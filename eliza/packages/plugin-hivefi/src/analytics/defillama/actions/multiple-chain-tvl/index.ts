import type { Action, Handler } from "@elizaos/core";
import { elizaLogger } from "@elizaos/core";
import { getChainData } from "../../api/client";
import { extractMultipleChainNames } from "../../utils/extract";
import { formatCurrency } from "../../utils/format";
import type { ChainTVLData } from "../../types";

const handler: Handler = async (runtime, message, state, _options, callback) => {
  try {
    // Extract chain names from message
    const chains = extractMultipleChainNames(message.content?.text || "");
    if (chains.length === 0) {
      callback?.({
        text: "Please specify at least one chain to check. For example: 'Show TVL for Ethereum, Arbitrum, and Optimism'"
      });
      return false;
    }

    // Fetch chain data
    const result = await getChainData();
    if (!result.success) {
      callback?.({
        text: `Failed to get TVL data: ${result.error?.message}`
      });
      return false;
    }

    // Find and format data for each chain
    const chainData: ChainTVLData[] = [];
    const notFound: string[] = [];

    for (const chain of chains) {
      const data = result.result.find((c: any) => 
        c.name.toLowerCase() === chain.toLowerCase()
      );

      if (data) {
        chainData.push({
          name: data.name,
          tvl: data.tvl,
          formattedTVL: formatCurrency(data.tvl),
          change_1d: data.change_1d,
          change_7d: data.change_7d,
          change_1m: data.change_1m,
          mcaptvl: data.mcaptvl,
          chainId: data.chainId,
          tokenSymbol: data.tokenSymbol
        });
      } else {
        notFound.push(chain);
      }
    }

    if (chainData.length === 0) {
      callback?.({
        text: `No TVL data found for any of the specified chains. Please check the chain names and try again.`
      });
      return false;
    }

    // Sort by TVL
    chainData.sort((a, b) => b.tvl - a.tvl);

    // Calculate total TVL
    const totalTVL = chainData.reduce((sum, chain) => sum + chain.tvl, 0);

    // Format response
    let response = "Chain TVL Comparison:\n\n";
    chainData.forEach((chain, index) => {
      response += `${index + 1}. ${chain.name}: ${chain.formattedTVL}`;
      if (chain.change_1d !== undefined) {
        response += `\n   24h Change: ${chain.change_1d > 0 ? '+' : ''}${chain.change_1d.toFixed(2)}%`;
      }
      if (chain.change_7d !== undefined) {
        response += `\n   7d Change: ${chain.change_7d > 0 ? '+' : ''}${chain.change_7d.toFixed(2)}%`;
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
        chains: chainData,
        notFound,
        totalTVL,
        formattedTotalTVL: formatCurrency(totalTVL)
      }
    });

    return true;
  } catch (error) {
    elizaLogger.error('Error in GET_MULTIPLE_CHAIN_TVL handler:', error);
    callback?.({
      text: "Sorry, I encountered an error while fetching the chain TVL data."
    });
    return false;
  }
};

export const multipleChainTVLAction: Action = {
  name: 'GET_MULTIPLE_CHAIN_TVL',
  description: 'Get TVL data for multiple blockchains',
  similes: [
    'MULTIPLE_CHAIN_TVL',
    'CHAIN_TVL_COMPARISON',
    'COMPARE_CHAINS',
    'CHAIN_COMPARISON',
    'MULTI_CHAIN_TVL'
  ],
  handler,
  validate: async () => true,
  examples: [[
    {
      user: 'user1',
      content: { text: "Show TVL for Ethereum, Arbitrum, and Optimism" }
    },
    {
      user: 'assistant',
      content: { text: 'Chain TVL Comparison:\n\n1. Ethereum: $50.67B\n   24h Change: +2.5%\n   7d Change: -1.2%\n\n2. Arbitrum: $15.5B\n   24h Change: +3.2%\n   7d Change: +5.6%\n\n3. Optimism: $14.4B\n   24h Change: +1.8%\n   7d Change: +2.3%\n\nTotal TVL: $80.57B' }
    }
  ]]
}; 