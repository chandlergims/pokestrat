'use client';

import { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import { CardHolding, Treasury, PokemonCard } from '@/types/pokemon';
import { getCurrentPrice, calculatePotentialROI } from '@/lib/services/pokemonService';
import Link from 'next/link';

export default function Portfolio() {
  const [holdings, setHoldings] = useState<CardHolding[]>([]);
  const [treasury, setTreasury] = useState<Treasury>({
    availableBalance: 0,
    totalInvested: 0,
    totalValue: 0,
    profit: 0,
    lastUpdated: new Date().toISOString(),
  });
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'active' | 'completed' | 'all'>('active');

  // Load portfolio data
  useEffect(() => {
    const loadPortfolio = async () => {
      setLoading(true);
      
      try {
        // Import the API function
        const { getCardById } = await import('@/lib/services/pokemonService');
        
        // Fetch REAL card data from Pokemon TCG API
        const kabutoCard = await getCardById('base1-24');
        
        // Your holdings data (this part you'll track manually or in Firebase)
        const mockHoldings: CardHolding[] = [
          {
            cardId: 'base1-24',
            card: kabutoCard, // ← NOW USING REAL API DATA WITH LIVE PRICES!
            quantityOwned: 0, // ← YOU set this (how many you own)
            totalSupply: 10000, // ← YOU estimate this
            averagePurchasePrice: 0, // ← YOU track what you paid
            totalInvested: 0, // ← YOU track total spent
            targetQuantity: 5000, // ← YOUR goal
            status: 'active',
            notes: 'Following @KabutoKing strategy - targeting 50% supply control',
            dateAdded: '2024/12/01',
          },
        ];

        setHoldings(mockHoldings);
        
        // Calculate treasury
        const totalInvested = mockHoldings.reduce((sum, h) => sum + h.totalInvested, 0);
        const totalValue = mockHoldings.reduce((sum, h) => {
          const currentPrice = getCurrentPrice(h.card);
          return sum + (currentPrice * h.quantityOwned);
        }, 0);
        
        setTreasury({
          availableBalance: 0, // Will be manually set
          totalInvested,
          totalValue,
          profit: totalValue - totalInvested,
          lastUpdated: new Date().toISOString(),
        });
      } catch (error) {
        console.error('Error loading portfolio:', error);
        setHoldings([]);
      } finally {
        setLoading(false);
      }
    };

    loadPortfolio();
  }, []);

  const filteredHoldings = holdings.filter(h => {
    if (activeTab === 'all') return true;
    return h.status === activeTab;
  });

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#f7f6fb' }}>
      <Navbar />
      
      <main className="mx-auto max-w-7xl px-4 py-8">
        {/* Treasury Overview */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">Pokemon Card Treasury</h1>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
              <div className="text-sm font-semibold text-gray-500 mb-2">Available Balance</div>
              <div className="text-3xl font-bold text-gray-900">
                ${treasury.availableBalance.toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </div>
              <div className="text-xs text-gray-400 mt-2">Ready to deploy</div>
            </div>
            
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
              <div className="text-sm font-semibold text-gray-500 mb-2">Total Invested</div>
              <div className="text-3xl font-bold text-gray-900">
                ${treasury.totalInvested.toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </div>
              <div className="text-xs text-gray-400 mt-2">In card holdings</div>
            </div>
            
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
              <div className="text-sm font-semibold text-gray-500 mb-2">Portfolio Value</div>
              <div className="text-3xl font-bold text-gray-900">
                ${treasury.totalValue.toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </div>
              <div className="text-xs text-gray-400 mt-2">Current market value</div>
            </div>
            
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
              <div className="text-sm font-semibold text-gray-500 mb-2">Total P/L</div>
              <div className={`text-3xl font-bold ${treasury.profit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {treasury.profit >= 0 ? '+' : ''}${treasury.profit.toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </div>
              <div className={`text-xs mt-2 ${treasury.profit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {treasury.totalInvested > 0 
                  ? `${((treasury.profit / treasury.totalInvested) * 100).toFixed(2)}% return`
                  : '0% return'
                }
              </div>
            </div>
          </div>
        </div>

        {/* Strategy Info */}
        <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-6 mb-8 border border-blue-200">
          <h2 className="text-xl font-bold text-gray-900 mb-2">Strategy: Market Dominance</h2>
          <p className="text-gray-700 mb-4">
            Following the proven Kabuto strategy - systematically acquiring large portions of rare card supplies 
            to gain market control and drive price appreciation through scarcity.
          </p>
          <div className="flex gap-4 text-sm">
            <div className="bg-white px-4 py-2 rounded-lg">
              <span className="font-semibold text-gray-900">Target: </span>
              <span className="text-gray-600">40-60% supply control</span>
            </div>
            <div className="bg-white px-4 py-2 rounded-lg">
              <span className="font-semibold text-gray-900">Focus: </span>
              <span className="text-gray-600">Rare vintage + low pop cards</span>
            </div>
            <div className="bg-white px-4 py-2 rounded-lg">
              <span className="font-semibold text-gray-900">Funding: </span>
              <span className="text-gray-600">Pump.fun creator fees</span>
            </div>
          </div>
        </div>

        {/* Holdings Tabs */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="border-b border-gray-200">
            <div className="flex">
              <button
                onClick={() => setActiveTab('active')}
                className={`flex-1 px-6 py-4 text-sm font-bold transition-colors ${
                  activeTab === 'active'
                    ? 'text-gray-900 border-b-2 border-gray-900 bg-gray-50'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                Active Targets ({holdings.filter(h => h.status === 'active').length})
              </button>
              <button
                onClick={() => setActiveTab('completed')}
                className={`flex-1 px-6 py-4 text-sm font-bold transition-colors ${
                  activeTab === 'completed'
                    ? 'text-gray-900 border-b-2 border-gray-900 bg-gray-50'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                Completed ({holdings.filter(h => h.status === 'completed').length})
              </button>
              <button
                onClick={() => setActiveTab('all')}
                className={`flex-1 px-6 py-4 text-sm font-bold transition-colors ${
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
          <div className="overflow-x-auto">
            {loading ? (
              <div className="p-12 text-center">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
                <p className="mt-4 text-gray-500">Loading portfolio...</p>
              </div>
            ) : filteredHoldings.length === 0 ? (
              <div className="p-12 text-center">
                <p className="text-gray-500 mb-4">No holdings yet</p>
                <button className="px-6 py-3 bg-gray-900 text-white font-bold rounded-lg hover:bg-gray-800 transition-colors">
                  Add Target Card
                </button>
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
                    const currentValue = currentPrice * holding.quantityOwned;
                    const profit = currentValue - holding.totalInvested;
                    const profitPercent = holding.totalInvested > 0 
                      ? ((profit / holding.totalInvested) * 100).toFixed(2)
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
      </main>
    </div>
  );
}
