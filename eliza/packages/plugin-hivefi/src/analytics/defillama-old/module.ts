import axios from 'axios';
import { StandardResponse, createSuccessResponse, createErrorResponse } from '../utils/response';
import { elizaLogger } from "@elizaos/core";

// Base URL for DefiLlama API
const DEFILLAMA_API_URL = 'https://api.llama.fi';

// Cache for protocol data to reduce API calls
interface ProtocolCache {
  [key: string]: {
    data: any;
    timestamp: number;
  };
}

// Cache for chain data
interface ChainCache {
  [key: string]: {
    data: any;
    timestamp: number;
  };
}

// Cache TTL in milliseconds (5 minutes)
const CACHE_TTL = 5 * 60 * 1000;

// Protocol data cache
const protocolCache: ProtocolCache = {};

// Chain data cache
const chainCache: ChainCache = {};

// Map of chain names to DefiLlama slugs
const CHAIN_TO_DEFILLAMA_SLUG: Record<string, string> = {
  // Major chains
  'ethereum': 'ethereum',
  'eth': 'ethereum',
  'polygon': 'polygon',
  'matic': 'polygon',
  'arbitrum': 'arbitrum',
  'arb': 'arbitrum',
  'optimism': 'optimism',
  'op': 'optimism',
  'base': 'base',
  'bsc': 'bsc',
  'binance': 'bsc',
  'avalanche': 'avalanche',
  'avax': 'avalanche',
  'solana': 'solana',
  'sol': 'solana',
  'fantom': 'fantom',
  'ftm': 'fantom',
  
  // Supported chains
  'mantle': 'mantle',
  'mnt': 'mantle',
  'sonic': 'sonic',
  's': 'sonic',
  
  // Other popular chains
  'near': 'near',
  'cosmos': 'cosmos',
  'atom': 'cosmos',
  'polkadot': 'polkadot',
  'dot': 'polkadot',
  'cardano': 'cardano',
  'ada': 'cardano',
  'algorand': 'algorand',
  'algo': 'algorand',
  'flow': 'flow',
  'aptos': 'aptos',
  'sui': 'sui'
};

// Map of protocol names to DefiLlama slugs
const PROTOCOL_TO_DEFILLAMA_SLUG: Record<string, string> = {
  // Major protocols
  'uniswap': 'uniswap-v3',
  'uniswap v3': 'uniswap-v3',
  'uniswap v2': 'uniswap-v2',
  'curve': 'curve',
  'compound': 'compound',
  'compound v3': 'compound-v3',
  'maker': 'maker',
  'makerdao': 'maker',
  'lido': 'lido',
  'aave': 'aave-v3',
  'aave v3': 'aave-v3',
  'balancer': 'balancer',
  'sushiswap': 'sushi',
  'sushi': 'sushi',
  'pancakeswap': 'pancakeswap',
  'cake': 'pancakeswap',
  '1inch': '1inch',
  'gmx': 'gmx',
  'dydx': 'dydx',
  'synthetix': 'synthetix',
  'snx': 'synthetix',
  
  // Mantle protocols
  'merchant moe': 'merchant-moe',
  'merchantmoe': 'merchant-moe',
  'agni': 'agni-finance',
  'agni finance': 'agni-finance',
  'lendle': 'lendle',
  'init capital': 'init-capital',
  'initcapital': 'init-capital',
  'pendle': 'pendle',
  
  // Sonic protocols
  'beets': 'beethoven-x',
  'beethoven x': 'beethoven-x',
  'swapx': 'swapx',
  'shadow exchange': 'shadow-exchange',
  'shadowexchange': 'shadow-exchange',
  'silo finance': 'silo-finance',
  'silofinance': 'silo-finance',
  'beefy': 'beefy'
};

/**
 * Format currency values with appropriate suffixes (K, M, B, T)
 */
function formatCurrency(value: number): string {
  if (value >= 1_000_000_000_000) {
    return `$${(value / 1_000_000_000_000).toFixed(2)}T`;
  } else if (value >= 1_000_000_000) {
    return `$${(value / 1_000_000_000).toFixed(2)}B`;
  } else if (value >= 1_000_000) {
    return `$${(value / 1_000_000).toFixed(2)}M`;
  } else if (value >= 1_000) {
    return `$${(value / 1_000).toFixed(2)}K`;
  } else {
    return `$${value.toFixed(2)}`;
  }
}

/**
 * Normalize protocol name to match DefiLlama slugs
 */
function normalizeProtocolName(name: string): string {
  const normalized = name.toLowerCase().trim();
  return PROTOCOL_TO_DEFILLAMA_SLUG[normalized] || normalized;
}

/**
 * Normalize chain name to match DefiLlama chain IDs
 */
function normalizeChainName(name: string): string {
  const normalized = name.toLowerCase().trim();
  return CHAIN_TO_DEFILLAMA_SLUG[normalized] || normalized;
}

/**
 * Get TVL data for a specific chain by name
 */
export async function getChainTVL(params: { chain: string }): Promise<StandardResponse> {
  try {
    const { chain } = params;
    const normalizedChain = normalizeChainName(chain);
    
    // Check cache first
    const cacheKey = `${normalizedChain}-tvl`;
    const cachedData = chainCache[cacheKey];
    
    if (cachedData && Date.now() - cachedData.timestamp < CACHE_TTL) {
      elizaLogger.info(`Using cached ${normalizedChain} TVL data`);
      return createSuccessResponse(cachedData.data);
    }
    
    // Fetch data from DefiLlama API
    const response = await axios.get(`${DEFILLAMA_API_URL}/v2/chains`);
    
    if (response.status !== 200) {
      return createErrorResponse(`Failed to fetch ${normalizedChain} TVL data`, 'API_ERROR');
    }
    
    const chains = response.data;
    
    // Find the chain by name (case insensitive)
    const chainData = chains.find((c: any) => 
      c.name.toLowerCase() === normalizedChain.toLowerCase()
    );
    
    if (!chainData) {
      return createErrorResponse(`Chain ${chain} not found`, 'NOT_FOUND');
    }
    
    // Format the response
    const formattedData = {
      name: chainData.name,
      tvl: chainData.tvl,
      formattedTVL: formatCurrency(chainData.tvl),
      change_1d: chainData.change_1d,
      change_7d: chainData.change_7d,
      change_1m: chainData.change_1m,
      mcaptvl: chainData.mcaptvl
    };
    
    // Update cache
    chainCache[cacheKey] = {
      data: formattedData,
      timestamp: Date.now()
    };
    
    return createSuccessResponse(formattedData);
  } catch (error) {
    elizaLogger.error(`Error fetching ${params.chain} TVL:`, error);
    return createErrorResponse(`Failed to fetch ${params.chain} TVL data`, 'API_ERROR');
  }
}

/**
 * Get protocol data by name
 */
export async function getProtocolByName(params: { name: string }): Promise<StandardResponse> {
  try {
    const { name } = params;
    const normalizedName = normalizeProtocolName(name);
    
    // Check cache first
    const cacheKey = `protocol-${normalizedName}`;
    const cachedData = protocolCache[cacheKey];
    
    if (cachedData && Date.now() - cachedData.timestamp < CACHE_TTL) {
      elizaLogger.info(`Using cached protocol data for ${normalizedName}`);
      return createSuccessResponse(cachedData.data);
    }
    
    // Fetch data from DefiLlama API
    const response = await axios.get(`${DEFILLAMA_API_URL}/protocol/${normalizedName}`);
    
    if (response.status !== 200) {
      return createErrorResponse(`Failed to fetch data for protocol ${name}`, 'API_ERROR');
    }
    
    const protocolData = response.data;
    
    // Format the response
    const formattedData = {
              name: protocolData.name,
      displayName: protocolData.name,
      slug: protocolData.slug,
      description: protocolData.description,
      tvl: protocolData.tvl,
      formattedTVL: formatCurrency(protocolData.tvl),
      change_1d: protocolData.change_1d,
      change_7d: protocolData.change_7d,
      change_1m: protocolData.change_1m,
      category: protocolData.category,
      chains: protocolData.chains,
      chainTvls: Object.entries(protocolData.chainTvls).map(([chain, tvl]: [string, any]) => ({
        chain,
              tvl: tvl,
        formattedTVL: formatCurrency(tvl)
      })),
      url: protocolData.url,
      twitter: protocolData.twitter,
      audit_links: protocolData.audit_links,
      gecko_id: protocolData.gecko_id,
      cmcId: protocolData.cmcId
    };
    
    // Update cache
    protocolCache[cacheKey] = {
      data: formattedData,
            timestamp: Date.now()
    };
    
    return createSuccessResponse(formattedData);
  } catch (error) {
    elizaLogger.error(`Error fetching protocol ${params.name}:`, error);
    return createErrorResponse(`Failed to fetch data for protocol ${params.name}`, 'API_ERROR');
  }
}

/**
 * Get top protocols for a specific chain
 */
export async function getTopProtocolsByChain(params: { chain: string, limit?: number }): Promise<StandardResponse> {
  try {
    const { chain, limit = 10 } = params;
    const normalizedChain = normalizeChainName(chain);
    
    // Check cache first
    const cacheKey = `top-protocols-${normalizedChain}-${limit}`;
    const cachedData = protocolCache[cacheKey];
    
    if (cachedData && Date.now() - cachedData.timestamp < CACHE_TTL) {
      elizaLogger.info(`Using cached top protocols for ${normalizedChain}`);
      return createSuccessResponse(cachedData.data);
    }
    
    // Fetch data from DefiLlama API
    const response = await axios.get(`${DEFILLAMA_API_URL}/protocols`);
    
    if (response.status !== 200) {
      return createErrorResponse(`Failed to fetch top protocols for ${chain}`, 'API_ERROR');
    }
    
    const protocols = response.data;
    
    // Filter protocols by chain and sort by TVL
    const chainProtocols = protocols
      .filter((protocol: any) => 
        protocol.chains.some((c: string) => c.toLowerCase() === normalizedChain.toLowerCase())
      )
      .sort((a: any, b: any) => b.tvl - a.tvl)
      .slice(0, limit);
    
    // Format the response
    const formattedData = {
      chain: normalizedChain,
      protocols: chainProtocols.map((protocol: any) => ({
          name: protocol.name,
        slug: protocol.slug,
          tvl: protocol.tvl,
          formattedTVL: formatCurrency(protocol.tvl),
        change_1d: protocol.change_1d,
        change_7d: protocol.change_7d,
        category: protocol.category
      }))
    };
    
    // Update cache
    protocolCache[cacheKey] = {
      data: formattedData,
        timestamp: Date.now()
    };
    
    return createSuccessResponse(formattedData);
  } catch (error) {
    elizaLogger.error(`Error fetching top protocols for ${params.chain}:`, error);
    return createErrorResponse(`Failed to fetch top protocols for ${params.chain}`, 'API_ERROR');
  }
}

/**
 * Get top Mantle protocols
 */
export async function getTopMantleProtocols(params: { limit?: number }): Promise<StandardResponse> {
  return getTopProtocolsByChain({ chain: 'mantle', limit: params.limit });
}

/**
 * Get global DeFi stats
 */
export async function getGlobalDeFiStats(): Promise<StandardResponse> {
  try {
    // Check cache first
    const cacheKey = 'global-defi-stats';
    const cachedData = protocolCache[cacheKey];
    
    if (cachedData && Date.now() - cachedData.timestamp < CACHE_TTL) {
      elizaLogger.info('Using cached global DeFi stats');
      return createSuccessResponse(cachedData.data);
    }
    
    // Fetch data from DefiLlama API
    const response = await axios.get(`${DEFILLAMA_API_URL}/v2/chains`);
    
    if (response.status !== 200) {
      return createErrorResponse('Failed to fetch global DeFi stats', 'API_ERROR');
    }
    
    const chains = response.data;
    
    // Calculate total TVL across all chains
    const totalTVL = chains.reduce((sum: number, chain: any) => sum + chain.tvl, 0);
    
    // Get top chains by TVL
    const topChains = chains
        .sort((a: any, b: any) => b.tvl - a.tvl)
      .slice(0, 10)
      .map((chain: any) => ({
        name: chain.name,
        tvl: chain.tvl,
        formattedTVL: formatCurrency(chain.tvl),
        change_1d: chain.change_1d,
        change_7d: chain.change_7d,
        percentage: (chain.tvl / totalTVL * 100).toFixed(2) + '%'
      }));
    
    // Format the response
    const formattedData = {
      totalTVL,
      formattedTotalTVL: formatCurrency(totalTVL),
      topChains,
      chainCount: chains.length
    };
    
    // Update cache
    protocolCache[cacheKey] = {
      data: formattedData,
      timestamp: Date.now()
    };
    
    return createSuccessResponse(formattedData);
  } catch (error) {
    elizaLogger.error('Error fetching global DeFi stats:', error);
    return createErrorResponse('Failed to fetch global DeFi stats', 'API_ERROR');
  }
}

/**
 * Get top chains by TVL
 */
export async function getTopChains(params: { limit?: number }): Promise<StandardResponse> {
  try {
    const { limit = 10 } = params;
    
    // Check cache first
    const cacheKey = `top-chains-${limit}`;
    const cachedData = chainCache[cacheKey];
    
    if (cachedData && Date.now() - cachedData.timestamp < CACHE_TTL) {
      elizaLogger.info('Using cached top chains data');
      return createSuccessResponse(cachedData.data);
    }
    
    // Fetch data from DefiLlama API
    const response = await axios.get(`${DEFILLAMA_API_URL}/v2/chains`);
    
    if (response.status !== 200) {
      return createErrorResponse('Failed to fetch top chains', 'API_ERROR');
    }
    
    const chains = response.data;
    
    // Calculate total TVL across all chains
    const totalTVL = chains.reduce((sum: number, chain: any) => sum + chain.tvl, 0);
    
    // Get top chains by TVL
    const topChains = chains
      .sort((a: any, b: any) => b.tvl - a.tvl)
      .slice(0, limit)
      .map((chain: any) => ({
        name: chain.name,
        tvl: chain.tvl,
        formattedTVL: formatCurrency(chain.tvl),
        change_1d: chain.change_1d,
        change_7d: chain.change_7d,
        change_1m: chain.change_1m,
        percentage: (chain.tvl / totalTVL * 100).toFixed(2) + '%'
      }));
    
    // Format the response
    const formattedData = {
      totalTVL,
      formattedTotalTVL: formatCurrency(totalTVL),
      chains: topChains
    };
    
    // Update cache
    chainCache[cacheKey] = {
      data: formattedData,
      timestamp: Date.now()
    };
    
    return createSuccessResponse(formattedData);
  } catch (error) {
    elizaLogger.error('Error fetching top chains:', error);
    return createErrorResponse('Failed to fetch top chains', 'API_ERROR');
  }
}

/**
 * Compare TVL between multiple chains
 */
export async function compareChainsTVL(params: { chains: string[] }): Promise<StandardResponse> {
  try {
    const { chains } = params;
    
    if (!chains || chains.length === 0) {
      return createErrorResponse('No chains specified for comparison', 'NO_CHAINS_SPECIFIED');
    }
    
    // Normalize chain names
    const normalizedChains = chains.map(chain => normalizeChainName(chain));
    
    // Create a unique cache key based on the sorted chains
    const cacheKey = `compare-chains-${normalizedChains.sort().join('-')}`;
    const cachedData = chainCache[cacheKey];
    
    if (cachedData && Date.now() - cachedData.timestamp < CACHE_TTL) {
      elizaLogger.info('Using cached chain comparison data');
      return createSuccessResponse(cachedData.data);
    }
    
    // Fetch data from DefiLlama API
    const response = await axios.get(`${DEFILLAMA_API_URL}/v2/chains`);
    
    if (response.status !== 200) {
      return createErrorResponse('Failed to fetch chain comparison data', 'API_ERROR');
    }
    
    const allChains = response.data;
    
    // Filter and map the requested chains
    const chainData = normalizedChains
      .map(normalizedChain => {
        const chainInfo = allChains.find((c: any) => 
          c.name.toLowerCase() === normalizedChain.toLowerCase()
        );
        
        if (!chainInfo) {
          return {
            name: normalizedChain,
            found: false,
            error: `Chain ${normalizedChain} not found`,
            errorCode: 'NOT_FOUND'
          };
        }
        
        return {
          name: chainInfo.name,
          found: true,
          tvl: chainInfo.tvl,
          formattedTVL: formatCurrency(chainInfo.tvl),
          change_1d: chainInfo.change_1d,
          change_7d: chainInfo.change_7d,
          change_1m: chainInfo.change_1m
        };
      });
    
    // Format the response
    const formattedData = {
      chains: chainData.filter(chain => chain.found),
      notFound: chainData.filter(chain => !chain.found).map(chain => chain.name),
      error: chainData.find(chain => !chain.found)?.error,
      errorCode: chainData.find(chain => !chain.found)?.errorCode
    };
    
    // Update cache
    chainCache[cacheKey] = {
      data: formattedData,
      timestamp: Date.now()
    };
    
    return createSuccessResponse(formattedData);
  } catch (error) {
    elizaLogger.error('Error comparing chains TVL:', error);
    return createErrorResponse('Failed to compare chains TVL', 'API_ERROR');
  }
}

/**
 * Compare TVL between multiple protocols
 */
export async function compareProtocolsTVL(params: { protocols: string[] }): Promise<StandardResponse> {
  try {
    const { protocols } = params;
    
    if (!protocols || protocols.length === 0) {
      return createErrorResponse('No protocols specified for comparison', 'NO_PROTOCOLS_SPECIFIED');
    }
    
    // Normalize protocol names
    const normalizedProtocols = protocols.map(protocol => normalizeProtocolName(protocol));
    
    // Create a unique cache key based on the sorted protocols
    const cacheKey = `compare-protocols-${normalizedProtocols.sort().join('-')}`;
    const cachedData = protocolCache[cacheKey];
    
    if (cachedData && Date.now() - cachedData.timestamp < CACHE_TTL) {
      elizaLogger.info('Using cached protocol comparison data');
      return createSuccessResponse(cachedData.data);
    }
    
    // Fetch data for each protocol
    const protocolDataPromises = normalizedProtocols.map(async (normalizedProtocol) => {
      try {
        const response = await axios.get(`${DEFILLAMA_API_URL}/protocol/${normalizedProtocol}`);
        
        if (response.status !== 200) {
          return {
            name: normalizedProtocol,
            found: false,
            error: `Protocol ${normalizedProtocol} not found`,
            errorCode: 'PROTOCOL_NOT_FOUND'
          };
        }
        
        const protocolData = response.data;
        
        return {
          name: protocolData.name,
          slug: protocolData.slug,
          found: true,
          tvl: protocolData.tvl,
          formattedTVL: formatCurrency(protocolData.tvl),
          change_1d: protocolData.change_1d,
          change_7d: protocolData.change_7d,
          category: protocolData.category,
          chains: protocolData.chains
        };
      } catch (error) {
        return {
          name: normalizedProtocol,
          found: false,
          error: `Error fetching data for ${normalizedProtocol}`,
          errorCode: 'DATA_FETCH_ERROR'
        };
      }
    });
    
    const protocolData = await Promise.all(protocolDataPromises);
    
    // Format the response
    const formattedData = {
      protocols: protocolData.filter(protocol => protocol.found),
      notFound: protocolData.filter(protocol => !protocol.found).map(protocol => protocol.name),
      error: protocolData.find(protocol => !protocol.found)?.error,
      errorCode: protocolData.find(protocol => !protocol.found)?.errorCode
    };
    
    // Update cache
    protocolCache[cacheKey] = {
      data: formattedData,
      timestamp: Date.now()
    };
    
    return createSuccessResponse(formattedData);
  } catch (error) {
    elizaLogger.error('Error comparing protocols TVL:', error);
    return createErrorResponse('Failed to compare protocols TVL', 'API_ERROR');
  }
}

/**
 * Get historical TVL data for a chain
 */
export async function getChainHistoricalTVL(params: { chain: string, timestamp?: number }): Promise<StandardResponse> {
  try {
    const { chain, timestamp } = params;
    const normalizedChain = normalizeChainName(chain);
    
    // Create cache key including timestamp if provided
    const cacheKey = `${normalizedChain}-historical-tvl${timestamp ? `-${timestamp}` : ''}`;
    const cachedData = chainCache[cacheKey];
    
    if (cachedData && Date.now() - cachedData.timestamp < CACHE_TTL) {
      elizaLogger.info(`Using cached historical TVL data for ${normalizedChain}`);
      return createSuccessResponse(cachedData.data);
    }
    
    // Fetch data from DefiLlama API
    const response = await axios.get(`${DEFILLAMA_API_URL}/v2/historicalChainTvl/${normalizedChain}`);
    
    if (response.status !== 200) {
      return createErrorResponse(`Failed to fetch historical TVL data for ${chain}`, 'API_ERROR');
    }
    
    const historicalData = response.data;
    
    // If timestamp is provided, find the closest data point
    if (timestamp) {
      const closestDataPoint = historicalData.find((point: any) => 
        Math.abs(point.date * 1000 - timestamp) < 24 * 60 * 60 * 1000 // Within 24 hours
      );
      
      if (!closestDataPoint) {
        return createErrorResponse(`No data found for ${chain} at timestamp ${timestamp}`, 'NOT_FOUND');
      }
      
      const formattedData = {
        chain: normalizedChain,
        timestamp: closestDataPoint.date * 1000,
        tvl: closestDataPoint.tvl,
        formattedTVL: formatCurrency(closestDataPoint.tvl)
      };
      
      // Update cache
      chainCache[cacheKey] = {
        data: formattedData,
        timestamp: Date.now()
      };
      
      return createSuccessResponse(formattedData);
    }
    
    // Format all historical data
    const formattedData = {
      chain: normalizedChain,
      data: historicalData.map((point: any) => ({
        timestamp: point.date * 1000,
        tvl: point.tvl,
        formattedTVL: formatCurrency(point.tvl)
      }))
    };
    
    // Update cache
    chainCache[cacheKey] = {
      data: formattedData,
      timestamp: Date.now()
    };
    
    return createSuccessResponse(formattedData);
  } catch (error) {
    elizaLogger.error(`Error fetching historical TVL for ${params.chain}:`, error);
    return createErrorResponse(`Failed to fetch historical TVL data for ${params.chain}`, 'API_ERROR');
  }
}

/**
 * Get historical TVL data for a protocol
 */
export async function getProtocolHistoricalTVL(params: { protocol: string, timestamp?: number }): Promise<StandardResponse> {
  try {
    const { protocol, timestamp } = params;
    const normalizedProtocol = normalizeProtocolName(protocol);
    
    // Create cache key including timestamp if provided
    const cacheKey = `${normalizedProtocol}-historical-tvl${timestamp ? `-${timestamp}` : ''}`;
    const cachedData = protocolCache[cacheKey];
    
    if (cachedData && Date.now() - cachedData.timestamp < CACHE_TTL) {
      elizaLogger.info(`Using cached historical TVL data for ${normalizedProtocol}`);
      return createSuccessResponse(cachedData.data);
    }
    
    // Fetch data from DefiLlama API
    const response = await axios.get(`${DEFILLAMA_API_URL}/protocol/${normalizedProtocol}/chart`);
    
    if (response.status !== 200) {
      return createErrorResponse(`Failed to fetch historical TVL data for ${protocol}`, 'API_ERROR');
    }
    
    const historicalData = response.data;
    
    // If timestamp is provided, find the closest data point
    if (timestamp) {
      const closestDataPoint = historicalData.find((point: any) => 
        Math.abs(point.date * 1000 - timestamp) < 24 * 60 * 60 * 1000 // Within 24 hours
      );
      
      if (!closestDataPoint) {
        return createErrorResponse(`No data found for ${protocol} at timestamp ${timestamp}`, 'NOT_FOUND');
      }
      
      const formattedData = {
        protocol: normalizedProtocol,
        timestamp: closestDataPoint.date * 1000,
        tvl: closestDataPoint.tvl,
        formattedTVL: formatCurrency(closestDataPoint.tvl)
      };
      
      // Update cache
      protocolCache[cacheKey] = {
        data: formattedData,
        timestamp: Date.now()
      };
      
      return createSuccessResponse(formattedData);
    }
    
    // Format all historical data
    const formattedData = {
      protocol: normalizedProtocol,
      data: historicalData.map((point: any) => ({
        timestamp: point.date * 1000,
        tvl: point.tvl,
        formattedTVL: formatCurrency(point.tvl)
      }))
    };
    
    // Update cache
    protocolCache[cacheKey] = {
      data: formattedData,
      timestamp: Date.now()
    };
    
    return createSuccessResponse(formattedData);
  } catch (error) {
    elizaLogger.error(`Error fetching historical TVL for ${params.protocol}:`, error);
    return createErrorResponse(`Failed to fetch historical TVL data for ${params.protocol}`, 'API_ERROR');
  }
}

/**
 * Get protocol TVL by chain
 */
export async function getProtocolTVLByChain(params: { protocol: string, chain: string }): Promise<StandardResponse> {
  try {
    const { protocol, chain } = params;
    const normalizedProtocol = normalizeProtocolName(protocol);
    const normalizedChain = normalizeChainName(chain);
    
    // Create cache key
    const cacheKey = `${normalizedProtocol}-${normalizedChain}-tvl`;
    const cachedData = protocolCache[cacheKey];
    
    if (cachedData && Date.now() - cachedData.timestamp < CACHE_TTL) {
      elizaLogger.info(`Using cached chain TVL data for ${normalizedProtocol} on ${normalizedChain}`);
      return createSuccessResponse(cachedData.data);
    }
    
    // First get the protocol data to verify the chain is supported
    const protocolResponse = await axios.get(`${DEFILLAMA_API_URL}/protocol/${normalizedProtocol}`);
    
    if (protocolResponse.status !== 200) {
      return createErrorResponse(`Failed to fetch data for protocol ${protocol}`, 'API_ERROR');
    }
    
    const protocolData = protocolResponse.data;
    
    // Check if protocol supports the specified chain
    if (!protocolData.chains.some((c: string) => c.toLowerCase() === normalizedChain.toLowerCase())) {
      return createErrorResponse(`Protocol ${protocol} is not deployed on ${chain}`, 'CHAIN_NOT_SUPPORTED');
    }
    
    // Get chain-specific TVL
    const chainTvl = protocolData.chainTvls[normalizedChain] || 0;
    
    // Format the response
    const formattedData = {
      protocol: protocolData.name,
      chain: normalizedChain,
      tvl: chainTvl,
      formattedTVL: formatCurrency(chainTvl),
      percentage: ((chainTvl / protocolData.tvl) * 100).toFixed(2) + '%'
    };
    
    // Update cache
    protocolCache[cacheKey] = {
      data: formattedData,
      timestamp: Date.now()
    };
    
    return createSuccessResponse(formattedData);
  } catch (error) {
    elizaLogger.error(`Error fetching TVL for ${params.protocol} on ${params.chain}:`, error);
    return createErrorResponse(`Failed to fetch TVL data for ${params.protocol} on ${params.chain}`, 'API_ERROR');
  }
}

/**
 * Get protocol historical TVL by chain
 */
export async function getProtocolHistoricalTVLByChain(params: { protocol: string, chain: string, timestamp?: number }): Promise<StandardResponse> {
  try {
    const { protocol, chain, timestamp } = params;
    const normalizedProtocol = normalizeProtocolName(protocol);
    const normalizedChain = normalizeChainName(chain);
    
    // Create cache key
    const cacheKey = `${normalizedProtocol}-${normalizedChain}-historical-tvl${timestamp ? `-${timestamp}` : ''}`;
    const cachedData = protocolCache[cacheKey];
    
    if (cachedData && Date.now() - cachedData.timestamp < CACHE_TTL) {
      elizaLogger.info(`Using cached historical chain TVL data for ${normalizedProtocol} on ${normalizedChain}`);
      return createSuccessResponse(cachedData.data);
    }
    
    // Fetch data from DefiLlama API
    const response = await axios.get(`${DEFILLAMA_API_URL}/protocol/${normalizedProtocol}/chain/${normalizedChain}`);
    
    if (response.status !== 200) {
      return createErrorResponse(`Failed to fetch historical TVL data for ${protocol} on ${chain}`, 'API_ERROR');
    }
    
    const historicalData = response.data;
    
    // If timestamp is provided, find the closest data point
    if (timestamp) {
      const closestDataPoint = historicalData.find((point: any) => 
        Math.abs(point.date * 1000 - timestamp) < 24 * 60 * 60 * 1000 // Within 24 hours
      );
      
      if (!closestDataPoint) {
        return createErrorResponse(`No data found for ${protocol} on ${chain} at timestamp ${timestamp}`, 'NOT_FOUND');
      }
      
      const formattedData = {
        protocol: normalizedProtocol,
        chain: normalizedChain,
        timestamp: closestDataPoint.date * 1000,
        tvl: closestDataPoint.tvl,
        formattedTVL: formatCurrency(closestDataPoint.tvl)
      };
      
      // Update cache
      protocolCache[cacheKey] = {
        data: formattedData,
        timestamp: Date.now()
      };
      
      return createSuccessResponse(formattedData);
    }
    
    // Format all historical data
    const formattedData = {
      protocol: normalizedProtocol,
      chain: normalizedChain,
      data: historicalData.map((point: any) => ({
        timestamp: point.date * 1000,
        tvl: point.tvl,
        formattedTVL: formatCurrency(point.tvl)
      }))
    };
    
    // Update cache
    protocolCache[cacheKey] = {
      data: formattedData,
      timestamp: Date.now()
    };
    
    return createSuccessResponse(formattedData);
  } catch (error) {
    elizaLogger.error(`Error fetching historical TVL for ${params.protocol} on ${params.chain}:`, error);
    return createErrorResponse(`Failed to fetch historical TVL data for ${params.protocol} on ${params.chain}`, 'API_ERROR');
  }
} 