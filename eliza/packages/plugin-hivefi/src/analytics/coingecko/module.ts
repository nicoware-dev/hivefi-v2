import axios from 'axios';
import { StandardResponse, createSuccessResponse, createErrorResponse } from '../utils/response';
import { elizaLogger } from "@elizaos/core";

// Map of token symbols to CoinGecko IDs
const TOKEN_TO_COINGECKO_ID: Record<string, string> = {
  // Mantle Network
  'mnt': 'mantle',
  'wmnt': 'wrapped-mantle',
  
  // Sonic Chain
  's': 'sonic-3',
  'ws': 'wrapped-sonic',
  'shadow': 'shadow-2',
  'swpx': 'swapx-2',
  'beets': 'beets',
  
  // Ethereum
  'eth': 'ethereum',
  'weth': 'weth',
  
  // Bitcoin
  'btc': 'bitcoin',
  'wbtc': 'wrapped-bitcoin',
  
  // Stablecoins
  'usdc': 'usd-coin',
  'usdt': 'tether',
  'dai': 'dai',
  'busd': 'binance-usd',
  'tusd': 'true-usd',
  'usdd': 'usdd',
  
  // Major Layer 1s
  'bnb': 'binancecoin',
  'sol': 'solana',
  'ada': 'cardano',
  'avax': 'avalanche-2',
  'dot': 'polkadot',
  'matic': 'matic-network',
  'near': 'near',
  'atom': 'cosmos',
  'ftm': 'fantom',
  'arb': 'arbitrum',
  'op': 'optimism',
  
  // DeFi
  'uni': 'uniswap',
  'aave': 'aave',
  'link': 'chainlink',
  'crv': 'curve-dao-token',
  'mkr': 'maker',
  'comp': 'compound-governance-token',
  'sushi': 'sushi',
  'cake': 'pancakeswap-token',
  'snx': 'synthetix-network-token',
  '1inch': '1inch',
  
  // Other popular tokens
  'doge': 'dogecoin',
  'shib': 'shiba-inu',
  'ape': 'apecoin',
  'grt': 'the-graph',
  'ldo': 'lido-dao',
  'mana': 'decentraland',
  'sand': 'the-sandbox',
  'axs': 'axie-infinity',
};

// Cache for token prices to reduce API calls
interface PriceCache {
  [key: string]: {
    price: number;
    timestamp: number;
    name?: string;
    symbol?: string;
    market_cap?: number;
    volume_24h?: number;
    price_change_24h?: number;
    price_change_percentage_24h?: number;
  };
}

const priceCache: PriceCache = {};
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes in milliseconds

// Format currency with appropriate precision
function formatCurrency(value: number): string {
  if (value >= 1000) {
    return value.toLocaleString('en-US', { maximumFractionDigits: 2 });
  } else if (value >= 1) {
    return value.toLocaleString('en-US', { maximumFractionDigits: 4 });
  } else {
    return value.toLocaleString('en-US', { maximumFractionDigits: 6 });
  }
}

// Get CoinGecko ID for a token symbol
function getTokenCoinGeckoId(symbol: string): string | null {
  const normalizedSymbol = symbol.toLowerCase();
  return TOKEN_TO_COINGECKO_ID[normalizedSymbol] || null;
}

/**
 * Get price information for a single token
 */
export async function getTokenPrice(params: { denom: string }): Promise<StandardResponse> {
  try {
    const { denom } = params;
    const normalizedDenom = denom.toLowerCase();
    
    // Check cache first
    const now = Date.now();
    if (priceCache[normalizedDenom] && now - priceCache[normalizedDenom].timestamp < CACHE_TTL) {
      const cachedData = priceCache[normalizedDenom];
      
      return createSuccessResponse({
        denom: normalizedDenom,
        price: cachedData.price,
        formattedPrice: `$${formatCurrency(cachedData.price)}`,
        name: cachedData.name || normalizedDenom,
        symbol: cachedData.symbol || normalizedDenom,
        market_cap: cachedData.market_cap,
        volume_24h: cachedData.volume_24h,
        price_change_24h: cachedData.price_change_24h,
        price_change_percentage_24h: cachedData.price_change_percentage_24h,
        timestamp: cachedData.timestamp,
        source: "CoinGecko (cached)"
      });
    }
    
    // Get CoinGecko ID
    const coinGeckoId = getTokenCoinGeckoId(normalizedDenom);
    if (!coinGeckoId) {
      return createErrorResponse(
        "InvalidToken", 
        `Token '${denom}' is not supported. Please use a valid token symbol.`
      );
    }
    
    // Fetch price data from CoinGecko
    const response = await axios.get(
      `https://api.coingecko.com/api/v3/coins/${coinGeckoId}?localization=false&tickers=false&market_data=true&community_data=false&developer_data=false&sparkline=false`
    );
    
    const data = response.data;
    const price = data.market_data.current_price.usd;
    
    // Update cache
    priceCache[normalizedDenom] = {
      price,
      timestamp: now,
      name: data.name,
      symbol: data.symbol,
      market_cap: data.market_data.market_cap?.usd,
      volume_24h: data.market_data.total_volume?.usd,
      price_change_24h: data.market_data.price_change_24h,
      price_change_percentage_24h: data.market_data.price_change_percentage_24h
    };
    
    return createSuccessResponse({
      denom: normalizedDenom,
      price,
      formattedPrice: `$${formatCurrency(price)}`,
      name: data.name,
      symbol: data.symbol,
      market_cap: data.market_data.market_cap?.usd,
      volume_24h: data.market_data.total_volume?.usd,
      price_change_24h: data.market_data.price_change_24h,
      price_change_percentage_24h: data.market_data.price_change_percentage_24h,
      timestamp: now,
      source: "CoinGecko"
    });
    
  } catch (error: unknown) {
    // Detailed error logging
    if (error instanceof Error) {
      elizaLogger.error(`CoinGecko API error for ${params.denom}:`, {
        message: error.message,
        status: axios.isAxiosError(error) ? error.response?.status : undefined,
        statusText: axios.isAxiosError(error) ? error.response?.statusText : undefined,
        data: axios.isAxiosError(error) ? error.response?.data : undefined,
        headers: axios.isAxiosError(error) ? error.response?.headers : undefined
      });
      
      // Check for rate limiting
      if (axios.isAxiosError(error) && error.response && error.response.status === 429) {
        elizaLogger.warn('CoinGecko rate limit reached, using fallback data');
      }
      
      return createErrorResponse("ApiError", `Error fetching price: ${error.message}`);
    }
    
    return createErrorResponse("ApiError", `Error fetching price: Unknown error`);
  }
}

/**
 * Get price information for multiple tokens
 */
export async function getMultipleTokenPrices(params: { denoms: string[] }): Promise<StandardResponse> {
  try {
    const { denoms } = params;
    const normalizedDenoms = denoms.map(d => d.toLowerCase());
    
    // Prepare result object
    const result: Record<string, any> = {
      prices: {},
      timestamp: Date.now(),
      source: "CoinGecko"
    };
    
    // Get CoinGecko IDs
    const coinGeckoIds: string[] = [];
    const denomToId: Record<string, string> = {};
    
    for (const denom of normalizedDenoms) {
      const id = getTokenCoinGeckoId(denom);
      if (id) {
        coinGeckoIds.push(id);
        denomToId[denom] = id;
      } else {
        result.prices[denom] = {
          error: `Token '${denom}' is not supported`
        };
      }
    }
    
    if (coinGeckoIds.length === 0) {
      return createErrorResponse(
        "InvalidTokens", 
        `None of the provided tokens are supported. Please use valid token symbols.`
      );
    }
    
    // Check cache first
    const now = Date.now();
    const idsToFetch: string[] = [];
    
    for (const denom of Object.keys(denomToId)) {
      if (priceCache[denom] && now - priceCache[denom].timestamp < CACHE_TTL) {
        const cachedData = priceCache[denom];
        
        result.prices[denom] = {
          price: cachedData.price,
          formattedPrice: `$${formatCurrency(cachedData.price)}`,
          name: cachedData.name || denom,
          symbol: cachedData.symbol || denom,
          market_cap: cachedData.market_cap,
          volume_24h: cachedData.volume_24h,
          price_change_24h: cachedData.price_change_24h,
          price_change_percentage_24h: cachedData.price_change_percentage_24h,
          source: "CoinGecko (cached)"
        };
      } else {
        idsToFetch.push(denomToId[denom]);
      }
    }
    
    // If all tokens are cached, return the result
    if (idsToFetch.length === 0) {
      return createSuccessResponse(result);
    }
    
    // Fetch price data from CoinGecko
    const response = await axios.get(
      `https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&ids=${idsToFetch.join(',')}&order=market_cap_desc&per_page=100&page=1&sparkline=false&price_change_percentage=24h`
    );
    
    const data = response.data;
    
    // Process the response
    for (const item of data) {
      // Find the corresponding denom
      const denom = Object.keys(denomToId).find(key => denomToId[key] === item.id);
      if (!denom) continue;
      
      // Update cache
      priceCache[denom] = {
        price: item.current_price,
        timestamp: now,
        name: item.name,
        symbol: item.symbol,
        market_cap: item.market_cap,
        volume_24h: item.total_volume,
        price_change_24h: item.price_change_24h,
        price_change_percentage_24h: item.price_change_percentage_24h
      };
      
      // Add to result
      result.prices[denom] = {
        price: item.current_price,
        formattedPrice: `$${formatCurrency(item.current_price)}`,
        name: item.name,
        symbol: item.symbol,
        market_cap: item.market_cap,
        volume_24h: item.total_volume,
        price_change_24h: item.price_change_24h,
        price_change_percentage_24h: item.price_change_percentage_24h,
        source: "CoinGecko"
      };
    }
    
    return createSuccessResponse(result);
    
  } catch (error: unknown) {
    // Detailed error logging
    if (error instanceof Error) {
      elizaLogger.error(`CoinGecko API error for multiple tokens:`, {
        message: error.message,
        status: axios.isAxiosError(error) ? error.response?.status : undefined,
        statusText: axios.isAxiosError(error) ? error.response?.statusText : undefined,
        data: axios.isAxiosError(error) ? error.response?.data : undefined
      });
      
      return createErrorResponse("ApiError", `Error fetching prices: ${error.message}`);
    }
    
    return createErrorResponse("ApiError", `Error fetching prices: Unknown error`);
  }
} 