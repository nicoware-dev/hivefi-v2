import { elizaLogger } from '@elizaos/core';
import { WormholeToken } from '../types';

const logger = elizaLogger.child({ module: 'WormholeToken' });

/**
 * Get a list of supported tokens
 * @returns Array of supported token names
 */
export function getSupportedTokens(): string[] {
  return Object.values(WormholeToken);
}

/**
 * Check if a token is supported on a chain
 * @param token The token to check
 * @param chain The chain to check (optional)
 * @returns True if the token is supported, false otherwise
 */
export function isTokenSupported(token: string, chain?: string): boolean {
  logger.info(`Checking if token ${token} is supported${chain ? ` on chain ${chain}` : ''}`);
  
  // If no token is provided, assume it's supported
  if (!token) {
    logger.info('No token provided, assuming supported');
    return true;
  }
  
  // Normalize token name
  const normalizedToken = token.toUpperCase();
  logger.info(`Normalized token: ${normalizedToken}`);
  
  // Get all supported tokens
  const supportedTokens = getSupportedTokens();
  logger.info(`All supported tokens: ${supportedTokens.join(', ')}`);
  
  // Check if the token is in the list of supported tokens
  const isInGlobalList = supportedTokens.includes(normalizedToken);
  logger.info(`Token ${normalizedToken} is ${isInGlobalList ? '' : 'not '}in global supported list`);
  
  // Special handling for specific chains
  if (chain) {
    const normalizedChain = chain.toLowerCase();
    logger.info(`Checking chain-specific support for ${normalizedChain}`);
    
    // For Mantle, we know these tokens are supported
    if (normalizedChain === 'mantle' || normalizedChain === 'mnt') {
      // Define Mantle supported tokens
      const mantleSupportedTokens = ['USDT', 'USDC', 'ETH', 'MNT', 'WETH'];
      logger.info(`Mantle supported tokens: ${mantleSupportedTokens.join(', ')}`);
      
      // Check if the token is supported on Mantle
      if (mantleSupportedTokens.includes(normalizedToken)) {
        logger.info(`Token ${normalizedToken} is supported on Mantle`);
        return true;
      }
      
      // Special case for NATIVE on Mantle (which is MNT)
      if (normalizedToken === 'NATIVE') {
        logger.info('NATIVE token on Mantle is MNT, which is supported');
        return true;
      }
      
      logger.info(`Token ${normalizedToken} is not supported on Mantle`);
      return false;
    }
    
    // For BSC, we know these tokens are supported
    if (normalizedChain === 'bsc' || normalizedChain === 'binance') {
      // Define BSC supported tokens
      const bscSupportedTokens = ['USDT', 'USDC', 'BNB', 'ETH', 'BUSD', 'WETH'];
      logger.info(`BSC supported tokens: ${bscSupportedTokens.join(', ')}`);
      
      // Check if the token is supported on BSC
      if (bscSupportedTokens.includes(normalizedToken)) {
        logger.info(`Token ${normalizedToken} is supported on BSC`);
        return true;
      }
      
      // Special case for NATIVE on BSC (which is BNB)
      if (normalizedToken === 'NATIVE') {
        logger.info('NATIVE token on BSC is BNB, which is supported');
        return true;
      }
      
      logger.info(`Token ${normalizedToken} is not supported on BSC`);
      return false;
    }
    
    // For other chains, check if the token is in the global list
    logger.info(`No special handling for chain ${normalizedChain}, using global token list`);
  }
  
  // For chains without special handling, use the global supported list
  logger.info(`Final result: Token ${normalizedToken} is ${isInGlobalList ? '' : 'not '}supported`);
  return isInGlobalList;
} 