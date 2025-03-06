import { elizaLogger } from '@elizaos/core';

const logger = elizaLogger.child({ module: 'WormholeExplorer' });

/**
 * Get the explorer link for a transaction
 * @param chain The chain name
 * @param txHash The transaction hash
 * @returns The explorer link
 */
export function getExplorerLink(chain: string, txHash: string): string {
  const explorers: Record<string, string> = {
    'ethereum': 'https://etherscan.io/tx/',
    'polygon': 'https://polygonscan.com/tx/',
    'arbitrum': 'https://arbiscan.io/tx/',
    'optimism': 'https://optimistic.etherscan.io/tx/',
    'base': 'https://basescan.org/tx/',
    'avalanche': 'https://snowtrace.io/tx/',
    'solana': 'https://solscan.io/tx/',
    'sui': 'https://explorer.sui.io/txblock/',
    'aptos': 'https://explorer.aptoslabs.com/txn/'
  };

  const baseUrl = explorers[chain.toLowerCase()] || 'https://etherscan.io/tx/';
  return `${baseUrl}${txHash}`;
} 