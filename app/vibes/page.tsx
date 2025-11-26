'use client';

import Navbar from '@/components/Navbar';
import { useEffect, useState } from 'react';
import { getAllCoins } from '@/lib/services/coinService';
import { CoinData } from '@/types/coin';
import Link from 'next/link';
import { Sparkle } from 'phosphor-react';
import { InfiniteCarousel } from '@/components/InfiniteCarousel';
import { CarouselSkeleton } from '@/components/CarouselSkeleton';

export default function Vibes() {
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

  // Show only approved coins (status === 'active')
  const filteredCoins = [...coins]
    .filter(coin => coin.status === 'active')
    .sort((a, b) => {
      return (b.marketCap || 0) - (a.marketCap || 0);
    });

  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: '#f7f6fb' }}>
      <Navbar />
      
      {loading ? (
        <main className="flex flex-col flex-1 items-center justify-center px-4">
          <CarouselSkeleton />
        </main>
      ) : filteredCoins.length === 0 ? (
        <div className="flex flex-col items-center justify-center flex-1 py-20">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
            <Sparkle size={32} weight="regular" className="text-gray-400" />
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">No vibes yet</h3>
          <p className="text-gray-600 mb-6">Be the first to tokenize your vibe-coded project</p>
          <Link 
            href="/create"
            className="px-6 py-3 bg-gray-900 text-white font-bold rounded-lg hover:bg-gray-800 transition-colors"
          >
            Create First Project
          </Link>
        </div>
      ) : (
        <main className="flex flex-col flex-1 items-center justify-center px-4">
          <InfiniteCarousel items={filteredCoins} />
        </main>
      )}
    </div>
  );
}
