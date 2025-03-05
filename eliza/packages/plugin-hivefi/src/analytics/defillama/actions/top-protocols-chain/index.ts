import type { Action, Handler } from "@elizaos/core";
import { elizaLogger } from "@elizaos/core";
import { getAllProtocols } from "../../api/client";
import { extractChainName, extractLimit } from "../../utils/extract";
import { formatCurrency } from "../../utils/format";

const DEFAULT_LIMIT = 10;

interface ProtocolChainData {
  name: string;
  tvl: number;
  formattedTVL: string;
}

const handler: Handler = async (runtime, message, state, _options, callback) => {
  try {
    // Extract chain name and limit from message
    const messageText = message.content?.text || "";
    const chain = extractChainName(messageText);
    const limit = extractLimit(messageText) || DEFAULT_LIMIT;

    if (!chain) {
      callback?.({
        text: "Please specify a chain name. For example: 'Show top protocols on Arbitrum' or 'What are the biggest protocols on Optimism?'"
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

    // Find protocols with TVL on the specified chain
    const protocolsOnChain: ProtocolChainData[] = result.result
      .filter((p: any) => p.chainTvls?.[chain] !== undefined)
      .map((p: any) => ({
        name: p.name,
        tvl: p.chainTvls[chain],
        formattedTVL: formatCurrency(p.chainTvls[chain])
      }))
      .sort((a: ProtocolChainData, b: ProtocolChainData) => b.tvl - a.tvl)
      .slice(0, limit);

    if (protocolsOnChain.length === 0) {
      callback?.({
        text: `No protocols found on ${chain}. Please check the chain name and try again.`
      });
      return false;
    }

    // Calculate total chain TVL
    const totalTVL = protocolsOnChain.reduce((sum: number, p: ProtocolChainData) => sum + p.tvl, 0);

    // Format response
    let response = `Top Protocols on ${chain}:\n\n`;
    protocolsOnChain.forEach((protocol: ProtocolChainData, index: number) => {
      const percentage = (protocol.tvl / totalTVL * 100).toFixed(2);
      response += `${index + 1}. ${protocol.name}: ${protocol.formattedTVL} (${percentage}% of chain TVL)\n\n`;
    });

    response += `Total Chain TVL: ${formatCurrency(totalTVL)}`;

    callback?.({
      text: response,
      content: {
        chain,
        protocols: protocolsOnChain,
        totalTVL,
        formattedTotalTVL: formatCurrency(totalTVL)
      }
    });

    return true;
  } catch (error) {
    elizaLogger.error('Error in TOP_PROTOCOLS_CHAIN handler:', error);
    callback?.({
      text: "Sorry, I encountered an error while fetching the protocol data."
    });
    return false;
  }
};

export const topProtocolsByChainAction: Action = {
  name: 'TOP_PROTOCOLS_CHAIN',
  description: 'Get top protocols by TVL for a specific chain',
  similes: [
    'TOP_PROTOCOLS',
    'BIGGEST_PROTOCOLS',
    'CHAIN_TOP_PROTOCOLS',
    'PROTOCOL_RANKINGS',
    'CHAIN_PROTOCOL_RANKINGS'
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
      content: { text: 'Top Protocols on Arbitrum:\n\n1. GMX: $920.5M (19.18% of chain TVL)\n\n2. Aave: $820.3M (17.09% of chain TVL)\n\n3. Uniswap: $750.2M (15.63% of chain TVL)\n\n4. Curve: $580.1M (12.09% of chain TVL)\n\n5. Balancer: $320.5M (6.68% of chain TVL)\n\nTotal Chain TVL: $4.8B' }
    }
  ]]
}; 