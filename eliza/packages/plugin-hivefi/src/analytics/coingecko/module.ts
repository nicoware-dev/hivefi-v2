import axios from 'axios';
import { StandardResponse, createSuccessResponse, createErrorResponse } from '../utils/response';
import { elizaLogger } from "@elizaos/core";

// Map of MultiversX denoms to CoinGecko IDs
const DENOM_TO_COINGECKO_ID: Record<string, string> = {
  'egld': 'elrond-erd-2',
  'mex': 'maiar-exchange-token',
  'usdc': 'usd-coin',
  'usdt': 'tether',
  'btc': 'bitcoin',
  'eth': 'ethereum',
  'bhat': 'hatom',
  'ride': 'holoride',
  'utk': 'utrust',
  'itheum': 'itheum',
  'aero': 'aerovek-aviation',
  'lkmex': 'locked-maiar-exchange-token',
  'lpad': 'launchpad-token',
  'zpay': 'zpay',
  'ada': 'cardano',
  'sol': 'solana',
  'dot': 'polkadot',
  'avax': 'avalanche-2',
  'matic': 'matic-network',
  'link': 'chainlink',
  'uni': 'uniswap',
  'doge': 'dogecoin',
  'shib': 'shiba-inu',
  'xrp': 'ripple',
  'bnb': 'binancecoin',
  'near': 'near',
};

// Common token data for fallback when API fails
const COMMON_TOKEN_PRICES: Record<string, any> = {
  'elrond-erd-2': {
    name: 'MultiversX',
    symbol: 'EGLD',
    price: 45.20,
    lastUpdated: Date.now()
  },
  'maiar-exchange-token': {
    name: 'xExchange',
    symbol: 'MEX',
    price: 0.000045,
    lastUpdated: Date.now()
  },
  'bitcoin': {
    name: 'Bitcoin',
    symbol: 'BTC',
    price: 62500.00,
    lastUpdated: Date.now()
  },
  'ethereum': {
    name: 'Ethereum',
    symbol: 'ETH',
    price: 3200.00,
    lastUpdated: Date.now()
  },
  'tether': {
    name: 'Tether',
    symbol: 'USDT',
    price: 1.00,
    lastUpdated: Date.now()
  },
  'usd-coin': {
    name: 'USD Coin',
    symbol: 'USDC',
    price: 1.00,
    lastUpdated: Date.now()
  },
  'hatom': {
    name: 'Hatom',
    symbol: 'BHAT',
    price: 0.12,
    lastUpdated: Date.now()
  },
  'holoride': {
    name: 'Holoride',
    symbol: 'RIDE',
    price: 0.03,
    lastUpdated: Date.now()
  },
  'utrust': {
    name: 'Utrust',
    symbol: 'UTK',
    price: 0.15,
    lastUpdated: Date.now()
  },
  'itheum': {
    name: 'Itheum',
    symbol: 'ITHEUM',
    price: 0.05,
    lastUpdated: Date.now()
  }
};

// Cache for storing price data to avoid rate limits
interface PriceCache {
  [key: string]: {
    price: number;
    timestamp: number;
    name?: string;
    symbol?: string;
  };
}

// Global price cache
const priceCache: PriceCache = {};
const cacheExpiryMs: number = 5 * 60 * 1000; // 5 minutes

// Create axios instance with timeout
const api = axios.create({
  timeout: 10000, // 10 seconds
});

/**
 * Format currency for display
 */
function formatCurrency(value: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 6
  }).format(value);
}

/**
 * Get the CoinGecko ID for a given denom
 */
function getDenomCoinGeckoId(denom: string): string | null {
  // Normalize the denom to lowercase
  const normalizedDenom = denom.toLowerCase();
  return DENOM_TO_COINGECKO_ID[normalizedDenom] || null;
}

/**
 * Get the USD price for a specific token
 */
export async function getTokenPrice(params: { denom: string }): Promise<StandardResponse> {
  try {
    const denom = params.denom.toLowerCase();
    const coinId = getDenomCoinGeckoId(denom);
    
    if (!coinId) {
      return createErrorResponse("InvalidDenom", `Unknown token denomination: ${denom}`);
    }
    
    // Check cache first
    const now = Date.now();
    if (priceCache[coinId] && (now - priceCache[coinId].timestamp) < cacheExpiryMs) {
      elizaLogger.info(`Using cached price for ${denom} (${coinId})`);
      
      const cachedPrice = priceCache[coinId].price;
      const formattedPrice = formatCurrency(cachedPrice);
      
      return createSuccessResponse({
        denom,
        coinId,
        price: cachedPrice,
        formattedPrice,
        name: priceCache[coinId].name || coinId,
        symbol: priceCache[coinId].symbol || denom.toUpperCase(),
        currency: 'USD',
        timestamp: priceCache[coinId].timestamp,
        isFromCache: true
      });
    }
    
    // Make API request with proper headers and parameters
    const url = `https://api.coingecko.com/api/v3/simple/price?ids=${coinId}&vs_currencies=usd&include_last_updated_at=true`;
    
    elizaLogger.info(`Fetching price from CoinGecko for ${denom} (${coinId})`);
    
    const response = await api.get(url, {
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        // Add a user agent to be nice to the API
        'User-Agent': 'HiveX-MultiversX-Integration/0.1'
      },
      timeout: 5000 // 5 second timeout
    });
    
    const data = response.data;
    
    if (data && data[coinId] && data[coinId].usd) {
      const price = data[coinId].usd;
      const lastUpdatedAt = data[coinId].last_updated_at * 1000 || now;
      const formattedPrice = formatCurrency(price);
      
      // Update cache
      priceCache[coinId] = {
        price,
        timestamp: now
      };
      
      return createSuccessResponse({
        denom,
        coinId,
        price,
        formattedPrice,
        currency: 'USD',
        timestamp: lastUpdatedAt
      });
    } else {
      elizaLogger.warn(`No price data returned for ${coinId}, using fallback`);
      
      // Try fallback data
      if (COMMON_TOKEN_PRICES[coinId]) {
        const fallbackData = COMMON_TOKEN_PRICES[coinId];
        elizaLogger.warn(`Using fallback data for ${coinId}`);
        
        return createSuccessResponse({
          denom,
          coinId,
          price: fallbackData.price,
          formattedPrice: formatCurrency(fallbackData.price),
          name: fallbackData.name,
          symbol: fallbackData.symbol,
          currency: 'USD',
          timestamp: now,
          isEstimated: true
        });
      }
      
      return createErrorResponse("NoData", `No price data available for ${denom}`);
    }
  } catch (error) {
    // Detailed error logging
    elizaLogger.error(`CoinGecko API error for ${params.denom}:`, {
      message: error.message,
      status: error.response?.status,
      statusText: error.response?.statusText,
      data: error.response?.data,
      headers: error.response?.headers
    });
    
    // Check for rate limiting
    if (error.response && error.response.status === 429) {
      elizaLogger.warn('CoinGecko rate limit reached, using fallback data');
    }
    
    // Try to use fallback data
    const coinId = getDenomCoinGeckoId(params.denom);
    if (coinId && COMMON_TOKEN_PRICES[coinId]) {
      const fallbackData = COMMON_TOKEN_PRICES[coinId];
      elizaLogger.warn(`Using fallback data for ${coinId} due to API error`);
      
      return createSuccessResponse({
        denom: params.denom,
        coinId,
        price: fallbackData.price,
        formattedPrice: formatCurrency(fallbackData.price),
        name: fallbackData.name,
        symbol: fallbackData.symbol,
        currency: 'USD',
        timestamp: Date.now(),
        isEstimated: true
      });
    }
    
    return createErrorResponse("ApiError", `Error fetching price: ${error.message}`);
  }
}

/**
 * Get prices for multiple tokens
 */
export async function getMultipleTokenPrices(params: { denoms: string[] }): Promise<StandardResponse> {
  const { denoms } = params;
  const now = Date.now();
  
  try {
    // Map denoms to CoinGecko IDs
    const denomToCoinIdMap: Record<string, string> = {};
    const coinIds: string[] = [];
    
    for (const denom of denoms) {
      const coinId = getDenomCoinGeckoId(denom);
      if (coinId) {
        denomToCoinIdMap[denom] = coinId;
        coinIds.push(coinId);
      }
    }
    
    if (coinIds.length === 0) {
      return createErrorResponse("InvalidDenom", "No valid token denominations provided");
    }
    
    // Prepare result object
    const result: Record<string, any> = {};
    
    // Check cache first for each token
    for (const denom of denoms) {
      const coinId = denomToCoinIdMap[denom];
      if (!coinId) continue;
      
      if (priceCache[coinId] && (now - priceCache[coinId].timestamp) < cacheExpiryMs) {
        elizaLogger.info(`Using cached price for ${denom} (${coinId})`);
        
        const cachedPrice = priceCache[coinId].price;
        const cachedName = priceCache[coinId].name || denom.toUpperCase();
        const cachedSymbol = priceCache[coinId].symbol || denom.toUpperCase();
        
        result[denom] = {
          denom,
          coinId,
          price: cachedPrice,
          formattedPrice: formatCurrency(cachedPrice),
          name: cachedName,
          symbol: cachedSymbol,
          currency: 'USD',
          timestamp: now,
          fromCache: true
        };
      }
    }
    
    // Get remaining tokens from API
    const remainingCoinIds = coinIds.filter(coinId => {
      return !Object.values(result).some((r: any) => r.coinId === coinId);
    });
    
    if (remainingCoinIds.length > 0) {
      const coinIdsParam = remainingCoinIds.join(',');
      
      // Try to get the API key from environment
      const apiKey = process.env.COINGECKO_API_KEY;
      
      // Construct the endpoint URL based on whether we have an API key
      const endpoint = apiKey 
        ? `https://pro-api.coingecko.com/api/v3/simple/price?ids=${coinIdsParam}&vs_currencies=usd&include_last_updated_at=true&x_cg_pro_api_key=${apiKey}`
        : `https://api.coingecko.com/api/v3/simple/price?ids=${coinIdsParam}&vs_currencies=usd&include_last_updated_at=true`;

      const response = await api.get(endpoint);
      
      // Process the response and update cache
      for (const denom of denoms) {
        const coinId = denomToCoinIdMap[denom];
        if (!coinId || result[denom]) continue;
        
        if (response.data && response.data[coinId] && response.data[coinId].usd) {
          const price = response.data[coinId].usd;
          const lastUpdatedAt = response.data[coinId].last_updated_at || now;
          
          // Get additional token info if available
          let name = denom.toUpperCase();
          let symbol = denom.toUpperCase();
          
          // Try to get token info from common data
          if (COMMON_TOKEN_PRICES[coinId]) {
            name = COMMON_TOKEN_PRICES[coinId].name;
            symbol = COMMON_TOKEN_PRICES[coinId].symbol;
          }
          
          // Update cache
          priceCache[coinId] = {
            price,
            timestamp: now,
            name,
            symbol
          };
          
          result[denom] = {
            denom,
            coinId,
            price,
            formattedPrice: formatCurrency(price),
            name,
            symbol,
            currency: 'USD',
            timestamp: lastUpdatedAt
          };
        } else {
          // If API doesn't have data for this coin, try fallback
          if (COMMON_TOKEN_PRICES[coinId]) {
            const fallbackData = COMMON_TOKEN_PRICES[coinId];
            elizaLogger.warn(`Using fallback data for ${coinId}`);
            
            // Update cache with fallback data
            priceCache[coinId] = {
              price: fallbackData.price,
              timestamp: now,
              name: fallbackData.name,
              symbol: fallbackData.symbol
            };
            
            result[denom] = {
              denom,
              coinId,
              price: fallbackData.price,
              formattedPrice: formatCurrency(fallbackData.price),
              name: fallbackData.name,
              symbol: fallbackData.symbol,
              currency: 'USD',
              timestamp: now,
              isEstimated: true
            };
          } else {
            result[denom] = { 
              error: `Failed to fetch price for ${denom}`,
              denom
            };
          }
        }
      }
    }

    // Check if we have any results
    const successfulResults = Object.values(result).filter((r: any) => !r.error);
    if (successfulResults.length === 0) {
      // If all API calls failed, try to use fallback data
      for (const denom of denoms) {
        const coinId = denomToCoinIdMap[denom];
        if (!coinId) continue;
        
        if (COMMON_TOKEN_PRICES[coinId]) {
          const fallbackData = COMMON_TOKEN_PRICES[coinId];
          elizaLogger.warn(`Using fallback data for ${coinId} due to API failure`);
          
          result[denom] = {
            denom,
            coinId,
            price: fallbackData.price,
            formattedPrice: formatCurrency(fallbackData.price),
            name: fallbackData.name,
            symbol: fallbackData.symbol,
            currency: 'USD',
            timestamp: now,
            isEstimated: true
          };
        }
      }
    }

    return createSuccessResponse({
      prices: result,
      timestamp: now,
      count: Object.keys(result).length
    });
  } catch (error) {
    elizaLogger.error('Error fetching multiple token prices:', error);
    
    // Try to use fallback data for all requested tokens
    const result: Record<string, any> = {};
    const now = Date.now();
    
    for (const denom of params.denoms) {
      const coinId = getDenomCoinGeckoId(denom);
      if (!coinId) continue;
      
      if (COMMON_TOKEN_PRICES[coinId]) {
        const fallbackData = COMMON_TOKEN_PRICES[coinId];
        
        result[denom] = {
          denom,
          coinId,
          price: fallbackData.price,
          formattedPrice: formatCurrency(fallbackData.price),
          name: fallbackData.name,
          symbol: fallbackData.symbol,
          currency: 'USD',
          timestamp: now,
          isEstimated: true
        };
      }
    }
    
    if (Object.keys(result).length > 0) {
      elizaLogger.warn(`Using fallback data for ${Object.keys(result).length} tokens due to API error`);
      return createSuccessResponse({
        prices: result,
        timestamp: now,
        count: Object.keys(result).length,
        isEstimated: true
      });
    }
    
    return createErrorResponse("ApiError", `Error fetching prices: ${(error as Error).message}`);
  }
} 