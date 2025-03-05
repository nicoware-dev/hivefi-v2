import { elizaLogger } from '@elizaos/core';
import { Chain } from '@wormhole-foundation/sdk';
import { WormholeChain } from '../types';

const logger = elizaLogger.child({ module: 'WormholeChain' });

/**
 * Normalize chain name to the format expected by the Wormhole SDK
 * @param chainName The chain name to normalize
 * @returns The normalized chain name
 */
export function normalizeChainName(chainName: string): Chain {
  // Remove spaces and convert to lowercase
  const normalized = chainName.replace(/\s+/g, '').toLowerCase();
  
  logger.info(`Normalizing chain name: ${chainName} (normalized: ${normalized})`);
  
  // Map our chain names to Wormhole SDK chain names
  const chainMap: Record<string, Chain> = {
    'ethereum': 'Ethereum',
    'eth': 'Ethereum',
    'solana': 'Solana',
    'sol': 'Solana',
    'polygon': 'Polygon',
    'matic': 'Polygon',
    'bsc': 'Bsc',
    'binance': 'Bsc',
    'binancesmartchain': 'Bsc',
    'avalanche': 'Avalanche',
    'avax': 'Avalanche',
    'fantom': 'Fantom',
    'ftm': 'Fantom',
    'celo': 'Celo',
    'moonbeam': 'Moonbeam',
    'mantle': 'Mantle',
    'glmr': 'Moonbeam',
    'arbitrum': 'Arbitrum',
    'arb': 'Arbitrum',
    'optimism': 'Optimism',
    'op': 'Optimism',
    'aptos': 'Aptos',
    'apt': 'Aptos',
    'sui': 'Sui',
    'base': 'Base'
  };
  
/*   // Special case for Mantle - map to Ethereum for compatibility
  if (normalized === 'mantle' || normalized === 'mnt') {
    logger.info('Normalizing Mantle chain to Ethereum for SDK compatibility');
    return 'Ethereum';
  } */
  
  // Special case for BSC - ensure it's properly mapped
  if (normalized === 'bsc' || normalized === 'binance' || normalized === 'binancesmartchain') {
    logger.info('Normalizing BSC chain to Bsc for SDK compatibility');
    return 'Bsc';
  }
  
  // Get the mapped chain name
  const mappedChain = chainMap[normalized] as Chain;
  
  if (mappedChain) {
    logger.info(`Mapped chain ${normalized} to ${mappedChain}`);
    return mappedChain;
  }
  
  // If no mapping found, log a warning and default to Ethereum
  logger.warn(`No mapping found for chain ${normalized}, defaulting to Ethereum`);
  return 'Ethereum';
}

/**
 * Get a list of supported chains
 * @returns Array of supported chain names
 */
export function getSupportedChains(): string[] {
  return Object.values(WormholeChain);
}

/**
 * Check if a chain is supported
 * @param chain The chain to check
 * @returns True if the chain is supported
 */
export function isChainSupported(chain: string): boolean {
  return Object.values(WormholeChain).includes(chain as WormholeChain);
} 