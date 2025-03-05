import type { Action, Handler } from "@elizaos/core";
import { elizaLogger } from "@elizaos/core";
import { getAllProtocols } from "../../api/client";
import { extractMultipleProtocolNames } from "../../utils/extract";
import { formatCurrency } from "../../utils/format";
import type { ProtocolTVLData } from "../../types";

const handler: Handler = async (runtime, message, state, _options, callback) => {
  try {
    // Extract protocol names from message
    const protocols = extractMultipleProtocolNames(message.content?.text || "");
    if (protocols.length === 0) {
      callback?.({
        text: "Please specify at least one protocol to check. For example: 'Show TVL for Uniswap, Aave, and Curve'"
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

    // Find and format data for each protocol
    const protocolData: ProtocolTVLData[] = [];
    const notFound: string[] = [];

    for (const protocol of protocols) {
      const data = result.result.find((p: any) => 
        p.slug.toLowerCase() === protocol.toLowerCase()
      );

      if (data) {
        // Get chain TVLs
        const chainTvls = Object.entries(data.chainTvls || {})
          .map(([chain, tvl]) => ({
            chain,
            tvl: tvl as number,
            formattedTVL: formatCurrency(tvl as number)
          }))
          .sort((a, b) => b.tvl - a.tvl);

        protocolData.push({
          name: data.name,
          slug: data.slug,
          tvl: data.tvl,
          formattedTVL: formatCurrency(data.tvl),
          chains: data.chains,
          chainTvls
        });
      } else {
        notFound.push(protocol);
      }
    }

    if (protocolData.length === 0) {
      callback?.({
        text: `No TVL data found for any of the specified protocols. Please check the protocol names and try again.`
      });
      return false;
    }

    // Sort by TVL
    protocolData.sort((a, b) => b.tvl - a.tvl);

    // Calculate total TVL
    const totalTVL = protocolData.reduce((sum, protocol) => sum + protocol.tvl, 0);

    // Format response
    let response = "Protocol TVL Comparison:\n\n";
    protocolData.forEach((protocol, index) => {
      response += `${index + 1}. ${protocol.name}: ${protocol.formattedTVL}`;
      if (protocol.chains?.length) {
        response += `\n   Chains: ${protocol.chains.join(', ')}`;
      }
      response += '\n\n';
    });

    response += `Total TVL: ${formatCurrency(totalTVL)}`;

    if (notFound.length > 0) {
      response += `\n\nNote: Could not find data for: ${notFound.join(', ')}`;
    }

    callback?.({
      text: response,
      content: {
        protocols: protocolData,
        notFound,
        totalTVL,
        formattedTotalTVL: formatCurrency(totalTVL)
      }
    });

    return true;
  } catch (error) {
    elizaLogger.error('Error in GET_MULTIPLE_PROTOCOL_TVL handler:', error);
    callback?.({
      text: "Sorry, I encountered an error while fetching the protocol TVL data."
    });
    return false;
  }
};

export const multipleProtocolTVLAction: Action = {
  name: 'GET_MULTIPLE_PROTOCOL_TVL',
  description: 'Get TVL data for multiple protocols',
  similes: [
    'MULTIPLE_PROTOCOL_TVL',
    'PROTOCOL_TVL_COMPARISON',
    'COMPARE_PROTOCOLS',
    'PROTOCOL_COMPARISON',
    'MULTI_PROTOCOL_TVL'
  ],
  handler,
  validate: async () => true,
  examples: [[
    {
      user: 'user1',
      content: { text: "Show TVL for Uniswap, Aave, and Curve" }
    },
    {
      user: 'assistant',
      content: { text: 'Protocol TVL Comparison:\n\n1. Aave: $12.3B\n   Chains: Ethereum, Arbitrum, Optimism\n\n2. Uniswap: $4.1B\n   Chains: Ethereum, Arbitrum, Optimism, Polygon\n\n3. Curve: $3.8B\n   Chains: Ethereum, Arbitrum, Optimism\n\nTotal TVL: $20.2B' }
    }
  ]]
}; 