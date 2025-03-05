import type { Action, Handler } from "@elizaos/core";
import { elizaLogger } from "@elizaos/core";
import { getAllProtocols } from "../../api/client";
import { extractMultipleProtocolNames } from "../../utils/extract";
import { formatCurrency } from "../../utils/format";
import { PROTOCOL_TO_DEFILLAMA_SLUG } from "../../config/mappings";
import type { ProtocolTVLData } from "../../types";

const handler: Handler = async (runtime, message, state, _options, callback) => {
  try {
    // Extract protocol names from message
    const protocols = extractMultipleProtocolNames(message.content?.text || "");
    if (protocols.length === 0) {
      callback?.({
        text: "Please specify at least one protocol to check. For example:\n" +
             "'Show TVL for Uniswap, Aave, and Curve' or\n" +
             "'Compare TVL of major DEXes'"
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
      // Try to find protocol by name or slug
      const data = result.result.find((p: any) => {
        const protocolSlug = PROTOCOL_TO_DEFILLAMA_SLUG[protocol.toLowerCase()];
        return p.slug.toLowerCase() === (protocolSlug || protocol.toLowerCase()) ||
               p.name.toLowerCase() === protocol.toLowerCase();
      });

      if (data) {
        // Get chain TVLs
        const chainTvls = Object.entries(data.chainTvls || {})
          .map(([chain, tvl]) => ({
            chain,
            tvl: tvl as number,
            formattedTVL: formatCurrency(tvl as number)
          }))
          .filter(({ tvl }) => tvl > 0)
          .sort((a, b) => b.tvl - a.tvl);

        protocolData.push({
          name: data.name,
          slug: data.slug,
          tvl: data.tvl || 0,
          formattedTVL: formatCurrency(data.tvl || 0),
          chains: data.chains || [],
          chainTvls,
          category: data.category,
          change_1d: data.change_1d,
          change_7d: data.change_7d
        });
      } else {
        notFound.push(protocol);
      }
    }

    if (protocolData.length === 0) {
      callback?.({
        text: `No TVL data found for any of the specified protocols. Please check the protocol names and try again.\n\n` +
             `Not found: ${notFound.join(", ")}`
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
      const percentage = (protocol.tvl / totalTVL * 100).toFixed(2);
      response += `${index + 1}. ${protocol.name}: ${protocol.formattedTVL} (${percentage}% of total)`;
      
      if (protocol.category) {
        response += `\n   Category: ${protocol.category}`;
      }
      
      if (protocol.chains?.length) {
        response += `\n   Chains: ${protocol.chains.join(", ")}`;
      }
      
      if (protocol.change_1d !== undefined) {
        response += `\n   24h Change: ${protocol.change_1d > 0 ? '+' : ''}${protocol.change_1d.toFixed(2)}%`;
      }
      
      if (protocol.change_7d !== undefined) {
        response += `\n   7d Change: ${protocol.change_7d > 0 ? '+' : ''}${protocol.change_7d.toFixed(2)}%`;
      }
      
      // Add top 3 chains by TVL
      if (protocol.chainTvls && protocol.chainTvls.length > 0) {
        const top3Chains = protocol.chainTvls.slice(0, 3);
        response += `\n   Top Chains by TVL:`;
        top3Chains.forEach(chain => {
          const chainPercentage = (chain.tvl / protocol.tvl * 100).toFixed(2);
          response += `\n     ${chain.chain}: ${chain.formattedTVL} (${chainPercentage}%)`;
        });
      }
      
      response += "\n\n";
    });

    response += `Total TVL: ${formatCurrency(totalTVL)}`;

    if (notFound.length > 0) {
      response += `\n\nNote: Could not find data for: ${notFound.join(", ")}`;
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
      text: "Sorry, I encountered an error while fetching the protocol TVL data. " +
           "Please try again in a moment."
    });
    return false;
  }
};

export const multipleProtocolTVLAction: Action = {
  name: 'GET_MULTIPLE_PROTOCOL_TVL',
  description: 'Get TVL data for multiple protocols',
  similes: [
    // Direct matches
    'SHOW_TVL_FOR_PROTOCOLS',
    'GET_MULTIPLE_PROTOCOL_TVL',
    'COMPARE_PROTOCOL_TVLS',
    'PROTOCOL_TVL_COMPARISON',
    // Question patterns
    'WHATS_TVL_FOR_PROTOCOLS',
    'HOW_MUCH_TVL_DO_PROTOCOLS_HAVE',
    'WHAT_IS_TVL_OF_PROTOCOLS',
    // Compare patterns
    'COMPARE_PROTOCOLS',
    'COMPARE_TVL',
    'COMPARE_PROTOCOL_TVL',
    // List patterns
    'LIST_PROTOCOL_TVLS',
    'SHOW_PROTOCOL_TVLS',
    // Multiple patterns
    'MULTIPLE_PROTOCOL_TVL',
    'MULTI_PROTOCOL_TVL',
    'PROTOCOLS_TVL',
    'TVL_COMPARISON',
    // Common variations
    'PROTOCOL_COMPARISON',
    'PROTOCOL_TVL_COMPARE',
    'PROTOCOLS_COMPARISON',
    'TVL_FOR_PROTOCOLS'
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
      content: { text: 'Protocol TVL Comparison:\n\n1. Aave: $12.3B (61% of total)\n   Category: Lending\n   Chains: Ethereum, Arbitrum, Optimism\n   24h Change: +1.2%\n   7d Change: +3.5%\n   Top Chains by TVL:\n     Ethereum: $8.2B (66.7%)\n     Arbitrum: $2.5B (20.3%)\n     Optimism: $1.6B (13%)\n\n2. Curve: $4.1B (20.3% of total)\n   Category: DEX\n   Chains: Ethereum, Arbitrum, Optimism\n   24h Change: +0.8%\n   7d Change: +2.1%\n   Top Chains by TVL:\n     Ethereum: $3.2B (78%)\n     Arbitrum: $0.6B (14.6%)\n     Optimism: $0.3B (7.4%)\n\n3. Uniswap: $3.8B (18.7% of total)\n   Category: DEX\n   Chains: Ethereum, Arbitrum, Optimism, Polygon\n   24h Change: +1.5%\n   7d Change: +4.2%\n   Top Chains by TVL:\n     Ethereum: $2.8B (73.7%)\n     Arbitrum: $0.7B (18.4%)\n     Optimism: $0.3B (7.9%)\n\nTotal TVL: $20.2B' }
    }
  ]]
}; 