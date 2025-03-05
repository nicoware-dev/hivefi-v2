import type { Action, Handler } from "@elizaos/core";
import { elizaLogger } from "@elizaos/core";
import { getChainData } from "../../api/client";
import { getChainCache, setChainCache } from "../../utils/cache";
import { extractChainName } from "../../utils/extract";
import { formatChainData, formatCurrency } from "../../utils/format";
import type { ChainTVLData } from "../../types";
import { CHAIN_TO_DEFILLAMA_SLUG } from "../../config/mappings";

const handler: Handler = async (runtime, message, state, _options, callback) => {
  try {
    // Extract chain name from message
    const messageText = message.content?.text || "";
    const chainSlug = extractChainName(messageText);
    
    elizaLogger.debug('Chain TVL request:', { 
      messageText,
      extractedSlug: chainSlug
    });

    if (!chainSlug) {
      const supportedChains = Object.keys(CHAIN_TO_DEFILLAMA_SLUG)
        .filter(key => key.length > 2) // Filter out short abbreviations
        .sort()
        .join(", ");
      
      callback?.({
        text: "Please specify a valid chain name. For example:\n" +
             "'What's the TVL of Ethereum?' or 'Show me Mantle's TVL'\n\n" +
             `Supported chains include: ${supportedChains}`
      });
      return false;
    }

    // Check cache first
    const cacheKey = `chain-tvl-${chainSlug}`;
    const cachedData = getChainCache(cacheKey);
    if (cachedData) {
      elizaLogger.info(`Using cached TVL data for ${chainSlug}`);
      callback?.({
        text: formatChainData(
          cachedData.name,
          cachedData.formattedTVL,
          {
            change_1d: cachedData.change_1d,
            change_7d: cachedData.change_7d,
            change_1m: cachedData.change_1m
          }
        ),
        content: cachedData
      });
      return true;
    }

    // Fetch fresh data
    elizaLogger.debug('Fetching fresh chain data for:', chainSlug);
    const result = await getChainData();
    if (!result.success) {
      callback?.({
        text: `Failed to get TVL data: ${result.error?.message}`
      });
      return false;
    }

    // Find the requested chain
    const chainData = result.result.find((c: any) => 
      c.name.toLowerCase() === chainSlug.toLowerCase()
    );

    if (!chainData) {
      elizaLogger.error('Chain not found in API response:', {
        requestedChain: chainSlug,
        availableChains: result.result.map((c: any) => c.name)
      });
      
      callback?.({
        text: `No TVL data found for ${chainSlug}. This could mean either:\n` +
             `1. The chain name is not recognized\n` +
             `2. The chain is not tracked by DefiLlama\n` +
             `3. The chain has no TVL data available\n\n` +
             `Please check the chain name and try again.`
      });
      return false;
    }

    // Format the data
    const formattedData: ChainTVLData = {
      name: chainData.name,
      tvl: chainData.tvl,
      formattedTVL: formatCurrency(chainData.tvl),
      change_1d: chainData.change_1d,
      change_7d: chainData.change_7d,
      change_1m: chainData.change_1m,
      mcaptvl: chainData.mcaptvl,
      chainId: chainData.chainId,
      tokenSymbol: chainData.tokenSymbol
    };

    // Update cache
    setChainCache(cacheKey, formattedData);

    // Send response
    callback?.({
      text: formatChainData(
        formattedData.name,
        formattedData.formattedTVL,
        {
          change_1d: formattedData.change_1d,
          change_7d: formattedData.change_7d,
          change_1m: formattedData.change_1m
        }
      ),
      content: formattedData
    });

    return true;
  } catch (error) {
    elizaLogger.error('Error in GET_CHAIN_TVL handler:', {
      error,
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    });
    
    callback?.({
      text: "Sorry, I encountered an error while fetching the chain TVL data. " +
           "Please try again in a moment."
    });
    return false;
  }
};

export const chainTVLAction: Action = {
  name: 'GET_CHAIN_TVL',
  description: 'Get TVL data for a specific blockchain',
  similes: [
    'CHAIN_TVL',
    'TVL_OF_CHAIN',
    'TOTAL_VALUE_LOCKED',
    'VALUE_LOCKED',
    'CHAIN_VALUE'
  ],
  handler,
  validate: async () => true,
  examples: [[
    {
      user: 'user1',
      content: { text: "What's the TVL of Ethereum?" }
    },
    {
      user: 'assistant',
      content: { text: 'Ethereum Chain TVL: $123.45B\n24h Change: +2.5%\n7d Change: -1.2%' }
    }
  ]]
}; 