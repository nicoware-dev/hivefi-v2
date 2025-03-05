import { elizaLogger } from '@elizaos/core';
import { Chain, isChain } from '@wormhole-foundation/sdk';

const logger = elizaLogger.child({ module: 'WormholeChains' });

/**
 * Mapping from our internal chain names to Wormhole SDK chain names
 */
export const CHAIN_MAPPING: Record<string, string> = {
  'ethereum': 'Ethereum',
  'ethereum-sepolia': 'EthereumSepolia',
  'bsc': 'Bsc',
  'polygon': 'Polygon',
  'avalanche': 'Avalanche',
  'fantom': 'Fantom',
  'celo': 'Celo',
  'arbitrum': 'Arbitrum',
  'optimism': 'Optimism',
  'base': 'Base',
  'solana': 'Solana',
  'sui': 'Sui',
  'mantle': 'Mantle', 
};

/**
 * Get the Wormhole SDK chain name for our internal chain name
 * @param chain Our internal chain name
 * @returns The Wormhole SDK chain name
 */
export function getWormholeChain(chain: string): Chain {
  const normalizedChain = chain.toLowerCase();
  const wormholeChain = CHAIN_MAPPING[normalizedChain];
  
  if (!wormholeChain || !isChain(wormholeChain)) {
    logger.warn(`No valid Wormhole chain mapping for ${chain}, using Ethereum as fallback`);
    return 'Ethereum' as Chain;
  }
  
  return wormholeChain as Chain;
}

/**
 * Check if a chain is directly supported by the Wormhole SDK
 * @param chain The chain to check
 * @returns True if the chain is directly supported, false otherwise
 */
export function isWormholeSupported(chain: string): boolean {
  const normalizedChain = chain.toLowerCase();
  
/*   // Mantle is not directly supported
  if (normalizedChain === 'mantle') {
    return false;
  } */
  
  const wormholeChain = CHAIN_MAPPING[normalizedChain];
  return !!wormholeChain && isChain(wormholeChain);
}

/**
 * Get the chain ID for a chain
 * @param chain The chain to get the ID for
 * @returns The chain ID
 */
export function getChainId(chain: string): number {
  const normalizedChain = chain.toLowerCase();
  
  switch (normalizedChain) {
    case 'ethereum':
      return 1;
    case 'ethereum-sepolia':
      return 11155111;
    case 'bsc':
      return 56;
    case 'polygon':
      return 137;
    case 'avalanche':
      return 43114;
    case 'fantom':
      return 250;
    case 'celo':
      return 42220;
    case 'arbitrum':
      return 42161;
    case 'optimism':
      return 10;
    case 'base':
      return 8453;
    case 'mantle':
      return 5000;
    default:
      logger.warn(`No chain ID configured for ${chain}, using Ethereum as fallback`);
      return 1; // Fallback to Ethereum
  }
} 