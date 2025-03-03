import { createGenericAction } from "../../core/actions/base";
import { getTokenPrice, getMultipleTokenPrices } from './module';
import type { Action, ActionExample, Memory, State, HandlerCallback, IAgentRuntime } from "@elizaos/core";
import { elizaLogger, composeContext, generateObjectDeprecated, ModelClass, generateText } from "@elizaos/core";

// Helper function to extract token denom from message
function extractTokenDenom(messageText: string): string {
  const lowerText = messageText.toLowerCase();
  
  // Common token names to check for
  const commonTokens = [
    "egld", "multiversx", "usdt", "tether", "usdc", "usd coin", 
    "btc", "bitcoin", "eth", "ethereum", "mex", "xexchange",
    "bhat", "hatom", "ride", "holoride", "utk", "utrust", "itheum"
  ];
  
  // First check for exact matches of common tokens
  for (const token of commonTokens) {
    if (lowerText.includes(token)) {
      // Map common names to denoms
      if (token === "multiversx") return "egld";
      if (token === "tether") return "usdt";
      if (token === "usd coin") return "usdc";
      if (token === "bitcoin") return "btc";
      if (token === "ethereum") return "eth";
      if (token === "xexchange") return "mex";
      if (token === "hatom") return "bhat";
      if (token === "holoride") return "ride";
      if (token === "utrust") return "utk";
      return token;
    }
  }
  
  // Try different regex patterns to extract token names
  
  // Pattern 1: "of X token" or "of the X token"
  const ofPattern = /(?:of|about|for)\s+(?:the\s+)?([a-z0-9\s.]+?)(?:\s+token|\s+coin|\s+price|\s*\?|$)/i;
  const ofMatch = lowerText.match(ofPattern);
  if (ofMatch && ofMatch[1]) {
    return ofMatch[1].trim();
  }
  
  // Pattern 2: "X price" or "X's price"
  const priceTvlPattern = /([a-z0-9\s.]+?)(?:'s|\s+token)?\s+(?:price|value|cost)/i;
  const priceTvlMatch = lowerText.match(priceTvlPattern);
  if (priceTvlMatch && priceTvlMatch[1]) {
    return priceTvlMatch[1].trim();
  }
  
  // Pattern 3: "what is X" where X might be a token
  const whatIsPattern = /what(?:'s| is) (?:the )?(?:price of )?([a-z0-9\s.]+?)(?:\?|$)/i;
  const whatIsMatch = lowerText.match(whatIsPattern);
  if (whatIsMatch && whatIsMatch[1] && !whatIsMatch[1].includes("price")) {
    return whatIsMatch[1].trim();
  }
  
  return "";
}

// Helper function to extract multiple token denoms from message
function extractMultipleTokenDenoms(messageText: string): string[] {
  const lowerText = messageText.toLowerCase();
  const tokens = [];
  
  // Common token names to check for
  const commonTokens = [
    "egld", "multiversx", "usdt", "tether", "usdc", "usd coin", 
    "btc", "bitcoin", "eth", "ethereum", "mex", "xexchange",
    "bhat", "hatom", "ride", "holoride", "utk", "utrust", "itheum"
  ];
  
  // Check for each common token
  for (const token of commonTokens) {
    if (lowerText.includes(token)) {
      // Map common names to denoms
      if (token === "multiversx") tokens.push("egld");
      else if (token === "tether") tokens.push("usdt");
      else if (token === "usd coin") tokens.push("usdc");
      else if (token === "bitcoin") tokens.push("btc");
      else if (token === "ethereum") tokens.push("eth");
      else if (token === "xexchange") tokens.push("mex");
      else if (token === "hatom") tokens.push("bhat");
      else if (token === "holoride") tokens.push("ride");
      else if (token === "utrust") tokens.push("utk");
      else tokens.push(token);
    }
  }
  
  // If no tokens found, try to extract from common patterns
  if (tokens.length === 0) {
    // Look for lists like "btc, eth and egld" or "btc eth egld"
    const listPattern = /(?:price of|prices for|compare)\s+([a-z0-9\s,.&and]+)(?:\?|$)/i;
    const listMatch = lowerText.match(listPattern);
    
    if (listMatch && listMatch[1]) {
      const tokenList = listMatch[1]
        .replace(/\s+and\s+/g, ',')
        .replace(/[,\s]+/g, ',')
        .split(',')
        .map(t => t.trim())
        .filter(t => t.length > 0);
      
      tokens.push(...tokenList);
    }
  }
  
  return tokens;
}

// Empty examples array since we're simplifying
const emptyExamples: any[] = [];

// Define actions with improved implementation
export const GetTokenPriceAction: Action = {
  name: "GET_TOKEN_PRICE",
  description: "Get the price of a specific token",
  similes: [
    "GET_TOKEN_PRICE", 
    "SHOW_TOKEN_PRICE", 
    "DISPLAY_TOKEN_PRICE", 
    "CHECK_TOKEN_PRICE", 
    "FETCH_TOKEN_PRICE",
    "GET_PRICE",
    "SHOW_PRICE",
    "CHECK_PRICE",
    "FETCH_PRICE",
    "PRICE_CHECK",
    "TOKEN_PRICE",
    "CRYPTO_PRICE",
    "COIN_PRICE",
    "WHAT_IS_THE_PRICE",
    "HOW_MUCH_IS",
    "CURRENT_PRICE",
    "PRICE_OF",
    "VALUE_OF"
  ],
  examples: [emptyExamples as ActionExample[]],
  validate: async () => true,
  handler: async (
    runtime: IAgentRuntime,
    message: Memory,
    state: State,
    _options: { [key: string]: unknown },
    callback?: HandlerCallback
  ): Promise<boolean> => {
    elizaLogger.info(`CoinGecko action: GET_TOKEN_PRICE triggered`);
    
    try {
      // Extract token denom from message
      const messageText = message.content.text;
      const denom = extractTokenDenom(messageText);
      
      if (!denom) {
        if (callback) {
          callback({
            text: "I'd be happy to check the price of a token for you. Could you please specify which token you're interested in? For example, you can ask about 'price of EGLD' or 'BTC price'."
          });
        }
        return true;
      }
      
      elizaLogger.info(`Looking up price for token: ${denom}`);
      
      // First message to indicate we're looking up the data
      if (callback) {
        callback({
          text: `I'll check the current price of ${denom.toUpperCase()}. One moment while I fetch the latest data...`
        });
      }
      
      // Call the module function
      const response = await getTokenPrice({ denom });
      
      if (!response.success) {
        elizaLogger.error(`CoinGecko price error: ${response.error?.message}`);
        if (callback) {
          callback({
            text: `I couldn't retrieve the price data for ${denom.toUpperCase()}. There was an error: ${response.error?.message}`
          });
        }
        return true;
      }
      
      // Format the response for the user
      const price = response.result.price || 0;
      
      const formattedPrice = new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 2,
        maximumFractionDigits: 6
      }).format(price);
      
      let responseText = `The current price of ${denom.toUpperCase()} is ${formattedPrice}.`;
      
      if (callback) {
        callback({
          text: responseText,
          content: response.result
        });
      }
      return true;
    } catch (error) {
      elizaLogger.error(`Error in GET_TOKEN_PRICE handler: ${error instanceof Error ? error.message : 'Unknown error'}`);
      if (callback) {
        callback({
          text: "I'm sorry, I encountered an error while retrieving the token price data."
        });
      }
      return true;
    }
  }
};

// Action to get multiple token prices
export const GetMultipleTokenPricesAction: Action = {
  name: "GET_MULTIPLE_TOKEN_PRICES",
  description: "Get prices for multiple tokens at once",
  similes: [
    "GET_MULTIPLE_TOKEN_PRICES", 
    "SHOW_MULTIPLE_TOKEN_PRICES", 
    "DISPLAY_MULTIPLE_TOKEN_PRICES", 
    "CHECK_MULTIPLE_TOKEN_PRICES", 
    "FETCH_MULTIPLE_TOKEN_PRICES",
    "GET_PRICES",
    "SHOW_PRICES",
    "CHECK_PRICES",
    "FETCH_PRICES",
    "COMPARE_PRICES",
    "MULTIPLE_PRICES",
    "CRYPTO_PRICES",
    "COIN_PRICES",
    "TOKEN_PRICES",
    "PRICE_COMPARISON"
  ],
  examples: [emptyExamples as ActionExample[]],
  validate: async () => true,
  handler: async (
    runtime: IAgentRuntime,
    message: Memory,
    state: State,
    _options: { [key: string]: unknown },
    callback?: HandlerCallback
  ): Promise<boolean> => {
    elizaLogger.info(`CoinGecko action: GET_MULTIPLE_TOKEN_PRICES triggered`);
    
    try {
      // Extract token denoms from message
      const messageText = message.content.text;
      const denoms = extractMultipleTokenDenoms(messageText);
      
      if (!denoms || denoms.length === 0) {
        if (callback) {
          callback({
            text: "I'd be happy to check the prices of multiple tokens for you. Could you please specify which tokens you're interested in? For example, you can ask about 'prices of BTC, ETH, and EGLD'."
          });
        }
        return true;
      }
      
      elizaLogger.info(`Looking up prices for tokens: ${denoms.join(', ')}`);
      
      // First message to indicate we're looking up the data
      if (callback) {
        callback({
          text: `I'll check the current prices of ${denoms.map(d => d.toUpperCase()).join(', ')}. One moment while I fetch the latest data...`
        });
      }
      
      // Call the module function
      const response = await getMultipleTokenPrices({ denoms });
      
      if (!response.success) {
        elizaLogger.error(`CoinGecko multiple prices error: ${response.error?.message}`);
        if (callback) {
          callback({
            text: `I couldn't retrieve the price data for the requested tokens. There was an error: ${response.error?.message}`
          });
        }
        return true;
      }
      
      // Format the response for the user
      const prices = response.result.prices || {};
      
      let responseText = `Here are the current prices:\n\n`;
      
      for (const denom of denoms) {
        const tokenData = prices[denom];
        if (tokenData && !tokenData.error) {
          const formattedPrice = new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            minimumFractionDigits: 2,
            maximumFractionDigits: 6
          }).format(tokenData.price || 0);
          
          responseText += `• **${denom.toUpperCase()}**: ${formattedPrice}\n`;
        } else {
          responseText += `• **${denom.toUpperCase()}**: Price data not available\n`;
        }
      }
      
      if (callback) {
        callback({
          text: responseText,
          content: response.result
        });
      }
      return true;
    } catch (error) {
      elizaLogger.error(`Error in GET_MULTIPLE_TOKEN_PRICES handler: ${error instanceof Error ? error.message : 'Unknown error'}`);
      if (callback) {
        callback({
          text: "I'm sorry, I encountered an error while retrieving the token price data."
        });
      }
      return true;
    }
  }
};

export const CoinGeckoActions = [
  GetTokenPriceAction,
  GetMultipleTokenPricesAction,
];
