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
  increment,
  serverTimestamp,
  getDoc,
  onSnapshot,
  Unsubscribe
} from 'firebase/firestore';
import { PokemonCard } from '@/types/pokemon';

export interface CommunityRequest {
  id?: string;
  cardId: string;
  cardData: PokemonCard;
  requestCount: number;
  requestedBy: string[]; // Array of wallet addresses
  requesters?: string[]; // Alias for requestedBy (for compatibility)
  createdAt: any;
  lastUpdatedAt: any;
}

// Add a card to community requests
export async function addCommunityRequest(
  cardId: string, 
  cardData: PokemonCard, 
  walletAddress: string
): Promise<{ success: boolean; message: string; alreadyRequested?: boolean }> {
  try {
    const requestsRef = collection(db, 'communityRequests');
    
    // Check if this card already exists
    const q = query(requestsRef, where('cardId', '==', cardId));
    const querySnapshot = await getDocs(q);
    
    if (!querySnapshot.empty) {
      // Card already exists, check if this user already requested it
      const existingDoc = querySnapshot.docs[0];
      const existingData = existingDoc.data() as CommunityRequest;
      
      if (existingData.requestedBy.includes(walletAddress)) {
        return { 
          success: false, 
          message: 'You have already requested this card',
          alreadyRequested: true 
        };
      }
      
      // Add this user to the requestedBy array and increment count
      await updateDoc(doc(db, 'communityRequests', existingDoc.id), {
        requestCount: increment(1),
        requestedBy: [...existingData.requestedBy, walletAddress],
        lastUpdatedAt: serverTimestamp()
      });
      
      return { 
        success: true, 
        message: 'Added to community requests!' 
      };
    } else {
      // Create new request
      await addDoc(requestsRef, {
        cardId,
        cardData,
        requestCount: 1,
        requestedBy: [walletAddress],
        createdAt: serverTimestamp(),
        lastUpdatedAt: serverTimestamp()
      });
      
      return { 
        success: true, 
        message: 'Added to community requests!' 
      };
    }
  } catch (error) {
    console.error('Error adding community request:', error);
    return { 
      success: false, 
      message: 'Failed to add request. Please try again.' 
    };
  }
}

// Get all community requests sorted by request count
export async function getCommunityRequests(): Promise<CommunityRequest[]> {
  try {
    const requestsRef = collection(db, 'communityRequests');
    const q = query(requestsRef, orderBy('requestCount', 'desc'));
    const querySnapshot = await getDocs(q);
    
    return querySnapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
        requesters: data.requestedBy // Map requestedBy to requesters for compatibility
      } as CommunityRequest;
    });
  } catch (error) {
    console.error('Error fetching community requests:', error);
    return [];
  }
}

// Check if user has already requested a card
export async function hasUserRequested(cardId: string, walletAddress: string): Promise<boolean> {
  try {
    const requestsRef = collection(db, 'communityRequests');
    const q = query(requestsRef, where('cardId', '==', cardId));
    const querySnapshot = await getDocs(q);
    
    if (querySnapshot.empty) return false;
    
    const existingData = querySnapshot.docs[0].data() as CommunityRequest;
    return existingData.requestedBy.includes(walletAddress);
  } catch (error) {
    console.error('Error checking user request:', error);
    return false;
  }
}

// Real-time listener for community requests
export function subscribeToCommunityRequests(
  callback: (requests: CommunityRequest[]) => void
): Unsubscribe {
  const requestsRef = collection(db, 'communityRequests');
  const q = query(requestsRef, orderBy('requestCount', 'desc'));
  
  return onSnapshot(q, (querySnapshot) => {
    const requests = querySnapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
        requesters: data.requestedBy // Map requestedBy to requesters for compatibility
      } as CommunityRequest;
    });
    callback(requests);
  }, (error) => {
    console.error('Error in community requests listener:', error);
  });
}

// Shorten wallet address for display
export function shortenAddress(address: string): string {
  if (!address) return '';
  if (address.length < 10) return address;
  return `${address.slice(0, 4)}...${address.slice(-4)}`;
}

// Remove a user's request for a card
export async function removeCommunityRequest(
  cardId: string, 
  walletAddress: string
): Promise<{ success: boolean; message: string }> {
  try {
    const requestsRef = collection(db, 'communityRequests');
    const q = query(requestsRef, where('cardId', '==', cardId));
    const querySnapshot = await getDocs(q);
    
    if (querySnapshot.empty) {
      return { success: false, message: 'Request not found' };
    }
    
    const existingDoc = querySnapshot.docs[0];
    const existingData = existingDoc.data() as CommunityRequest;
    
    if (!existingData.requestedBy.includes(walletAddress)) {
      return { success: false, message: 'You have not requested this card' };
    }
    
    const newRequestedBy = existingData.requestedBy.filter(addr => addr !== walletAddress);
    
    if (newRequestedBy.length === 0) {
      // Delete the document if no one is requesting it anymore
      await deleteDoc(doc(db, 'communityRequests', existingDoc.id));
    } else {
      // Update the document
      await updateDoc(doc(db, 'communityRequests', existingDoc.id), {
        requestCount: increment(-1),
        requestedBy: newRequestedBy,
        lastUpdatedAt: serverTimestamp()
      });
    }
    
    return { success: true, message: 'Request removed' };
  } catch (error) {
    console.error('Error removing community request:', error);
    return { success: false, message: 'Failed to remove request' };
  }
}
