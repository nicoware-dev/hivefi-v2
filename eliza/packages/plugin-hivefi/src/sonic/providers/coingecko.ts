import type { Provider, IAgentRuntime, Memory, State } from '@elizaos/core';
import { elizaLogger } from '@elizaos/core';
import axios from 'axios';

const BASE_URL = 'https://api.coingecko.com/api/v3';

// Predefined list of tokens to track with correct CoinGecko IDs
const TRACKED_TOKENS = [
  { id: 'bitcoin', symbol: 'btc', name: 'Bitcoin' },
  { id: 'ethereum', symbol: 'eth', name: 'Ethereum' },
  { id: 'tether', symbol: 'usdt', name: 'Tether' },
  { id: 'sonic-3', symbol: 's', name: 'Sonic' },
  { id: 'shadow-2', symbol: 'shadow', name: 'Shadow' },
  { id: 'swapx-2', symbol: 'swpx', name: 'SwapX' },
  { id: 'beets', symbol: 'beets', name: 'Beets' },
  { id: 'usd-coin', symbol: 'usdc', name: 'USD Coin' },
  { id: 'eurc', symbol: 'eurc', name: 'EURC' }
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

function getColoredPriceChange(change: number | undefined): string {
  if (typeof change !== 'number' || Number.isNaN(change)) {
    return '±0.00%';
  }
  const sign = change >= 0 ? '▲' : '▼';
  const changeText = `${sign} ${Math.abs(change).toFixed(2)}%`;
  return change >= 0 ? `**${changeText}**` : `*${changeText}*`;
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
      elizaLogger.warn('Rate limited by CoinGecko API');
      if (marketDataCache.data) {
        return marketDataCache.data;
      }
      throw new Error('Rate limited by CoinGecko API and no cached data available');
    }

    elizaLogger.error('Error fetching market data:', error);
    throw error;
  }
}

export const coinGeckoProvider: Provider = {
  async get(_runtime: IAgentRuntime, message: Memory, _state?: State): Promise<string> {
    try {
      let selectedTokens = TRACKED_TOKENS;
      const requestedTokens = message.content?.text?.toLowerCase().match(/\b(btc|eth|usdt|s|shadow|swpx|beets|usdc|eurc)\b/g);

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

          return [
            `### ${token.name} (${token.symbol.toUpperCase()})`,
            `- Current Price: ${formatCurrency(data.usd)}`,
            `- 24h Change: ${getColoredPriceChange(data.usd_24h_change)}`
          ].join('\n');
        })
        .filter(Boolean);

      if (!priceLines.length) {
        return 'Currently, I\'m unable to fetch the latest prices due to a temporary issue with the market data feed. Please try again later.';
      }

      return [
        '# Current Cryptocurrency Prices',
        '',
        ...priceLines,
        '',
        '---',
        '_Prices are updated every 5 minutes. Bold numbers indicate price increase, italic numbers indicate decrease._',
        '',
        'Let me know if you need specific tokens or more detailed market analysis!'
      ].join('\n');
    } catch (error) {
      elizaLogger.error('Error in CoinGecko provider:', error);
      return 'Currently, I\'m unable to fetch the latest prices due to a temporary issue with the market data feed. This may be due to a high number of requests or connectivity issues. However, typically, ETH, BTC, and S (Sonic) prices are reflective of broader market trends. Once the connection is re-established, I can provide the most up-to-date pricing information.';
    }
  }
};
