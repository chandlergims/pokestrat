'use client';

import Navbar from '@/components/Navbar';
import { useEffect, useState } from 'react';
import { getAllCoins } from '@/lib/services/coinService';
import { CoinData } from '@/types/coin';
import Link from 'next/link';
import { Sparkle } from 'phosphor-react';

export default function Community() {
  const [coins, setCoins] = useState<CoinData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadCoins = async () => {
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

  // Show only pending community submissions
  const pendingCoins = [...coins]
    .filter(coin => coin.status === 'pending')
    .sort((a, b) => {
      return (b.createdAt || 0) - (a.createdAt || 0);
    });

  return (
    <div className="min-h-screen bg-black text-white">
      <Navbar />
      
      <main className="mx-auto max-w-7xl px-4 py-12">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Community Submissions</h1>
          <p className="text-gray-400">Vibe-coded projects awaiting approval</p>
        </div>

        {loading ? (
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
          </div>
        ) : pendingCoins.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="w-16 h-16 bg-gray-800 rounded-full flex items-center justify-center mb-4">
              <Sparkle size={32} weight="regular" className="text-gray-400" />
            </div>
            <h3 className="text-xl font-bold mb-2">No pending submissions</h3>
            <p className="text-gray-400">Community creations will appear here</p>
          </div>
        ) : (
          <div className="bg-gray-900 rounded-lg overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-800 border-b border-gray-700">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">#</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Name</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Ticker</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Description</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Submitted</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800">
                {pendingCoins.map((coin, index) => (
                  <tr key={coin.id} className="hover:bg-gray-800 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">
                      {index + 1}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        <img 
                          src={coin.image} 
                          alt={coin.name}
                          className="w-10 h-10 rounded-full object-cover"
                        />
                        <span className="font-semibold">{coin.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-3 py-1 bg-gray-800 rounded-full text-sm font-mono">
                        ${coin.ticker}
                      </span>
                    </td>
                    <td className="px-6 py-4 max-w-md">
                      <p className="text-sm text-gray-300 truncate">{coin.description}</p>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-3 py-1 bg-yellow-900 text-yellow-200 rounded-full text-xs font-semibold">
                        Pending
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">
                      {new Date(coin.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </main>
    </div>
  );
}
