import type { Action, Handler } from "@elizaos/core";
import { elizaLogger } from "@elizaos/core";
import { getProtocolData } from "../../api/client";
import { getProtocolCache, setProtocolCache } from "../../utils/cache";
import { extractProtocolName } from "../../utils/extract";
import { formatCurrency } from "../../utils/format";
import type { ProtocolTVLData } from "../../types";

const handler: Handler = async (runtime, message, state, _options, callback) => {
  try {
    // Extract protocol name from message
    const messageText = message.content?.text || "";
    elizaLogger.info(`Processing message for protocol TVL: "${messageText}"`);
    
    const protocol = extractProtocolName(messageText);
    if (!protocol) {
      callback?.({
        text: "Please specify a protocol name. For example: 'What's the total TVL of Uniswap across all chains?' or 'Show me Aave's total TVL'"
      });
      return false;
    }

    elizaLogger.info(`Extracted protocol: ${protocol}`);

    // Check cache first
    const cacheKey = `protocol-tvl-${protocol}`;
    const cachedData = getProtocolCache(cacheKey);
    if (cachedData) {
      elizaLogger.info(`Using cached TVL data for ${protocol}`);
      callback?.({
        text: `${cachedData.name} Total Protocol TVL (across all chains): ${cachedData.formattedTVL}`,
        content: cachedData
      });
      return true;
    }

    // Fetch fresh data
    elizaLogger.info(`Fetching data for protocol: ${protocol}`);
    const result = await getProtocolData(protocol);
    if (!result.success) {
      callback?.({
        text: `Failed to get protocol data: ${result.error?.message}`
      });
      return false;
    }

    const protocolData = result.result;
    elizaLogger.info(`Found protocol: ${protocolData.name} with TVL: ${protocolData.tvl}`);

    // Format the data
    const formattedData: ProtocolTVLData = {
      name: protocolData.name,
      slug: protocol,
      tvl: protocolData.tvl,
      formattedTVL: formatCurrency(protocolData.tvl)
    };

    // Get chain TVLs if available
    if (protocolData.chainTvls) {
      const chainTvls = Object.entries(protocolData.chainTvls)
        .map(([chain, tvl]) => ({
          chain,
          tvl: tvl as number,
          formattedTVL: formatCurrency(tvl as number)
        }))
        .filter(({ tvl }) => tvl > 0)
        .sort((a, b) => b.tvl - a.tvl);
      
      formattedData.chainTvls = chainTvls;
    }

    // Update cache
    setProtocolCache(cacheKey, formattedData);

    // Build response
    let response = `${formattedData.name} Total Protocol TVL (across all chains): ${formattedData.formattedTVL}`;
    
    // Add 24h and 7d changes if available
    if (protocolData.change_1d !== undefined) {
      response += `\n24h Change: ${protocolData.change_1d > 0 ? '+' : ''}${protocolData.change_1d.toFixed(2)}%`;
    }
    if (protocolData.change_7d !== undefined) {
      response += `\n7d Change: ${protocolData.change_7d > 0 ? '+' : ''}${protocolData.change_7d.toFixed(2)}%`;
    }

    // Add top chains by TVL if available
    if (formattedData.chainTvls && formattedData.chainTvls.length > 0) {
      const top3Chains = formattedData.chainTvls.slice(0, 3);
      response += "\n\nTop Chains by TVL:";
      top3Chains.forEach(chain => {
        const percentage = (chain.tvl / protocolData.tvl * 100).toFixed(2);
        response += `\n${chain.chain}: ${chain.formattedTVL} (${percentage}%)`;
      });
    }

    // Add note about chain-specific TVL
    response += "\n\nNote: This shows the total TVL across all chains. To see TVL on a specific chain, try: 'What's Uniswap's TVL on Arbitrum?'";

    // Send response
    callback?.({
      text: response,
      content: formattedData
    });

    return true;
  } catch (error) {
    elizaLogger.error('Error in GET_PROTOCOL_TVL handler:', error);
    callback?.({
      text: "Sorry, I encountered an error while fetching the protocol TVL data. " +
           "Please try again in a moment."
    });
    return false;
  }
};

export const protocolTVLAction: Action = {
  name: 'GET_TOTAL_PROTOCOL_TVL',
  description: 'Get total TVL data for a protocol across all chains',
  similes: [
    // Total/All chains patterns
    'PROTOCOL_TOTAL_TVL',
    'PROTOCOL_TVL_ALL_CHAINS',
    'PROTOCOL_TVL_ACROSS_CHAINS',
    'TOTAL_PROTOCOL_TVL',
    'ALL_CHAINS_PROTOCOL_TVL',
    'PROTOCOL_GLOBAL_TVL',
    'PROTOCOL_OVERALL_TVL',
    // Direct matches
    'GET_PROTOCOL_TVL',
    'PROTOCOL_TVL',
    'SHOW_PROTOCOL_TVL',
    'DISPLAY_PROTOCOL_TVL',
    // Question patterns
    'WHATS_PROTOCOL_TVL',
    'HOW_MUCH_TVL_PROTOCOL',
    'WHAT_IS_TVL_OF_PROTOCOL',
    'HOW_MUCH_TVL_DOES_PROTOCOL_HAVE',
    'WHAT_IS_TOTAL_TVL_OF_PROTOCOL',
    // Common variations
    'TVL_OF_PROTOCOL',
    'PROTOCOL_VALUE_LOCKED',
    'PROTOCOL_LOCKED_VALUE',
    'PROTOCOL_TVL_TOTAL',
    // Specific examples
    'UNISWAP_TVL',
    'AAVE_TVL',
    'CURVE_TVL',
    'GMX_TVL'
  ],
  handler,
  validate: async () => true,
  examples: [[
    {
      user: 'user1',
      content: { text: "What's the total TVL of Uniswap across all chains?" }
    },
    {
      user: 'assistant',
      content: { text: 'Uniswap Total Protocol TVL (across all chains): $5.4B\n24h Change: +1.5%\n7d Change: +4.2%\n\nTop Chains by TVL:\nEthereum: $4.1B (75.9%)\nArbitrum: $820.5M (15.2%)\nOptimism: $480M (8.9%)' }
    }
  ]]
}; 