import { CACHE_TTL } from '../config/constants';
import { elizaLogger } from '@elizaos/core';
import type { ChainCache, ProtocolCache } from '../types';

// Initialize caches
const chainCache: ChainCache = {};
const protocolCache: ProtocolCache = {};

/**
 * Get cached chain data
 */
export function getChainCache(key: string): any | null {
  const cachedData = chainCache[key];
  if (cachedData && Date.now() - cachedData.timestamp < CACHE_TTL) {
    elizaLogger.debug('Cache hit for chain data:', { key });
    return cachedData.data;
  }
  
  if (cachedData) {
    elizaLogger.debug('Cache expired for chain data:', { key });
    delete chainCache[key];
  }
  
  return null;
}

/**
 * Set chain cache data
 */
export function setChainCache(key: string, data: any): void {
  try {
    chainCache[key] = {
      data,
      timestamp: Date.now()
    };
    elizaLogger.debug('Chain data cached:', { key });
  } catch (error) {
    elizaLogger.error('Error caching chain data:', { key, error });
  }
}

/**
 * Get cached protocol data
 */
export function getProtocolCache(key: string): any | null {
  const cachedData = protocolCache[key];
  if (cachedData && Date.now() - cachedData.timestamp < CACHE_TTL) {
    elizaLogger.debug('Cache hit for protocol data:', { key });
    return cachedData.data;
  }
  
  if (cachedData) {
    elizaLogger.debug('Cache expired for protocol data:', { key });
    delete protocolCache[key];
  }
  
  return null;
}

/**
 * Set protocol cache data
 */
export function setProtocolCache(key: string, data: any): void {
  try {
    protocolCache[key] = {
      data,
      timestamp: Date.now()
    };
    elizaLogger.debug('Protocol data cached:', { key });
  } catch (error) {
    elizaLogger.error('Error caching protocol data:', { key, error });
  }
}

/**
 * Clear expired cache entries
 */
export function clearExpiredCache(): void {
  const now = Date.now();
  
  // Clear expired chain cache entries
  Object.keys(chainCache).forEach(key => {
    if (now - chainCache[key].timestamp >= CACHE_TTL) {
      delete chainCache[key];
      elizaLogger.debug('Cleared expired chain cache:', { key });
    }
  });
  
  // Clear expired protocol cache entries
  Object.keys(protocolCache).forEach(key => {
    if (now - protocolCache[key].timestamp >= CACHE_TTL) {
      delete protocolCache[key];
      elizaLogger.debug('Cleared expired protocol cache:', { key });
    }
  });
}

// Run cache cleanup every minute
setInterval(clearExpiredCache, 60000); 