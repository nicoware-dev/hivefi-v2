import { elizaLogger, IAgentRuntime } from '@elizaos/core';
import { TransferParams } from '../types';
import { getSigner } from '../utils/wallet';
import { normalizeChainName } from '../utils/chain';
import { getWormholeInstance } from './instance';
import { TokenId, amount, Chain, TokenTransfer, UniversalAddress } from '@wormhole-foundation/sdk';
import { getTokenAddress, getTokenDecimals, getWormholeChain, isWormholeSupported } from '../config';

const logger = elizaLogger.child({ module: 'WormholeTokenTransfer' });

// Map of chain names to block explorers
const BLOCK_EXPLORERS: Record<string, string> = {
  'ethereum': 'https://etherscan.io/tx/',
  'polygon': 'https://polygonscan.com/tx/',
  'bsc': 'https://bscscan.com/tx/',
  'avalanche': 'https://snowtrace.io/tx/',
  'fantom': 'https://ftmscan.com/tx/',
  'arbitrum': 'https://arbiscan.io/tx/',
  'optimism': 'https://optimistic.etherscan.io/tx/',
  'base': 'https://basescan.org/tx/',
  'mantle': 'https://explorer.mantle.xyz/tx/'
};

// Store transfer receipts for tracking
const transferReceipts: Record<string, any> = {};

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

// Add a helper function to safely serialize BigInt values
function safeSerialize(obj: any): any {
  return JSON.stringify(obj, (_, value) =>
    typeof value === 'bigint' ? value.toString() : value
  );
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
 * Create a proper chain address object for the Wormhole SDK
 * @param chain The chain name
 * @param address The address string
 * @returns A properly formatted chain address object
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
 * Transfer tokens from one chain to another using Wormhole
 * 
 * @param runtime The agent runtime
 * @param params The transfer parameters
 * @returns The transaction hash and explorer link
 */
export async function transferTokens(runtime: IAgentRuntime, params: TransferParams): Promise<{txHash: string, explorerLink: string}> {
  const tokenName = params.token || 'tokens';
  logger.info(`Transferring ${params.amount} ${tokenName} from ${params.sourceChain} to ${params.destinationChain}`);
  
  // Store original chain names for reference
  const originalSourceChain = params.sourceChain.toLowerCase();
  const originalDestChain = params.destinationChain.toLowerCase();
  // Store token type for use in error handling
  const tokenType = params.token?.toUpperCase() || 'NATIVE';
  
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
    
    // Get token type
    logger.info(`Token type: ${tokenType}`);
    
    // Get Wormhole chain names
    const wormholeSourceChain = getWormholeChain(sourceChain);
    const wormholeDestChain = getWormholeChain(destChain);
    logger.info(`Wormhole chains: ${wormholeSourceChain} -> ${wormholeDestChain}`);
    
    // Check if both chains are supported by Wormhole
    const sourceSupported = isWormholeSupported(sourceChain);
    const destSupported = isWormholeSupported(destChain);
    
    if (!sourceSupported || !destSupported) {
      logger.error(`One or both chains not supported by Wormhole: ${sourceChain} (${sourceSupported}) -> ${destChain} (${destSupported})`);
      throw new Error(`Unsupported chain(s): ${!sourceSupported ? sourceChain : ''} ${!destSupported ? destChain : ''}`);
    }
    
    // Get token address
    const tokenAddress = getTokenAddress(sourceChain, tokenType);
    
    if (!tokenAddress) {
      logger.error(`No token address found for ${tokenType} on ${sourceChain}`);
      throw new Error(`Unsupported token: ${tokenType} on ${sourceChain}`);
    }
    
    logger.info(`Using token address: ${tokenAddress}`);
    
    // Get chain contexts
    const srcChain = wh.getChain(wormholeSourceChain);
    const dstChain = wh.getChain(wormholeDestChain);
    logger.info(`Got chain contexts for ${wormholeSourceChain} and ${wormholeDestChain}`);
    
    // Create token ID
    let tokenId: TokenId;
    
    if (tokenAddress === 'native') {
      logger.info(`Using native token for ${sourceChain}`);
      // For native tokens, we use a special format that the SDK understands
      tokenId = { 
        chain: wormholeSourceChain, 
        address: 'native' 
      } as TokenId;
    } else {
      logger.info(`Using token address ${tokenAddress} for ${tokenType} on ${sourceChain}`);
      // For contract tokens, we need to ensure the address is properly formatted
      // The SDK expects addresses in the format appropriate for the chain
      tokenId = { 
        chain: wormholeSourceChain, 
        address: tokenAddress 
      } as TokenId;
    }
    
    // Get source and destination addresses
    const signerAddress = signer.address();
    logger.info(`Using signer address: ${signerAddress}`);
    
    // Create properly formatted chain addresses
    const sourceAddress = createChainAddress(wormholeSourceChain, signerAddress);
    const destAddress = createChainAddress(wormholeDestChain, signerAddress);
    
    logger.info(`Created source address: ${safeSerialize(sourceAddress)}`);
    logger.info(`Created destination address: ${safeSerialize(destAddress)}`);
    
    // Parse amount to bigint with appropriate decimals
    const tokenDecimals = getTokenDecimals(tokenType);
    const amountBigInt = BigInt(Math.floor(parseFloat(params.amount) * (10 ** tokenDecimals)));
    logger.info(`Parsed amount: ${amountBigInt} (${tokenDecimals} decimals)`);
    
    // Special handling for USDC
    if (tokenType === 'USDC' && wh.circleTransfer) {
      logger.info('Using Circle CCTP for USDC transfer');
      
      try {
        // Create a Circle transfer
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
        
        const srcTxids = await xfer.initiateTransfer(signer);
        logger.info(`Circle transfer initiated with txids: ${safeSerialize(srcTxids)}`);
        
        // Store the transfer receipt for tracking
        const receipt = {
          type: 'circle',
          sourceChain: originalSourceChain,
          destinationChain: originalDestChain,
          token: tokenType,
          amount: params.amount,
          timestamp: Date.now(),
          status: 'initiated',
          txHash: srcTxids[0],
          transfer: xfer
        };
        
        storeTransferReceipt(srcTxids[0], receipt);
        
        // Return the first transaction ID and explorer link
        const txHash = srcTxids[0];
        const explorerLink = getExplorerLink(originalSourceChain, txHash);
        return { txHash, explorerLink };
      } catch (error: any) {
        logger.error(`Error with Circle transfer: ${error.message}`);
        logger.error(error);
        throw new Error(`Failed to initiate Circle transfer: ${error.message}`);
      }
    }
    
    // Create a token transfer
    logger.info('Creating token transfer...');
    
    try {
      const xfer = await wh.tokenTransfer(
        tokenId,
        amountBigInt,
        sourceAddress,
        destAddress,
        false, // Not automatic for now
        undefined, // No payload
        undefined // No native gas dropoff
      );
      
      logger.info('Created token transfer object');
      
      // Update quote logging
      try {
        const transferDetails = {
          token: tokenId,
          amount: amountBigInt,
          automatic: false
        };
        
        const quote = await TokenTransfer.quoteTransfer(
          wh,
          srcChain,
          dstChain,
          transferDetails
        );
        logger.info(`Transfer quote: ${safeSerialize(quote)}`);
      } catch (error: any) {
        logger.warn(`Error getting transfer quote: ${error.message}`);
        // Continue with transfer even if quote fails
      }
      
      // Initiate the transfer
      logger.info('Initiating token transfer...');
      
      const srcTxids = await xfer.initiateTransfer(signer);
      logger.info(`Token transfer initiated with txids: ${safeSerialize(srcTxids)}`);
      
      // Store the transfer receipt
      const receipt = {
        type: 'token',
        sourceChain: originalSourceChain,
        destinationChain: originalDestChain,
        token: tokenType,
        amount: params.amount.toString(),
        amountBigInt: amountBigInt.toString(),
        timestamp: Date.now(),
        status: 'initiated',
        txHash: srcTxids[0],
        transfer: {
          ...xfer,
          amount: amountBigInt.toString()
        }
      };
      
      storeTransferReceipt(srcTxids[0], receipt);
      
      const txHash = srcTxids[0];
      const explorerLink = getExplorerLink(originalSourceChain, txHash);
      return { txHash, explorerLink };
    } catch (error: any) {
      logger.error(`Error with token transfer: ${error.message}`);
      logger.error(error);
      
      // Check for specific errors and provide more helpful messages
      if (error.message.includes('insufficient funds')) {
        throw new Error(`Insufficient funds for transfer: ${error.message}`);
      } else if (error.message.includes('rate limit') || error.message.includes('Too Many Requests')) {
        throw new Error(`RPC rate limit exceeded: ${error.message}. Please try again later.`);
      } else if (error.message.includes('gas')) {
        throw new Error(`Gas estimation failed: ${error.message}. Please try with a smaller amount.`);
      } else {
        throw new Error(`Failed to initiate token transfer: ${error.message}`);
      }
    }
  } catch (error: any) {
    logger.error(`Error in transferTokens: ${error.message}`);
    logger.error(error);
    throw error;
  }
}

/**
 * Check the status of a transfer
 * @param txHash The transaction hash
 * @returns The transfer status
 */
export async function checkTransferStatus(txHash: string): Promise<{status: string, message: string}> {
  const receipt = getTransferReceipt(txHash);
  
  if (!receipt) {
    return { status: 'unknown', message: 'Transfer not found' };
  }
  
  try {
    const wh = await getWormholeInstance();
    
    if (receipt.type === 'circle') {
      // For Circle transfers
      const xfer = receipt.transfer;
      
      // Check if the transfer is complete
      const isComplete = await xfer.isComplete();
      
      if (isComplete) {
        receipt.status = 'completed';
        return { status: 'completed', message: 'Transfer completed successfully' };
      } else {
        // Check if the attestation is ready
        try {
          const attestIds = await xfer.fetchAttestation(5000); // 5 second timeout
          if (attestIds && attestIds.length > 0) {
            receipt.status = 'attested';
            receipt.attestationIds = attestIds;
            return { status: 'attested', message: 'Transfer attested, ready for redemption' };
          }
        } catch (error) {
          // Attestation not ready yet
        }
        
        return { status: 'pending', message: 'Transfer in progress' };
      }
    } else {
      // For token transfers
      const xfer = receipt.transfer;
      
      // Check if the transfer is complete
      const isComplete = await xfer.isComplete();
      
      if (isComplete) {
        receipt.status = 'completed';
        return { status: 'completed', message: 'Transfer completed successfully' };
      } else {
        // Check if the attestation is ready
        try {
          const attestIds = await xfer.fetchAttestation(5000); // 5 second timeout
          if (attestIds && attestIds.length > 0) {
            receipt.status = 'attested';
            receipt.attestationIds = attestIds;
            return { status: 'attested', message: 'Transfer attested, ready for redemption' };
          }
        } catch (error) {
          // Attestation not ready yet
        }
        
        return { status: 'pending', message: 'Transfer in progress' };
      }
    }
  } catch (error: any) {
    logger.error(`Error checking transfer status: ${error.message}`);
    return { status: 'error', message: `Error checking status: ${error.message}` };
  }
} 