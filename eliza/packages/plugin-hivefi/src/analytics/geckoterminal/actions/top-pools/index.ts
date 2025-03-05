import type { Action, Handler } from "@elizaos/core";
import { elizaLogger } from "@elizaos/core";
import { getTopPools } from "../../api/client";
import { formatMarkdown, formatPoolInfo } from "../../utils/format";
import { SUPPORTED_NETWORKS } from "../../config/networks";
import { Pool } from "../../types";

const handler: Handler = async (runtime, message, state, _options, callback) => {
    try {
        const messageText = message.content?.text?.toLowerCase() || "";
        
        // Extract network from message
        const network = SUPPORTED_NETWORKS.find(n => 
            messageText.includes(n.id) || messageText.includes(n.name.toLowerCase())
        );

        // Extract limit if specified (e.g., "top 5 pools", "10 pools")
        const limitMatch = messageText.match(/\b(\d+)\s*(pools?|top)\b/);
        const limit = limitMatch ? Math.min(parseInt(limitMatch[1], 10), 100) : 10;

        elizaLogger.debug('Top pools request:', { 
            messageText,
            extractedNetwork: network?.id,
            limit
        });

        if (!network) {
            const supportedNetworks = SUPPORTED_NETWORKS
                .filter(n => n.enabled)
                .map(n => n.name)
                .join(", ");
            
            callback?.({
                text: "Please specify a network. For example:\n" +
                     "'Show me top pools on Arbitrum' or 'Get top 10 pools on Mantle'\n\n" +
                     `Supported networks include: ${supportedNetworks}`
            });
            return false;
        }

        // Fetch top pools
        const result = await getTopPools(network.id, limit);
        if (!result.success || !result.result) {
            callback?.({
                text: `Failed to get top pools: ${result.error?.message || 'No pools found'}`
            });
            return false;
        }

        // Generate markdown report
        let markdown = `# Top ${limit} Pools on ${network.name}\n\n`;

        if (result.result.length === 0) {
            markdown += "_No pools found at the moment._";
        } else {
            const pools = Array.isArray(result.result) ? result.result : [result.result];
            markdown += pools.map((pool: Pool) => formatMarkdown(formatPoolInfo(pool))).join("\n\n");
        }

        callback?.({
            text: markdown,
            content: result.result
        });

        return true;

    } catch (error) {
        elizaLogger.error('Error in GET_TOP_POOLS handler:', {
            error,
            message: error instanceof Error ? error.message : 'Unknown error',
            stack: error instanceof Error ? error.stack : undefined
        });
        
        callback?.({
            text: "Sorry, I encountered an error while fetching top pools. " +
                 "Please try again in a moment."
        });
        return false;
    }
};

export const topPoolsAction: Action = {
    name: 'GET_TOP_POOLS',
    description: 'Get top pools by TVL for a specific network',
    similes: [
        'TOP_POOLS',
        'BEST_POOLS',
        'LARGEST_POOLS',
        'BIGGEST_POOLS',
        'HIGHEST_TVL_POOLS',
        'TOP_LIQUIDITY_POOLS'
    ],
    handler,
    validate: async () => true,
    examples: [[
        {
            user: 'user1',
            content: { text: "Show me top pools on Arbitrum" }
        },
        {
            user: 'assistant',
            content: { 
                text: '# Top 10 Pools on Arbitrum\n\n## USDC/WETH Pool\n- TVL: $10.5M\n...'
            }
        }
    ], [
        {
            user: 'user1',
            content: { text: "What are the top 5 pools on Mantle?" }
        },
        {
            user: 'assistant',
            content: { 
                text: '# Top 5 Pools on Mantle\n\n## WMNT/WETH Pool\n- TVL: $8.2M\n...'
            }
        }
    ]]
}; 