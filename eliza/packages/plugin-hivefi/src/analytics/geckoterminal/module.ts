import { elizaLogger } from "@elizaos/core";
import { StandardResponse, createSuccessResponse, createErrorResponse } from '../utils/response';
import { NetworkStats } from './types';
import { formatUSD, formatMarkdown } from './utils/format';
import { getCachedNetworkStats, setCachedNetworkStats } from './utils/cache';
import { getNetworkStats } from './api/client';
import { SUPPORTED_NETWORKS } from './config/networks';

/**
 * Get pool analysis for a specific network or all supported networks
 */
export async function getPoolAnalysis(params: { networkId?: string }): Promise<StandardResponse> {
    try {
        const { networkId } = params;
        
        // If no network specified, get stats for all enabled networks
        const networksToAnalyze = networkId 
            ? SUPPORTED_NETWORKS.filter(n => n.id === networkId && n.enabled)
            : SUPPORTED_NETWORKS.filter(n => n.enabled);

        if (networksToAnalyze.length === 0) {
            return createErrorResponse(
                "InvalidNetwork",
                `No supported networks found${networkId ? ` for ID: ${networkId}` : ''}.`
            );
        }

        const results: NetworkStats[] = [];
        const errors: string[] = [];

        // Fetch stats for each network
        for (const network of networksToAnalyze) {
            try {
                // Check cache first
                let stats = getCachedNetworkStats(network.id);
                
                if (!stats) {
                    stats = await getNetworkStats(network.id, network.name);
                    setCachedNetworkStats(network.id, stats);
                }
                
                results.push(stats);
            } catch (error) {
                elizaLogger.error(`Error fetching data for ${network.name}:`, error);
                errors.push(network.name);
            }
        }

        if (results.length === 0) {
            return createErrorResponse(
                "FetchError",
                "Failed to fetch data from any networks."
            );
        }

        // Calculate totals
        const totalTvl = results.reduce((sum, stats) => sum + stats.totalTvl, 0);
        const totalVolume = results.reduce((sum, stats) => sum + stats.totalVolume24h, 0);
        const totalPools = results.reduce((sum, stats) => sum + stats.totalPools, 0);

        return createSuccessResponse({
            networks: results,
            totals: {
                tvl: totalTvl,
                volume24h: totalVolume,
                poolCount: totalPools
            },
            errors: errors.length > 0 ? errors : undefined,
            timestamp: Date.now()
        });

    } catch (error) {
        elizaLogger.error("Error in pool analysis:", error);
        return createErrorResponse(
            "UnknownError",
            "Failed to analyze pools. Please try again later."
        );
    }
} 