import { Action, Memory, State, IAgentRuntime, HandlerCallback } from "@elizaos/core";
import { zerionProvider } from "../providers/zerion";
import { formatPositionDetails } from "../utils/formatter";
import { PositionData } from "../types";

/**
 * Cache for portfolio position responses to avoid redundant API calls
 */
const responseCache = new Map<string, { timestamp: number; data: PositionData }>();

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
 * Action to get detailed portfolio positions across multiple chains
 */
export const portfolioDetails: Action = {
  name: "MULTICHAIN_PORTFOLIO_DETAILS",
  similes: [
    "GET_PORTFOLIO_DETAILS",
    "SHOW_PORTFOLIO_POSITIONS",
    "VIEW_WALLET_POSITIONS",
    "CHECK_PORTFOLIO_TOKENS",
    "LIST_PORTFOLIO_ASSETS"
  ],
  description: "Get detailed token positions in your wallet across multiple chains",
  examples: [
    [
      {
        user: "user1",
        content: {
          text: "Show me detailed positions in my portfolio for 0x1234567890abcdef1234567890abcdef12345678",
        }
      },
      {
        user: "assistant",
        content: {
          text: "Fetching your detailed portfolio positions across multiple chains..."
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
          text: "Fetching your detailed portfolio positions across multiple chains..."
        });
      }

      // Check cache first
      const cacheKey = `details-${address}`;
      const cachedResponse = responseCache.get(cacheKey);
      
      if (cachedResponse && Date.now() - cachedResponse.timestamp < 5 * 60 * 1000) {
        // Use cached data if it's less than 5 minutes old
        const formattedResponse = formatPositionDetails(cachedResponse.data, address);
        callback({ text: formattedResponse });
        return true;
      }

      // Fetch position data from Zerion
      const response = await zerionProvider.getPositions(runtime, address);
      
      if (!response.success || !response.data || !('positions' in response.data)) {
        callback({
          text: `Error fetching portfolio positions: ${response.error || "Unknown error"}`
        });
        return false;
      }

      // Cache the response
      responseCache.set(cacheKey, {
        timestamp: Date.now(),
        data: response.data as PositionData
      });

      // Format and send the response
      const formattedResponse = formatPositionDetails(response.data as PositionData, address);
      callback({ text: formattedResponse });
      return true;
    } catch (error) {
      console.error("Error in portfolio details handler:", error);
      callback({
        text: `Error fetching portfolio details: ${error instanceof Error ? error.message : "Unknown error"}`
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