import { elizaLogger } from "@elizaos/core";
import { StandardResponse, createSuccessResponse, createErrorResponse } from '../../utils/response';
import { GeckoTerminalResponse, NetworkStats, Pool, Token } from '../types';
import { formatPoolInfo } from '../utils/format';

const GECKO_TERMINAL_API = "https://api.geckoterminal.com/api/v2";
const API_VERSION = "20230302";

interface GeckoTerminalItem {
    id: string;
    attributes: any;
}

interface GeckoTerminalApiResponse {
    data: GeckoTerminalItem | GeckoTerminalItem[];
}

/**
 * Base function to make API requests to GeckoTerminal
 */
async function makeRequest<T extends GeckoTerminalItem | GeckoTerminalItem[]>(endpoint: string): Promise<StandardResponse<T>> {
    try {
        const response = await fetch(
            `${GECKO_TERMINAL_API}${endpoint}`,
            {
                headers: {
                    'Accept': `application/json;version=${API_VERSION}`
                }
            }
        );

        if (!response.ok) {
            throw new Error(`Failed to fetch data: ${response.statusText}`);
        }

        const data: GeckoTerminalApiResponse = await response.json();
        
        // Handle both single item and array responses
        if (Array.isArray(data.data)) {
            // For array responses (pools, tokens, etc.)
            return createSuccessResponse(data.data as T);
        } else if (data.data) {
            // For single item responses (pool info, token info)
            return createSuccessResponse(data.data as T);
        }
        
        throw new Error('Invalid response format from API');
    } catch (error) {
        elizaLogger.error("GeckoTerminal API error:", error);
        return createErrorResponse(
            "ApiError",
            error instanceof Error ? error.message : "Unknown error"
        );
    }
}

/**
 * Get trending pools across all networks or for a specific network
 */
export async function getTrendingPools(networkId?: string): Promise<StandardResponse<Pool[]>> {
    const endpoint = networkId 
        ? `/networks/${networkId}/trending_pools`
        : '/networks/trending_pools';
    
    return makeRequest<Pool[]>(endpoint);
}

/**
 * Get specific pool information
 */
export async function getPoolInfo(networkId: string, poolAddress: string): Promise<StandardResponse<Pool>> {
    return makeRequest<Pool>(`/networks/${networkId}/pools/${poolAddress}`);
}

/**
 * Get top pools for a network
 */
export async function getTopPools(networkId: string, limit: number = 100): Promise<StandardResponse<Pool[]>> {
    return makeRequest<Pool[]>(`/networks/${networkId}/pools?page=1&limit=${limit}`);
}

/**
 * Get pools for a specific DEX on a network
 */
export async function getDexPools(networkId: string, dexId: string): Promise<StandardResponse<Pool[]>> {
    return makeRequest<Pool[]>(`/networks/${networkId}/dexes/${dexId}/pools`);
}

/**
 * Get new pools on a network or across all networks
 */
export async function getNewPools(networkId?: string): Promise<StandardResponse<Pool[]>> {
    const endpoint = networkId 
        ? `/networks/${networkId}/new_pools`
        : '/networks/new_pools';
    
    return makeRequest<Pool[]>(endpoint);
}

/**
 * Search for pools on a network
 */
export async function searchPools(networkId: string, query: string): Promise<StandardResponse<Pool[]>> {
    return makeRequest<Pool[]>(`/search/pools?network=${networkId}&query=${encodeURIComponent(query)}`);
}

/**
 * Get token information on a network
 */
export async function getTokenInfo(networkId: string, tokenAddress: string): Promise<StandardResponse<Token>> {
    return makeRequest<Token>(`/networks/${networkId}/tokens/${tokenAddress}`);
}

/**
 * Get token pools on a network
 */
export async function getTokenPools(networkId: string, tokenAddress: string): Promise<StandardResponse<Pool[]>> {
    return makeRequest<Pool[]>(`/networks/${networkId}/tokens/${tokenAddress}/pools`);
}

/**
 * Get multiple tokens information on a network
 */
export async function getMultipleTokens(networkId: string, tokenAddresses: string[]): Promise<StandardResponse<Token[]>> {
    return makeRequest<Token[]>(`/networks/${networkId}/tokens/multi/${tokenAddresses.join(',')}`);
}

export async function fetchNetworkPools(networkId: string): Promise<GeckoTerminalResponse> {
    try {
        const response = await fetch(
            `${GECKO_TERMINAL_API}/networks/${networkId}/pools`,
            {
                headers: {
                    'Accept': 'application/json;version=20230302'
                }
            }
        );

        if (!response.ok) {
            throw new Error(`Failed to fetch data: ${response.statusText}`);
        }

        return await response.json();
    } catch (error) {
        elizaLogger.error("GeckoTerminal API error:", error);
        throw error;
    }
}

export async function getNetworkStats(networkId: string, networkName: string): Promise<NetworkStats> {
    const data = await fetchNetworkPools(networkId);
    
    if (!data.data?.length) {
        return {
            networkId,
            networkName,
            totalTvl: 0,
            totalVolume24h: 0,
            totalPools: 0,
            topPools: []
        };
    }

    const pools = data.data;
    const totalTvl = pools.reduce((sum: number, pool: Pool) => 
        sum + parseFloat(pool.attributes.reserve_in_usd), 0);
    const totalVolume24h = pools.reduce((sum: number, pool: Pool) => 
        sum + parseFloat(pool.attributes.volume_usd.h24), 0);

    // Sort pools by TVL and get top 5
    const topPools = pools
        .sort((a: Pool, b: Pool) => 
            parseFloat(b.attributes.reserve_in_usd) - parseFloat(a.attributes.reserve_in_usd))
        .slice(0, 5)
        .map(formatPoolInfo);

    return {
        networkId,
        networkName,
        totalTvl,
        totalVolume24h,
        totalPools: pools.length,
        topPools
    };
} 