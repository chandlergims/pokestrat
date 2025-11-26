'use client';

import Link from 'next/link';
import HowItWorksModal from './HowItWorksModal';
import { useState } from 'react';

export default function Footer() {
  const [showModal, setShowModal] = useState(false);

  return (
    <>
      <HowItWorksModal isOpen={showModal} onClose={() => setShowModal(false)} />
      
      <footer className="w-full fixed bottom-0 left-0 right-0 border-t border-gray-200 bg-white z-50">
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="flex h-8 items-center justify-between">
            {/* Left side - Links */}
            <div className="flex items-center gap-6">
              <button
                onClick={() => setShowModal(true)}
                className="text-xs font-semibold text-gray-600 hover:text-gray-900 transition-colors cursor-pointer"
              >
                How it Works
              </button>
              <a 
                href="https://vibeify.gitbook.io/documentation/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs font-semibold text-gray-600 hover:text-gray-900 transition-colors cursor-pointer"
              >
                Docs
              </a>
            </div>

          {/* Center - Copyright */}
          <div className="absolute left-1/2 -translate-x-1/2">
            <p className="text-xs text-gray-600 font-bold">
              © 2025 Vibeify. All Rights Reserved.
            </p>
          </div>

          {/* Right side - X Logo */}
          <div className="flex items-center">
            <a
              href="https://x.com/vibeifyio"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:opacity-70 transition-opacity cursor-pointer"
              title="X (Twitter)"
            >
              <svg
                className="w-3.5 h-3.5 text-gray-700"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
              </svg>
            </a>
          </div>
        </div>
      </div>
    </footer>
    </>
  );
}
