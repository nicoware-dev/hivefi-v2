import type { StandardResponse } from '../../utils/response';

// Cache interfaces
export interface ProtocolCache {
  [key: string]: {
    data: any;
    timestamp: number;
  };
}

export interface ChainCache {
  [key: string]: {
    data: any;
    timestamp: number;
  };
}

// Response interfaces
export interface TVLData {
  tvl: number;
  formattedTVL: string;
  change_1d?: number;
  change_7d?: number;
  change_1m?: number;
  mcaptvl?: number;
}

export interface ChainTVLData extends TVLData {
  name: string;
  chainId?: string;
  tokenSymbol?: string;
}

export interface ProtocolTVLData extends TVLData {
  name: string;
  slug?: string;
  description?: string;
  category?: string;
  chains?: string[];
  chainTvls?: Record<string, number> | {
    chain: string;
    tvl: number;
    formattedTVL: string;
  }[];
  chainMetrics?: Record<string, {
    change_1d?: number;
    change_7d?: number;
  }>;
  url?: string;
  twitter?: string;
}

export interface HistoricalDataPoint {
  timestamp: number;
  tvl: number;
  formattedTVL: string;
}

export interface HistoricalTVLData {
  chain?: string;
  protocol?: string;
  data: HistoricalDataPoint[];
}

// API response types
export interface DefiLlamaChainResponse {
  name: string;
  chainId: string;
  tokenSymbol: string;
  tvl: number;
  change_1d: number;
  change_7d: number;
  change_1m?: number;
  mcaptvl?: number;
}

export interface DefiLlamaProtocolResponse {
  name: string;
  slug?: string;
  description?: string;
  tvl: number;
  change_1d?: number;
  change_7d?: number;
  change_1m?: number;
  mcaptvl?: number;
  category?: string;
  chains?: string[];
  chainTvls?: Record<string, number>;
  url?: string;
  twitter?: string;
}

// Function parameter types
export interface GetChainTVLParams {
  chain: string;
}

export interface GetProtocolTVLParams {
  name: string;
}

export interface GetHistoricalTVLParams {
  chain?: string;
  protocol?: string;
  timestamp?: number;
}

export interface GetTopProtocolsParams {
  chain?: string;
  limit?: number;
}

export interface CompareParams {
  items: string[];
  limit?: number;
}

// Function return types
export type GetChainTVLResult = StandardResponse<ChainTVLData>;
export type GetProtocolTVLResult = StandardResponse<ProtocolTVLData>;
export type GetHistoricalTVLResult = StandardResponse<HistoricalTVLData>;
export type GetTopProtocolsResult = StandardResponse<{
  chain?: string;
  protocols: ProtocolTVLData[];
}>;
export type CompareResult = StandardResponse<{
  items: (ChainTVLData | ProtocolTVLData)[];
  notFound: string[];
}>; 