import type { Provider, IAgentRuntime, Memory, State } from '@elizaos/core';
import axios from 'axios';

const BASE_URL = 'https://api.coingecko.com/api/v3';

// Predefined list of tokens to track with correct CoinGecko IDs
const TRACKED_TOKENS = [
  { id: 'bitcoin', symbol: 'btc', name: 'Bitcoin' },
  { id: 'ethereum', symbol: 'eth', name: 'Ethereum' },
  { id: 'tether', symbol: 'usdt', name: 'Tether' },
  { id: 'mantle', symbol: 'mnt', name: 'Mantle' },
  { id: 'binancecoin', symbol: 'bnb', name: 'BNB' },
  { id: 'optimism', symbol: 'op', name: 'Optimism' },
  { id: 'arbitrum', symbol: 'arb', name: 'Arbitrum' },
  { id: 'polygon', symbol: 'matic', name: 'Polygon' },
  { id: 'base', symbol: 'base', name: 'Base' }
];

type TokenInfo = typeof TRACKED_TOKENS[number];

interface CoinGeckoPrice {
  usd: number;
  usd_24h_change?: number;
  usd_market_cap?: number;
  last_updated_at?: number;
}

interface CoinGeckoPriceResponse {
  [key: string]: CoinGeckoPrice;
}

// Cache configuration
const CACHE_DURATION = 300 * 1000; // 300 seconds to avoid rate limits
let marketDataCache: {
  data: CoinGeckoPriceResponse | null;
  timestamp: number;
} = {
  data: null,
  timestamp: 0
};

// Helper function to check if cache is valid
function isCacheValid(): boolean {
  return Date.now() - marketDataCache.timestamp < CACHE_DURATION;
}

// Format currency with appropriate decimal places
function formatCurrency(value: number): string {
  if (typeof value !== 'number' || Number.isNaN(value)) {
    return '$0.00';
  }
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: value >= 1000 ? 2 : 4,
    maximumFractionDigits: value >= 1000 ? 2 : 6
  }).format(value);
}

// Format price change percentage
function formatPriceChange(value: number | undefined): string {
  if (typeof value !== 'number' || Number.isNaN(value)) {
    return '+0.00%';
  }
  const sign = value >= 0 ? '+' : '';
  return `${sign}${value.toFixed(2)}%`;
}

async function fetchMarketData(tokens: TokenInfo[]): Promise<CoinGeckoPriceResponse> {
  if (isCacheValid() && marketDataCache.data) {
    return marketDataCache.data;
  }

  try {
    const ids = tokens.map(t => t.id).join(',');
    const response = await axios.get<CoinGeckoPriceResponse>(`${BASE_URL}/simple/price`, {
      params: {
        ids,
        vs_currencies: 'usd',
        include_24h_change: true,
        include_market_cap: true,
        include_last_updated_at: true
      },
      timeout: 5000,
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      }
    });

    if (!response.data || typeof response.data !== 'object') {
      throw new Error('Invalid response format from CoinGecko API');
    }

    // Update cache
    marketDataCache = {
      data: response.data,
      timestamp: Date.now()
    };

    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response?.status === 429) {
      // If rate limited and we have cache, return cache even if expired
      if (marketDataCache.data) {
        return marketDataCache.data;
      }
      throw new Error('Rate limited by CoinGecko API and no cached data available');
    }

    throw error;
  }
}

export const coinGeckoProvider: Provider = {
  async get(_runtime: IAgentRuntime, message: Memory, _state?: State): Promise<string> {
    try {
      let selectedTokens = TRACKED_TOKENS;
      const requestedTokens = message.content?.text?.toLowerCase().match(/\b(btc|eth|usdt|mnt|bnb|op|arb|matic|base|agni)\b/g);

      if (requestedTokens?.length) {
        selectedTokens = requestedTokens
          .map(symbol => TRACKED_TOKENS.find(t => t.symbol.toLowerCase() === symbol))
          .filter((t): t is TokenInfo => t !== undefined);
      }

      if (!selectedTokens.length) {
        selectedTokens = TRACKED_TOKENS;
      }

      const priceData = await fetchMarketData(selectedTokens);

      if (!priceData || Object.keys(priceData).length === 0) {
        return 'Currently, I\'m unable to fetch the latest prices due to a temporary issue with the market data feed. Please try again later.';
      }

      const priceLines = selectedTokens
        .map(token => {
          const data = priceData[token.id];
          if (!data?.usd) return null;
          return `• ${token.name} (${token.symbol.toUpperCase()}): ${formatCurrency(data.usd)} ${formatPriceChange(data.usd_24h_change)}`;
        })
        .filter(Boolean);

      if (!priceLines.length) {
        return 'Currently, I\'m unable to fetch the latest prices due to a temporary issue with the market data feed. Please try again later.';
      }

      return [
        'Current Cryptocurrency Prices:',
        '',
        ...priceLines,
        '',
        'Prices are updated every 60 seconds. Let me know if you need specific tokens or more market data!'
      ].join('\n');
    } catch (error) {
      console.error('Error in CoinGecko provider:', error);
      return 'Currently, I\'m unable to fetch the latest prices due to a temporary issue with the market data feed. This may be due to a high number of requests or connectivity issues. However, typically, ETH, BTC, and MNT prices are reflective of broader market trends. Once the connection is re-established, I can provide the most up-to-date pricing information.';
    }
  }
};
