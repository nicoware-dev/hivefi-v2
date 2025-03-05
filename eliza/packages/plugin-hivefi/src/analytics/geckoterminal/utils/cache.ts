import { NetworkStats } from '../types';

// Cache duration in milliseconds (5 minutes)
export const CACHE_DURATION = 5 * 60 * 1000;

interface NetworkCache {
    [networkId: string]: {
        data: NetworkStats;
        timestamp: number;
    };
}

const networkCache: NetworkCache = {};

export function getCachedNetworkStats(networkId: string): NetworkStats | null {
    const cached = networkCache[networkId];
    if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
        return cached.data;
    }
    return null;
}

export function setCachedNetworkStats(networkId: string, data: NetworkStats): void {
    networkCache[networkId] = {
        data,
        timestamp: Date.now()
    };
}

export function clearCache(): void {
    Object.keys(networkCache).forEach(key => delete networkCache[key]);
} 