export interface PokemonCard {
  id: string;
  name: string;
  supertype: string;
  subtypes: string[];
  hp?: string;
  types?: string[];
  set: {
    id: string;
    name: string;
    series: string;
    printedTotal: number;
    total: number;
    releaseDate: string;
  };
  number: string;
  artist: string;
  rarity: string;
  images: {
    small: string;
    large: string;
  };
  tcgplayer?: {
    url: string;
    updatedAt: string;
    prices?: {
      normal?: PriceData;
      holofoil?: PriceData;
      reverseHolofoil?: PriceData;
      '1stEditionHolofoil'?: PriceData;
      '1stEditionNormal'?: PriceData;
      '1stEdition'?: PriceData;
      unlimited?: PriceData;
      [key: string]: PriceData | undefined; // Allow any other price types
    };
  };
}

export interface PriceData {
  low?: number;
  mid?: number;
  high?: number;
  market?: number;
  directLow?: number;
}

export interface CardHolding {
  id?: string; // Firebase document ID
  cardId: string;
  card: PokemonCard;
  quantityOwned: number;
  totalSupply: number; // estimated total in circulation
  averagePurchasePrice: number;
  totalInvested: number;
  targetQuantity: number; // how many we want to own
  status: 'active' | 'completed' | 'paused';
  notes?: string;
  dateAdded: string;
  lastPurchaseDate?: string;
}

export interface Treasury {
  availableBalance: number; // in USD
  totalInvested: number;
  totalValue: number; // current market value of all holdings
  profit: number;
  lastUpdated: string;
}

export interface PriceHistory {
  date: string;
  price: number;
}
