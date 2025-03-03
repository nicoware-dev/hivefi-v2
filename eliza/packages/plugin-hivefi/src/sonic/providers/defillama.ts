import type { Provider, IAgentRuntime, Memory, State } from '@elizaos/core';
import { elizaLogger } from '@elizaos/core';
import axios from 'axios';

// Types
interface TVLDataPoint {
  date: string;
  tvl: number;
}

interface TVLSummary {
  currentTVL: number;
  monthlyChange: number;
  maxTVL: number;
  minTVL: number;
  avgTVL: number;
  last12Months: TVLDataPoint[];
}

interface DefiLlamaHistoricalTVL {
  tvl: number;
  date: number;
}

interface DefiLlamaProtocolTVL {
  tvl: Array<{
    date: number;
    totalLiquidityUSD: number;
  }>;
}

interface GlobalTVLData {
  totalTvl: number;
  topChains: Array<{
    name: string;
    tvl: number;
    percentage: number;
  }>;
}

// Constants
const BASE_URL = 'https://api.llama.fi';
const CHAIN_NAME = 'Sonic';

// Updated protocol slugs - these need to be verified with DefiLlama's API
const PROTOCOLS = [
  'beets',           // Updated from beethoven-x-sonic
  'silo-finance',           // Updated from silo-finance-sonic
  'avalon-labs',
  'beefy',
  'wagmi',
  'swapx',
  'shadow-exchange',
] as const;

// Cache configuration
const CACHE_DURATION = 300 * 1000; // 5 minutes
let tvlCache: {
  chainData: TVLSummary | null;
  protocolsData: Record<string, TVLSummary> | null;
  globalData: GlobalTVLData | null;
  timestamp: number;
} = {
  chainData: null,
  protocolsData: null,
  globalData: null,
  timestamp: 0
};

function isCacheValid(): boolean {
  return Date.now() - tvlCache.timestamp < CACHE_DURATION;
}

function formatCurrency(value: number): string {
  if (value >= 1e9) {
    return `$${(value / 1e9).toFixed(2)}B`;
  }
  if (value >= 1e6) {
    return `$${(value / 1e6).toFixed(2)}M`;
  }
  return `$${value.toFixed(2)}`;
}

function formatPercentage(value: number): string {
  const sign = value >= 0 ? '+' : '';
  return `${sign}${value.toFixed(2)}%`;
}

async function fetchChainTVL(): Promise<TVLSummary> {
  try {
    const response = await axios.get<DefiLlamaHistoricalTVL[]>(
      `${BASE_URL}/v2/historicalChainTvl/${CHAIN_NAME}`
    );

    if (!response.data || !Array.isArray(response.data)) {
      throw new Error('Invalid response format from DefiLlama API');
    }

    // Get last 12 months of data
    const yearAgo = new Date();
    yearAgo.setMonth(yearAgo.getMonth() - 12);

    const last12Months = response.data
      .filter(d => new Date(d.date * 1000) >= yearAgo)
      .map(d => ({
        date: new Date(d.date * 1000).toISOString().split('T')[0],
        tvl: Number(d.tvl || 0)
      }))
      .filter(d => !Number.isNaN(d.tvl));

    if (last12Months.length === 0) {
      throw new Error('No valid TVL data found');
    }

    const currentTVL = last12Months[last12Months.length - 1].tvl;
    const monthAgoIndex = last12Months.length - 31;
    const monthAgoTVL = monthAgoIndex >= 0 ? last12Months[monthAgoIndex].tvl : last12Months[0].tvl;
    const monthlyChange = ((currentTVL - monthAgoTVL) / monthAgoTVL) * 100;

    const tvlValues = last12Months.map(d => d.tvl);
    return {
      currentTVL,
      monthlyChange,
      maxTVL: Math.max(...tvlValues),
      minTVL: Math.min(...tvlValues),
      avgTVL: tvlValues.reduce((sum, val) => sum + val, 0) / tvlValues.length,
      last12Months
    };
  } catch (error) {
    elizaLogger.error('Error fetching chain TVL:', error);
    throw error;
  }
}

async function fetchProtocolTVL(protocol: string): Promise<TVLSummary | null> {
  try {
    const response = await axios.get<DefiLlamaProtocolTVL>(`${BASE_URL}/protocol/${protocol}`);
    const data = response.data;

    if (!data?.tvl || !Array.isArray(data.tvl)) {
      elizaLogger.warn(`Invalid response format for protocol ${protocol}`);
      return null;
    }

    const yearAgo = new Date();
    yearAgo.setMonth(yearAgo.getMonth() - 12);

    const last12Months = data.tvl
      .filter(d => new Date(d.date * 1000) >= yearAgo)
      .map(d => ({
        date: new Date(d.date * 1000).toISOString().split('T')[0],
        tvl: Number(d.totalLiquidityUSD || 0)
      }))
      .filter(d => !Number.isNaN(d.tvl));

    if (last12Months.length === 0) {
      elizaLogger.warn(`No valid TVL data found for ${protocol}`);
      return null;
    }

    const currentTVL = last12Months[last12Months.length - 1].tvl;
    const monthAgoIndex = last12Months.length - 31;
    const monthAgoTVL = monthAgoIndex >= 0 ? last12Months[monthAgoIndex].tvl : last12Months[0].tvl;
    const monthlyChange = ((currentTVL - monthAgoTVL) / monthAgoTVL) * 100;

    const tvlValues = last12Months.map(d => d.tvl);
    return {
      currentTVL,
      monthlyChange,
      maxTVL: Math.max(...tvlValues),
      minTVL: Math.min(...tvlValues),
      avgTVL: tvlValues.reduce((sum, val) => sum + val, 0) / tvlValues.length,
      last12Months
    };
  } catch (error) {
    if (axios.isAxiosError(error) && error.response?.status === 400) {
      elizaLogger.warn(`Protocol ${protocol} not found in DefiLlama`);
      return null;
    }
    elizaLogger.error(`Error fetching protocol TVL for ${protocol}:`, error);
    return null;
  }
}

async function fetchGlobalTVL(): Promise<GlobalTVLData> {
  try {
    const response = await axios.get<Array<{ name: string; tvl: number; chainId: string }>>(`${BASE_URL}/v2/chains`);

    if (!response.data || !Array.isArray(response.data)) {
      throw new Error('Invalid response format from DefiLlama API');
    }

    const chains = response.data.filter(chain => chain.tvl > 0);
    const totalTvl = chains.reduce((sum, chain) => sum + chain.tvl, 0);

    const topChains = chains
      .sort((a, b) => b.tvl - a.tvl)
      .slice(0, 10)
      .map(chain => ({
        name: chain.name,
        tvl: chain.tvl,
        percentage: (chain.tvl / totalTvl) * 100
      }));

    return {
      totalTvl,
      topChains
    };
  } catch (error) {
    elizaLogger.error('Error fetching global TVL:', error);
    throw error;
  }
}

export const defiLlamaProvider: Provider = {
  async get(_runtime: IAgentRuntime, _message: Memory, _state?: State): Promise<string> {
    try {
      if (isCacheValid() && tvlCache.chainData && tvlCache.protocolsData && tvlCache.globalData) {
        const { chainData, protocolsData, globalData } = tvlCache;
        return formatTVLData(chainData, protocolsData, globalData);
      }

      const [chainData, globalData, ...protocolResults] = await Promise.all([
        fetchChainTVL(),
        fetchGlobalTVL(),
        ...PROTOCOLS.map(p => fetchProtocolTVL(p).catch(() => null))
      ]);

      const protocolsData: Record<string, TVLSummary> = {};
      PROTOCOLS.forEach((protocol, index) => {
        const result = protocolResults[index];
        if (result) {
          protocolsData[protocol] = result;
        }
      });

      tvlCache = {
        chainData,
        protocolsData,
        globalData,
        timestamp: Date.now()
      };

      return formatTVLData(chainData, protocolsData, globalData);
    } catch (error) {
      elizaLogger.error('Error in DefiLlama provider:', error);
      return 'Currently unable to fetch TVL data. Please try again later.';
    }
  }
};

function formatTVLData(
  chainData: TVLSummary,
  protocolsData: Record<string, TVLSummary>,
  globalData: GlobalTVLData
): string {
  const lines = [
    '# Global DeFi & Sonic Network TVL Analysis',
    '',
    '## Global DeFi Overview',
    `- Total DeFi TVL: ${formatCurrency(globalData.totalTvl)}`,
    '',
    '### Top 10 Chains by TVL',
    ...globalData.topChains.map((chain, i) =>
      `${i + 1}. ${chain.name}: ${formatCurrency(chain.tvl)} (${formatPercentage(chain.percentage)})`
    ),
    '',
    '## Sonic Network Overview',
    `- Current TVL: ${formatCurrency(chainData.currentTVL)}`,
    `- Global Market Share: ${formatPercentage((chainData.currentTVL / globalData.totalTvl) * 100)}`,
    `- 30-Day Change: ${formatPercentage(chainData.monthlyChange)}`,
    `- All-Time High: ${formatCurrency(chainData.maxTVL)}`,
    `- All-Time Low: ${formatCurrency(chainData.minTVL)}`,
    `- Average TVL: ${formatCurrency(chainData.avgTVL)}`,
    ''
  ];

  // Only add protocol section if we have valid protocol data
  const validProtocols = Object.entries(protocolsData)
    .filter(([, data]) => data !== null)
    .sort(([, a], [, b]) => b.currentTVL - a.currentTVL);

  if (validProtocols.length > 0) {
    lines.push('## Sonic Protocol Breakdown');

    for (const [protocol, data] of validProtocols) {
      const protocolName = protocol
        .split('-')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');

      lines.push(
        `### ${protocolName}`,
        `- Current TVL: ${formatCurrency(data.currentTVL)}`,
        `- 30-Day Change: ${formatPercentage(data.monthlyChange)}`,
        `- Network Share: ${formatPercentage((data.currentTVL / chainData.currentTVL) * 100)}`,
        `- Global Share: ${formatPercentage((data.currentTVL / globalData.totalTvl) * 100)}`,
        ''
      );
    }
  }

  lines.push(
    '---',
    '_Data is updated every 5 minutes. All values are in USD._'
  );

  return lines.join('\n');
}
