'use client';

import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import Navbar from '@/components/Navbar';
import { getCoinByAddress } from '@/lib/services/coinService';
import { Coin } from '@/types/coin';
import { TelegramLogo, Globe, CopySimple } from 'phosphor-react';

export default function CoinPage() {
  const params = useParams();
  const address = params.address as string;
  const [coin, setCoin] = useState<Coin | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadCoin = async () => {
      try {
        const coinData = await getCoinByAddress(address);
        setCoin(coinData);
      } catch (error) {
        console.error('Error loading coin:', error);
      } finally {
        setLoading(false);
      }
    };

    loadCoin();
  }, [address]);

  if (loading) {
  return (
    <div className="min-h-screen" style={{ backgroundColor: '#f7f6fb' }}>
      <Navbar />
      <main className="mx-auto max-w-6xl px-4 py-12">
          <div className="text-center text-gray-900">Loading...</div>
        </main>
      </div>
    );
  }

  if (!coin) {
    return (
      <div className="min-h-screen" style={{ backgroundColor: '#f7f6fb' }}>
        <Navbar />
        <main className="mx-auto max-w-6xl px-4 py-12">
          <div className="text-center text-gray-900">Coin not found</div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#f7f6fb' }}>
      <Navbar />
      <main className="mx-auto max-w-6xl px-4 py-12">
        {/* Coin Header */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6 border border-gray-200 relative">
          {/* Social Links - Top Right */}
          <div className="absolute top-6 right-6 flex gap-2">
            {coin.xLink && (
              <button
                onClick={() => window.open(coin.xLink, '_blank')}
                className="p-2 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors cursor-pointer"
                title="X (Twitter)"
              >
                <svg
                  className="w-4 h-4"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                </svg>
              </button>
            )}
            {coin.telegramLink && (
              <button
                onClick={() => window.open(coin.telegramLink, '_blank')}
                className="p-2 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors cursor-pointer"
                title="Telegram"
              >
                <TelegramLogo size={16} weight="regular" />
              </button>
            )}
            {coin.websiteLink && (
              <button
                onClick={() => window.open(coin.websiteLink, '_blank')}
                className="p-2 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors cursor-pointer"
                title="Website"
              >
                <Globe size={16} weight="regular" />
              </button>
            )}
            <button
              onClick={() => coin.contractAddress && navigator.clipboard.writeText(coin.contractAddress)}
              className="p-2 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors cursor-pointer"
              title="Copy contract address"
            >
              <CopySimple size={16} weight="regular" className="text-gray-600" />
            </button>
          </div>

          <div className="flex items-start gap-6 mb-6">
            <img
              src={coin.image}
              alt={coin.name}
              className="w-24 h-24 rounded-lg object-cover"
            />
            <div className="flex-1 pr-32">
              <div className="flex items-center gap-3">
                <h1 className="text-3xl font-bold text-gray-900">{coin.ticker}</h1>
                <span className="text-gray-400">•</span>
                <span className="text-xl text-gray-600">{coin.name}</span>
              </div>
            </div>
          </div>

          {/* Stats Grid in Header */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white p-4 rounded-lg border border-gray-200">
              <div className="text-gray-500 text-xs font-medium mb-1">Market Cap</div>
              <div className="text-gray-900 text-lg font-bold">${(coin.marketCap || 0).toLocaleString()}</div>
            </div>
            <div className="bg-white p-4 rounded-lg border border-gray-200">
              <div className="text-gray-500 text-xs font-medium mb-1">24h Volume</div>
              <div className="text-gray-900 text-lg font-bold">${(coin.volume24h || 0).toLocaleString()}</div>
            </div>
            <div className="bg-white p-4 rounded-lg border border-gray-200">
              <div className="text-gray-500 text-xs font-medium mb-1">Holders</div>
              <div className="text-gray-900 text-lg font-bold">{(coin.holders || 0).toLocaleString()}</div>
            </div>
            <div className="bg-white p-4 rounded-lg border border-gray-200">
              <div className="text-gray-500 text-xs font-medium mb-1">24h Change</div>
              <div className={`text-lg font-bold ${(coin.priceChange24h || 0) >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                {(coin.priceChange24h || 0) >= 0 ? '+' : ''}{(coin.priceChange24h || 0).toFixed(2)}%
              </div>
            </div>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Chart */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-200">
              <div className="w-full overflow-hidden rounded-lg" style={{ height: '600px' }}>
                <iframe
                  src={`https://birdeye.so/tv-widget/${address}?chain=solana&theme=light`}
                  className="w-full rounded-lg"
                  style={{ height: 'calc(100% + 30px)', marginBottom: '-30px' }}
                  frameBorder="0"
                  allowFullScreen
                />
              </div>
            </div>
          </div>

          {/* Right Column - Trading & Info */}
          <div className="lg:col-span-1 space-y-6">
            {/* Description */}
            <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
              <h3 className="text-sm font-semibold text-gray-900 mb-3">Description</h3>
              <p className="text-sm text-gray-600 leading-relaxed break-words">
                {coin.description}
              </p>
            </div>

            {/* Fees earned */}
            <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-semibold text-gray-900">Fees earned</h3>
              </div>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-xs text-gray-500">Total Fees</span>
                  <span className="text-sm font-semibold text-gray-900">$0</span>
                </div>
                <div className="flex justify-between items-center pt-2 border-t border-gray-100">
                  <span className="text-xs text-gray-500">Creator</span>
                  <button
                    onClick={() => coin.createdBy && navigator.clipboard.writeText(coin.createdBy)}
                    className="text-xs font-mono text-gray-900 hover:text-gray-600 transition-colors flex items-center gap-1 cursor-pointer"
                    title="Click to copy creator address"
                  >
                    {coin.createdBy?.slice(0, 4)}...{coin.createdBy?.slice(-4)}
                    <CopySimple size={12} weight="regular" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
