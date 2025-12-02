'use client';

import { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import { CardHolding, Treasury, PokemonCard } from '@/types/pokemon';
import { getCurrentPrice, calculatePotentialROI } from '@/lib/services/pokemonService';
import { getCommunityRequests, CommunityRequest, subscribeToCommunityRequests } from '@/lib/services/communityRequestService';
import { getHoldings, initializeDefaultHoldings } from '@/lib/services/holdingsService';
import Link from 'next/link';
import Modal from '@/components/Modal';
import { Copy } from '@phosphor-icons/react';
import { Connection, PublicKey, LAMPORTS_PER_SOL } from '@solana/web3.js';

export default function Strategy() {
  const [holdings, setHoldings] = useState<CardHolding[]>([]);
  const [communityRequests, setCommunityRequests] = useState<CommunityRequest[]>([]);
  const [treasury, setTreasury] = useState<Treasury>({
    availableBalance: 0,
    totalInvested: 0,
    totalValue: 0,
    profit: 0,
    lastUpdated: new Date().toISOString(),
  });
  const [treasuryWalletBalance, setTreasuryWalletBalance] = useState<number>(0);
  const [loading, setLoading] = useState(false);
  const [loadingHoldings, setLoadingHoldings] = useState(false);
  const [loadingCommunity, setLoadingCommunity] = useState(false);
  const [activeTab, setActiveTab] = useState<'active' | 'completed' | 'community' | 'all'>('active');
  const [selectedPool, setSelectedPool] = useState<CommunityRequest | null>(null);
  const [showPoolModal, setShowPoolModal] = useState(false);

  // Real-time listener for community requests
  useEffect(() => {
    setLoadingCommunity(true);
    
    const unsubscribe = subscribeToCommunityRequests((requests) => {
      setCommunityRequests(requests);
      setLoadingCommunity(false);
    });

    // Cleanup subscription on unmount
    return () => unsubscribe();
  }, []);

  // Fetch treasury wallet balance
  useEffect(() => {
    const fetchTreasuryBalance = async () => {
      try {
        const treasuryWallet = process.env.NEXT_PUBLIC_TREASURY_WALLET;
        if (!treasuryWallet) return;
        
        const connection = new Connection(
          process.env.NEXT_PUBLIC_SOLANA_RPC || 'https://api.mainnet-beta.solana.com',
          'confirmed'
        );
        
        const pubkey = new PublicKey(treasuryWallet);
        const lamports = await connection.getBalance(pubkey);
        const solBalance = lamports / LAMPORTS_PER_SOL;
        setTreasuryWalletBalance(solBalance);
      } catch (error) {
        console.error('Error fetching treasury balance:', error);
      }
    };
    
    fetchTreasuryBalance();
    // Refresh balance every 30 seconds
    const interval = setInterval(fetchTreasuryBalance, 30000);
    return () => clearInterval(interval);
  }, []);

  // Load holdings from Firebase
  useEffect(() => {
    const loadHoldingsFromDB = async () => {
      setLoadingHoldings(true);
      
      try {
        // Simply fetch holdings from Firebase - no initialization
        const fetchedHoldings = await getHoldings();
        
        setHoldings(fetchedHoldings);
        
        // Calculate treasury
        const totalInvested = fetchedHoldings.reduce((sum, h) => sum + h.totalInvested, 0);
        const totalValue = fetchedHoldings.reduce((sum, h) => {
          const currentPrice = getCurrentPrice(h.card);
          return sum + (currentPrice * h.quantityOwned);
        }, 0);
        
        setTreasury({
          availableBalance: treasuryWalletBalance,
          totalInvested,
          totalValue,
          profit: 0, // Will be editable in add page
          lastUpdated: new Date().toISOString(),
        });
      } catch (error) {
        console.error('Error loading holdings:', error);
      } finally {
        setLoadingHoldings(false);
      }
    };

    loadHoldingsFromDB();
  }, [treasuryWalletBalance]);

  const filteredHoldings = holdings.filter(h => {
    if (activeTab === 'all') return true;
    return h.status === activeTab;
  });

  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      
      <main className="mx-auto max-w-7xl px-6 py-6">
        {/* Strategy Overview - At Top */}
        <div className="bg-blue-50 rounded-lg p-3 mb-4 border border-blue-200">
          <div className="flex items-center justify-center gap-6 text-sm flex-wrap">
            <div>
              <span className="font-semibold text-gray-700">Target:</span>
              <span className="text-gray-600 ml-2">80-90% supply control</span>
            </div>
            <div className="h-4 w-px bg-gray-300"></div>
            <div>
              <span className="font-semibold text-gray-700">Focus:</span>
              <span className="text-gray-600 ml-2">Rare vintage + low pop cards</span>
            </div>
            <div className="h-4 w-px bg-gray-300"></div>
            <div>
              <span className="font-semibold text-gray-700">Funding:</span>
              <span className="text-gray-600 ml-2">LP Fees</span>
            </div>
          </div>
        </div>

        {/* Treasury Overview - Enhanced Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-lg p-4 border border-gray-200">
            <div className="text-xs font-medium text-gray-500 mb-1">Available Capital</div>
            <div className="text-2xl font-bold text-gray-900">
              {treasury.availableBalance.toLocaleString('en-US', { minimumFractionDigits: 2 })} SOL
            </div>
            <div className="text-xs text-gray-400 mt-1">Treasury wallet balance</div>
          </div>
          
          <div className="bg-white rounded-lg p-4 border border-gray-200">
            <div className="text-xs font-medium text-gray-500 mb-1">Total Invested</div>
            <div className="text-2xl font-bold text-gray-900">
              ${treasury.totalInvested.toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </div>
            <div className="text-xs text-gray-400 mt-1">In card holdings</div>
          </div>
          
          <div className="bg-white rounded-lg p-4 border border-gray-200">
            <div className="text-xs font-medium text-gray-500 mb-1">Portfolio Value</div>
            <div className="text-2xl font-bold text-gray-900">
              ${treasury.totalValue.toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </div>
            <div className="text-xs text-gray-400 mt-1">Current market value</div>
          </div>
          
          <div className="bg-white rounded-lg p-4 border border-gray-200">
            <div className="text-xs font-medium text-gray-500 mb-1">Total P/L</div>
            <div className={`text-2xl font-bold ${treasury.profit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {treasury.profit >= 0 ? '+' : ''}${treasury.profit.toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </div>
            <div className={`text-xs mt-1 ${treasury.profit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {treasury.totalInvested > 0 
                ? `${((treasury.profit / treasury.totalInvested) * 100).toFixed(2)}% return`
                : '0% return'
              }
            </div>
          </div>
        </div>

        {/* Holdings Section */}
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <div className="border-b border-gray-200">
            <div className="flex">
              <button
                onClick={() => setActiveTab('active')}
                className={`flex-1 px-6 py-4 text-sm font-bold transition-colors cursor-pointer ${
                  activeTab === 'active'
                    ? 'text-gray-900 border-b-2 border-gray-900 bg-gray-50'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                Active Targets ({holdings.filter(h => h.status === 'active').length})
              </button>
              <button
                onClick={() => setActiveTab('community')}
                className={`flex-1 px-6 py-4 text-sm font-bold transition-colors cursor-pointer ${
                  activeTab === 'community'
                    ? 'text-gray-900 border-b-2 border-gray-900 bg-gray-50'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                Pools ({communityRequests.length})
              </button>
              <button
                onClick={() => setActiveTab('completed')}
                className={`flex-1 px-6 py-4 text-sm font-bold transition-colors cursor-pointer ${
                  activeTab === 'completed'
                    ? 'text-gray-900 border-b-2 border-gray-900 bg-gray-50'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                Completed ({holdings.filter(h => h.status === 'completed').length})
              </button>
              <button
                onClick={() => setActiveTab('all')}
                className={`flex-1 px-6 py-4 text-sm font-bold transition-colors cursor-pointer ${
                  activeTab === 'all'
                    ? 'text-gray-900 border-b-2 border-gray-900 bg-gray-50'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                All Holdings ({holdings.length})
              </button>
            </div>
          </div>

          {/* Holdings Table */}
          <div className="overflow-x-auto max-h-[700px] overflow-y-auto">
            {loadingHoldings ? (
              <div className="p-12 text-center">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
                <p className="mt-4 text-gray-500">Loading target cards...</p>
              </div>
            ) : activeTab === 'community' ? (
              // Pools View
              communityRequests.length === 0 ? (
                <div className="p-12 text-center">
                  <p className="text-gray-500">No active pools yet</p>
                  <p className="text-xs text-gray-400 mt-2">Pools with 50+ participants are moved to Active Targets</p>
                </div>
              ) : (
                <table className="w-full">
                  <thead className="bg-gray-50 sticky top-0">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Card</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Set</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Current Price</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Pool Progress</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {communityRequests.map((request) => {
                      const price = getCurrentPrice(request.cardData);
                      const participants = request.requesters?.length || 0;
                      const progress = (participants / 50) * 100;
                      const isComplete = participants >= 50;
                      
                      return (
                        <tr 
                          key={request.id} 
                          onClick={() => {
                            setSelectedPool(request);
                            setShowPoolModal(true);
                          }}
                          className="hover:bg-gray-50 transition-colors cursor-pointer"
                        >
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <img 
                                src={request.cardData.images.small} 
                                alt={request.cardData.name}
                                className="w-12 h-16 rounded object-cover"
                              />
                              <div>
                                <div className="font-semibold text-gray-900">{request.cardData.name}</div>
                                <div className="text-xs text-gray-500">{request.cardData.rarity}</div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="font-medium text-gray-900">{request.cardData.set.name}</div>
                            <div className="text-xs text-gray-500">#{request.cardData.number}</div>
                          </td>
                          <td className="px-6 py-4">
                            {price > 0 ? (
                              <>
                                <div className="font-semibold text-gray-900">${price.toFixed(2)}</div>
                                <div className="text-xs text-gray-500">market</div>
                              </>
                            ) : (
                              <span className="text-xs text-gray-400">N/A</span>
                            )}
                          </td>
                          <td className="px-6 py-4">
                            <div className="w-full max-w-xs">
                              <div className="w-full bg-gray-200 rounded-full h-2 mb-1">
                                <div 
                                  className={`h-2 rounded-full transition-all ${
                                    isComplete ? 'bg-green-600' : 'bg-blue-600'
                                  }`}
                                  style={{ width: `${Math.min(progress, 100)}%` }}
                                ></div>
                              </div>
                              <div className="text-xs font-semibold text-gray-900">
                                {participants}/50
                                {isComplete && <span className="text-green-600 ml-2">✓ Ready!</span>}
                              </div>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              )
            ) : filteredHoldings.length === 0 ? (
              <div className="p-12 text-center">
                <p className="text-gray-500">No {activeTab === 'completed' ? 'completed' : activeTab === 'all' ? '' : activeTab} target cards</p>
              </div>
            ) : (
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Card</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Owned</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Target</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Control %</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Current Price</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Invested</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Value</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">P/L</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredHoldings.map((holding) => {
                    const currentPrice = getCurrentPrice(holding.card);
                    const invested = currentPrice * holding.quantityOwned; // Calculate invested as owned * price
                    const currentValue = currentPrice * holding.quantityOwned;
                    const profit = currentValue - invested;
                    const profitPercent = invested > 0 
                      ? ((profit / invested) * 100).toFixed(2)
                      : '0.00';
                    const controlPercent = ((holding.quantityOwned / holding.totalSupply) * 100).toFixed(2);
                    const targetPercent = ((holding.targetQuantity / holding.totalSupply) * 100).toFixed(1);
                    const progress = (holding.quantityOwned / holding.targetQuantity) * 100;

                    return (
                      <tr key={holding.cardId} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <img 
                              src={holding.card.images.small} 
                              alt={holding.card.name}
                              className="w-12 h-16 rounded object-cover"
                            />
                            <div>
                              <div className="font-semibold text-gray-900">{holding.card.name}</div>
                              <div className="text-xs text-gray-500">{holding.card.set.name} • {holding.card.rarity}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="font-semibold text-gray-900">{holding.quantityOwned.toLocaleString()}</div>
                          <div className="text-xs text-gray-500">cards</div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="font-semibold text-gray-900">{holding.targetQuantity.toLocaleString()}</div>
                          <div className="text-xs text-gray-500">{targetPercent}% of supply</div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="w-full bg-gray-200 rounded-full h-2 mb-1">
                            <div 
                              className="bg-blue-600 h-2 rounded-full transition-all"
                              style={{ width: `${Math.min(progress, 100)}%` }}
                            ></div>
                          </div>
                          <div className="text-xs font-semibold text-gray-900">{controlPercent}%</div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="font-semibold text-gray-900">${currentPrice.toFixed(2)}</div>
                          <div className="text-xs text-gray-500">market</div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="font-semibold text-gray-900">${holding.totalInvested.toFixed(2)}</div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="font-semibold text-gray-900">${currentValue.toFixed(2)}</div>
                        </td>
                        <td className="px-6 py-4">
                          <div className={`font-semibold ${profit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                            {profit >= 0 ? '+' : ''}${profit.toFixed(2)}
                          </div>
                          <div className={`text-xs ${profit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                            {profit >= 0 ? '+' : ''}{profitPercent}%
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {/* Pool Details Modal */}
        <Modal 
          isOpen={showPoolModal} 
          onClose={() => setShowPoolModal(false)}
          onSubmit={() => setShowPoolModal(false)}
          title={selectedPool ? `Pool: ${selectedPool.cardData.name}` : 'Pool Details'}
          buttonText="Close"
          processingText=""
        >
          {selectedPool && (
            <div>
              <div className="flex gap-3 mb-4">
                <img 
                  src={selectedPool.cardData.images.small} 
                  alt={selectedPool.cardData.name}
                  className="w-20 h-auto rounded-lg shadow-sm"
                />
                <div className="flex-1">
                  <h3 className="font-bold text-sm text-gray-900 mb-1">{selectedPool.cardData.name}</h3>
                  <p className="text-xs text-gray-600">{selectedPool.cardData.set.name}</p>
                  <p className="text-xs text-gray-500">Card #{selectedPool.cardData.number}</p>
                </div>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-semibold text-gray-700">Pool Progress:</span>
                  <span className="text-sm font-bold text-gray-900">
                    {selectedPool.requesters?.length || 0}/50
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div 
                    className={`h-3 rounded-full transition-all ${
                      (selectedPool.requesters?.length || 0) >= 50 ? 'bg-green-600' : 'bg-blue-600'
                    }`}
                    style={{ width: `${Math.min(((selectedPool.requesters?.length || 0) / 50) * 100, 100)}%` }}
                  ></div>
                </div>
                <p className="text-xs text-gray-600 mt-2">
                  {(selectedPool.requesters?.length || 0) >= 50 
                    ? '✓ Pool is ready to be added to Active Targets!' 
                    : `${50 - (selectedPool.requesters?.length || 0)} more participants needed`}
                </p>
              </div>

              <div>
                <h4 className="text-sm font-semibold text-gray-700 mb-2">
                  All Participants ({selectedPool.requesters?.length || 0}):
                </h4>
                <div className="max-h-40 overflow-y-auto">
                  <div className="space-y-1">
                    {selectedPool.requesters?.map((addr: string, idx: number) => (
                      <div 
                        key={idx} 
                        onClick={() => {
                          navigator.clipboard.writeText(addr);
                        }}
                        className="text-xs font-mono px-3 py-1.5 text-gray-700 hover:bg-gray-100 cursor-pointer transition-colors flex items-center justify-between group"
                      >
                        <span>{addr.slice(0, 8)}...{addr.slice(-8)}</span>
                        <Copy size={14} className="text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </Modal>
      </main>
    </div>
  );
}
