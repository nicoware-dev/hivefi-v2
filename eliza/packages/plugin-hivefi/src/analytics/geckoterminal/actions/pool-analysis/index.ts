import type { Action, Handler } from "@elizaos/core";
import { elizaLogger } from "@elizaos/core";
import { getNetworkStats } from "../../api/client";
import { getCachedNetworkStats, setCachedNetworkStats } from "../../utils/cache";
import { formatUSD, formatMarkdown } from "../../utils/format";
import { NetworkStats } from "../../types";
import { SUPPORTED_NETWORKS } from "../../config/networks";

const handler: Handler = async (runtime, message, state, _options, callback) => {
  try {
    const messageText = message.content?.text?.toLowerCase() || "";
    
    // Extract network from message if specified
    const networkId = SUPPORTED_NETWORKS.find(n => 
      messageText.includes(n.id) || messageText.includes(n.name.toLowerCase())
    )?.id;

    elizaLogger.debug('Pool analysis request:', { 
      messageText,
      extractedNetwork: networkId
    });

    // If no network specified or found, analyze all enabled networks
    const networksToAnalyze = networkId 
      ? SUPPORTED_NETWORKS.filter(n => n.id === networkId && n.enabled)
      : SUPPORTED_NETWORKS.filter(n => n.enabled);

    if (networksToAnalyze.length === 0) {
      const supportedNetworks = SUPPORTED_NETWORKS
        .filter(n => n.enabled)
        .map(n => n.name)
        .join(", ");
      
      callback?.({
        text: `No supported networks found${networkId ? ` for: ${networkId}` : ''}.\n` +
             `Supported networks include: ${supportedNetworks}`
      });
      return false;
    }

    const results: NetworkStats[] = [];
    const errors: string[] = [];

    // Fetch stats for each network
    for (const network of networksToAnalyze) {
      try {
        // Check cache first
        let stats = getCachedNetworkStats(network.id);
        
        if (!stats) {
          stats = await getNetworkStats(network.id, network.name);
          setCachedNetworkStats(network.id, stats);
        }
        
        results.push(stats);
      } catch (error) {
        elizaLogger.error(`Error fetching data for ${network.name}:`, error);
        errors.push(network.name);
      }
    }

    if (results.length === 0) {
      callback?.({
        text: "Failed to fetch data from any networks. Please try again later."
      });
      return false;
    }

    // Generate markdown report
    let markdown = "# DeFi Pool Analysis\n\n";

    // Add error message if any networks failed
    if (errors.length > 0) {
      markdown += `> ⚠️ Failed to fetch data for: ${errors.join(", ")}\n\n`;
    }

    // Generate network summaries
    for (const stats of results) {
      markdown += `## ${stats.networkName} Overview\n`;
      markdown += `- Total TVL: ${formatUSD(stats.totalTvl)}\n`;
      markdown += `- Total 24h Volume: ${formatUSD(stats.totalVolume24h)}\n`;
      markdown += `- Total Pools: ${stats.totalPools}\n\n`;

      if (stats.topPools.length > 0) {
        markdown += "### Top Pools by TVL\n\n";
        markdown += stats.topPools.map(formatMarkdown).join("\n\n");
        markdown += "\n\n";
      }
    }

    markdown += "_Data provided by GeckoTerminal_";

    callback?.({
      text: markdown,
      content: results
    });

    return true;

  } catch (error) {
    elizaLogger.error('Error in GET_POOL_ANALYSIS handler:', {
      error,
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    });
    
    callback?.({
      text: "Sorry, I encountered an error while analyzing the pools. " +
           "Please try again in a moment."
    });
    return false;
  }
};

export const poolAnalysisAction: Action = {
  name: 'GET_POOL_ANALYSIS',
  description: 'Get comprehensive pool analysis for one or multiple networks',
  similes: [
    'POOL_ANALYSIS',
    'DEX_POOLS',
    'LIQUIDITY_POOLS',
    'POOL_STATS',
    'POOL_TVL',
    'POOL_VOLUME',
    'DEX_ANALYTICS'
  ],
  handler,
  validate: async () => true,
  examples: [[
    {
      user: 'user1',
      content: { text: "Show me all pools across networks" }
    },
    {
      user: 'assistant',
      content: { 
        text: '# DeFi Pool Analysis\n\n## Sonic Network Overview\n- Total TVL: $50.67M\n- Total 24h Volume: $15.5M\n- Total Pools: 25\n\n### Top Pools by TVL...' 
      }
    }
  ]]
}; 