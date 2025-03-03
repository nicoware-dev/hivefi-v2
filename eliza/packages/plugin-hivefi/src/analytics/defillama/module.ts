import axios from 'axios';
import { StandardResponse, createSuccessResponse, createErrorResponse } from '../utils/response';
import { elizaLogger } from "@elizaos/core";

// Cache for storing protocol data to avoid rate limits
interface ProtocolCache {
  [key: string]: {
    data: any;
    timestamp: number;
  };
}

// Global protocol cache
const protocolCache: ProtocolCache = {};
const cacheExpiryMs: number = 5 * 60 * 1000; // 5 minutes

// Create axios instance with timeout
const api = axios.create({
  timeout: 10000, // 10 seconds
});

// Common MultiversX protocols with fallback data in case API fails
const COMMON_MULTIVERSX_PROTOCOLS: Record<string, any> = {
  'xexchange': {
    name: 'xExchange',
    tvl: 96730000,
    symbol: 'MEX',
    category: 'DEX',
    chains: ['MultiversX'],
    url: 'https://xexchange.com/'
  },
  'hatom': {
    name: 'Hatom',
    tvl: 89340000,
    symbol: 'HTM',
    category: 'Lending',
    chains: ['MultiversX'],
    url: 'https://hatom.com/'
  },
  'ashswap': {
    name: 'AshSwap',
    tvl: 70480000,
    symbol: 'ASH',
    category: 'DEX',
    chains: ['MultiversX'],
    url: 'https://ashswap.io/'
  },
  'onedex': {
    name: 'OneDex',
    tvl: 45250000,
    symbol: 'ONE',
    category: 'DEX',
    chains: ['MultiversX'],
    url: 'https://onedex.app/'
  },
  'jexchange': {
    name: 'JEXchange',
    tvl: 32180000,
    symbol: 'JEX',
    category: 'DEX',
    chains: ['MultiversX'],
    url: 'https://jexchange.io/'
  },
  'vestige': {
    name: 'Vestige',
    tvl: 28750000,
    symbol: 'VES',
    category: 'Yield Aggregator',
    chains: ['MultiversX'],
    url: 'https://vestige.fi/'
  },
  'arda': {
    name: 'Arda Staking',
    tvl: 25120000,
    symbol: 'ARDA',
    category: 'Staking',
    chains: ['MultiversX'],
    url: 'https://arda.run/'
  }
};

// Format currency for display
function formatCurrency(value: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(value);
}

// Normalize protocol name for comparison
function normalizeProtocolName(name: string): string {
  return name.toLowerCase()
    .replace(/\./g, '')
    .replace(/\s+/g, '')
    .replace(/-/g, '')
    .replace(/protocol/g, '');
}

/**
 * Get TVL data for MultiversX protocols
 */
export async function getMultiversXTVL(): Promise<StandardResponse> {
  try {
    const cacheKey = 'multiversx-tvl';
    const cachedData = protocolCache[cacheKey];
    const now = Date.now();

    if (cachedData && now - cachedData.timestamp < cacheExpiryMs) {
      elizaLogger.info('Using cached MultiversX TVL data');
      return createSuccessResponse({
        protocols: cachedData.data.protocols,
        totalTVL: cachedData.data.totalTVL,
        timestamp: cachedData.timestamp,
        count: cachedData.data.protocols.length
      });
    }

    // Try to get all protocols first
    elizaLogger.info('Fetching protocols from DefiLlama API');
    const response = await api.get('https://api.llama.fi/protocols');
    
    if (response.data && Array.isArray(response.data)) {
      // Filter for MultiversX protocols
      const multiversxProtocols = response.data
        .filter((protocol: any) => 
          protocol.chains && (protocol.chains.includes('MultiversX') || protocol.chains.includes('Elrond'))
        )
        .map((protocol: any) => {
          // Extract MultiversX-specific TVL
          let tvl = 0;
          if (protocol.chainTvls && (protocol.chainTvls.MultiversX || protocol.chainTvls.Elrond)) {
            tvl = protocol.chainTvls.MultiversX || protocol.chainTvls.Elrond;
          } else if (protocol.currentChainTvls && (protocol.currentChainTvls.MultiversX || protocol.currentChainTvls.Elrond)) {
            tvl = protocol.currentChainTvls.MultiversX || protocol.currentChainTvls.Elrond;
          } else {
            tvl = protocol.tvl || 0;
          }

          return {
            name: protocol.name,
            tvl: tvl,
            symbol: protocol.symbol || '',
            category: protocol.category || '',
            chains: protocol.chains || [],
            url: protocol.url || '',
            change_1d: protocol.change_1d || 0,
            change_7d: protocol.change_7d || 0,
            slug: protocol.slug || null
          };
        });

      // Sort by TVL descending
      multiversxProtocols.sort((a: any, b: any) => b.tvl - a.tvl);
      
      // Now try to get the chain TVL
      let totalTVL = 0;
      try {
        // Try the chain endpoint - note that MultiversX might be listed as "Elrond" in the API
        const chainResponse = await api.get('https://api.llama.fi/v2/chains');
        
        if (chainResponse.data && Array.isArray(chainResponse.data)) {
          const multiversxChain = chainResponse.data.find((chain: any) => 
            chain.name === 'MultiversX' || chain.name === 'Elrond'
          );
          
          if (multiversxChain) {
            totalTVL = multiversxChain.tvl || 0;
          } else {
            // If chain not found, sum up protocol TVLs
            totalTVL = multiversxProtocols.reduce((sum: number, p: any) => sum + (p.tvl || 0), 0);
          }
        } else {
          // If chain endpoint fails, sum up protocol TVLs
          totalTVL = multiversxProtocols.reduce((sum: number, p: any) => sum + (p.tvl || 0), 0);
        }
      } catch (chainError) {
        elizaLogger.warn('Error fetching chain data, using sum of protocols', chainError);
        // If chain endpoint fails, sum up protocol TVLs
        totalTVL = multiversxProtocols.reduce((sum: number, p: any) => sum + (p.tvl || 0), 0);
      }
      
      // Cache the data
      protocolCache[cacheKey] = {
        data: {
          protocols: multiversxProtocols,
          totalTVL: totalTVL
        },
        timestamp: now
      };
      
      elizaLogger.info(`Found ${multiversxProtocols.length} MultiversX protocols with total TVL: ${formatCurrency(totalTVL)}`);
      
      return createSuccessResponse({
        protocols: multiversxProtocols,
        totalTVL,
        timestamp: now,
        count: multiversxProtocols.length
      });
    }
    
    // If API fails, return default data
    elizaLogger.warn('Failed to fetch protocols from DefiLlama API, using default data');
    const defaultProtocols = Object.values(COMMON_MULTIVERSX_PROTOCOLS);
    const totalTVL = defaultProtocols.reduce((sum: number, p: any) => sum + (p.tvl || 0), 0);
    
    // Cache the default data
    protocolCache[cacheKey] = {
      data: {
        protocols: defaultProtocols,
        totalTVL: totalTVL
      },
      timestamp: now
    };
    
    return createSuccessResponse({
      protocols: defaultProtocols,
      totalTVL,
      timestamp: now,
      count: defaultProtocols.length,
      isDefaultData: true,
      note: "Using estimated data due to API unavailability"
    });
  } catch (error) {
    elizaLogger.error('Error fetching MultiversX TVL:', error);
    
    // Return default data on error
    const defaultProtocols = Object.values(COMMON_MULTIVERSX_PROTOCOLS);
    const totalTVL = defaultProtocols.reduce((sum: number, p: any) => sum + (p.tvl || 0), 0);
    
    return createSuccessResponse({
      protocols: defaultProtocols,
      totalTVL,
      timestamp: Date.now(),
      count: defaultProtocols.length,
      isDefaultData: true,
      note: "Using estimated data due to API error"
    });
  }
}

/**
 * Get protocol data by name
 */
export async function getProtocolByName(params: { name: string }): Promise<StandardResponse> {
  try {
    const searchName = params.name.trim();
    const normalizedSearchName = normalizeProtocolName(searchName);
    
    if (!searchName) {
      return createErrorResponse("InvalidParam", "Protocol name is required");
    }
    
    elizaLogger.info(`Looking up protocol: ${searchName}`);
    
    // Try to get protocol directly by slug first
    try {
      // Try to find a matching protocol slug
      const allProtocolsResponse = await api.get('https://api.llama.fi/protocols');
      
      let slug = null;
      if (allProtocolsResponse.data && Array.isArray(allProtocolsResponse.data)) {
        const matchingProtocol = allProtocolsResponse.data.find((p: any) => 
          normalizeProtocolName(p.name) === normalizedSearchName && 
          (p.chains.includes('MultiversX') || p.chains.includes('Elrond'))
        );
        
        if (matchingProtocol) {
          slug = matchingProtocol.slug;
        }
      }
      
      if (slug) {
        // Try to get protocol-specific data
        const protocolResponse = await api.get(`https://api.llama.fi/protocol/${slug}`);
        
        if (protocolResponse.data) {
          const protocolData = protocolResponse.data;
          
          // Extract MultiversX-specific TVL
          let tvl = 0;
          if (protocolData.currentChainTvls && (protocolData.currentChainTvls.MultiversX || protocolData.currentChainTvls.Elrond)) {
            tvl = protocolData.currentChainTvls.MultiversX || protocolData.currentChainTvls.Elrond;
          } else if (protocolData.chainTvls && (protocolData.chainTvls.MultiversX || protocolData.chainTvls.Elrond)) {
            tvl = protocolData.chainTvls.MultiversX || protocolData.chainTvls.Elrond;
          } else {
            // Fallback to total TVL if chain-specific not available
            tvl = protocolData.tvl || 0;
          }
          
          return createSuccessResponse({
            protocol: {
              name: protocolData.name,
              tvl: tvl,
              formattedTVL: formatCurrency(tvl),
              symbol: protocolData.symbol || '',
              category: protocolData.category || '',
              chains: protocolData.chains || ['MultiversX'],
              url: protocolData.url || '',
              description: protocolData.description || '',
              twitter: protocolData.twitter || '',
              logo: protocolData.logo || ''
            },
            timestamp: Date.now()
          });
        }
      }
    } catch (err) {
      elizaLogger.warn(`Failed to fetch specific protocol data for ${params.name}`, err);
      // Continue with fallback methods
    }
    
    // Check cache for all protocols
    const cacheKey = 'multiversx-tvl';
    const cachedData = protocolCache[cacheKey];
    const now = Date.now();
    
    let multiversxProtocols: any[] = [];
    
    if (cachedData && now - cachedData.timestamp < cacheExpiryMs) {
      elizaLogger.info('Using cached protocol data');
      multiversxProtocols = cachedData.data.protocols;
    } else {
      // Fetch all protocols from DefiLlama
      elizaLogger.info('Fetching protocols from DefiLlama API');
      const response = await api.get('https://api.llama.fi/protocols');
      
      if (response.data && Array.isArray(response.data)) {
        // Filter for MultiversX protocols
        multiversxProtocols = response.data.filter((protocol: any) => 
          protocol.chains && (protocol.chains.includes('MultiversX') || protocol.chains.includes('Elrond'))
        );
        
        // Cache the data
        protocolCache[cacheKey] = {
          data: {
            protocols: multiversxProtocols,
            totalTVL: multiversxProtocols.reduce((sum: number, p: any) => sum + (p.tvl || 0), 0)
          },
          timestamp: now
        };
      } else {
        // Use default data if API fails
        multiversxProtocols = Object.values(COMMON_MULTIVERSX_PROTOCOLS);
      }
    }
    
    // Try to find an exact match first
    let protocol = multiversxProtocols.find((p: any) => 
      normalizeProtocolName(p.name) === normalizedSearchName
    );
    
    // If no exact match, try partial match
    if (!protocol) {
      protocol = multiversxProtocols.find((p: any) => 
        normalizeProtocolName(p.name).includes(normalizedSearchName) || 
        (normalizedSearchName.length > 3 && normalizeProtocolName(p.name).includes(normalizedSearchName))
      );
    }
    
    // Check common protocols if still not found
    if (!protocol) {
      const commonProtocolKey = Object.keys(COMMON_MULTIVERSX_PROTOCOLS).find(key => 
        normalizeProtocolName(key) === normalizedSearchName || 
        normalizeProtocolName(COMMON_MULTIVERSX_PROTOCOLS[key].name) === normalizedSearchName
      );
      
      if (commonProtocolKey) {
        protocol = COMMON_MULTIVERSX_PROTOCOLS[commonProtocolKey];
      }
    }
    
    if (protocol) {
      return createSuccessResponse({
        protocol: {
          name: protocol.name,
          tvl: protocol.tvl,
          formattedTVL: formatCurrency(protocol.tvl),
          symbol: protocol.symbol || '',
          category: protocol.category || '',
          chains: protocol.chains || ['MultiversX'],
          url: protocol.url || ''
        },
        timestamp: Date.now()
      });
    }
    
    return createErrorResponse("NotFound", `Protocol '${params.name}' not found on MultiversX`);
  } catch (error) {
    elizaLogger.error('Error fetching protocol by name:', error);
    return createErrorResponse("ApiError", `Error fetching protocol: ${(error as Error).message}`);
  }
}

/**
 * Get top protocols on MultiversX by TVL
 */
export async function getTopMultiversXProtocols(params: { limit?: number }): Promise<StandardResponse> {
  try {
    const limit = params.limit || 10;
    
    // Get all protocols first
    const response = await getMultiversXTVL();
    
    if (response.success && response.result && response.result.protocols) {
      // Sort by TVL and limit
      const topProtocols = response.result.protocols
        .sort((a: any, b: any) => b.tvl - a.tvl)
        .slice(0, limit)
        .map((protocol: any) => ({
          name: protocol.name,
          tvl: protocol.tvl,
          formattedTVL: formatCurrency(protocol.tvl),
          category: protocol.category || '',
          url: protocol.url || ''
        }));
      
      elizaLogger.info(`Returning top ${topProtocols.length} protocols out of ${response.result.protocols.length}`);
      
      return createSuccessResponse({
        protocols: topProtocols,
        totalCount: response.result.protocols.length,
        totalTVL: response.result.totalTVL,
        formattedTotalTVL: formatCurrency(response.result.totalTVL),
        timestamp: response.result.timestamp,
        isDefaultData: response.result.isDefaultData
      });
    }
    
    // If the main call failed, use default data
    const defaultProtocols = Object.values(COMMON_MULTIVERSX_PROTOCOLS)
      .sort((a: any, b: any) => b.tvl - a.tvl)
      .slice(0, limit)
      .map((protocol: any) => ({
        name: protocol.name,
        tvl: protocol.tvl,
        formattedTVL: formatCurrency(protocol.tvl),
        category: protocol.category || '',
        url: protocol.url || ''
      }));
    
    const totalTVL = defaultProtocols.reduce((sum: number, p: any) => sum + (p.tvl || 0), 0);
    
    return createSuccessResponse({
      protocols: defaultProtocols,
      totalCount: Object.keys(COMMON_MULTIVERSX_PROTOCOLS).length,
      totalTVL,
      formattedTotalTVL: formatCurrency(totalTVL),
      timestamp: Date.now(),
      isDefaultData: true,
      note: "Using estimated data due to API unavailability"
    });
  } catch (error) {
    elizaLogger.error('Error fetching top protocols:', error);
    return createErrorResponse("ApiError", `Error fetching top protocols: ${(error as Error).message}`);
  }
} 