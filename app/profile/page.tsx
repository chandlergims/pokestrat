'use client';

import Navbar from '@/components/Navbar';
import { usePrivy } from '@privy-io/react-auth';
import { useEffect, useState } from 'react';
import { getCoinsByCreator } from '@/lib/services/coinService';
import { CoinData } from '@/types/coin';
import Link from 'next/link';

type Tab = 'launches' | 'fees';

export default function Profile() {
  const { user, authenticated } = usePrivy();
  const [coins, setCoins] = useState<CoinData[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<Tab>('launches');
  
  const walletAddress = user?.wallet?.address;

  const shortenAddress = (address: string) => {
    if (!address) return '';
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  useEffect(() => {
    const loadCoins = async () => {
      if (!walletAddress) {
        setLoading(false);
        return;
      }
      
      setLoading(true);
      try {
        const data = await getCoinsByCreator(walletAddress);
        setCoins(data);
      } catch (error) {
        console.error('Error loading coins:', error);
      } finally {
        setLoading(false);
      }
    };

    if (authenticated && walletAddress) {
      loadCoins();
    } else if (authenticated && !walletAddress) {
      setLoading(true);
    } else {
      setLoading(false);
    }
  }, [authenticated, walletAddress]);

  const renderSkeleton = () => (
    <>
      {/* Table Header */}
      <div className="px-6 py-3">
        <div className="grid grid-cols-12 gap-4">
          <div className="col-span-4 text-xs font-semibold text-gray-500 uppercase tracking-wide">
            Token
          </div>
          <div className="col-span-2 text-xs font-semibold text-gray-500 uppercase tracking-wide">
            Total Fees
          </div>
          <div className="col-span-2 text-xs font-semibold text-gray-500 uppercase tracking-wide">
            Holders
          </div>
          <div className="col-span-2 text-xs font-semibold text-gray-500 uppercase tracking-wide">
            MC
          </div>
          <div className="col-span-2 text-xs font-semibold text-gray-500 uppercase tracking-wide text-right">
            Confirmed
          </div>
        </div>
      </div>
      
      {/* Skeleton Rows */}
      <div className="space-y-0">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="px-6 py-4">
            <div className="grid grid-cols-12 gap-4 items-center">
              <div className="col-span-4 flex items-center gap-3">
                <div className="w-11 h-11 rounded-lg bg-gray-200 animate-pulse"></div>
                <div className="min-w-0 space-y-2">
                  <div className="h-3.5 w-16 bg-gray-200 rounded animate-pulse"></div>
                  <div className="h-3 w-24 bg-gray-200 rounded animate-pulse"></div>
                </div>
              </div>
              <div className="col-span-2">
                <div className="h-3.5 w-12 bg-gray-200 rounded animate-pulse"></div>
              </div>
              <div className="col-span-2">
                <div className="h-3.5 w-16 bg-gray-200 rounded animate-pulse"></div>
              </div>
              <div className="col-span-2">
                <div className="h-3.5 w-20 bg-gray-200 rounded animate-pulse"></div>
              </div>
              <div className="col-span-2 flex justify-end">
                <div className="h-3.5 w-10 bg-gray-200 rounded animate-pulse"></div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </>
  );

  if (!authenticated) {
    return (
      <div className="min-h-screen" style={{ backgroundColor: '#f7f6fb' }}>
        <Navbar />
        <main className="mx-auto max-w-4xl px-4 py-12">
          {/* Unified Profile Card */}
          <div className="rounded-2xl overflow-hidden">
            {/* Profile Header */}
            <div className="p-6">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-gray-200 animate-pulse"></div>
                <div className="flex-1 min-w-0 space-y-2">
                  <div className="h-4 w-32 bg-gray-200 rounded animate-pulse"></div>
                  <div className="h-3 w-48 bg-gray-200 rounded animate-pulse"></div>
                </div>
              </div>
            </div>

            {/* Tabs */}
            <div className="border-b border-gray-300">
              <div className="flex">
                <button className="flex-1 px-4 py-3 text-sm font-bold text-gray-900 border-b-2 border-gray-900">
                  Launches
                </button>
                <button className="flex-1 px-4 py-3 text-sm font-bold text-gray-500">
                  Fees
                </button>
              </div>
            </div>

            {/* Tab Content with Connect Wallet Overlay */}
            <div className="min-h-[400px] relative">
              {renderSkeleton()}
              
              {/* Connect Wallet Overlay */}
              <div className="absolute inset-0 flex items-center justify-center bg-[#f7f6fb]/80 backdrop-blur-sm">
                <div className="text-center">
                  <h1 className="text-2xl font-bold text-gray-900 mb-4">Please connect your wallet</h1>
                  <p className="text-gray-600">You need to connect your wallet to view your profile.</p>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#f7f6fb' }}>
      <Navbar />
      <main className="mx-auto max-w-4xl px-4 py-12">
        {/* Unified Profile Card */}
        <div className="rounded-2xl overflow-hidden">
          {/* Profile Header */}
          <div className="p-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-gray-900 flex items-center justify-center text-white text-lg font-bold">
                {walletAddress?.charAt(0).toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <h1 className="text-lg font-bold text-gray-900 mb-0.5">
                  {shortenAddress(walletAddress || '')}
                </h1>
                <p className="text-xs text-gray-500 font-mono truncate">{walletAddress}</p>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="border-b border-gray-300">
            <div className="flex">
              <button
                onClick={() => setActiveTab('launches')}
                className={`flex-1 px-4 py-3 text-sm font-bold transition-colors cursor-pointer ${
                  activeTab === 'launches'
                    ? 'text-gray-900 border-b-2 border-gray-900'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                Launches
              </button>
              <button
                onClick={() => setActiveTab('fees')}
                className={`flex-1 px-4 py-3 text-sm font-bold transition-colors cursor-pointer ${
                  activeTab === 'fees'
                    ? 'text-gray-900 border-b-2 border-gray-900'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                Fees
              </button>
            </div>
          </div>

          {/* Tab Content */}
          <div className="min-h-[400px]">
            {activeTab === 'launches' && (
              <>
                {loading ? (
                  renderSkeleton()
                ) : coins.length === 0 ? (
                  <div className="text-center py-20">
                    <p className="text-gray-500 mb-4">No launches yet</p>
                    <Link 
                      href="/create"
                      className="inline-block px-6 py-3 bg-gray-900 text-white font-bold rounded-lg hover:bg-gray-800 transition-colors text-sm"
                    >
                      Launch Your First Coin
                    </Link>
                  </div>
                ) : (
                  <>
                    {/* Table Header */}
                    <div className="px-6 py-3">
                      <div className="grid grid-cols-12 gap-4">
                        <div className="col-span-4 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                          Token
                        </div>
                        <div className="col-span-2 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                          Total Fees
                        </div>
                        <div className="col-span-2 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                          Holders
                        </div>
                        <div className="col-span-2 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                          MC
                        </div>
                        <div className="col-span-2 text-xs font-semibold text-gray-500 uppercase tracking-wide text-right">
                          Confirmed
                        </div>
                      </div>
                    </div>
                    
                    {/* Coin List */}
                    <div className="max-h-[480px] overflow-y-auto [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-gray-300 [&::-webkit-scrollbar-thumb]:rounded-full">
                      {coins.map((coin) => (
                        <Link
                          key={coin.id}
                          href={`/coin/${coin.contractAddress}`}
                          className="block px-6 py-4 hover:bg-gray-100/40 transition-colors cursor-pointer"
                        >
                          <div className="grid grid-cols-12 gap-4 items-center">
                            <div className="col-span-4 flex items-center gap-3">
                              <img 
                                src={coin.image} 
                                alt={coin.name}
                                className="w-11 h-11 rounded-lg object-cover"
                              />
                              <div className="min-w-0">
                                <div className="text-sm font-bold text-gray-900">{coin.ticker}</div>
                                <div className="text-xs text-gray-500 truncate">{coin.name}</div>
                              </div>
                            </div>
                            <div className="col-span-2 text-left">
                              <div className="text-sm font-semibold text-gray-900">$0</div>
                            </div>
                            <div className="col-span-2 text-left">
                              <div className="text-sm font-semibold text-gray-900">{(coin.holders || 0).toLocaleString()}</div>
                            </div>
                            <div className="col-span-2 text-left">
                              <div className="text-sm font-semibold text-gray-900">
                                ${((coin.marketCap || 0) / 1000).toFixed(1)}K
                              </div>
                            </div>
                            <div className="col-span-2 text-right">
                              <div className="text-sm font-semibold text-gray-900">
                                {coin.verified ? 'Confirmed' : '-'}
                              </div>
                            </div>
                          </div>
                        </Link>
                      ))}
                    </div>
                  </>
                )}
              </>
            )}

            {activeTab === 'fees' && (
              <div className="p-12 text-center">
                <div className="text-gray-400 mb-2">
                  <svg className="w-16 h-16 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <p className="text-gray-500 font-medium">No fees to claim</p>
                <p className="text-sm text-gray-400 mt-2">
                  Creator fees from your coins will appear here
                </p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
