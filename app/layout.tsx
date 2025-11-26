'use client';

import "./globals.css";
import { PrivyProvider } from '@privy-io/react-auth';
import Footer from '@/components/Footer';
import { toSolanaWalletConnectors } from '@privy-io/react-auth/solana';
import { WalletProvider, ConnectionProvider } from '@solana/wallet-adapter-react';
import { useMemo, useState, useEffect } from 'react';
import { Geist, Geist_Mono } from "next/font/google";
import LoadingSpinner from '@/components/LoadingSpinner';

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

function LoadingWrapper({ children }: { children: React.ReactNode }) {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Only show loader on initial page load/refresh
    const timer = setTimeout(() => {
      setLoading(false);
    }, 800);

    return () => clearTimeout(timer);
  }, []); // Empty dependency array - only runs once on mount

  if (loading) {
    return <LoadingSpinner />;
  }

  return <>{children}</>;
}

function WalletAdapter({ children }: { children: React.ReactNode }) {
  const wallets = useMemo(() => [], []);
  const endpoint = useMemo(() => process.env.NEXT_PUBLIC_SOLANA_RPC || '', []);
  
  return (
    <ConnectionProvider endpoint={endpoint}>
      <WalletProvider wallets={wallets} autoConnect>
        <LoadingWrapper>
          {children}
        </LoadingWrapper>
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
        <title>Vibeify</title>
        <meta name="description" content="Launch and trade memecoins on Solana" />
        <link rel="icon" href="/Vibeify-Logo-jpeg-file (1).jpg" />
        <meta property="og:title" content="Vibeify" />
        <meta property="og:description" content="Launch and trade memecoins on Solana" />
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
