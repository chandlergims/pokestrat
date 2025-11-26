'use client';

import { X, Rocket, Percent, Star } from 'phosphor-react';

interface HowItWorksModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function HowItWorksModal({ isOpen, onClose }: HowItWorksModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop with blur */}
      <div 
        className="absolute inset-0 backdrop-blur-sm"
        onClick={onClose}
        style={{ backgroundColor: 'rgba(0, 0, 0, 0.3)' }}
      />
      
      {/* Modal */}
      <div className="relative z-10 w-full max-w-md p-5 rounded-xl bg-white shadow-lg">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-400 hover:text-gray-900 transition-colors cursor-pointer"
        >
          <X size={20} weight="bold" />
        </button>

        <h2 className="text-lg font-bold text-gray-900 mb-4">How It Works</h2>
        
        <div className="space-y-4 text-xs text-gray-700">
          {/* Create a Coin */}
          <div>
            <h3 className="text-sm font-bold text-gray-900 mb-1.5 flex items-center gap-2">
              <Rocket size={18} weight="regular" className="text-gray-900" />
              Create a Coin
            </h3>
            <p>
              Tokenize your vibe-coded project or app by choosing a name, ticker, image, and description. Add optional social links to build community around your creation.
            </p>
          </div>

          {/* Trading Fees */}
          <div>
            <h3 className="text-sm font-bold text-gray-900 mb-1.5 flex items-center gap-2">
              <Percent size={18} weight="regular" className="text-gray-900" />
              Trading Fees
            </h3>
            <p>
              A 2% fee is charged on all buys and sells, both on the initial bonding curve and after migration to Meteora's DAMM v2 pool.
            </p>
          </div>

          {/* Creator Benefits */}
          <div>
            <h3 className="text-sm font-bold text-gray-900 mb-1.5 flex items-center gap-2">
              <Star size={18} weight="regular" className="text-gray-900" />
              Creator Benefits
            </h3>
            <p>
              Earn 1% of all trading volume post-migration (50% of the 2% fee). An LP position NFT is transferred to the creator post-migration, which can be used to claim fees on meteora.ag.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
