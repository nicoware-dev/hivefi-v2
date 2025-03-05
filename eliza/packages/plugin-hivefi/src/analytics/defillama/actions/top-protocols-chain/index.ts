import type { Action, Handler } from "@elizaos/core";
import { elizaLogger } from "@elizaos/core";
import { getAllProtocols } from "../../api/client";
import { extractChainName, extractLimit } from "../../utils/extract";
import { formatCurrency } from "../../utils/format";
import { CHAIN_TO_DEFILLAMA_SLUG } from "../../config/mappings";

const DEFAULT_LIMIT = 10;

interface ProtocolChainData {
  name: string;
  tvl: number;
  formattedTVL: string;
  category?: string;
  change_1d?: number;
  change_7d?: number;
  dominance?: number;
}

const handler: Handler = async (runtime, message, state, _options, callback) => {
  try {
    // Extract chain name and limit from message
    const messageText = message.content?.text || "";
    const chainSlug = extractChainName(messageText);
    const limit = extractLimit(messageText) || DEFAULT_LIMIT;

    if (!chainSlug) {
      const supportedChains = Object.keys(CHAIN_TO_DEFILLAMA_SLUG)
        .filter(key => key.length > 2)
        .sort()
        .join(", ");
      
      callback?.({
        text: "Please specify a chain name. For example:\n" +
             "'Show top protocols on Arbitrum' or 'List top 5 protocols on Optimism'\n\n" +
             `Supported chains include: ${supportedChains}`
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

    // Fetch all protocols data
    const result = await getAllProtocols();
    if (!result.success) {
      callback?.({
        text: `Failed to get protocol data: ${result.error?.message}`
      });
      return false;
    }

    // Find protocols deployed on the specified chain
    const protocolsOnChain: ProtocolChainData[] = [];
    
    for (const protocol of result.result) {
      const chainTvl = protocol.chainTvls?.[chainName];
      if (chainTvl && chainTvl > 0) {
        protocolsOnChain.push({
          name: protocol.name,
          tvl: chainTvl,
          formattedTVL: formatCurrency(chainTvl),
          category: protocol.category,
          change_1d: protocol.change_1d,
          change_7d: protocol.change_7d
        });
      }
    }

    // Sort by TVL and get top protocols
    protocolsOnChain.sort((a, b) => b.tvl - a.tvl);
    const topProtocols = protocolsOnChain.slice(0, limit);

    if (topProtocols.length === 0) {
      callback?.({
        text: `No protocols found on ${chainName}. This could mean either:\n` +
             `1. No protocols are currently tracked on this chain\n` +
             `2. There is an issue with the data feed\n\n` +
             `Please check the chain name and try again.`
      });
      return false;
    }

    // Calculate total chain TVL and dominance
    const totalChainTVL = protocolsOnChain.reduce((sum, p) => sum + p.tvl, 0);
    topProtocols.forEach(p => {
      p.dominance = (p.tvl / totalChainTVL * 100);
    });

    // Format response
    let response = `Top ${topProtocols.length} Protocols on ${chainName}:\n\n`;
    
    topProtocols.forEach((protocol, index) => {
      response += `${index + 1}. ${protocol.name}: ${protocol.formattedTVL} (${protocol.dominance?.toFixed(2)}% of chain TVL)`;
      
      if (protocol.category) {
        response += `\n   Category: ${protocol.category}`;
      }
      if (protocol.change_1d !== undefined) {
        response += `\n   24h Change: ${protocol.change_1d > 0 ? '+' : ''}${protocol.change_1d.toFixed(2)}%`;
      }
      if (protocol.change_7d !== undefined) {
        response += `\n   7d Change: ${protocol.change_7d > 0 ? '+' : ''}${protocol.change_7d.toFixed(2)}%`;
      }
      response += '\n\n';
    });

    response += `Total Chain TVL: ${formatCurrency(totalChainTVL)}`;

    callback?.({
      text: response,
      content: {
        chain: chainName,
        protocols: topProtocols,
        totalChainTVL,
        formattedTotalTVL: formatCurrency(totalChainTVL)
      }
    });

    return true;
  } catch (error) {
    elizaLogger.error('Error in TOP_PROTOCOLS_CHAIN handler:', error);
    callback?.({
      text: "Sorry, I encountered an error while fetching the protocol data. " +
           "Please try again in a moment."
    });
    return false;
  }
};

export const topProtocolsByChainAction: Action = {
  name: "TOP_PROTOCOLS_CHAIN",
  description: "Get top protocols by TVL on a specific chain",
  similes: [
    'TOP_PROTOCOLS',
    'BIGGEST_PROTOCOLS',
    'CHAIN_TOP_PROTOCOLS',
    'PROTOCOL_RANKINGS',
    'CHAIN_PROTOCOL_RANKINGS',
    'LARGEST_PROTOCOLS',
    'CHAIN_PROTOCOLS',
    'PROTOCOLS_BY_SIZE',
    'TOP_DEFI_PROTOCOLS',
    'CHAIN_TVL_LEADERS'
  ],
  handler,
  validate: async () => true,
  examples: [[
    {
      user: 'user1',
      content: { text: "Show top protocols on Arbitrum" }
    },
    {
      user: 'assistant',
      content: { text: 'Top Protocols on Arbitrum:\n\n1. GMX: $920.5M (19.18% of chain TVL)\n   Category: Derivatives\n   24h Change: +1.2%\n   7d Change: +3.5%\n\n2. Aave: $820.3M (17.09% of chain TVL)\n   Category: Lending\n   24h Change: +0.8%\n   7d Change: +2.1%\n\nTotal Chain TVL: $4.8B' }
    }
  ]]
}; 