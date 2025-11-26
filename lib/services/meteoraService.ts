import { Connection, PublicKey } from '@solana/web3.js';
import { buildCurve, DynamicBondingCurveClient } from '@meteora-ag/dynamic-bonding-curve-sdk';

// Initialize Solana connection
const connection = new Connection(
  process.env.NEXT_PUBLIC_SOLANA_RPC || 'https://api.mainnet-beta.solana.com',
  'confirmed'
);

// Initialize Meteora SDK client
const meteoraClient = new DynamicBondingCurveClient(connection, 'confirmed');

// Platform wallet that receives trading fees
const PLATFORM_WALLET = new PublicKey(process.env.NEXT_PUBLIC_PLATFORM_WALLET!);

/**
 * Create curve configuration for Meteora
 * Platform gets 100% of fees, creator gets 0%
 */
export const createCurveConfig = () => {
  return buildCurve({
    totalTokenSupply: 1000000000,
    percentageSupplyOnMigration: 20,
    migrationQuoteThreshold: 80,
    migrationOption: 1, // DAMM V2
    tokenBaseDecimal: 9,
    tokenQuoteDecimal: 9,
    lockedVestingParam: {
      totalLockedVestingAmount: 0,
      numberOfVestingPeriod: 0,
      cliffUnlockAmount: 0,
      totalVestingDuration: 0,
      cliffDurationFromMigrationTime: 0,
    },
    baseFeeParams: {
      baseFeeMode: 0, // FeeSchedulerLinear
      feeSchedulerParam: {
        startingFeeBps: 200,
        endingFeeBps: 200,
        numberOfPeriod: 0,
        totalDuration: 0,
      },
    },
    dynamicFeeEnabled: false,
    activationType: 0, // Slot
    collectFeeMode: 0, // QuoteToken
    migrationFeeOption: 3, // Fixed200bps
    tokenType: 0, // SPL
    partnerLpPercentage: 0,
    creatorLpPercentage: 0,
    partnerLockedLpPercentage: 100, // Platform gets 100%
    creatorLockedLpPercentage: 0,    // Creator gets 0%
    creatorTradingFeePercentage: 0,
    leftover: 0,
    tokenUpdateAuthority: 1, // Immutable
    migrationFee: {
      feePercentage: 0,
      creatorFeePercentage: 0,
    },
    migratedPoolFee: {
      collectFeeMode: 0, // QuoteToken
      dynamicFee: 0, // Disabled
      poolFeeBps: 0,
    },
  });
};

/**
 * Create a new coin on Meteora using createConfigAndPoolWithFirstBuy
 */
export async function createCoinOnMeteora(params: {
  name: string;
  ticker: string;
  description: string;
  imageUrl: string;
  initialBuyAmount?: number;
  walletPublicKey: PublicKey;
  baseMintKeypair: any;
}): Promise<{
  success: boolean; 
  contractAddress?: string; 
  transactions?: any[];
  config?: string;
  error?: string;
}> {
  try {
    const { 
      name, 
      ticker, 
      imageUrl, 
      initialBuyAmount,
      walletPublicKey,
      baseMintKeypair,
    } = params;
    
    console.log('Creating coin on Meteora with params:', {
      name,
      ticker,
      walletPublicKey: walletPublicKey.toString(),
      baseMint: baseMintKeypair.publicKey.toString(),
    });
    
    // Generate new config keypair (createConfigTx will create it)
    const { Keypair } = await import('@solana/web3.js');
    const configKeypair = Keypair.generate();
    console.log('Generated config:', configKeypair.publicKey.toString());

    // Get curve configuration from buildCurve
    const curveConfig = createCurveConfig();
    
    // SOL mint address (native SOL)
    const SOL_MINT = new PublicKey('So11111111111111111111111111111111111111112');
    
    // Convert initialBuyAmount from SOL to lamports if provided
    const BN = (await import('bn.js')).default;
    const buyAmountLamports = initialBuyAmount 
      ? new BN(initialBuyAmount * 1_000_000_000) // SOL to lamports
      : null;

    // Prepare first buy parameters if initial buy amount is provided
    const firstBuyParam = buyAmountLamports ? {
      buyer: walletPublicKey,
      buyAmount: buyAmountLamports,
      minimumAmountOut: new BN(1),
      referralTokenAccount: null,
    } : undefined;

    // Create the config and pool using ALL values from buildCurve
    const transactions = await meteoraClient.pool.createConfigAndPoolWithFirstBuy({
      payer: walletPublicKey,           // User pays gas fees
      config: configKeypair.publicKey,
      feeClaimer: PLATFORM_WALLET,      // Platform receives trading fees (100%)
      leftoverReceiver: PLATFORM_WALLET, // Platform receives any leftover funds
      quoteMint: SOL_MINT,
      // Use all parameters from curveConfig returned by buildCurve()
      ...curveConfig,
      preCreatePoolParam: {
        baseMint: baseMintKeypair.publicKey,
        name: name,
        symbol: ticker,
        uri: imageUrl,
        poolCreator: walletPublicKey,
      },
      firstBuyParam: firstBuyParam,
    });

    // Get recent blockhash and set it on all transactions
    const { blockhash } = await connection.getLatestBlockhash();
    
    transactions.createConfigTx.recentBlockhash = blockhash;
    transactions.createConfigTx.feePayer = walletPublicKey;
    
    transactions.createPoolTx.recentBlockhash = blockhash;
    transactions.createPoolTx.feePayer = walletPublicKey;
    
    if (transactions.swapBuyTx) {
      transactions.swapBuyTx.recentBlockhash = blockhash;
      transactions.swapBuyTx.feePayer = walletPublicKey;
    }
    
    // Sign with backend keypairs BEFORE sending to user
    transactions.createConfigTx.partialSign(configKeypair);
    transactions.createPoolTx.partialSign(baseMintKeypair);
    
    console.log('Transactions signed and prepared');
    
    return {
      success: true,
      contractAddress: baseMintKeypair.publicKey.toString(),
      config: configKeypair.publicKey.toString(),
      transactions: [
        transactions.createConfigTx,
        transactions.createPoolTx,
        transactions.swapBuyTx,
      ].filter(Boolean), // Remove undefined swapBuyTx if no initial buy
    };
  } catch (error) {
    console.error('Error creating coin on Meteora:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}
