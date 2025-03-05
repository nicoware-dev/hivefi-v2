import type { Action, Handler } from "@elizaos/core";
import { elizaLogger } from "@elizaos/core";
import { getAllProtocols } from "../../api/client";
import { extractChainName, extractProtocolName } from "../../utils/extract";
import { formatCurrency } from "../../utils/format";

const handler: Handler = async (runtime, message, state, _options, callback) => {
  try {
    // Extract protocol and chain names from message
    const messageText = message.content?.text || "";
    const protocol = extractProtocolName(messageText);
    const chain = extractChainName(messageText);

    if (!protocol || !chain) {
      callback?.({
        text: "Please specify both a protocol and chain name. For example: 'What's Uniswap's TVL on Arbitrum?' or 'Show me Aave's TVL on Optimism'"
      });
      return false;
    }

    // Fetch all protocols data
    const result = await getAllProtocols();
    if (!result.success) {
      callback?.({
        text: `Failed to get protocol data: ${result.error?.message}`
      });
      return false;
    }

    // Find the protocol
    const protocolData = result.result.find((p: any) => 
      p.slug.toLowerCase() === protocol.toLowerCase()
    );

    if (!protocolData) {
      callback?.({
        text: `Protocol '${protocol}' not found. Please check the protocol name and try again.`
      });
      return false;
    }

    // Find the chain's TVL
    const chainTVL = protocolData.chainTvls?.[chain];
    if (chainTVL === undefined) {
      callback?.({
        text: `No TVL data found for ${protocolData.name} on ${chain}. The protocol might not be deployed on this chain.`
      });
      return false;
    }

    // Format response
    const formattedTVL = formatCurrency(chainTVL);
    const response = `${protocolData.name} TVL on ${chain}: ${formattedTVL}`;

    callback?.({
      text: response,
      content: {
        protocol: protocolData.name,
        chain,
        tvl: chainTVL,
        formattedTVL
      }
    });

    return true;
  } catch (error) {
    elizaLogger.error('Error in GET_PROTOCOL_TVL_CHAIN handler:', error);
    callback?.({
      text: "Sorry, I encountered an error while fetching the protocol TVL data."
    });
    return false;
  }
};

export const protocolTVLByChainAction: Action = {
  name: 'GET_PROTOCOL_TVL_CHAIN',
  description: 'Get TVL data for a specific protocol on a specific chain',
  similes: [
    'PROTOCOL_TVL_CHAIN',
    'CHAIN_PROTOCOL_TVL',
    'PROTOCOL_CHAIN_TVL',
    'TVL_BY_CHAIN',
    'CHAIN_SPECIFIC_TVL'
  ],
  handler,
  validate: async () => true,
  examples: [[
    {
      user: 'user1',
      content: { text: "What's Uniswap's TVL on Arbitrum?" }
    },
    {
      user: 'assistant',
      content: { text: 'Uniswap TVL on Arbitrum: $820.5M' }
    }
  ]]
}; 