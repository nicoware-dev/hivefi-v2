import type { Action, Handler } from "@elizaos/core";
import { elizaLogger } from "@elizaos/core";
import { getTokenInfo } from "../../api/client";
import { formatTokenInfo } from "../../utils/format";
import { SUPPORTED_NETWORKS } from "../../config/networks";

const handler: Handler = async (runtime, message, state, _options, callback) => {
    try {
        const messageText = message.content?.text?.toLowerCase() || "";
        
        // Extract network and token address from message
        const network = SUPPORTED_NETWORKS.find(n => 
            messageText.includes(n.id) || messageText.includes(n.name.toLowerCase())
        );

        // Look for a potential token address in the message
        const addressMatch = messageText.match(/0x[a-fA-F0-9]{40}/);
        const tokenAddress = addressMatch ? addressMatch[0] : undefined;

        elizaLogger.debug('Token info request:', { 
            messageText,
            extractedNetwork: network?.id,
            extractedAddress: tokenAddress
        });

        if (!network || !tokenAddress) {
            callback?.({
                text: "Please specify both a network and a token address. For example:\n" +
                     "'Show me token 0x123... on Arbitrum' or 'Get info for token 0x456... on Mantle'"
            });
            return false;
        }

        // Fetch token info
        const result = await getTokenInfo(network.id, tokenAddress);
        if (!result.success || !result.result) {
            callback?.({
                text: `Failed to get token info: ${result.error?.message || 'Token not found'}`
            });
            return false;
        }

        // Generate markdown report
        const markdown = formatTokenInfo(result.result);

        callback?.({
            text: markdown,
            content: result.result
        });

        return true;

    } catch (error) {
        elizaLogger.error('Error in GET_TOKEN_INFO handler:', {
            error,
            message: error instanceof Error ? error.message : 'Unknown error',
            stack: error instanceof Error ? error.stack : undefined
        });
        
        callback?.({
            text: "Sorry, I encountered an error while fetching token information. " +
                 "Please try again in a moment."
        });
        return false;
    }
};

export const tokenInfoAction: Action = {
    name: 'GET_TOKEN_INFO',
    description: 'Get detailed information about a specific token on a network',
    similes: [
        'TOKEN_INFO',
        'TOKEN_DETAILS',
        'TOKEN_DATA',
        'TOKEN_STATS',
        'TOKEN_METRICS',
        'TOKEN_ANALYSIS'
    ],
    handler,
    validate: async () => true,
    examples: [[
        {
            user: 'user1',
            content: { text: "Show me token 0x1234567890abcdef1234567890abcdef12345678 on Arbitrum" }
        },
        {
            user: 'assistant',
            content: { 
                text: '# Token Information\n\nUSDC (USDC)\n- Price: $1.00\n- Market Cap: $45.2B\n...'
            }
        }
    ]]
}; 