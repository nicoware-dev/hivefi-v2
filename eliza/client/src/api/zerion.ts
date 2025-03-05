/**
 * Zerion API client for fetching wallet portfolio data
 */
import { API_CONFIG } from '../utils/api-config';

// Types for Zerion API responses
export interface TokenBalance {
  symbol: string;
  name: string;
  balance: string;
  usdPrice: number;
  usdValue: number;
  chain: string;
  change24h?: number | null;
  verified?: boolean;
}

export interface PortfolioData {
  totalValue: number;
  chainDistribution: { [key: string]: number };
  positionTypes: {
    wallet: number;
    deposited: number;
    borrowed: number;
    locked: number;
    staked: number;
  };
  changes: {
    absolute_1d: number;
    percent_1d: number;
  };
}

export interface PositionData {
  positions: TokenBalance[];
  totalValue: number;
}

interface ZerionPosition {
  attributes: {
    value: number;
    quantity: {
      float: number;
    };
    price: number;
    changes: {
      percent_1d: number | null;
    };
    fungible_info: {
      name: string;
      symbol: string;
      flags: {
        verified: boolean;
      };
    };
  };
  relationships: {
    chain: {
      data: {
        id: string;
      };
    };
  };
}

// Mock data for development when API is not available
const MOCK_PORTFOLIO_DATA: PortfolioData = {
  totalValue: 4578.32,
  chainDistribution: {
    "ethereum": 2760.44,
    "sonic": 1817.88
  },
  positionTypes: {
    wallet: 4578.32,
    deposited: 0,
    borrowed: 0,
    locked: 0,
    staked: 0
  },
  changes: {
    absolute_1d: 125.67,
    percent_1d: 2.8
  }
};

const MOCK_POSITION_DATA: PositionData = {
  positions: [
    {
      name: "Wrapped Ethereum",
      symbol: "WETH",
      balance: "1.0",
      usdPrice: 2760.44,
      usdValue: 2760.44,
      chain: "ethereum",
      change24h: 1.8,
      verified: true
    },
    {
      name: "Sonic",
      symbol: "S",
      balance: "1782.24",
      usdPrice: 1.02,
      usdValue: 1817.88,
      chain: "sonic",
      change24h: -0.2,
      verified: true
    }
  ],
  totalValue: 4578.32
};

/**
 * Get API headers for Zerion requests
 */
const getHeaders = () => {
  const apiKey = import.meta.env.VITE_ZERION_API_KEY;
  if (!apiKey) {
    console.error('VITE_ZERION_API_KEY not found in environment variables');
    return null;
  }
  
  // Encode API key for Basic Auth
  const encodedApiKey = btoa(`${apiKey}:`);
  
  return {
    'Accept': 'application/json',
    'Authorization': `Basic ${encodedApiKey}`
  };
};

/**
 * Zerion API client
 */
export const zerionApi = {
  /**
   * Get portfolio summary data for a wallet
   * @param address The wallet address to fetch data for
   * @returns Portfolio data
   */
  getPortfolio: async (address: string): Promise<PortfolioData> => {
    try {
      // Check if we should use mock data
      if (import.meta.env.DEV && import.meta.env.VITE_USE_MOCK_DATA === 'true') {
        console.log("Using mock portfolio data for development");
        return MOCK_PORTFOLIO_DATA;
      }

      if (!address || !address.match(/^0x[a-fA-F0-9]{40}$/)) {
        throw new Error("Invalid Ethereum address format");
      }

      // Get the API endpoint from our configuration
      const endpoint = API_CONFIG.zerion.portfolio(address);
      
      // For production (using our API proxy), we don't need auth headers
      const headers = import.meta.env.PROD ? {} : getHeaders();
      if (!import.meta.env.PROD && !headers) {
        throw new Error("Zerion API key not configured");
      }

      // Make request to API
      const response = await fetch(endpoint, { 
        method: 'GET',
        headers: headers as HeadersInit
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Failed to fetch portfolio: ${response.statusText}`);
      }

      const data = await response.json();
      
      // If we're using our API proxy, the data is already formatted
      if (import.meta.env.PROD) {
        return data;
      }
      
      // Otherwise, format the raw Zerion API response
      const { attributes } = data.data;
      return {
        totalValue: attributes.total.positions,
        chainDistribution: attributes.positions_distribution_by_chain,
        positionTypes: attributes.positions_distribution_by_type,
        changes: {
          absolute_1d: attributes.changes.absolute_1d,
          percent_1d: attributes.changes.percent_1d
        }
      };
    } catch (error) {
      console.error("Error fetching portfolio from Zerion:", error);
      
      // Fallback to mock data in case of error
      console.log("Falling back to mock portfolio data");
      return MOCK_PORTFOLIO_DATA;
    }
  },

  /**
   * Get detailed position data for a wallet
   * @param address The wallet address to fetch data for
   * @returns Position data with detailed token balances
   */
  getPositions: async (address: string): Promise<PositionData> => {
    try {
      // Check if we should use mock data
      if (import.meta.env.DEV && import.meta.env.VITE_USE_MOCK_DATA === 'true') {
        console.log("Using mock position data for development");
        return MOCK_POSITION_DATA;
      }

      if (!address || !address.match(/^0x[a-fA-F0-9]{40}$/)) {
        throw new Error("Invalid Ethereum address format");
      }

      // Get the API endpoint from our configuration
      const endpoint = API_CONFIG.zerion.positions(address);
      
      // For production (using our API proxy), we don't need auth headers
      const headers = import.meta.env.PROD ? {} : getHeaders();
      if (!import.meta.env.PROD && !headers) {
        throw new Error("Zerion API key not configured");
      }

      // Make request to API
      const response = await fetch(endpoint, { 
        method: 'GET',
        headers: headers as HeadersInit
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Failed to fetch positions: ${response.statusText}`);
      }

      const data = await response.json();
      
      // If we're using our API proxy, the data is already formatted
      if (import.meta.env.PROD) {
        return data;
      }
      
      // Otherwise, format the raw Zerion API response
      let totalValue = 0;
      const positions = data.data.map((position: ZerionPosition) => {
        const value = position.attributes.value || 0;
        totalValue += value;
        
        return {
          name: position.attributes.fungible_info.name,
          symbol: position.attributes.fungible_info.symbol,
          balance: position.attributes.quantity.float.toString(),
          usdPrice: position.attributes.price || 0,
          usdValue: position.attributes.value || 0,
          chain: position.relationships.chain.data.id,
          change24h: position.attributes.changes?.percent_1d || null,
          verified: position.attributes.fungible_info.flags.verified
        };
      });
      
      return {
        positions,
        totalValue
      };
    } catch (error) {
      console.error("Error fetching positions from Zerion:", error);
      
      // Fallback to mock data in case of error
      console.log("Falling back to mock position data");
      return MOCK_POSITION_DATA;
    }
  }
}; 
 