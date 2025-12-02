import { db } from '@/lib/firebase';
import { 
  collection, 
  addDoc, 
  updateDoc,
  deleteDoc,
  doc, 
  getDocs, 
  query, 
  where,
  orderBy,
  serverTimestamp,
  getDoc,
  setDoc
} from 'firebase/firestore';
import { CardHolding } from '@/types/pokemon';

// Add a new holding to Firebase
export async function addHolding(holding: Omit<CardHolding, 'id'>): Promise<{ success: boolean; message: string; id?: string }> {
  try {
    const holdingsRef = collection(db, 'holdings');
    const docRef = await addDoc(holdingsRef, {
      ...holding,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
    
    return { 
      success: true, 
      message: 'Holding added successfully',
      id: docRef.id
    };
  } catch (error) {
    console.error('Error adding holding:', error);
    return { 
      success: false, 
      message: 'Failed to add holding. Please try again.' 
    };
  }
}

// Get all holdings from Firebase
export async function getHoldings(): Promise<CardHolding[]> {
  try {
    const holdingsRef = collection(db, 'holdings');
    const q = query(holdingsRef, orderBy('dateAdded', 'desc'));
    const querySnapshot = await getDocs(q);
    
    return querySnapshot.docs.map(doc => ({
      ...(doc.data() as CardHolding),
      id: doc.id
    }));
  } catch (error) {
    console.error('Error fetching holdings:', error);
    return [];
  }
}

// Update a holding
export async function updateHolding(
  holdingId: string, 
  updates: Partial<CardHolding>
): Promise<{ success: boolean; message: string }> {
  try {
    const holdingRef = doc(db, 'holdings', holdingId);
    await updateDoc(holdingRef, {
      ...updates,
      updatedAt: serverTimestamp()
    });
    
    return { 
      success: true, 
      message: 'Holding updated successfully' 
    };
  } catch (error) {
    console.error('Error updating holding:', error);
    return { 
      success: false, 
      message: 'Failed to update holding' 
    };
  }
}

// Delete a holding
export async function deleteHolding(holdingId: string): Promise<{ success: boolean; message: string }> {
  try {
    await deleteDoc(doc(db, 'holdings', holdingId));
    return { 
      success: true, 
      message: 'Holding deleted successfully' 
    };
  } catch (error) {
    console.error('Error deleting holding:', error);
    return { 
      success: false, 
      message: 'Failed to delete holding' 
    };
  }
}

// Initialize default holdings (run this once to seed the database)
export async function initializeDefaultHoldings(): Promise<{ success: boolean; message: string }> {
  try {
    const { getCardById } = await import('@/lib/services/pokemonService');
    
    // Check if holdings already exist
    const existingHoldings = await getHoldings();
    if (existingHoldings.length > 0) {
      return { 
        success: false, 
        message: 'Holdings already initialized' 
      };
    }
    
    // Fetch card data
    const [kabutoCard, charizardCard, blastoiseCard, mewCard, pikachuCard] = await Promise.all([
      getCardById('base1-24'),
      getCardById('base1-4'),
      getCardById('base1-2'),
      getCardById('mcd19-1'),
      getCardById('mcd19-6'),
    ]);
    
    const defaultHoldings = [
      {
        cardId: 'base1-24',
        card: kabutoCard,
        quantityOwned: 0,
        totalSupply: 10000,
        averagePurchasePrice: 0,
        totalInvested: 0,
        targetQuantity: 5000,
        status: 'active' as const,
        notes: 'Following @KabutoKing strategy - targeting 50% supply control',
        dateAdded: '2024/12/01',
      },
      {
        cardId: 'base1-4',
        card: charizardCard,
        quantityOwned: 0,
        totalSupply: 50000,
        averagePurchasePrice: 0,
        totalInvested: 0,
        targetQuantity: 20000,
        status: 'active' as const,
        notes: 'High-value target - iconic card with strong market demand',
        dateAdded: '2024/12/01',
      },
      {
        cardId: 'base1-2',
        card: blastoiseCard,
        quantityOwned: 0,
        totalSupply: 30000,
        averagePurchasePrice: 0,
        totalInvested: 0,
        targetQuantity: 12000,
        status: 'active' as const,
        notes: 'Starter Pokemon - high collector value and nostalgia factor',
        dateAdded: '2024/12/01',
      },
      {
        cardId: 'mcd19-1',
        card: mewCard,
        quantityOwned: 0,
        totalSupply: 15000,
        averagePurchasePrice: 0,
        totalInvested: 0,
        targetQuantity: 7500,
        status: 'active' as const,
        notes: 'Limited McDonald\'s promo - low population, high demand',
        dateAdded: '2024/12/01',
      },
      {
        cardId: 'mcd19-6',
        card: pikachuCard,
        quantityOwned: 0,
        totalSupply: 8000,
        averagePurchasePrice: 0,
        totalInvested: 0,
        targetQuantity: 4000,
        status: 'active' as const,
        notes: 'McDonald\'s 2019 Pikachu - popular promo with strong nostalgia appeal',
        dateAdded: '2024/12/01',
      },
    ];
    
    // Add all holdings to Firebase
    await Promise.all(defaultHoldings.map(holding => addHolding(holding)));
    
    return { 
      success: true, 
      message: 'Default holdings initialized successfully' 
    };
  } catch (error) {
    console.error('Error initializing holdings:', error);
    return { 
      success: false, 
      message: 'Failed to initialize holdings' 
    };
  }
}
