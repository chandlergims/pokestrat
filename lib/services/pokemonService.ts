import { PokemonCard } from '@/types/pokemon';

const POKEMON_TCG_API_BASE = 'https://api.pokemontcg.io/v2';
const API_KEY = process.env.NEXT_PUBLIC_POKEMON_TCG_API_KEY || '';

// Helper function to make API calls
async function fetchFromPokemonAPI(endpoint: string, params?: Record<string, string>) {
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  };
  
  if (API_KEY) {
    headers['X-Api-Key'] = API_KEY;
  }

  const queryParams = params ? `?${new URLSearchParams(params).toString()}` : '';
  const url = `${POKEMON_TCG_API_BASE}${endpoint}${queryParams}`;
  
  const response = await fetch(url, { headers });
  
  if (!response.ok) {
    throw new Error(`Pokemon TCG API error: ${response.statusText}`);
  }
  
  return response.json();
}

// Get a specific card by ID
export async function getCardById(cardId: string): Promise<PokemonCard> {
  const data = await fetchFromPokemonAPI(`/cards/${cardId}`);
  return data.data;
}

// Search for cards with filters
export async function searchCards(params: {
  name?: string;
  set?: string;
  rarity?: string;
  types?: string;
  page?: number;
  pageSize?: number;
}): Promise<{ data: PokemonCard[]; totalCount: number }> {
  const queryParts: string[] = [];
  
  // Build the search query
  if (params.name) queryParts.push(`name:"${params.name}"`);
  if (params.set) queryParts.push(`set.name:"${params.set}"`);
  if (params.rarity) queryParts.push(`rarity:"${params.rarity}"`);
  if (params.types) queryParts.push(`types:"${params.types}"`);
  
  const queryParams: Record<string, string> = {};
  if (queryParts.length > 0) {
    queryParams.q = queryParts.join(' ');
  }
  if (params.page) queryParams.page = params.page.toString();
  if (params.pageSize) queryParams.pageSize = params.pageSize.toString();
  
  const response = await fetchFromPokemonAPI('/cards', queryParams);
  
  return {
    data: response.data,
    totalCount: response.totalCount || response.data.length,
  };
}

// Get cards from a specific set
export async function getCardsFromSet(setId: string): Promise<PokemonCard[]> {
  const data = await fetchFromPokemonAPI('/cards', { q: `set.id:${setId}` });
  return data.data;
}

// Get all available sets
export async function getAllSets() {
  const data = await fetchFromPokemonAPI('/sets');
  return data.data;
}

// Get rare cards from vintage sets (good targets for buyouts)
export async function getRareVintageCards(): Promise<PokemonCard[]> {
  const vintageSets = ['base1', 'base2', 'basep', 'base3', 'base4', 'base5'];
  const rarities = ['Rare Holo', 'Rare Holo EX', 'Rare Holo LV.X', 'Rare Prime', 'Rare Rainbow'];
  
  const cards: PokemonCard[] = [];
  
  for (const setId of vintageSets) {
    try {
      const setCards = await getCardsFromSet(setId);
      const rareCards = setCards.filter(card => 
        rarities.some(rarity => card.rarity?.includes('Rare'))
      );
      cards.push(...rareCards);
    } catch (error) {
      console.error(`Error fetching cards from set ${setId}:`, error);
    }
  }
  
  return cards;
}

// Get current market price for a card
export function getCurrentPrice(card: PokemonCard): number {
  if (!card.tcgplayer?.prices) return 0;
  
  const prices = card.tcgplayer.prices;
  
  // Prioritize holofoil, then 1st edition, then normal
  const priceData = 
    prices.holofoil || 
    prices['1stEditionHolofoil'] || 
    prices.reverseHolofoil || 
    prices['1stEditionNormal'] || 
    prices.normal;
  
  return priceData?.market || priceData?.mid || 0;
}

// Calculate potential ROI for a card based on supply and current ownership
export function calculatePotentialROI(
  currentPrice: number,
  quantityOwned: number,
  totalSupply: number,
  targetOwnership: number // percentage (e.g., 0.5 for 50%)
): {
  targetQuantity: number;
  marketControlPercentage: number;
  estimatedPriceIncrease: number;
  potentialValue: number;
  roi: number;
} {
  const targetQuantity = Math.ceil(totalSupply * targetOwnership);
  const marketControlPercentage = (quantityOwned / totalSupply) * 100;
  
  // Simple model: Every 10% of market control = 50% price increase
  // This is a rough estimate based on the Kabuto example
  const estimatedPriceMultiplier = 1 + (marketControlPercentage / 10) * 0.5;
  const estimatedPriceIncrease = currentPrice * estimatedPriceMultiplier;
  const potentialValue = quantityOwned * estimatedPriceIncrease;
  const invested = quantityOwned * currentPrice;
  const roi = ((potentialValue - invested) / invested) * 100;
  
  return {
    targetQuantity,
    marketControlPercentage,
    estimatedPriceIncrease,
    potentialValue,
    roi,
  };
}
