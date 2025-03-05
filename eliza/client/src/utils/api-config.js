/**
 * API configuration based on environment
 */

// Determine if we're in production (Vercel) or development
const isProduction = import.meta.env.PROD;

// Base URLs
const ZERION_BASE_URL = 'https://api.zerion.io/v1';
const DEFILLAMA_BASE_URL = 'https://api.llama.fi';

// API endpoints configuration
export const API_CONFIG = {
  // Zerion endpoints
  zerion: {
    portfolio: (address) => isProduction 
      ? `/api/zerion/portfolio/${address}`
      : `${ZERION_BASE_URL}/wallets/${address}/portfolio`,
    positions: (address) => isProduction
      ? `/api/zerion/positions/${address}`
      : `${ZERION_BASE_URL}/wallets/${address}/positions?filter[positions]=only_simple&currency=usd&filter[trash]=only_non_trash&sort=value`
  },
  
  // DefiLlama endpoints
  defillama: {
    tvl: isProduction 
      ? '/api/defillama/tvl'
      : `${DEFILLAMA_BASE_URL}/charts/tvl`,
    protocols: isProduction
      ? '/api/defillama/protocols'
      : `${DEFILLAMA_BASE_URL}/protocols`
  }
};

export default API_CONFIG; 