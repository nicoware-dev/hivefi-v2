/**
 * DefiLlama API client for fetching DeFi analytics data
 */
import { API_CONFIG } from '../utils/api-config';

// Types for DefiLlama API responses
export interface ChainTVLData {
  name: string;
  tvl: number;
  tokenSymbol?: string;
  chainId?: string;
  change_1d?: number;
  change_7d?: number;
  change_1m?: number;
  formattedTVL?: string;
}

export interface ProtocolTVLData {
  name: string;
  slug?: string;
  description?: string;
  tvl: number;
  change_1d?: number;
  change_7d?: number;
  change_1m?: number;
  category?: string;
  chains?: string[];
  chainTvls?: Record<string, number>;
  url?: string;
  twitter?: string;
  formattedTVL?: string;
}

export interface HistoricalDataPoint {
  date: string;
  timestamp: number;
  tvl: number;
}

export interface GlobalTVLData {
  totalLiquidityUSD: number;
  totalLiquidityETH?: number;
  totalVolume24h?: number;
  totalVolume7d?: number;
  change_1d?: number;
  change_7d?: number;
  protocols?: number;
  formattedTVL?: string;
}

// Mock data for development when API is not available
const MOCK_CHAINS_DATA: ChainTVLData[] = [
  { name: 'Ethereum', tvl: 45000000000, change_1d: 2.5, change_7d: -1.2, formattedTVL: '$45B' },
  { name: 'Arbitrum', tvl: 12000000000, change_1d: 1.8, change_7d: 3.5, formattedTVL: '$12B' },
  { name: 'Optimism', tvl: 5000000000, change_1d: -0.5, change_7d: 2.1, formattedTVL: '$5B' },
  { name: 'Solana', tvl: 4000000000, change_1d: 3.2, change_7d: 5.6, formattedTVL: '$4B' },
  { name: 'Polygon', tvl: 2500000000, change_1d: 0.7, change_7d: -0.3, formattedTVL: '$2.5B' }
];

const MOCK_PROTOCOLS_DATA: ProtocolTVLData[] = [
  { name: 'Aave', tvl: 8500000000, change_1d: 1.2, change_7d: 3.5, category: 'Lending', chains: ['Ethereum', 'Arbitrum'], formattedTVL: '$8.5B' },
  { name: 'Uniswap', tvl: 7200000000, change_1d: 0.8, change_7d: 2.1, category: 'Dexes', chains: ['Ethereum', 'Arbitrum', 'Optimism'], formattedTVL: '$7.2B' },
  { name: 'Lido', tvl: 15000000000, change_1d: 2.5, change_7d: 4.2, category: 'Liquid Staking', chains: ['Ethereum'], formattedTVL: '$15B' },
  { name: 'MakerDAO', tvl: 6800000000, change_1d: -0.3, change_7d: 1.5, category: 'CDP', chains: ['Ethereum'], formattedTVL: '$6.8B' },
  { name: 'Curve', tvl: 3500000000, change_1d: 1.1, change_7d: -0.7, category: 'Dexes', chains: ['Ethereum', 'Arbitrum'], formattedTVL: '$3.5B' }
];

const MOCK_HISTORICAL_DATA: HistoricalDataPoint[] = Array.from({ length: 30 }, (_, i) => {
  const date = new Date();
  date.setDate(date.getDate() - (29 - i));
  return {
    date: date.toISOString().split('T')[0],
    timestamp: date.getTime() / 1000,
    tvl: 40000000000 + (i * 500000000) + (Math.random() * 1000000000)
  };
});

const MOCK_GLOBAL_DATA: GlobalTVLData = {
  totalLiquidityUSD: 75000000000,
  change_1d: 1.5,
  change_7d: 3.2,
  protocols: 1500,
  formattedTVL: '$75B'
};

/**
 * Format TVL value to human-readable string
 */
const formatTVL = (tvl: number): string => {
  if (tvl >= 1e12) {
    return `$${(tvl / 1e12).toFixed(2)}T`;
  } else if (tvl >= 1e9) {
    return `$${(tvl / 1e9).toFixed(2)}B`;
  } else if (tvl >= 1e6) {
    return `$${(tvl / 1e6).toFixed(2)}M`;
  } else if (tvl >= 1e3) {
    return `$${(tvl / 1e3).toFixed(2)}K`;
  }
  return `$${tvl.toFixed(2)}`;
};

/**
 * DefiLlama API client
 */
export const defiLlamaApi = {
  /**
   * Get all chains with their TVL
   */
  getChains: async (): Promise<ChainTVLData[]> => {
    try {
      // For development with mock data
      if (import.meta.env.DEV && import.meta.env.VITE_USE_MOCK_DATA === 'true') {
        console.log("Using mock chains data for development");
        return MOCK_CHAINS_DATA;
      }

      const response = await fetch(`${import.meta.env.PROD ? '' : 'https://api.llama.fi'}/chains`);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch chains: ${response.statusText}`);
      }
      
      const data = await response.json();
      
      return data.map((chain: any) => ({
        name: chain.name,
        tvl: chain.tvl,
        tokenSymbol: chain.tokenSymbol,
        chainId: chain.chainId,
        change_1d: chain.change_1d,
        change_7d: chain.change_7d,
        change_1m: chain.change_1m,
        formattedTVL: formatTVL(chain.tvl)
      }));
    } catch (error) {
      console.error("Error fetching chains from DefiLlama:", error);
      return MOCK_CHAINS_DATA;
    }
  },
  
  /**
   * Get all protocols with their TVL
   */
  getProtocols: async (): Promise<ProtocolTVLData[]> => {
    try {
      // For development with mock data
      if (import.meta.env.DEV && import.meta.env.VITE_USE_MOCK_DATA === 'true') {
        console.log("Using mock protocols data for development");
        return MOCK_PROTOCOLS_DATA;
      }

      // Use our API proxy in production
      const endpoint = import.meta.env.PROD ? API_CONFIG.defillama.protocols : 'https://api.llama.fi/protocols';
      const response = await fetch(endpoint);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch protocols: ${response.statusText}`);
      }
      
      const data = await response.json();
      
      return data.map((protocol: any) => ({
        name: protocol.name,
        slug: protocol.slug,
        description: protocol.description,
        tvl: protocol.tvl,
        change_1d: protocol.change_1d,
        change_7d: protocol.change_7d,
        change_1m: protocol.change_1m,
        category: protocol.category,
        chains: protocol.chains,
        chainTvls: protocol.chainTvls,
        url: protocol.url,
        twitter: protocol.twitter,
        formattedTVL: formatTVL(protocol.tvl)
      }));
    } catch (error) {
      console.error("Error fetching protocols from DefiLlama:", error);
      return MOCK_PROTOCOLS_DATA;
    }
  },
  
  /**
   * Get top protocols by TVL
   */
  getTopProtocols: async (limit: number = 10): Promise<ProtocolTVLData[]> => {
    try {
      const protocols = await defiLlamaApi.getProtocols();
      return protocols
        .sort((a, b) => b.tvl - a.tvl)
        .slice(0, limit);
    } catch (error) {
      console.error("Error fetching top protocols:", error);
      return MOCK_PROTOCOLS_DATA.slice(0, limit);
    }
  },
  
  /**
   * Get top protocols for a specific chain
   */
  getTopProtocolsByChain: async (chain: string, limit: number = 10): Promise<ProtocolTVLData[]> => {
    try {
      const protocols = await defiLlamaApi.getProtocols();
      return protocols
        .filter(protocol => protocol.chains?.includes(chain))
        .sort((a, b) => b.tvl - a.tvl)
        .slice(0, limit);
    } catch (error) {
      console.error(`Error fetching top protocols for chain ${chain}:`, error);
      return MOCK_PROTOCOLS_DATA.slice(0, limit);
    }
  },
  
  /**
   * Get historical TVL data
   */
  getHistoricalTVL: async (): Promise<HistoricalDataPoint[]> => {
    try {
      // For development with mock data
      if (import.meta.env.DEV && import.meta.env.VITE_USE_MOCK_DATA === 'true') {
        console.log("Using mock historical data for development");
        return MOCK_HISTORICAL_DATA;
      }

      // Use our API proxy in production
      const endpoint = import.meta.env.PROD ? API_CONFIG.defillama.tvl : 'https://api.llama.fi/charts/tvl';
      const response = await fetch(endpoint);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch historical TVL: ${response.statusText}`);
      }
      
      const data = await response.json();
      
      return data.map((point: any) => ({
        date: new Date(point.date * 1000).toISOString().split('T')[0],
        timestamp: point.date,
        tvl: point.totalLiquidityUSD
      }));
    } catch (error) {
      console.error("Error fetching historical TVL from DefiLlama:", error);
      return MOCK_HISTORICAL_DATA;
    }
  },
  
  /**
   * Get global TVL data including total value and changes
   */
  getGlobalTVL: async (): Promise<GlobalTVLData> => {
    try {
      // For development with mock data
      if (import.meta.env.DEV && import.meta.env.VITE_USE_MOCK_DATA === 'true') {
        console.log("Using mock global TVL data for development");
        return MOCK_GLOBAL_DATA;
      }

      // Get historical data to calculate current TVL
      const historicalData = await defiLlamaApi.getHistoricalTVL();
      const latestData = historicalData[historicalData.length - 1];
      const oneDayAgo = historicalData[historicalData.length - 2];
      const sevenDaysAgo = historicalData[historicalData.length - 8];
      
      // Get protocols count
      const protocols = await defiLlamaApi.getProtocols();
      
      // Calculate changes
      const change_1d = ((latestData.tvl - oneDayAgo.tvl) / oneDayAgo.tvl) * 100;
      const change_7d = ((latestData.tvl - sevenDaysAgo.tvl) / sevenDaysAgo.tvl) * 100;
      
      return {
        totalLiquidityUSD: latestData.tvl,
        change_1d,
        change_7d,
        protocols: protocols.length,
        formattedTVL: formatTVL(latestData.tvl)
      };
    } catch (error) {
      console.error("Error fetching global TVL data:", error);
      return MOCK_GLOBAL_DATA;
    }
  },
  
  /**
   * Get chain distribution data
   */
  getChainDistribution: async (limit: number = 5): Promise<{ name: string; value: number }[]> => {
    try {
      const chains = await defiLlamaApi.getChains();
      
      // Sort chains by TVL and get top ones
      const topChains = chains
        .sort((a, b) => b.tvl - a.tvl)
        .slice(0, limit);
      
      // Calculate total TVL of top chains
      const topChainsTVL = topChains.reduce((sum, chain) => sum + chain.tvl, 0);
      
      // Calculate total TVL of all chains
      const totalTVL = chains.reduce((sum, chain) => sum + chain.tvl, 0);
      
      // Create distribution data with top chains and "Others"
      const distribution = topChains.map(chain => ({
        name: chain.name,
        value: chain.tvl
      }));
      
      // Add "Others" category if there are more chains
      if (chains.length > limit) {
        distribution.push({
          name: 'Others',
          value: totalTVL - topChainsTVL
        });
      }
      
      return distribution;
    } catch (error) {
      console.error("Error calculating chain distribution:", error);
      
      // Return mock distribution data
      return [
        { name: 'Ethereum', value: 45000000000 },
        { name: 'Arbitrum', value: 12000000000 },
        { name: 'Optimism', value: 5000000000 },
        { name: 'Solana', value: 4000000000 },
        { name: 'Polygon', value: 2500000000 },
        { name: 'Others', value: 6500000000 }
      ];
    }
  }
}; 