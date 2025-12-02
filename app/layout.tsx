'use client';

import "./globals.css";
import { PrivyProvider } from '@privy-io/react-auth';
import Footer from '@/components/Footer';
import HowItWorksModal from '@/components/HowItWorksModal';
import { toSolanaWalletConnectors } from '@privy-io/react-auth/solana';
import { WalletProvider, ConnectionProvider } from '@solana/wallet-adapter-react';
import { useMemo, useState, useEffect } from 'react';
import { Geist, Geist_Mono } from "next/font/google";
const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

function WalletAdapter({ children }: { children: React.ReactNode }) {
  const wallets = useMemo(() => [], []);
  const endpoint = useMemo(() => process.env.NEXT_PUBLIC_SOLANA_RPC || '', []);
  const [showHowItWorks, setShowHowItWorks] = useState(false);
  
  useEffect(() => {
    // Auto-show modal on every page load
    setShowHowItWorks(true);
  }, []);
  
  return (
    <ConnectionProvider endpoint={endpoint}>
      <WalletProvider wallets={wallets} autoConnect>
        <HowItWorksModal 
          isOpen={showHowItWorks} 
          onClose={() => setShowHowItWorks(false)} 
        />
        {children}
      </WalletProvider>
    </ConnectionProvider>
  );
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <title>PokeStrategy - Strategic Pokemon Card Acquisition</title>
        <meta name="description" content="PokeStrategy - Join acquisition pools to strategically acquire Pokemon card supply through coordinated market dominance" />
        <link rel="icon" href="/Vibeify-Logo-jpeg-file (1).jpg" />
        <meta property="og:title" content="PokeStrategy - Strategic Pokemon Card Acquisition" />
        <meta property="og:description" content="Join acquisition pools to strategically acquire Pokemon card supply through coordinated market dominance" />
        <meta property="og:image" content="/Vibeify-Logo-jpeg-file (1).jpg" />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <PrivyProvider
          appId={process.env.NEXT_PUBLIC_PRIVY_APP_ID || ''}
          config={{
            appearance: {
              walletChainType: 'solana-only',
              walletList: ['phantom']
            },
            externalWallets: {
              solana: {
                connectors: toSolanaWalletConnectors({
                  shouldAutoConnect: true,
                }),
              },
            },
          }}
        >
          <WalletAdapter>
            {children}
            <Footer />
          </WalletAdapter>
        </PrivyProvider>
      </body>
    </html>
  );
}
