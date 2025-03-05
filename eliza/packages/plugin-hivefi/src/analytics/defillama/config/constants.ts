// API URLs
export const DEFILLAMA_API_URL = 'https://api.llama.fi';
export const DEFILLAMA_STABLECOINS_API_URL = 'https://stablecoins.llama.fi';
export const DEFILLAMA_YIELDS_API_URL = 'https://yields.llama.fi';

// Cache settings
export const CACHE_TTL = 5 * 60 * 1000; // 5 minutes in milliseconds

// API endpoints
export const ENDPOINTS = {
  // Chain endpoints
  CHAINS: '/v2/chains',
  CHAIN_TVL: '/v2/tvl/chains',
  CHAIN_HISTORICAL: '/v2/historicalChainTvl',
  
  // Protocol endpoints
  PROTOCOLS: '/protocols',
  PROTOCOL: '/protocol',
  PROTOCOL_TVL: '/tvl',
  PROTOCOL_HISTORICAL: '/protocol/chart',
  
  // Global endpoints
  GLOBAL_TVL: '/v2/tvl',
  GLOBAL_HISTORICAL: '/v2/historicalTvl',
  
  // Charts and stats
  CHARTS: '/charts',
  STATS: '/stats',
  
  // Yields endpoints
  YIELDS_POOLS: '/pools',
  YIELDS_POOL: '/pool',
  
  // Stablecoins endpoints
  STABLECOINS: '/stablecoins',
  STABLECOIN_CHARTS: '/stablecoin/charts'
} as const;