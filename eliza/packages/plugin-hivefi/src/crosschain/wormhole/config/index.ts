/**
 * Wormhole module configuration
 */

/**
 * Cache TTL in milliseconds (5 minutes)
 */
export const CACHE_TTL = 5 * 60 * 1000;

/**
 * Default gas limit for transactions
 */
export const DEFAULT_GAS_LIMIT = '300000';

/**
 * Default slippage tolerance percentage
 */
export const DEFAULT_SLIPPAGE = 0.5;

/**
 * Maximum token amount allowed for transfer
 */
export const MAX_TOKEN_AMOUNT = '1000000';

/**
 * Minimum token amount allowed for transfer
 */
export const MIN_TOKEN_AMOUNT = '0.000001';

/**
 * Default timeout for API requests in milliseconds
 */
export const API_TIMEOUT = 30000;

/**
 * Maximum number of retries for API requests
 */
export const MAX_API_RETRIES = 3;

// Export all configurations
export * from './chains';
export * from './rpc';
export * from './tokens'; 