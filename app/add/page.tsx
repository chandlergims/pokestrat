'use client';

import { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import { addHolding, getHoldings, updateHolding } from '@/lib/services/holdingsService';
import { PokemonCard, CardHolding } from '@/types/pokemon';

export default function AddCard() {
  const [existingHoldings, setExistingHoldings] = useState<CardHolding[]>([]);
  const [jsonInput, setJsonInput] = useState('');
  const [quantityOwned, setQuantityOwned] = useState('0');
  const [totalSupply, setTotalSupply] = useState('10000');
  const [targetQuantity, setTargetQuantity] = useState('9000'); // 90% of default supply
  const [totalInvested, setTotalInvested] = useState('0');
  const [notes, setNotes] = useState('');
  const [status, setStatus] = useState<'active' | 'completed'>('active');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [editMessage, setEditMessage] = useState('');
  
  // Bulk card import state
  const [bulkCardsJson, setBulkCardsJson] = useState('');
  const [bulkImportMessage, setBulkImportMessage] = useState('');
  const [bulkImporting, setBulkImporting] = useState(false);

  // Load existing holdings on mount
  useEffect(() => {
    const loadHoldings = async () => {
      const holdings = await getHoldings();
      setExistingHoldings(holdings);
    };
    loadHoldings();
  }, []);

  // Refresh holdings after adding
  const refreshHoldings = async () => {
    const holdings = await getHoldings();
    setExistingHoldings(holdings);
  };

  const handleSubmit = async () => {
    setLoading(true);
    setMessage('');

    try {
      // Parse the JSON
      const cardData: PokemonCard = JSON.parse(jsonInput);

      // Create the holding object
      const holding = {
        cardId: cardData.id,
        card: cardData,
        quantityOwned: parseInt(quantityOwned) || 0,
        totalSupply: parseInt(totalSupply) || 10000,
        averagePurchasePrice: 0,
        totalInvested: parseFloat(totalInvested) || 0,
        targetQuantity: parseInt(targetQuantity) || 5000,
        status,
        notes: notes || `${cardData.name} - ${cardData.set.name}`,
        dateAdded: new Date().toISOString().split('T')[0],
      };

      // Add to Firebase
      const result = await addHolding(holding);

      if (result.success) {
        setMessage(`✅ Successfully added ${cardData.name} to Firebase!`);
        // Clear form
        setJsonInput('');
        setNotes('');
        // Refresh holdings list
        await refreshHoldings();
      } else {
        setMessage(`❌ Error: ${result.message}`);
      }
    } catch (error) {
      setMessage(`❌ Error: ${error instanceof Error ? error.message : 'Invalid JSON'}`);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async (holdingId: string, updates: Partial<CardHolding>) => {
    setEditMessage('');
    const result = await updateHolding(holdingId, updates);
    if (result.success) {
      setEditMessage(`✅ ${result.message}`);
      await refreshHoldings();
    } else {
      setEditMessage(`❌ ${result.message}`);
    }
  };

  const handleBulkImport = async () => {
    setBulkImporting(true);
    setBulkImportMessage('');

    try {
      let parsedData = JSON.parse(bulkCardsJson);
      
      // Handle different data formats
      let cardsData: PokemonCard[];
      
      if (Array.isArray(parsedData)) {
        // Direct array: [...cards]
        cardsData = parsedData;
      } else if (parsedData.data && Array.isArray(parsedData.data)) {
        // API response format: {data: [...cards]}
        cardsData = parsedData.data;
      } else if (parsedData.cards && Array.isArray(parsedData.cards)) {
        // Alternative format: {cards: [...cards]}
        cardsData = parsedData.cards;
      } else {
        setBulkImportMessage('❌ Error: Could not find card array. Please paste either: [cards...] or {data: [cards...]}');
        setBulkImporting(false);
        return;
      }
      
      if (cardsData.length === 0) {
        setBulkImportMessage('❌ Error: No cards found in the data');
        setBulkImporting(false);
        return;
      }

      setBulkImportMessage(`📦 Importing ${cardsData.length} cards to Firebase...`);

      const { db } = await import('@/lib/firebase');
      const { collection, doc, writeBatch } = await import('firebase/firestore');
      
      const batchSize = 500;
      let imported = 0;

      for (let i = 0; i < cardsData.length; i += batchSize) {
        const batch = writeBatch(db);
        const cardsChunk = cardsData.slice(i, i + batchSize);
        
        cardsChunk.forEach((card: PokemonCard) => {
          const cardRef = doc(collection(db, 'allPokemonCards'), card.id);
          batch.set(cardRef, {
            ...card,
            lastUpdated: new Date().toISOString()
          });
        });
        
        await batch.commit();
        imported += cardsChunk.length;
        setBulkImportMessage(`📦 Imported ${imported} / ${cardsData.length} cards...`);
      }

      setBulkImportMessage(`✅ Successfully imported ${imported} cards! Search page will now use this database.`);
      setBulkCardsJson('');
    } catch (error) {
      setBulkImportMessage(`❌ Error: ${error instanceof Error ? error.message : 'Invalid JSON or import failed'}`);
    } finally {
      setBulkImporting(false);
    }
  };

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#f7f6fb' }}>
      <Navbar />
      
      <div className="max-w-6xl mx-auto p-8">
        <h1 className="text-3xl font-bold mb-6">Manage Holdings</h1>

        {/* Edit Existing Holdings Section */}
        {existingHoldings.length > 0 && (
          <div className="mb-8">
            <h2 className="text-2xl font-bold mb-4">Edit Existing Holdings</h2>
            {editMessage && (
              <div className={`mb-4 p-4 rounded ${editMessage.includes('✅') ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                {editMessage}
              </div>
            )}
            <div className="space-y-4">
              {existingHoldings.map((holding) => (
                <div key={holding.id} className="bg-white rounded-lg shadow p-6">
                  <div className="flex items-start gap-4">
                    <img 
                      src={holding.card.images.small} 
                      alt={holding.card.name}
                      className="w-20 h-28 rounded object-cover"
                    />
                    <div className="flex-1">
                      <h3 className="font-bold text-lg mb-2">{holding.card.name}</h3>
                      <p className="text-sm text-gray-600 mb-4">{holding.card.set.name} • {holding.card.rarity}</p>
                      
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        <div>
                          <label className="block text-xs font-semibold text-gray-600 mb-1">Quantity Owned</label>
                          <input
                            type="number"
                            defaultValue={holding.quantityOwned}
                            onBlur={(e) => handleUpdate(holding.id!, { quantityOwned: parseInt(e.target.value) || 0 })}
                            className="w-full p-2 border rounded text-sm"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-gray-600 mb-1">Total Supply</label>
                          <input
                            type="number"
                            defaultValue={holding.totalSupply}
                            onBlur={(e) => handleUpdate(holding.id!, { totalSupply: parseInt(e.target.value) || 0 })}
                            className="w-full p-2 border rounded text-sm"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-gray-600 mb-1">Target Quantity</label>
                          <input
                            type="number"
                            defaultValue={holding.targetQuantity}
                            onBlur={(e) => handleUpdate(holding.id!, { targetQuantity: parseInt(e.target.value) || 0 })}
                            className="w-full p-2 border rounded text-sm"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-gray-600 mb-1">Total Invested ($)</label>
                          <input
                            type="number"
                            step="0.01"
                            defaultValue={holding.totalInvested}
                            onBlur={(e) => handleUpdate(holding.id!, { totalInvested: parseFloat(e.target.value) || 0 })}
                            className="w-full p-2 border rounded text-sm"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-gray-600 mb-1">Status</label>
                          <select
                            defaultValue={holding.status}
                            onChange={(e) => handleUpdate(holding.id!, { status: e.target.value as 'active' | 'completed' })}
                            className="w-full p-2 border rounded text-sm"
                          >
                            <option value="active">Active</option>
                            <option value="completed">Completed</option>
                          </select>
                        </div>
                      </div>
                      
                      <div className="mt-3">
                        <label className="block text-xs font-semibold text-gray-600 mb-1">Notes</label>
                        <textarea
                          defaultValue={holding.notes}
                          onBlur={(e) => handleUpdate(holding.id!, { notes: e.target.value })}
                          className="w-full p-2 border rounded text-sm"
                          rows={2}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Add New Card Section */}
        <h2 className="text-2xl font-bold mb-4">Add New Card</h2>

        <div className="bg-white rounded-lg shadow p-6 mb-4">
          <label className="block mb-2 font-semibold">Paste Pokemon Card JSON:</label>
          <textarea
            value={jsonInput}
            onChange={(e) => setJsonInput(e.target.value)}
            className="w-full h-64 p-4 border rounded font-mono text-sm"
            placeholder='Paste the JSON from Pokemon TCG API here...'
          />
        </div>

        <div className="bg-white rounded-lg shadow p-6 mb-4">
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block mb-2 font-semibold">Quantity Owned:</label>
              <input
                type="number"
                value={quantityOwned}
                onChange={(e) => setQuantityOwned(e.target.value)}
                className="w-full p-2 border rounded"
              />
            </div>

            <div>
              <label className="block mb-2 font-semibold">Total Supply:</label>
              <input
                type="number"
                value={totalSupply}
                onChange={(e) => setTotalSupply(e.target.value)}
                className="w-full p-2 border rounded"
              />
            </div>

            <div>
              <label className="block mb-2 font-semibold">Target Quantity:</label>
              <input
                type="number"
                value={targetQuantity}
                onChange={(e) => setTargetQuantity(e.target.value)}
                className="w-full p-2 border rounded"
              />
            </div>

            <div>
              <label className="block mb-2 font-semibold">Total Invested ($):</label>
              <input
                type="number"
                step="0.01"
                value={totalInvested}
                onChange={(e) => setTotalInvested(e.target.value)}
                className="w-full p-2 border rounded"
              />
            </div>

            <div>
              <label className="block mb-2 font-semibold">Status:</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as 'active' | 'completed')}
                className="w-full p-2 border rounded"
              >
                <option value="active">Active</option>
                <option value="completed">Completed</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block mb-2 font-semibold">Notes (optional):</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full p-2 border rounded"
              rows={3}
              placeholder="Add notes about this card..."
            />
          </div>
        </div>

        <button
          onClick={handleSubmit}
          disabled={loading || !jsonInput}
          className="w-full bg-blue-600 text-white py-3 rounded-lg font-bold hover:bg-blue-700 disabled:bg-gray-400"
        >
          {loading ? 'Adding to Firebase...' : 'Add to Active Targets'}
        </button>

        {message && (
          <div className={`mt-4 p-4 rounded ${message.includes('✅') ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
            {message}
          </div>
        )}

        <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4 mb-12">
          <p className="font-semibold mb-2">Instructions:</p>
          <ol className="list-decimal ml-5 space-y-1 text-sm">
            <li>Search for a card on the Search page</li>
            <li>Click "View Raw API Data" under the card</li>
            <li>Copy the entire JSON</li>
            <li>Paste it in the text area above</li>
            <li>Fill in quantity owned, total supply, and target</li>
            <li>Click "Add to Active Targets"</li>
            <li>Go to Strategy page to see your card!</li>
          </ol>
        </div>

        {/* Bulk Card Import Section */}
        <div className="border-t-4 border-purple-300 pt-8">
          <h2 className="text-2xl font-bold mb-4 text-purple-600">💾 Bulk Import Card Database</h2>
          
          <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 mb-4">
            <p className="font-semibold text-purple-800 mb-2">⚡ Admin Feature - Import All Cards</p>
            <p className="text-sm text-purple-700">
              Import a massive JSON array of Pokemon cards to make them searchable in the Search page. 
              This will store all cards in Firebase for instant searching without API delays.
            </p>
          </div>

          <div className="bg-white rounded-lg shadow p-6 mb-4">
            <label className="block mb-2 font-semibold">Paste Massive Cards Array JSON:</label>
            <textarea
              value={bulkCardsJson}
              onChange={(e) => setBulkCardsJson(e.target.value)}
              className="w-full h-96 p-4 border rounded font-mono text-sm"
              placeholder='Paste array of cards: [{"id": "base1-1", "name": "Alakazam", ...}, {"id": "base1-2", ...}, ...]'
            />
          </div>

          <button
            onClick={handleBulkImport}
            disabled={bulkImporting || !bulkCardsJson}
            className="w-full bg-purple-600 text-white py-3 rounded-lg font-bold hover:bg-purple-700 disabled:bg-gray-400 mb-4"
          >
            {bulkImporting ? 'Importing to Firebase...' : '💾 Import All Cards to Database'}
          </button>

          {bulkImportMessage && (
            <div className={`p-4 rounded ${
              bulkImportMessage.includes('✅') ? 'bg-green-100 text-green-800' : 
              bulkImportMessage.includes('📦') ? 'bg-blue-100 text-blue-800' : 
              'bg-red-100 text-red-800'
            }`}>
              {bulkImportMessage}
            </div>
          )}

          <div className="mt-4 bg-gray-50 border border-gray-200 rounded-lg p-4">
            <p className="font-semibold mb-2 text-sm">How it works:</p>
            <ul className="list-disc ml-5 space-y-1 text-xs text-gray-600">
              <li>Get full card data from Pokemon TCG API</li>
              <li>Format as JSON array: [card1, card2, card3, ...]</li>
              <li>Paste entire array above</li>
              <li>Click "Import All Cards to Database"</li>
              <li>Cards will be stored in Firebase 'allPokemonCards' collection</li>
              <li>Search page can then query Firebase instead of API for faster results!</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
