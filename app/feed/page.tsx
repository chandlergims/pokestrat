'use client';

import Navbar from '@/components/Navbar';
import { useEffect, useState } from 'react';
import { getAllCoins } from '@/lib/services/coinService';
import { CoinData } from '@/types/coin';
import Link from 'next/link';
import { Check, TelegramLogo, CopySimple, Globe, Flame, ChartLineUp, Lightning, MagnifyingGlass } from 'phosphor-react';

type SortOption = 'verified' | 'marketCap' | 'new';

export default function Feed() {
  const [coins, setCoins] = useState<CoinData[]>([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState<SortOption>('verified');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const loadCoins = async () => {
      setLoading(true);
      try {
        const data = await getAllCoins();
        setCoins(data);
      } catch (error) {
        console.error('Error loading coins:', error);
      } finally {
        setLoading(false);
      }
    };

    loadCoins();
  }, []);

  // Filter and sort coins - optimized with top 50 limit
  const filteredCoins = [...coins]
    .filter(coin => {
      // Filter by active status
      if (coin.status !== 'active') return false;
      
      // If "Verified" tab is selected, only show verified coins
      if (sortBy === 'verified') {
        return coin.verified === true;
      }
      
      // For other tabs, show all active coins
      return true;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'verified':
          // Sort verified coins by market cap
          return (b.marketCap || 0) - (a.marketCap || 0);
        case 'marketCap':
          // Sort by market cap descending
          return (b.marketCap || 0) - (a.marketCap || 0);
        case 'new':
          // Sort by creation time descending (most recent first)
          return (b.createdAt || 0) - (a.createdAt || 0);
        default:
          return 0;
      }
    })
    .slice(0, 50); // Limit to top 50 for performance

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      window.location.href = `/coin/${searchQuery.trim()}`;
    }
  };

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#f7f6fb' }}>
      <Navbar />
      
      <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        {/* Filter Tabs and Search */}
        <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setSortBy('verified')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-bold text-sm transition-colors cursor-pointer ${
                sortBy === 'verified'
                  ? 'bg-gray-900 text-white'
                  : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-50'
              }`}
            >
              <Flame size={16} weight="regular" />
              Verified
            </button>
            <button
              onClick={() => setSortBy('marketCap')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-bold text-sm transition-colors cursor-pointer ${
                sortBy === 'marketCap'
                  ? 'bg-gray-900 text-white'
                  : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-50'
              }`}
            >
              <ChartLineUp size={16} weight="regular" />
              Market cap
            </button>
            <button
              onClick={() => setSortBy('new')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-bold text-sm transition-colors cursor-pointer ${
                sortBy === 'new'
                  ? 'bg-gray-900 text-white'
                  : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-50'
              }`}
            >
              <Lightning size={16} weight="regular" />
              New
            </button>
          </div>
          
          {/* Search */}
          <form onSubmit={handleSearch} className="relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by contract address..."
              className="pl-10 pr-4 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none w-64"
            />
            <MagnifyingGlass size={16} weight="regular" className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          </form>
        </div>

        {filteredCoins.length === 0 && !loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <h3 className="text-xl font-bold text-gray-900 mb-2">No coins yet</h3>
            <p className="text-gray-600">Be the first to create one</p>
          </div>
        ) : (
          <div className="grid grid-cols-4 gap-4">
            {filteredCoins.map((coin, index) => (
              <div 
                key={coin.id}
                className="bg-white rounded-2xl border border-gray-200 p-3 cursor-pointer aspect-square flex flex-col transition-all duration-300 shadow-sm hover:shadow-md"
                onClick={() => window.location.href = `/coin/${coin.contractAddress}`}
              >
                {/* Social Icons Top Right */}
                <div className="flex justify-end gap-1 mb-2">
                  {coin.xLink && (
                    <button 
                      className="p-1.5 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors cursor-pointer"
                      onClick={(e) => {
                        e.stopPropagation();
                        window.open(coin.xLink, '_blank');
                      }}
                    >
                      <svg
                        className="w-3.5 h-3.5"
                        fill="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                      </svg>
                    </button>
                  )}
                  {coin.telegramLink && (
                    <button 
                      className="p-1.5 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors cursor-pointer"
                      onClick={(e) => {
                        e.stopPropagation();
                        window.open(coin.telegramLink, '_blank');
                      }}
                    >
                      <TelegramLogo size={14} weight="regular" />
                    </button>
                  )}
                  {coin.websiteLink && (
                    <button 
                      className="p-1.5 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors cursor-pointer"
                      onClick={(e) => {
                        e.stopPropagation();
                        window.open(coin.websiteLink, '_blank');
                      }}
                    >
                      <Globe size={14} weight="regular" />
                    </button>
                  )}
                  <button 
                    className="p-1.5 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors cursor-pointer"
                    onClick={(e) => {
                      e.stopPropagation();
                      navigator.clipboard.writeText(coin.contractAddress || '');
                    }}
                  >
                    <CopySimple size={14} weight="regular" />
                  </button>
                </div>

                {/* Coin Image */}
                <div className="flex-1 flex items-center justify-center mb-2">
                  <div className="w-20 h-20 rounded-xl overflow-hidden">
                    <img 
                      src={coin.image} 
                      alt={coin.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>

                {/* Coin Info */}
                <div className="text-center">
                  <h3 className="text-base font-bold text-gray-900 mb-0.5 truncate">{coin.name}</h3>
                  <p className="text-xs text-gray-500 mb-2">{coin.ticker}</p>
                  
                  {/* Stats */}
                  <div className="space-y-1 text-xs">
                    <div className="flex justify-between">
                      <span className="text-gray-500">Holders:</span>
                      <span className="font-bold text-gray-900">
                        {(coin.holders || 0) >= 1000 
                          ? `${((coin.holders || 0) / 1000).toFixed(1)}K`
                          : (coin.holders || 0)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">24h Vol:</span>
                      <span className="font-bold text-gray-900">
                        ${(coin.volume24h || 0) >= 1000 
                          ? `${((coin.volume24h || 0) / 1000).toFixed(0)}K`
                          : (coin.volume24h || 0).toFixed(0)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">24h Change:</span>
                      <span className={`font-bold ${
                        (coin.priceChange24h || 0) >= 0 ? 'text-green-600' : 'text-pink-600'
                      }`}>
                        {(coin.priceChange24h || 0) >= 0 ? '+' : ''}{(coin.priceChange24h || 0).toFixed(2)}%
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Market Cap:</span>
                      <span className="font-bold text-gray-900">
                        ${(coin.marketCap || 0) >= 1000000 
                          ? `${((coin.marketCap || 0) / 1000000).toFixed(2)}M`
                          : `${((coin.marketCap || 0) / 1000).toFixed(0)}K`}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
