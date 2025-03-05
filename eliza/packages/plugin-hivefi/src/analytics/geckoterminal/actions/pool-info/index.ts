import type { Action, Handler } from "@elizaos/core";
import { elizaLogger } from "@elizaos/core";
import { getPoolInfo } from "../../api/client";
import { formatMarkdown } from "../../utils/format";
import { SUPPORTED_NETWORKS } from "../../config/networks";
import { Pool } from "../../types";

const handler: Handler = async (runtime, message, state, _options, callback) => {
    try {
        const messageText = message.content?.text?.toLowerCase() || "";
        
        // Extract network and pool address from message
        const network = SUPPORTED_NETWORKS.find(n => 
            messageText.includes(n.id) || messageText.includes(n.name.toLowerCase())
        );

        // Look for a potential pool address in the message
        const addressMatch = messageText.match(/0x[a-fA-F0-9]{40}/);
        const poolAddress = addressMatch ? addressMatch[0] : undefined;

        elizaLogger.debug('Pool info request:', { 
            messageText,
            extractedNetwork: network?.id,
            extractedAddress: poolAddress
        });

        if (!network || !poolAddress) {
            callback?.({
                text: "Please specify both a network and a pool address. For example:\n" +
                     "'Show me pool 0x123... on Arbitrum' or 'Get info for pool 0x456... on Mantle'"
            });
            return false;
        }

        // Fetch pool info
        const result = await getPoolInfo(network.id, poolAddress);
        if (!result.success || !result.result) {
            callback?.({
                text: `Failed to get pool info: ${result.error?.message || 'Pool not found'}`
            });
            return false;
        }

        // Generate markdown report
        const pool = result.result;
        const markdown = `# Pool Information on ${network.name}\n\n` + formatMarkdown({
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
        });

        callback?.({
            text: markdown,
            content: result.result
        });

        return true;

    } catch (error) {
        elizaLogger.error('Error in GET_POOL_INFO handler:', {
            error,
            message: error instanceof Error ? error.message : 'Unknown error',
            stack: error instanceof Error ? error.stack : undefined
        });
        
        callback?.({
            text: "Sorry, I encountered an error while fetching pool information. " +
                 "Please try again in a moment."
        });
        return false;
    }
};

export const poolInfoAction: Action = {
    name: 'GET_POOL_INFO',
    description: 'Get detailed information about a specific pool on a network',
    similes: [
        'POOL_INFO',
        'POOL_DETAILS',
        'POOL_DATA',
        'POOL_STATS',
        'POOL_METRICS',
        'POOL_ANALYSIS'
    ],
    handler,
    validate: async () => true,
    examples: [[
        {
            user: 'user1',
            content: { text: "Show me pool 0x1234567890abcdef1234567890abcdef12345678 on Arbitrum" }
        },
        {
            user: 'assistant',
            content: { 
                text: '# Pool Information on Arbitrum\n\n## USDC/WETH Pool\n- TVL: $10.5M\n...'
            }
        }
    ]]
}; 