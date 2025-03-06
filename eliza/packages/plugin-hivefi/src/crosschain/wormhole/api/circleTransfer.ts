import { elizaLogger, IAgentRuntime } from '@elizaos/core';
import { TransferParams } from '../types';
import { getSigner, getBalance } from '../utils/wallet';
import { normalizeChainName } from '../utils/chain';
import { getWormholeInstance } from './instance';
import { Chain, UniversalAddress } from '@wormhole-foundation/sdk';
import { getWormholeChain, isWormholeSupported } from '../config';
import { getTokenAddress, getTokenDecimals } from '../config/tokens';

const logger = elizaLogger.child({ module: 'CircleTransfer' });

// List of chains supported by Circle Bridge for USDC transfers
const CIRCLE_SUPPORTED_CHAINS = [
  'ethereum',
  'avalanche',
  'optimism',
  'arbitrum',
  'solana',
  'base',
  'polygon',
  'sui',
  'aptos'
];

/**
 * Check if a chain is supported by Circle Bridge
 * @param chain The chain to check
 * @returns True if the chain is supported by Circle Bridge
 */
export function isCircleSupported(chain: string): boolean {
  const normalizedChain = chain.toLowerCase();
  return CIRCLE_SUPPORTED_CHAINS.includes(normalizedChain);
}

// Map of chain names to block explorers
const BLOCK_EXPLORERS: Record<string, string> = {
  'ethereum': 'https://etherscan.io/tx/',
  'polygon': 'https://polygonscan.com/tx/',
  'bsc': 'https://bscscan.com/tx/',
  'avalanche': 'https://snowtrace.io/tx/',
  'arbitrum': 'https://arbiscan.io/tx/',
  'optimism': 'https://optimistic.etherscan.io/tx/',
  'base': 'https://basescan.org/tx/',
  'mantle': 'https://explorer.mantle.xyz/tx/'
};

// Store transfer receipts for tracking
const transferReceipts: Record<string, any> = {};

/**
 * Helper function to safely serialize objects with BigInt values
 * @param obj The object to serialize
 * @returns A JSON string with BigInt values converted to strings
 */
function safeSerialize(obj: any): string {
  return JSON.stringify(obj, (_, value) => 
    typeof value === 'bigint' ? value.toString() : value
  );
}

/**
 * Get a block explorer link for a transaction
 * @param chain The chain name
 * @param txHash The transaction hash
 * @returns The block explorer link
 */
function getExplorerLink(chain: string, txHash: string): string {
  const normalizedChain = chain.toLowerCase();
  const baseUrl = BLOCK_EXPLORERS[normalizedChain] || 'https://etherscan.io/tx/';
  return `${baseUrl}${txHash}`;
}

/**
 * Store a transfer receipt for tracking
 * @param txHash The transaction hash
 * @param receipt The transfer receipt
 */
function storeTransferReceipt(txHash: string, receipt: any): void {
  // Convert any BigInt values to strings before storing
  const safeReceipt = JSON.parse(safeSerialize(receipt));
  transferReceipts[txHash] = safeReceipt;
  logger.info(`Stored transfer receipt for transaction ${txHash}`);
}

/**
 * Get a transfer receipt for tracking
 * @param txHash The transaction hash
 * @returns The transfer receipt
 */
export function getTransferReceipt(txHash: string): any {
  return transferReceipts[txHash];
}

/**
 * Create a chain address object for the Wormhole SDK
 * @param chain The chain
 * @param address The address
 * @returns The chain address object
 */
function createChainAddress(chain: Chain, address: string) {
  // Ensure address is properly formatted for UniversalAddress
  // Remove '0x' prefix if present for EVM addresses
  const cleanAddress = address.startsWith('0x') ? address.slice(2) : address;
  
  try {
    // Create a UniversalAddress instance
    const universalAddress = new UniversalAddress(cleanAddress);
    
    // Create a ChainAddress object
    const chainAddress = {
      chain,
      address: universalAddress
    };
    
    logger.info(`Created chain address for ${chain}: ${universalAddress.toString()}`);
    return chainAddress;
  } catch (error: any) {
    logger.error(`Error creating chain address: ${error.message}`);
    throw new Error(`Failed to create chain address for ${chain}: ${error.message}`);
  }
}

/**
 * Transfer USDC from one chain to another using Circle Bridge
 * 
 * @param runtime The agent runtime
 * @param params The transfer parameters
 * @returns The transaction hash and explorer link
 */
export async function transferCircleUSDC(runtime: IAgentRuntime, params: TransferParams): Promise<{txHash: string, explorerLink: string}> {
  const tokenName = params.token || 'USDC';
  
  // Verify that we're transferring USDC
  if (tokenName.toUpperCase() !== 'USDC') {
    throw new Error('Circle Bridge only supports USDC transfers');
  }
  
  logger.info(`Transferring ${params.amount} USDC from ${params.sourceChain} to ${params.destinationChain} via Circle Bridge`);
  
  // Store original chain names for reference
  const originalSourceChain = params.sourceChain.toLowerCase();
  const originalDestChain = params.destinationChain.toLowerCase();
  
  // Check if both chains are supported by Circle Bridge
  if (!isCircleSupported(originalSourceChain)) {
    throw new Error(`Source chain ${originalSourceChain} is not supported by Circle Bridge. Supported chains are: ${CIRCLE_SUPPORTED_CHAINS.join(', ')}`);
  }
  
  if (!isCircleSupported(originalDestChain)) {
    throw new Error(`Destination chain ${originalDestChain} is not supported by Circle Bridge. Supported chains are: ${CIRCLE_SUPPORTED_CHAINS.join(', ')}`);
  }
  
  try {
    // Normalize chain names
    const sourceChain = normalizeChainName(params.sourceChain);
    const destChain = normalizeChainName(params.destinationChain);
    
    logger.info(`Normalized chains: ${sourceChain} -> ${destChain}`);
    logger.info(`Original chains: ${originalSourceChain} -> ${originalDestChain}`);
    
    // Get signer for source chain
    const signer = await getSigner(runtime, sourceChain);
    logger.info(`Got signer with address: ${signer.address()}`);
    
    // Initialize Wormhole SDK
    const wh = await getWormholeInstance();
    logger.info(`Initialized Wormhole SDK`);
    
    // Get Wormhole chain names
    const wormholeSourceChain = getWormholeChain(sourceChain);
    const wormholeDestChain = getWormholeChain(destChain);
    logger.info(`Wormhole chains: ${wormholeSourceChain} -> ${wormholeDestChain}`);
    
    // Check if both chains are supported by Circle
    // This is different from Wormhole support - we need to check Circle support specifically
    if (!wh.circleTransfer) {
      logger.error('Circle Bridge is not available in the Wormhole SDK');
      throw new Error('Circle Bridge is not available');
    }
    
    // Get USDC token address
    const tokenAddress = getTokenAddress(sourceChain, 'USDC');
    
    if (!tokenAddress) {
      logger.error(`No USDC token address found for ${sourceChain}`);
      throw new Error(`USDC not supported on ${originalSourceChain}`);
    }
    
    logger.info(`Using USDC token address: ${tokenAddress}`);
    
    // Get source and destination addresses
    const signerAddress = signer.address();
    logger.info(`Using signer address: ${signerAddress}`);
    
    // Create properly formatted chain addresses
    const sourceAddress = createChainAddress(wormholeSourceChain, signerAddress);
    const destAddress = createChainAddress(wormholeDestChain, signerAddress);
    
    logger.info(`Created source address: ${safeSerialize(sourceAddress)}`);
    logger.info(`Created destination address: ${safeSerialize(destAddress)}`);
    
    // Parse amount to bigint with appropriate decimals
    const tokenDecimals = getTokenDecimals('USDC');
    const amountBigInt = BigInt(Math.floor(parseFloat(params.amount) * (10 ** tokenDecimals)));
    logger.info(`Parsed amount: ${amountBigInt} (${tokenDecimals} decimals)`);
    
    // Before initiating the transfer, check if the wallet has enough funds for gas
    try {
      // Get the wallet balance for gas
      const nativeBalance = await getBalance(runtime, sourceChain, signerAddress);
      logger.info(`Native token balance on ${sourceChain}: ${nativeBalance}`);
      
      // If native balance is 0, throw a more helpful error
      if (nativeBalance === '0' || nativeBalance === '0.0') {
        throw new Error(`Your wallet doesn't have any ${originalSourceChain} tokens to pay for gas fees. Please fund your wallet with some ${originalSourceChain} tokens first.`);
      }
      
      // Check USDC balance - pass 'USDC' as the token address to use the known address mapping
      let usdcBalance;
      let balanceCheckRetries = 0;
      const maxBalanceRetries = 3;
      
      while (balanceCheckRetries < maxBalanceRetries) {
        try {
          usdcBalance = await getBalance(runtime, sourceChain, signerAddress, 'USDC');
          logger.info(`USDC balance on ${sourceChain}: ${usdcBalance}`);
          break; // If successful, exit the retry loop
        } catch (error: any) {
          balanceCheckRetries++;
          logger.warn(`USDC balance check attempt ${balanceCheckRetries} failed: ${error.message}`);
          
          if (balanceCheckRetries >= maxBalanceRetries) {
            logger.error(`Failed to check USDC balance after ${maxBalanceRetries} attempts`);
            throw new Error(`Failed to check your USDC balance: ${error.message}`);
          }
          
          // Wait before retrying (exponential backoff)
          await new Promise(resolve => setTimeout(resolve, 1000 * balanceCheckRetries));
        }
      }
      
      // If we couldn't get the balance, use a default of 0
      if (!usdcBalance) {
        usdcBalance = '0';
        logger.warn(`Using default USDC balance of 0 due to balance check failures`);
      }
      
      // Convert amount to a number for comparison
      const amountNum = parseFloat(params.amount);
      const balanceNum = parseFloat(usdcBalance);
      
      // If USDC balance is less than the amount to transfer, throw an error
      if (balanceNum < amountNum) {
        throw new Error(`You don't have enough USDC on ${originalSourceChain}. Your balance is ${usdcBalance} USDC, but you're trying to transfer ${params.amount} USDC.`);
      }
      
      // Create a Circle transfer
      logger.info('Creating Circle USDC transfer...');
      
      const xfer = await wh.circleTransfer(
        amountBigInt,
        sourceAddress,
        destAddress,
        false, // Not automatic for now
        undefined, // No payload
        undefined // No native gas dropoff
      );
      
      logger.info('Created Circle transfer object');
      
      // Initiate the transfer with our signer
      logger.info('Initiating Circle transfer...');
      
      try {
        const srcTxids = await xfer.initiateTransfer(signer);
        logger.info(`Circle transfer initiated with txids: ${safeSerialize(srcTxids)}`);
        
        // Store the transfer receipt for tracking
        const receipt = {
          type: 'circle',
          sourceChain: originalSourceChain,
          destinationChain: originalDestChain,
          token: 'USDC',
          amount: params.amount,
          timestamp: Date.now(),
          status: 'initiated',
          txHash: srcTxids[0]
        };
        
        storeTransferReceipt(srcTxids[0], receipt);
        
        // Return the first transaction ID and explorer link
        const txHash = srcTxids[0];
        const explorerLink = getExplorerLink(originalSourceChain, txHash);
        return { txHash, explorerLink };
      } catch (error: any) {
        logger.error(`Error initiating Circle transfer: ${error.message}`);
        logger.error(error);
        
        // Provide specific error messages based on the error type
        if (error.code === 'INSUFFICIENT_FUNDS' || error.message.includes('insufficient funds')) {
          throw new Error(`Insufficient funds for USDC transfer: ${error.message}`);
        } else if (error.message.includes('rate limit') || error.message.includes('Too Many Requests')) {
          throw new Error(`RPC rate limit exceeded: ${error.message}. Please try again later.`);
        } else if (error.message.includes('gas')) {
          throw new Error(`Gas estimation failed: ${error.message}. Please try with a smaller amount.`);
        } else if (error.message.includes('rejected') || error.message.includes('denied')) {
          throw new Error(`Transaction rejected: ${error.message}`);
        } else if (error.message.includes('nonce')) {
          throw new Error(`Transaction nonce error: ${error.message}. Please try again.`);
        } else {
          throw new Error(`Failed to initiate Circle USDC transfer: ${error.message}`);
        }
      }
    } catch (error: any) {
      logger.error(`Error with Circle transfer: ${error.message}`);
      logger.error(error);
      throw error;
    }
  } catch (error: any) {
    logger.error(`Error in transferCircleUSDC: ${error.message}`);
    logger.error(error);
    throw error;
  }
}

/**
 * Check the status of a Circle transfer
 * @param txHash The transaction hash
 * @returns The transfer status
 */
export async function checkCircleTransferStatus(txHash: string): Promise<{status: string, message: string}> {
  const receipt = getTransferReceipt(txHash);
  
  if (!receipt) {
    return { status: 'unknown', message: 'Transfer not found' };
  }
  
  try {
    // Only proceed if this is a Circle transfer
    if (receipt.type !== 'circle') {
      return { status: 'unknown', message: 'Not a Circle transfer' };
    }
    
    // Check if the transfer has been completed
    if (receipt.status === 'completed') {
      return { status: 'completed', message: 'Transfer completed' };
    }
    
    // Check if the transfer has been redeemed
    if (receipt.status === 'redeemed') {
      return { status: 'redeemed', message: 'Transfer redeemed' };
    }
    
    // For Circle transfers, we can't easily check the status on-chain without additional SDK support
    // So we'll just return a generic pending status
    logger.info(`Circle transfer ${txHash} is still pending`);
    return { status: 'pending', message: 'Circle transfer in progress. This may take several minutes to complete.' };
  } catch (error: any) {
    logger.error(`Error checking Circle transfer status: ${error.message}`);
    return { status: 'error', message: `Error checking status: ${error.message}` };
  }
} 