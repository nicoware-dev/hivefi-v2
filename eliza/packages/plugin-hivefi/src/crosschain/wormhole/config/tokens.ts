import { elizaLogger } from '@elizaos/core';
import { WormholeToken } from '../types';
import { Chain } from '@wormhole-foundation/sdk';
import { getWormholeChain } from './chains';

const logger = elizaLogger.child({ module: 'WormholeTokens' });

/**
 * Token addresses for each supported chain
 * These are the addresses of the tokens on each chain
 */
export const TOKEN_ADDRESSES: Record<string, Record<string, string>> = {
  // Ethereum
  'ethereum': {
    'USDC': '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
    'USDT': '0xdAC17F958D2ee523a2206206994597C13D831ec7',
    'WETH': '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2',
    'WBTC': '0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599',
    'DAI': '0x6B175474E89094C44Da98b954EedeAC495271d0F',
  },
  
  // BSC
  'bsc': {
    'USDC': '0x8AC76a51cc950d9822D68b83fE1Ad97B32Cd580d',
    'USDT': '0x55d398326f99059fF775485246999027B3197955',
    'WBNB': '0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c',
    'BUSD': '0xe9e7CEA3DedcA5984780Bafc599bD69ADd087D56',
  },
  
  // Polygon
  'polygon': {
    'USDC': '0x3c499c542cEF5E3811e1192ce70d8cC03d5c3359',
    'USDT': '0xc2132D05D31c914a87C6611C10748AEb04B58e8F',
    'WMATIC': '0x0d500B1d8E8eF31E21C99d1Db9A6444d3ADf1270',
    'WETH': '0x7ceB23fD6bC0adD59E62ac25578270cFf1b9f619',
  },
  
  // Arbitrum
  'arbitrum': {
    'USDC': '0xaf88d065e77c8cC2239327C5EDb3A432268e5831',
    'USDT': '0xFd086bC7CD5C481DCC9C85ebE478A1C0b69FCbb9',
    'WETH': '0x82aF49447D8a07e3bd95BD0d56f35241523fBab1',
  },
  
  // Optimism
  'optimism': {
    'USDC': '0x7F5c764cBc14f9669B88837ca1490cCa17c31607',
    'USDT': '0x94b008aA00579c1307B0EF2c499aD98a8ce58e58',
    'WETH': '0x4200000000000000000000000000000000000006',
  },
  
  // Base
  'base': {
    'USDC': '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913',
    'WETH': '0x4200000000000000000000000000000000000006',
  },
  
  // Mantle
  'mantle': {
    'USDC': '0x09Bc4E0D864854c6aFB6eB9A9cdF58aC190D0dF9',
    'USDT': '0x201EBa5CC46D216Ce6DC03F6a759e8E766e956aE',
    'WMNT': '0x78c1b0C915c4FAA5FffA6CAbf0219DA63d7f4cb8',
  },
  
  // Avalanche
  'avalanche': {
    'USDC': '0xB97EF9Ef8734C71904D8002F8b6Bc66Dd9c48a6E',
    'USDT': '0x9702230A8Ea53601f5cD2dc00fDBc13d4dF4A8c7',
    'WAVAX': '0xB31f66AA3C1e785363F0875A1B74E27b85FD66c7',
  },
  
  // Fantom
  'fantom': {
    'USDC': '0x04068DA6C83AFCFA0e13ba15A6696662335D5B75',
    'WFTM': '0x21be370D5312f44cB42ce377BC9b8a0cEF1A4C83',
  },
};

/**
 * Get the address of a token on a chain
 * @param chain The chain to get the token address for
 * @param token The token to get the address for
 * @returns The token address or undefined if not found
 */
export function getTokenAddress(chain: string, token: string): string | undefined {
  const normalizedChain = chain.toLowerCase();
  const normalizedToken = token.toUpperCase();
  
  // Handle native token
  if (normalizedToken === 'NATIVE' || normalizedToken === 'ETH' || normalizedToken === 'BNB' || 
      normalizedToken === 'MATIC' || normalizedToken === 'AVAX' || normalizedToken === 'FTM' ||
      normalizedToken === 'MNT') {
    return 'native';
  }
  
  // We'll use our own mapping for now since the SDK token functions are not directly accessible
  // Check if we have addresses for this chain
  const chainAddresses = TOKEN_ADDRESSES[normalizedChain];
  if (!chainAddresses) {
    logger.warn(`No token addresses configured for chain ${chain}`);
    return undefined;
  }
  
  // Check if we have an address for this token
  const tokenAddress = chainAddresses[normalizedToken];
  if (!tokenAddress) {
    // Try to find a wrapped version of the token
    if (normalizedToken === 'ETH') {
      return chainAddresses['WETH'];
    } else if (normalizedToken === 'BTC') {
      return chainAddresses['WBTC'];
    } else if (normalizedToken === 'BNB') {
      return chainAddresses['WBNB'];
    } else if (normalizedToken === 'MATIC') {
      return chainAddresses['WMATIC'];
    } else if (normalizedToken === 'AVAX') {
      return chainAddresses['WAVAX'];
    } else if (normalizedToken === 'FTM') {
      return chainAddresses['WFTM'];
    } else if (normalizedToken === 'MNT') {
      return chainAddresses['WMNT'];
    }
    
    logger.warn(`No address configured for token ${token} on chain ${chain}`);
    return undefined;
  }
  
  return tokenAddress;
}

/**
 * Get the decimals for a token
 * @param token The token to get decimals for
 * @returns The number of decimals
 */
export function getTokenDecimals(token: string): number {
  const normalizedToken = token.toUpperCase();
  
  // USDC and USDT typically have 6 decimals
  if (normalizedToken === 'USDC' || normalizedToken === 'USDT') {
    return 6;
  }
  
  // Most other tokens have 18 decimals
  return 18;
} 