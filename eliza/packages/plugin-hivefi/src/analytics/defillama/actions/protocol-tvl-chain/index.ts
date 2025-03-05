import type { Action, Handler } from "@elizaos/core";
import { elizaLogger } from "@elizaos/core";
import { getAllProtocols } from "../../api/client";
import { extractChainName, extractProtocolName } from "../../utils/extract";
import { formatCurrency } from "../../utils/format";
import { CHAIN_TO_DEFILLAMA_SLUG } from "../../config/mappings";

interface ChainTVLData {
  chain: string;
  tvl: number;
}

const handler: Handler = async (runtime, message, state, _options, callback) => {
  try {
    // Extract protocol and chain names from message
    const messageText = message.content?.text || "";
    const protocol = extractProtocolName(messageText);
    const chainSlug = extractChainName(messageText);

    if (!protocol || !chainSlug) {
      const supportedChains = Object.keys(CHAIN_TO_DEFILLAMA_SLUG)
        .filter(key => key.length > 2)
        .sort()
        .join(", ");
      
      callback?.({
        text: "Please specify both a protocol and chain name. For example:\n" +
             "'What's Uniswap's TVL on Arbitrum?' or 'Show me Aave's TVL on Optimism'\n\n" +
             `Supported chains include: ${supportedChains}`
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
      p.slug.toLowerCase() === protocol.toLowerCase() ||
      p.name.toLowerCase() === protocol.toLowerCase()
    );

    if (!protocolData) {
      callback?.({
        text: `Protocol '${protocol}' not found. Please check the protocol name and try again.`
      });
      return false;
    }

    // Get the chain name as it appears in the DefiLlama API
    const chainName = CHAIN_TO_DEFILLAMA_SLUG[chainSlug.toLowerCase()];
    if (!chainName) {
      callback?.({
        text: `Chain '${chainSlug}' not recognized. Please use a supported chain name.`
      });
      return false;
    }

    // Check if protocol is deployed on the chain
    const chainTvls = protocolData.chainTvls || {};
    const chainTVL = chainTvls[chainName] as number | undefined;

    if (chainTVL === undefined) {
      const availableChains = Object.entries(chainTvls)
        .filter(([_, tvl]) => (tvl as number) > 0)
        .map(([chain]) => chain)
        .sort()
        .join(", ");

      callback?.({
        text: `${protocolData.name} is not deployed or has no TVL on ${chainName}.\n` +
              `Available chains: ${availableChains || "No chains with active TVL found"}`
      });
      return false;
    }

    // Format response
    const formattedTVL = formatCurrency(chainTVL);
    let response = `${protocolData.name} Protocol TVL on ${chainName}: ${formattedTVL}`;

    // Calculate percentage of total TVL
    const totalTVL = protocolData.tvl || 0;
    if (totalTVL > 0) {
      const percentage = (chainTVL / totalTVL * 100).toFixed(2);
      response += ` (${percentage}% of total TVL)`;
    }

    // Add chain-specific metrics if available
    const chainMetrics = protocolData.chainMetrics?.[chainName];
    if (chainMetrics) {
      if (chainMetrics.change_1d !== undefined) {
        response += `\n24h Change: ${chainMetrics.change_1d > 0 ? '+' : ''}${chainMetrics.change_1d.toFixed(2)}%`;
      }
      if (chainMetrics.change_7d !== undefined) {
        response += `\n7d Change: ${chainMetrics.change_7d > 0 ? '+' : ''}${chainMetrics.change_7d.toFixed(2)}%`;
      }
    }

    // Add total TVL for context
    response += `\n\nTotal Protocol TVL (all chains): ${formatCurrency(totalTVL)}`;

    // Add top 3 chains by TVL for context
    const topChains = Object.entries(chainTvls)
      .map(([chain, tvl]) => ({ chain, tvl: tvl as number }))
      .sort((a, b) => b.tvl - a.tvl)
      .slice(0, 3);

    if (topChains.length > 0) {
      response += "\n\nTop Chains by TVL:";
      topChains.forEach(({ chain, tvl }) => {
        const chainPercentage = (tvl / totalTVL * 100).toFixed(2);
        response += `\n${chain}: ${formatCurrency(tvl)} (${chainPercentage}%)`;
      });
    }

    callback?.({
      text: response,
      content: {
        protocol: protocolData.name,
        chain: chainName,
        tvl: chainTVL,
        formattedTVL,
        totalTVL,
        formattedTotalTVL: formatCurrency(totalTVL),
        percentage: totalTVL > 0 ? (chainTVL / totalTVL * 100) : 0,
        chainMetrics,
        topChains
      }
    });

    return true;
  } catch (error) {
    elizaLogger.error('Error in GET_PROTOCOL_TVL_BY_CHAIN handler:', error);
    callback?.({
      text: "Sorry, I encountered an error while fetching the protocol TVL data. " +
           "Please try again in a moment."
    });
    return false;
  }
};

export const protocolTVLByChainAction: Action = {
  name: "GET_PROTOCOL_TVL_BY_CHAIN",
  description: "Get the TVL of a specific protocol on a specific chain only",
  similes: [
    // Chain-specific patterns
    'PROTOCOL_TVL_ON_SPECIFIC_CHAIN',
    'CHAIN_SPECIFIC_PROTOCOL_TVL',
    'PROTOCOL_TVL_FOR_SPECIFIC_CHAIN',
    'SPECIFIC_CHAIN_PROTOCOL_TVL',
    // Direct matches
    'SHOW_ME_PROTOCOL_TVL_ON_CHAIN',
    'WHATS_PROTOCOL_TVL_ON_CHAIN',
    'GET_PROTOCOL_TVL_ON_CHAIN',
    'PROTOCOL_TVL_ON_CHAIN',
    'TVL_ON_CHAIN_FOR_PROTOCOL',
    // Protocol-first patterns
    'PROTOCOL_TVL_CHAIN',
    'PROTOCOL_ON_CHAIN',
    'PROTOCOL_CHAIN_TVL',
    'PROTOCOL_CHAIN_SPECIFIC',
    // Chain-first patterns
    'CHAIN_PROTOCOL_TVL',
    'CHAIN_SPECIFIC_TVL',
    'CHAIN_VALUE_PROTOCOL',
    // Question patterns
    'HOW_MUCH_TVL_PROTOCOL_ON_CHAIN',
    'WHAT_IS_PROTOCOL_TVL_ON_CHAIN',
    // Common variations
    'TVL_BY_CHAIN',
    'TVL_ON_CHAIN',
    'CHAIN_SPECIFIC_PROTOCOL',
    'PROTOCOL_TVL_FOR_CHAIN',
    'CHAIN_TVL_FOR_PROTOCOL'
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
      content: { text: 'Uniswap Protocol TVL on Arbitrum: $820.5M (15.2% of total TVL)\n24h Change: +1.2%\n7d Change: +3.5%\n\nTotal Protocol TVL (all chains): $5.4B\n\nTop Chains by TVL:\nEthereum: $4.1B (75.9%)\nArbitrum: $820.5M (15.2%)\nOptimism: $480M (8.9%)' }
    }
  ], [
    {
      user: 'user1',
      content: { text: "Show me Aave's TVL on Optimism" }
    },
    {
      user: 'assistant',
      content: { text: 'Aave Protocol TVL on Optimism: $480M (3.9% of total TVL)\n24h Change: +0.8%\n7d Change: +2.1%\n\nTotal Protocol TVL (all chains): $12.3B\n\nTop Chains by TVL:\nEthereum: $8.2B (66.7%)\nArbitrum: $2.5B (20.3%)\nOptimism: $480M (3.9%)' }
    }
  ]]
}; 