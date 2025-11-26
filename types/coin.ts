export interface CoinData {
  id: string;
  name: string;
  ticker: string;
  description: string;
  image: string; // IPFS URL or storage URL
  initialBuyAmount?: string;
  xLink?: string;
  websiteLink?: string;
  telegramLink?: string;
  
  // Meteora/Blockchain data
  contractAddress?: string;
  marketCap?: number;
  holders?: number;
  volume24h?: number;
  priceChange24h?: number;
  
  // Metadata
  createdAt: number;
  createdBy?: string;
  ipfsMetadata?: string; // IPFS hash for metadata JSON
  
  // Status
  status: 'pending' | 'active' | 'failed';
  
  // Verification
  verified: boolean;
  telegramHandle?: string;
  githubRepo?: string;
  verificationNotes?: string;
}

export interface CreateCoinForm {
  name: string;
  ticker: string;
  description: string;
  initialBuyAmount: string;
  xLink: string;
  websiteLink: string;
  telegramLink: string;
  image: File | null;
}

// Export alias for compatibility
export type Coin = CoinData;
