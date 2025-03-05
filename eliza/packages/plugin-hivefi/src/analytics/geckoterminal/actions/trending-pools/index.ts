import type { Action, Handler } from "@elizaos/core";
import { elizaLogger } from "@elizaos/core";
import { getTrendingPools } from "../../api/client";
import { formatMarkdown } from "../../utils/format";
import { SUPPORTED_NETWORKS } from "../../config/networks";
import { Pool } from "../../types";

const handler: Handler = async (runtime, message, state, _options, callback) => {
    try {
        const messageText = message.content?.text?.toLowerCase() || "";
        
        // Extract network from message if specified
        const networkId = SUPPORTED_NETWORKS.find(n => 
            messageText.includes(n.id) || messageText.includes(n.name.toLowerCase())
        )?.id;

        elizaLogger.debug('Trending pools request:', { 
            messageText,
            extractedNetwork: networkId
        });

        // Fetch trending pools
        const result = await getTrendingPools(networkId);
        if (!result.success || !result.result) {
            callback?.({
                text: `Failed to get trending pools: ${result.error?.message || 'No pools found'}`
            });
            return false;
        }

        // Generate markdown report
        let markdown = networkId 
            ? `# Trending Pools on ${SUPPORTED_NETWORKS.find(n => n.id === networkId)?.name}\n\n`
            : "# Trending Pools Across All Networks\n\n";

        if (result.result.length === 0) {
            markdown += "_No trending pools found at the moment._";
        } else {
            const pools = Array.isArray(result.result) ? result.result : [result.result];
            markdown += pools.map((pool: Pool) => formatMarkdown({
                name: pool.attributes.name,
                address: pool.attributes.address,
                tvl: parseFloat(pool.attributes.reserve_in_usd),
                volume24h: parseFloat(pool.attributes.volume_usd.h24),
                fees24h: parseFloat(pool.attributes.volume_usd.h24) * 0.003,
                priceChange24h: pool.attributes.price_change_percentage?.h24 
                    ? `${parseFloat(pool.attributes.price_change_percentage.h24) >= 0 ? '+' : ''}${parseFloat(pool.attributes.price_change_percentage.h24).toFixed(2)}%`
                    : undefined,
                transactions24h: pool.attributes.transactions_24h,
                baseTokenName: pool.attributes.base_token_name,
                quoteTokenName: pool.attributes.quote_token_name,
                baseTokenPrice: parseFloat(pool.attributes.base_token_price_usd || '0'),
                quoteTokenPrice: parseFloat(pool.attributes.quote_token_price_usd || '0'),
                baseTokenAddress: pool.attributes.base_token_address,
                quoteTokenAddress: pool.attributes.quote_token_address
            })).join("\n\n");
        }

        callback?.({
            text: markdown,
            content: result.result
        });

        return true;

    } catch (error) {
        elizaLogger.error('Error in GET_TRENDING_POOLS handler:', {
            error,
            message: error instanceof Error ? error.message : 'Unknown error',
            stack: error instanceof Error ? error.stack : undefined
        });
        
        callback?.({
            text: "Sorry, I encountered an error while fetching trending pools. " +
                 "Please try again in a moment."
        });
        return false;
    }
};

export const trendingPoolsAction: Action = {
    name: 'GET_TRENDING_POOLS',
    description: 'Get trending pools across all networks or for a specific network',
    similes: [
        'TRENDING_POOLS',
        'HOT_POOLS',
        'POPULAR_POOLS',
        'TOP_TRENDING',
        'MOST_ACTIVE_POOLS',
        'TRENDING_DEX_POOLS'
    ],
    handler,
    validate: async () => true,
    examples: [[
        {
            user: 'user1',
            content: { text: "Show me trending pools" }
        },
        {
            user: 'assistant',
            content: { 
                text: '# Trending Pools Across All Networks\n\n## USDC/WETH Pool\n- TVL: $10.5M\n...'
            }
        }
    ], [
        {
            user: 'user1',
            content: { text: "What are the trending pools on Arbitrum?" }
        },
        {
            user: 'assistant',
            content: { 
                text: '# Trending Pools on Arbitrum\n\n## WBTC/WETH Pool\n- TVL: $8.2M\n...'
            }
        }
    ]]
}; 