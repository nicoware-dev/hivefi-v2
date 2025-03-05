import type { Action, Handler } from "@elizaos/core";
import { elizaLogger } from "@elizaos/core";
import { getChainData } from "../../api/client";
import { extractLimit } from "../../utils/extract";
import { formatCurrency } from "../../utils/format";
import type { ChainTVLData } from "../../types";

const DEFAULT_CHAIN_LIMIT = 5;

const handler: Handler = async (runtime, message, state, _options, callback) => {
  try {
    // Extract limit from message if present
    const limit = extractLimit(message.content?.text || "") || DEFAULT_CHAIN_LIMIT;

    // Fetch chain data
    const result = await getChainData();
    if (!result.success) {
      callback?.({
        text: `Failed to get chain data: ${result.error?.message}`
      });
      return false;
    }

    // Format chain data and calculate total TVL
    const chainData: ChainTVLData[] = result.result
      .map((chain: any) => ({
        name: chain.name,
        tvl: chain.tvl,
        formattedTVL: formatCurrency(chain.tvl),
        change_1d: chain.change_1d,
        change_7d: chain.change_7d,
        change_1m: chain.change_1m,
        mcaptvl: chain.mcaptvl,
        chainId: chain.chainId,
        tokenSymbol: chain.tokenSymbol
      }))
      .sort((a: ChainTVLData, b: ChainTVLData) => b.tvl - a.tvl);

    // Calculate total TVL
    const totalTVL = chainData.reduce((sum, chain) => sum + chain.tvl, 0);
    const formattedTotalTVL = formatCurrency(totalTVL);

    // Get top chains by limit
    const topChains = chainData.slice(0, limit);

    // Format response
    let response = `Global DeFi Statistics:\n\n`;
    response += `Total Value Locked: ${formattedTotalTVL}\n`;
    response += `Active Chains: ${chainData.length}\n\n`;
    response += `Top ${topChains.length} Chains by TVL:\n\n`;

    topChains.forEach((chain, index) => {
      const percentage = (chain.tvl / totalTVL * 100).toFixed(2);
      response += `${index + 1}. ${chain.name}: ${chain.formattedTVL} (${percentage}% of total)`;
      if (chain.change_1d !== undefined) {
        response += `\n   24h Change: ${chain.change_1d > 0 ? '+' : ''}${chain.change_1d.toFixed(2)}%`;
      }
      if (chain.change_7d !== undefined) {
        response += `\n   7d Change: ${chain.change_7d > 0 ? '+' : ''}${chain.change_7d.toFixed(2)}%`;
      }
      response += '\n\n';
    });

    callback?.({
      text: response,
      content: {
        totalTVL,
        formattedTotalTVL,
        chainCount: chainData.length,
        topChains
      }
    });

    return true;
  } catch (error) {
    elizaLogger.error('Error in GET_GLOBAL_STATS handler:', error);
    callback?.({
      text: "Sorry, I encountered an error while fetching the global DeFi statistics."
    });
    return false;
  }
};

export const globalStatsAction: Action = {
  name: 'GET_GLOBAL_STATS',
  description: 'Get global DeFi statistics including total TVL and top chains',
  similes: [
    'GLOBAL_STATS',
    'DEFI_STATS',
    'TOTAL_TVL',
    'GLOBAL_TVL',
    'TOP_CHAINS',
    'CHAIN_RANKINGS',
    'DEFI_OVERVIEW',
    'MARKET_OVERVIEW'
  ],
  handler,
  validate: async () => true,
  examples: [[
    {
      user: 'user1',
      content: { text: "Show me global DeFi stats" }
    },
    {
      user: 'assistant',
      content: { text: 'Global DeFi Statistics:\n\nTotal Value Locked: $123.45B\nActive Chains: 100\n\nTop 5 Chains by TVL:\n\n1. Ethereum: $50.67B (41.05% of total)\n   24h Change: +2.5%\n   7d Change: -1.2%\n\n2. Tron: $15.89B (12.87% of total)\n   24h Change: +1.8%\n   7d Change: +3.4%\n\n3. BSC: $12.34B (10.00% of total)\n   24h Change: -0.5%\n   7d Change: +1.2%\n\n4. Arbitrum: $8.90B (7.21% of total)\n   24h Change: +3.2%\n   7d Change: +5.6%\n\n5. Optimism: $7.45B (6.04% of total)\n   24h Change: +1.5%\n   7d Change: +2.8%' }
    }
  ]]
};