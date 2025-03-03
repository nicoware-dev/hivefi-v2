import {
    IAgentRuntime,
    Memory,
    Provider,
    State,
    elizaLogger,
} from "@elizaos/core";
import { createPublicClient, http } from "viem";
import { sonicChain } from "../config/chains";

// Example queries that should trigger this provider
const EXAMPLE_QUERIES = [
    "Show me the top pools on Sonic network",
    "What are the most active pools on Sonic?",
    "Show me Sonic DEX pool information",
    "Get pool statistics from GeckoTerminal",
    "List Sonic liquidity pools",
    "What are the current pool rates?",
    "Show me pool TVL and volume"
];

const GECKO_TERMINAL_API = "https://api.geckoterminal.com/api/v2";
const SONIC_NETWORK_ID = "sonic";

// Cache duration in milliseconds (5 minutes)
const CACHE_DURATION = 5 * 60 * 1000;

interface Pool {
    id: string;
    attributes: {
        name: string;
        address: string;
        base_token_price_usd: string;
        quote_token_price_usd: string;
        base_token_name: string;
        quote_token_name: string;
        volume_usd: {
            h24: string;
        };
        reserve_in_usd: string;
        fee_24h?: string;
        transactions_24h?: string;
        price_change_percentage?: {
            h24?: string;
        };
        fdv_usd?: string;
        market_cap_usd?: string;
        base_token_address?: string;
        quote_token_address?: string;
    };
}

interface GeckoTerminalResponse {
    data: Pool[];
}

// Helper function to format USD values
function formatUSD(value: string | number): string {
    const num = typeof value === 'string' ? parseFloat(value) : value;
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    }).format(num);
}

// Helper function to format pool information
function formatPoolInfo(pool: Pool): string {
    const { 
        name, 
        address, 
        volume_usd, 
        reserve_in_usd,
        base_token_price_usd,
        quote_token_price_usd,
        base_token_name,
        quote_token_name,
        price_change_percentage,
        transactions_24h
    } = pool.attributes;

    const volume = parseFloat(volume_usd.h24);
    const tvl = parseFloat(reserve_in_usd);
    const fees = volume * 0.003; // 0.3% fee
    const priceChange = price_change_percentage?.h24 
        ? `${parseFloat(price_change_percentage.h24) >= 0 ? '+' : ''}${parseFloat(price_change_percentage.h24).toFixed(2)}%`
        : 'N/A';

    return `## ${name}
- Address: \`${address}\`
- TVL: $${tvl.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
- 24h Volume: $${volume.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
- 24h Fees Generated: $${fees.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
- 24h Price Change: ${priceChange}
- 24h Transactions: ${transactions_24h || 'N/A'}
- Token Prices:
  * ${base_token_name}: $${parseFloat(base_token_price_usd || '0').toLocaleString(undefined, { minimumFractionDigits: 6, maximumFractionDigits: 6 })}
  * ${quote_token_name}: $${parseFloat(quote_token_price_usd || '0').toLocaleString(undefined, { minimumFractionDigits: 6, maximumFractionDigits: 6 })}`;
}

// Cache state
let lastFetchTime = 0;
let cachedData: string | null = null;

export const geckoTerminalProvider: Provider = {
    get: async (runtime: IAgentRuntime, message: Memory, _state?: State): Promise<string | null> => {
        elizaLogger.debug("geckoTerminalProvider::get");
        
        const messageText = message.content?.text?.toLowerCase() || '';
        if (!messageText.includes('pool')) {
            return null;
        }

        try {
            const response = await fetch(
                `${GECKO_TERMINAL_API}/networks/sonic/pools`,
                {
                    headers: {
                        'Accept': 'application/json;version=20230302'
                    }
                }
            );

            if (!response.ok) {
                throw new Error(`Failed to fetch data: ${response.statusText}`);
            }

            const data = await response.json();
            if (!data.data?.length) {
                return "No pools found on Sonic network.";
            }

            const pools = data.data
                .sort((a: Pool, b: Pool) => 
                    parseFloat(b.attributes.reserve_in_usd) - parseFloat(a.attributes.reserve_in_usd))
                .slice(0, 5)
                .map(formatPoolInfo)
                .join("\n\n");

            const totalTVL = data.data.reduce((sum: number, pool: Pool) => 
                sum + parseFloat(pool.attributes.reserve_in_usd), 0);
            const totalVolume = data.data.reduce((sum: number, pool: Pool) => 
                sum + parseFloat(pool.attributes.volume_usd.h24), 0);

            return `# Sonic Network Pool Analysis

## Network Overview
- Total TVL: $${totalTVL.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
- Total 24h Volume: $${totalVolume.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
- Total Pools Analyzed: ${data.data.length}

## Top Pools by TVL
${pools}

_Data updated at: ${new Date().toLocaleString()}_
_Source: GeckoTerminal_`;
        } catch (error) {
            elizaLogger.error("GeckoTerminal provider error:", error);
            return "Failed to fetch pool data. Please try again later.";
        }
    }
};
