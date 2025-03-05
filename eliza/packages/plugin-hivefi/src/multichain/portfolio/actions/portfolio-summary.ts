import { Action, Memory, State, IAgentRuntime, HandlerCallback } from "@elizaos/core";
import { zerionProvider } from "../providers/zerion";
import { formatPortfolioSummary } from "../utils/formatter";
import { PortfolioData } from "../types";

/**
 * Cache for portfolio responses to avoid redundant API calls
 */
const responseCache = new Map<string, { timestamp: number; data: PortfolioData }>();

/**
 * Clean up old cache entries every 5 minutes
 */
setInterval(() => {
  const now = Date.now();
  for (const [key, value] of responseCache.entries()) {
    if (now - value.timestamp > 5 * 60 * 1000) { // 5 minutes
      responseCache.delete(key);
    }
  }
}, 5 * 60 * 1000);

/**
 * Action to get a summary of a wallet's portfolio across multiple chains
 */
export const portfolioSummary: Action = {
  name: "MULTICHAIN_PORTFOLIO_SUMMARY",
  similes: [
    "GET_PORTFOLIO_SUMMARY",
    "SHOW_PORTFOLIO_OVERVIEW",
    "VIEW_WALLET_SUMMARY",
    "CHECK_PORTFOLIO_SUMMARY"
  ],
  description: "Get a summary of your wallet's portfolio across multiple chains",
  examples: [
    [
      {
        user: "user1",
        content: {
          text: "Show me a summary of my portfolio for 0x1234567890abcdef1234567890abcdef12345678",
        }
      },
      {
        user: "assistant",
        content: {
          text: "Fetching your portfolio summary across multiple chains..."
        }
      }
    ]
  ],
  suppressInitialMessage: true, // Prevents double responses in Telegram
  handler: async (
    runtime: IAgentRuntime, 
    message: Memory, 
    state: State | undefined, 
    options: any, 
    callback?: HandlerCallback
  ): Promise<boolean> => {
    if (!callback) return false;
    if (!state) return false;

    // Check if this is a memory-based response
    if (state.isMemoryResponse) {
      return false;
    }

    // Mark this as not a memory response
    state.isMemoryResponse = true;

    // For telegram, we want to skip the initial acknowledgment
    const isTelegram = message.content.source === 'telegram';

    try {
      // Extract wallet address from the message
      const addressMatch = message.content.text.match(/0x[a-fA-F0-9]{40}/);
      if (!addressMatch) {
        callback({
          text: "Please provide a valid Ethereum wallet address in the format 0x... (42 characters)."
        });
        return false;
      }

      const address = addressMatch[0];

      // For non-telegram clients, send an immediate acknowledgment
      if (!isTelegram) {
        callback({
          text: "Fetching your portfolio summary across multiple chains..."
        });
      }

      // Check cache first
      const cacheKey = `summary-${address}`;
      const cachedResponse = responseCache.get(cacheKey);
      
      if (cachedResponse && Date.now() - cachedResponse.timestamp < 5 * 60 * 1000) {
        // Use cached data if it's less than 5 minutes old
        const formattedResponse = formatPortfolioSummary(cachedResponse.data, address);
        callback({ text: formattedResponse });
        return true;
      }

      // Fetch portfolio data from Zerion
      const response = await zerionProvider.getPortfolio(runtime, address);
      
      if (!response.success || !response.data || !('chainDistribution' in response.data)) {
        callback({
          text: `Error fetching portfolio: ${response.error || "Unknown error"}`
        });
        return false;
      }

      // Cache the response
      responseCache.set(cacheKey, {
        timestamp: Date.now(),
        data: response.data as PortfolioData
      });

      // Format and send the response
      const formattedResponse = formatPortfolioSummary(response.data as PortfolioData, address);
      callback({ text: formattedResponse });
      return true;
    } catch (error) {
      console.error("Error in portfolio summary handler:", error);
      callback({
        text: `Error fetching portfolio summary: ${error instanceof Error ? error.message : "Unknown error"}`
      });
      return false;
    }
  },
  validate: async (runtime: IAgentRuntime, message: Memory): Promise<boolean> => {
    // Check if the message contains a valid Ethereum address
    const addressRegex = /0x[a-fA-F0-9]{40}/;
    return addressRegex.test(message.content.text);
  }
}; 