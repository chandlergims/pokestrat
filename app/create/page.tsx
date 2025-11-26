'use client';

import Navbar from '@/components/Navbar';
import ImageUpload from '@/components/ImageUpload';
import FormInput from '@/components/FormInput';
import FormTextarea from '@/components/FormTextarea';
import Modal from '@/components/Modal';
import { useState } from 'react';
import { usePrivy } from '@privy-io/react-auth';
import { useWallets } from '@privy-io/react-auth/solana';
import { useConnection } from '@solana/wallet-adapter-react';
import { prepareCoinCreation } from '@/lib/services/mintService';
import { createCoinOnMeteora } from '@/lib/services/meteoraService';
import { saveCoin } from '@/lib/services/coinService';
import { PublicKey } from '@solana/web3.js';
import bs58 from 'bs58';
import { CaretDown } from 'phosphor-react';
import Script from 'next/script';

export default function CreateCoin() {
  const { authenticated, login } = usePrivy();
  const { wallets } = useWallets();
  const { connection } = useConnection();
  const [formData, setFormData] = useState({
    name: '',
    ticker: '',
    description: '',
    initialBuyAmount: '',
    xLink: '',
    websiteLink: '',
    telegramLink: '',
    telegramHandle: '',
    githubRepo: '',
    image: null as File | null,
  });

  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [showOptionalFields, setShowOptionalFields] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    
    // Validate initialBuyAmount
    if (name === 'initialBuyAmount') {
      const numValue = parseFloat(value);
      if (value !== '' && (numValue < 0.1 || numValue > 5)) {
        return; // Don't update if outside range
      }
    }
    
    // Validate name length (max 32 characters)
    if (name === 'name' && value.length > 32) {
      return;
    }
    
    // Validate ticker length (max 10 characters)
    if (name === 'ticker' && value.length > 10) {
      return;
    }
    
    // Validate description length (max 100 characters)
    if (name === 'description' && value.length > 100) {
      return;
    }
    
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setFormData(prev => ({
        ...prev,
        image: file
      }));
      
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // If not authenticated, open Privy login instead of modal
    if (!authenticated) {
      login();
      return;
    }
    
    setShowModal(true);
  };

  const handleFinalSubmit = async () => {
    if (!authenticated || !formData.image) return;

    try {
      setIsCreating(true);
      
      const { mintKeypair, imageUrl, metadataUrl } = await prepareCoinCreation({
        imageFile: formData.image,
        name: formData.name,
        ticker: formData.ticker,
        description: formData.description,
        xLink: formData.xLink,
        websiteLink: formData.websiteLink,
        telegramLink: formData.telegramLink,
      });
      
      if (!wallets || wallets.length === 0) {
        throw new Error('No Solana wallet connected!');
      }
      
      const wallet = wallets[0];
      const walletPublicKey = new PublicKey(wallet.address);
      
      const meteoraResult = await createCoinOnMeteora({
        name: formData.name,
        ticker: formData.ticker,
        description: formData.description,
        imageUrl: metadataUrl,
        initialBuyAmount: formData.initialBuyAmount ? parseFloat(formData.initialBuyAmount) : undefined,
        walletPublicKey: walletPublicKey,
        baseMintKeypair: mintKeypair,
      });

      if (!meteoraResult.success || !meteoraResult.transactions) {
        throw new Error(meteoraResult.error || 'Failed to get Meteora transactions');
      }

      const validTransactions = meteoraResult.transactions.filter((tx) => tx);
      
      console.log('🚀 Signing', validTransactions.length, 'transactions (one at a time, via Privy)');

      const results: { signature: string }[] = [];

      for (let i = 0; i < validTransactions.length; i++) {
        const tx = validTransactions[i];
        console.log(`Signing transaction ${i + 1}/${validTransactions.length}`);

        // 1) Serialize the transaction to bytes
        const serialized = tx.serialize({
          requireAllSignatures: false,
          verifySignatures: false,
        });

        // 2) Let Privy sign AND send it
        const res = await wallet.signAndSendTransaction!({
          chain: 'solana:mainnet',
          transaction: new Uint8Array(serialized),
        });

        // 3) Normalize signature to base58 for confirmTransaction
        const sigBase58 =
          typeof res.signature === 'string'
            ? res.signature
            : bs58.encode(res.signature);

        await connection.confirmTransaction(sigBase58, 'confirmed');
        results.push({ signature: sigBase58 });

        console.log(`Transaction ${i + 1} confirmed:`, sigBase58);
      }

      console.log('✅ All transactions confirmed!');

      await saveCoin({
        name: formData.name,
        ticker: formData.ticker,
        description: formData.description,
        image: imageUrl,
        initialBuyAmount: formData.initialBuyAmount,
        xLink: formData.xLink,
        websiteLink: formData.websiteLink,
        telegramLink: formData.telegramLink,
        contractAddress: meteoraResult.contractAddress!,
        createdBy: wallet.address, // Store creator's wallet address
        ipfsMetadata: metadataUrl,
        verified: false,
        marketCap: 0,
        holders: 0,
        volume24h: 0,
        priceChange24h: 0,
      }, 'active'); // Admin creates with 'active' status
      
      window.location.href = `/coin/${meteoraResult.contractAddress}`;

    } catch (error) {
      console.error('❌ Error:', error);
      setIsCreating(false);
    }
  };

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#f7f6fb' }}>
      <Navbar />
      <main className="mx-auto max-w-md px-4 py-12">
        <div className="mb-8 text-center">
          <p className="text-gray-600 text-sm max-w-sm mx-auto mb-6">
            Mint your vibe-coded creations, turn them into liquid ecosystems
          </p>
        </div>

        <div className="min-h-[750px]">
        <form onSubmit={handleFormSubmit} className="space-y-5">
          {/* Image Upload */}
          <div className="flex justify-center">
            <label className="cursor-pointer group">
              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="hidden"
                required
              />
              <div className="w-28 h-28 border-2 border-dashed border-gray-400 rounded-xl flex items-center justify-center hover:border-gray-500 transition-colors overflow-hidden" style={{ backgroundColor: '#e8e7f0' }}>
                {imagePreview ? (
                  <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                ) : (
                  <div className="text-center">
                    <svg className="w-10 h-10 text-gray-500 mx-auto mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    <p className="text-xs text-gray-500">Upload</p>
                  </div>
                )}
              </div>
            </label>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Name* <span className="text-xs text-gray-500">({formData.name.length}/32 characters)</span>
            </label>
            <FormInput
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Your coin's name"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Ticker* <span className="text-xs text-gray-500">({formData.ticker.length}/10 characters)</span>
            </label>
            <FormInput
              name="ticker"
              value={formData.ticker}
              onChange={handleChange}
              placeholder="Token symbol"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description* <span className="text-xs text-gray-500">({formData.description.length}/100 characters)</span>
            </label>
            <FormTextarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Explain your vibe-coded creation"
              required
              rows={3}
            />
          </div>

          <button
            type="button"
            onClick={() => setShowOptionalFields(!showOptionalFields)}
            className="w-full text-sm text-gray-900 hover:text-gray-700 font-semibold cursor-pointer flex items-center justify-center gap-2"
          >
            {showOptionalFields ? 'Hide optional fields' : 'Show optional fields'}
            <CaretDown 
              size={16} 
              weight="bold"
              className={`transition-transform ${showOptionalFields ? 'rotate-180' : ''}`}
            />
          </button>

          {showOptionalFields && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">X (optional)</label>
                <FormInput
                  name="xLink"
                  value={formData.xLink}
                  onChange={handleChange}
                  placeholder="https://x.com/your-profile"
                  type="url"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Website (optional)</label>
                <FormInput
                  name="websiteLink"
                  value={formData.websiteLink}
                  onChange={handleChange}
                  placeholder="https://your-website.com"
                  type="url"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Telegram (optional)</label>
                <FormInput
                  name="telegramLink"
                  value={formData.telegramLink}
                  onChange={handleChange}
                  placeholder="https://t.me/your-group"
                  type="url"
                />
              </div>
            </>
          )}

          <div className="flex justify-end mt-6">
            <button
              type="submit"
              className="px-6 py-2 bg-gray-900 text-white font-semibold rounded-lg hover:bg-gray-800 transition-colors text-sm cursor-pointer border-b-2 border-black"
            >
              Create
            </button>
          </div>

          <div className="mt-6 text-center text-xs text-gray-500">
            <div>Unsure about launching alone?</div>
            <div className="mt-1">
              Get instant verification, tailored support, and a curated path to launch.{' '}
              <a href="https://form.typeform.com/to/CXMChHlP" target="_blank" rel="noopener noreferrer" className="text-gray-900 hover:text-gray-700 font-medium cursor-pointer">
                Apply here
              </a>
            </div>
          </div>
        </form>
        </div>

        <Modal 
          isOpen={showModal} 
          onClose={() => !isCreating && setShowModal(false)}
          onSubmit={handleFinalSubmit}
          ticker={formData.ticker}
          isCreating={isCreating}
        >
          {isCreating ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
            </div>
          ) : (
            <>
              <div className="relative">
                <input
                  type="number"
                  name="initialBuyAmount"
                  value={formData.initialBuyAmount}
                  onChange={handleChange}
                  placeholder="0.00"
                  min="0.1"
                  max="5"
                  step="0.1"
                  autoComplete="off"
                  className="w-full px-4 py-3 pr-16 rounded-lg bg-gray-100 text-gray-900 font-semibold placeholder-gray-500 focus:outline-none border-0"
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-600 font-semibold">
                  SOL
                </span>
              </div>
              <p className="text-xs text-gray-600 mt-2">
                Tip: Buying a small amount helps protect your coin from snipers
              </p>
            </>
          )}
        </Modal>
      </main>
    </div>
  );
}
