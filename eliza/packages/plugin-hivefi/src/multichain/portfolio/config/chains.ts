import { ChainMapping } from '../types';

/**
 * Mapping of Zerion chain IDs to human-readable names
 * This helps translate the chain IDs returned by Zerion API to more user-friendly names
 */
export const chainMapping: ChainMapping = {
  'ethereum': {
    name: 'ethereum',
    displayName: 'Ethereum'
  },
  'polygon': {
    name: 'polygon',
    displayName: 'Polygon'
  },
  'arbitrum': {
    name: 'arbitrum',
    displayName: 'Arbitrum'
  },
  'optimism': {
    name: 'optimism',
    displayName: 'Optimism'
  },
  'base': {
    name: 'base',
    displayName: 'Base'
  },
  'bsc': {
    name: 'bsc',
    displayName: 'BNB Chain'
  },
  'binance-smart-chain': {
    name: 'binance-smart-chain',
    displayName: 'Binance Smart Chain'
  },
  'avalanche': {
    name: 'avalanche',
    displayName: 'Avalanche'
  },
  'mantle': {
    name: 'mantle',
    displayName: 'Mantle'
  },
  'zksync-era': {
    name: 'zksync-era',
    displayName: 'zkSync Era'
  },
  'zora': {
    name: 'zora',
    displayName: 'Zora'
  },
  'linea': {
    name: 'linea',
    displayName: 'Linea'
  },
  'fantom': {
    name: 'fantom',
    displayName: 'Fantom'
  },
  'celo': {
    name: 'celo',
    displayName: 'Celo'
  },
  'gnosis': {
    name: 'gnosis',
    displayName: 'Gnosis'
  },
  'moonbeam': {
    name: 'moonbeam',
    displayName: 'Moonbeam'
  },
  'harmony': {
    name: 'harmony',
    displayName: 'Harmony'
  },
  'metis': {
    name: 'metis',
    displayName: 'Metis'
  },
  'sonic': {
    name: 'sonic',
    displayName: 'Sonic'
  }
};

/**
 * Get a human-readable chain name from a Zerion chain ID
 * @param chainId The chain ID from Zerion API
 * @returns A user-friendly chain name
 */
export function getChainDisplayName(chainId: string): string {
  return chainMapping[chainId]?.displayName || formatChainName(chainId);
}

/**
 * Format a chain ID into a readable name if not found in the mapping
 * @param chainId The chain ID to format
 * @returns A formatted chain name
 */
function formatChainName(chainId: string): string {
  // Convert kebab-case or snake_case to Title Case
  return chainId
    .replace(/[-_]/g, ' ')
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
}

/**
 * Check if a chain is supported by our mapping
 * @param chainId The chain ID to check
 * @returns True if the chain is in our mapping
 */
export function isChainSupported(chainId: string): boolean {
  return !!chainMapping[chainId];
} 