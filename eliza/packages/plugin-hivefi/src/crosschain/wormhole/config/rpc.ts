import { elizaLogger } from '@elizaos/core';
import { Chain } from '@wormhole-foundation/sdk';

const logger = elizaLogger.child({ module: 'WormholeRPC' });

/**
 * RPC endpoints for each supported chain
 * These are public endpoints and may have rate limits
 * In production, you should use your own endpoints
 */
export const RPC_ENDPOINTS: Record<string, string> = {
  // Ethereum and L2s
  'ethereum': 'https://eth-mainnet.g.alchemy.com/v2/demo',
  'ethereum-sepolia': 'https://eth-sepolia.g.alchemy.com/v2/demo',
  'arbitrum': 'https://arb-mainnet.g.alchemy.com/v2/demo',
  'optimism': 'https://opt-mainnet.g.alchemy.com/v2/demo',
  'base': 'https://mainnet.base.org',
  'mantle': 'https://rpc.mantle.xyz',
  
  // Other EVM chains
  'bsc': 'https://bsc-dataseed.binance.org',
  'polygon': 'https://polygon-rpc.com',
  'avalanche': 'https://api.avax.network/ext/bc/C/rpc',
  'fantom': 'https://rpc.ftm.tools',
  'celo': 'https://forno.celo.org',
  
  // Non-EVM chains
  'solana': 'https://api.mainnet-beta.solana.com',
  'sui': 'https://fullnode.mainnet.sui.io',
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
    return 'https://eth-mainnet.g.alchemy.com/v2/demo'; // Fallback to Ethereum
  }
  
  return endpoint;
}

/**
 * Get the chain configuration for the Wormhole SDK
 * @returns Chain configuration object
 */
export function getChainConfig(): Record<string, { rpc: string }> {
  const config: Record<string, { rpc: string }> = {};
  
  // Map our RPC endpoints to Wormhole SDK chain names
  Object.entries(RPC_ENDPOINTS).forEach(([chainName, rpcUrl]) => {
    let wormholeChain: string | undefined;
    
    // Map our chain names to Wormhole SDK chain names
    switch (chainName.toLowerCase()) {
      case 'ethereum':
        wormholeChain = 'Ethereum';
        break;
      case 'ethereum-sepolia':
        wormholeChain = 'EthereumSepolia';
        break;
      case 'bsc':
        wormholeChain = 'Bsc';
        break;
      case 'polygon':
        wormholeChain = 'Polygon';
        break;
      case 'avalanche':
        wormholeChain = 'Avalanche';
        break;
      case 'fantom':
        wormholeChain = 'Fantom';
        break;
      case 'celo':
        wormholeChain = 'Celo';
        break;
      case 'arbitrum':
        wormholeChain = 'Arbitrum';
        break;
      case 'optimism':
        wormholeChain = 'Optimism';
        break;
      case 'base':
        wormholeChain = 'Base';
        break;
      case 'solana':
        wormholeChain = 'Solana';
        break;
      case 'sui':
        wormholeChain = 'Sui';
        break;
      // Mantle is not directly supported by Wormhole SDK, but we'll keep it for our own mapping
      case 'mantle':
        // Skip for now as it's not in the Wormhole SDK
        break;
    }
    
    if (wormholeChain) {
      config[wormholeChain] = { rpc: rpcUrl };
    }
  });
  
  return config;
} 