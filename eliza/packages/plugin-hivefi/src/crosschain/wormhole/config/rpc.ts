import { elizaLogger } from '@elizaos/core';
import { Chain } from '@wormhole-foundation/sdk';

const logger = elizaLogger.child({ module: 'WormholeRPC' });

/**
 * RPC endpoints for each supported chain
 * These are the official endpoints used by the Wormhole SDK
 */
export const RPC_ENDPOINTS: Record<string, string> = {
  // Ethereum and L2s
  'ethereum': 'https://rpc.ankr.com/eth',
  'ethereum-sepolia': 'https://eth-sepolia.public.blastapi.io',
  'arbitrum': 'https://arb1.arbitrum.io/rpc',
  'optimism': 'https://mainnet.optimism.io',
  'base': 'https://mainnet.base.org',
  'mantle': 'https://rpc.mantle.xyz',
  
  // Other EVM chains
  'bsc': 'https://bscrpc.com',
  'polygon': 'https://rpc.ankr.com/polygon',
  'avalanche': 'https://rpc.ankr.com/avalanche',
  'fantom': 'https://rpcapi.fantom.network',
  'celo': 'https://rpc.ankr.com/celo',
  'moonbeam': 'https://rpc.ankr.com/moonbeam',
  
  // Non-EVM chains
  'solana': 'https://api.mainnet-beta.solana.com',
  'sui': 'https://rpc.mainnet.sui.io',
  'aptos': 'https://fullnode.mainnet.aptoslabs.com/v1',
};

// Backup RPC endpoints in case the primary ones fail
export const BACKUP_RPC_ENDPOINTS: Record<string, string> = {
  'ethereum': 'https://ethereum.publicnode.com',
  'arbitrum': 'https://arbitrum-one.publicnode.com',
  'optimism': 'https://optimism.publicnode.com',
  'base': 'https://base.publicnode.com',
  'bsc': 'https://bsc.publicnode.com',
  'polygon': 'https://polygon.publicnode.com',
  'avalanche': 'https://avalanche-c-chain.publicnode.com',
  'fantom': 'https://fantom.publicnode.com',
};

/**
 * Get the RPC endpoint for a chain
 * @param chain The chain to get the RPC endpoint for
 * @returns The RPC endpoint
 */
export function getRpcEndpoint(chain: string): string {
  const normalizedChain = chain.toLowerCase();
  const endpoint = RPC_ENDPOINTS[normalizedChain];
  
  if (!endpoint) {
    logger.warn(`No RPC endpoint configured for chain ${chain}, using fallback`);
    return 'https://rpc.ankr.com/eth'; // Fallback to Ethereum
  }
  
  return endpoint;
}

/**
 * Get the backup RPC endpoint for a chain
 * @param chain The chain to get the backup RPC endpoint for
 * @returns The backup RPC endpoint or undefined if none exists
 */
export function getBackupRpcEndpoint(chain: string): string | undefined {
  const normalizedChain = chain.toLowerCase();
  return BACKUP_RPC_ENDPOINTS[normalizedChain];
}

/**
 * Get the chain configuration for the Wormhole SDK
 * @returns Chain configuration object
 */
export function getChainConfig(): Record<string, { rpc: string }> {
  // Use the official Wormhole SDK chain configuration format
  return {
    'Ethereum': { rpc: 'https://rpc.ankr.com/eth' },
    'Solana': { rpc: 'https://api.mainnet-beta.solana.com' },
    'Polygon': { rpc: 'https://rpc.ankr.com/polygon' },
    'Bsc': { rpc: 'https://bscrpc.com' },
    'Avalanche': { rpc: 'https://rpc.ankr.com/avalanche' },
    'Fantom': { rpc: 'https://rpcapi.fantom.network' },
    'Celo': { rpc: 'https://rpc.ankr.com/celo' },
    'Moonbeam': { rpc: 'https://rpc.ankr.com/moonbeam' },
    'Sui': { rpc: 'https://rpc.mainnet.sui.io' },
    'Aptos': { rpc: 'https://fullnode.mainnet.aptoslabs.com/v1' },
    'Arbitrum': { rpc: 'https://arb1.arbitrum.io/rpc' },
    'Optimism': { rpc: 'https://mainnet.optimism.io' },
    'Base': { rpc: 'https://mainnet.base.org' },
    'Mantle': { rpc: 'https://rpc.mantle.xyz' },
  };
} 