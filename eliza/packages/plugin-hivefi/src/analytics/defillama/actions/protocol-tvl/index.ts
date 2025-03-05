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
    const protocol = extractProtocolName(message.content?.text || "");
    if (!protocol) {
      callback?.({
        text: "Please specify a protocol name. For example: 'What's the TVL of Uniswap?' or 'Show me Aave's TVL'"
      });
      return false;
    }

    // Check cache first
    const cacheKey = `protocol-tvl-${protocol}`;
    const cachedData = getProtocolCache(cacheKey);
    if (cachedData) {
      elizaLogger.info(`Using cached TVL data for ${protocol}`);
      callback?.({
        text: `${cachedData.name} Protocol TVL: ${cachedData.formattedTVL}`,
        content: cachedData
      });
      return true;
    }

    // Fetch fresh data
    const result = await getProtocolData(protocol);
    if (!result.success) {
      callback?.({
        text: `Failed to get protocol data: ${result.error?.message}`
      });
      return false;
    }

    const protocolData = result.result;

    // Format the data
    const formattedData: ProtocolTVLData = {
      name: protocolData.name,
      slug: protocol,
      tvl: protocolData.tvl,
      formattedTVL: formatCurrency(protocolData.tvl)
    };

    // Update cache
    setProtocolCache(cacheKey, formattedData);

    // Send response
    callback?.({
      text: `${formattedData.name} Protocol TVL: ${formattedData.formattedTVL}`,
      content: formattedData
    });

    return true;
  } catch (error) {
    elizaLogger.error('Error in GET_PROTOCOL_TVL handler:', error);
    callback?.({
      text: "Sorry, I encountered an error while fetching the protocol TVL data."
    });
    return false;
  }
};

export const protocolTVLAction: Action = {
  name: 'GET_PROTOCOL_TVL',
  description: 'Get TVL data for a specific DeFi protocol',
  similes: [
    'PROTOCOL_TVL',
    'TVL_OF_PROTOCOL',
    'PROTOCOL_VALUE_LOCKED'
  ],
  handler,
  validate: async () => true,
  examples: [[
    {
      user: 'user1',
      content: { text: "What's the TVL of Uniswap?" }
    },
    {
      user: 'assistant',
      content: { text: 'Uniswap Protocol TVL: $123.45B' }
    }
  ]]
}; 