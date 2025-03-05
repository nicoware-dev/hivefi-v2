import { elizaLogger, IAgentRuntime } from '@elizaos/core';
import { RedeemParams } from '../types';
import { getSigner } from '../utils/wallet';
import { normalizeChainName } from '../utils/chain';
import { getWormholeInstance } from './instance';
import { TokenTransfer, Chain } from '@wormhole-foundation/sdk';
import { getWormholeChain, isWormholeSupported } from '../config';
import { getTransferReceipt } from './tokenTransfer';

const logger = elizaLogger.child({ module: 'WormholeTokenRedeem' });

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

// Store redeem receipts for tracking
const redeemReceipts: Record<string, any> = {};

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
 * Store a redeem receipt for tracking
 * @param txHash The transaction hash
 * @param receipt The redeem receipt
 */
function storeRedeemReceipt(txHash: string, receipt: any): void {
  // Convert any BigInt values to strings before storing
  const safeReceipt = JSON.parse(safeSerialize(receipt));
  redeemReceipts[txHash] = safeReceipt;
  logger.info(`Stored redeem receipt for transaction ${txHash}`);
}

/**
 * Get a redeem receipt for tracking
 * @param txHash The transaction hash
 * @returns The redeem receipt
 */
export function getRedeemReceipt(txHash: string): any {
  return redeemReceipts[txHash];
}

/**
 * Redeem tokens that were transferred from another chain using Wormhole
 * 
 * @param runtime The agent runtime
 * @param params The redeem parameters
 * @returns The transaction hash and explorer link
 */
export async function redeemTokens(runtime: IAgentRuntime, params: RedeemParams): Promise<{txHash: string, explorerLink: string}> {
  const tokenName = params.token || 'tokens';
  logger.info(`Redeeming ${tokenName} on ${params.chain}${params.transactionId ? ` with transaction ID ${params.transactionId}` : ''}`);
  
  // Store original chain name for reference
  const originalChain = params.chain.toLowerCase();
  const tokenType = params.token?.toUpperCase() || 'UNKNOWN';
  
  try {
    // Normalize chain name
    const destChain = normalizeChainName(params.chain);
    logger.info(`Normalized destination chain: ${destChain}`);
    logger.info(`Original destination chain: ${originalChain}`);
    
    // Get signer for destination chain
    const signer = await getSigner(runtime, destChain);
    logger.info(`Got signer with address: ${signer.address()}`);
    
    // Initialize Wormhole SDK
    const wh = await getWormholeInstance();
    logger.info(`Initialized Wormhole SDK`);
    
    // Get token type
    logger.info(`Token type: ${tokenType}`);
    
    // Get Wormhole chain name
    const wormholeChain = getWormholeChain(destChain);
    logger.info(`Wormhole chain: ${wormholeChain}`);
    
    // Check if the chain is supported by Wormhole
    const isSupported = isWormholeSupported(destChain);
    
    if (!isSupported) {
      logger.error(`Chain not supported by Wormhole: ${destChain}`);
      throw new Error(`Unsupported chain: ${destChain}`);
    }
    
    if (!params.transactionId) {
      logger.error('No transaction ID provided for redemption');
      throw new Error('Transaction ID is required for redemption');
    }
    
    // Get the chain context
    const chainContext = wh.getChain(wormholeChain);
    logger.info(`Got chain context for ${wormholeChain}`);
    
    // Check if we have a stored transfer receipt
    const transferReceipt = getTransferReceipt(params.transactionId);
    
    // Get the transfer from the transaction hash
    logger.info(`Recovering transfer from transaction hash: ${params.transactionId}`);
    
    // Recover the transfer from the transaction hash
    const xfer = await TokenTransfer.from(wh, {
      chain: wormholeChain,
      txid: params.transactionId
    });
    
    logger.info(`Recovered transfer: ${safeSerialize(xfer)}`);
    
    // Wait for the attestation
    logger.info('Waiting for attestation...');
    const attestIds = await xfer.fetchAttestation(60_000); // 60 second timeout
    logger.info(`Got attestation: ${safeSerialize(attestIds)}`);
    
    // Complete the transfer
    logger.info('Completing transfer...');
    
    // Complete the transfer with our signer
    const destTxids = await xfer.completeTransfer(signer);
    logger.info(`Transfer completed with txids: ${safeSerialize(destTxids)}`);
    
    // Store the redeem receipt for tracking
    const receipt = {
      type: 'redeem',
      sourceTransactionId: params.transactionId,
      chain: originalChain,
      token: tokenType,
      timestamp: Date.now(),
      status: 'completed',
      txHash: destTxids[0],
      attestationIds: attestIds
    };
    
    storeRedeemReceipt(destTxids[0], receipt);
    
    // If we have a transfer receipt, update its status
    if (transferReceipt) {
      transferReceipt.status = 'redeemed';
      transferReceipt.redeemTxHash = destTxids[0];
    }
    
    // Return the first transaction ID and explorer link
    const txHash = destTxids[0];
    const explorerLink = getExplorerLink(originalChain, txHash);
    return { txHash, explorerLink };
  } catch (error: any) {
    logger.error(`Error in redeemTokens: ${error.message}`);
    logger.error(error);
    throw error;
  }
}

/**
 * Check the status of a redeem
 * @param txHash The transaction hash
 * @returns The redeem status
 */
export async function checkRedeemStatus(txHash: string): Promise<{status: string, message: string}> {
  const receipt = getRedeemReceipt(txHash);
  
  if (!receipt) {
    return { status: 'unknown', message: 'Redeem not found' };
  }
  
  // For simplicity, we'll just use the stored status
  // In a real implementation, you would check the transaction status on-chain
  
  switch (receipt.status) {
    case 'completed':
      return { status: 'completed', message: 'Redeem completed successfully' };
    case 'confirmed':
      return { status: 'confirmed', message: 'Redeem confirmed on-chain' };
    case 'failed':
      return { status: 'failed', message: 'Redeem failed' };
    default:
      return { status: 'pending', message: 'Redeem in progress' };
  }
} 