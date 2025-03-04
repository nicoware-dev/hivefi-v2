import { createGenericAction } from "../../core/actions/base";
import { getTokenPrice, getMultipleTokenPrices } from './module';
import type { Action, ActionExample, Memory, State, HandlerCallback, IAgentRuntime, Handler } from "@elizaos/core";
import { elizaLogger, composeContext, generateObjectDeprecated, ModelClass, generateText } from "@elizaos/core";
import { getTokenPriceTemplate, getMultipleTokenPricesTemplate } from './template';

// Helper function to extract token symbol from message
function extractTokenSymbol(messageText: string): string {
  const lowerText = messageText.toLowerCase();
  
  // Common token names to check for
  const commonTokens = [
    // Mantle Network
    "mnt", "mantle", "wmnt", "wrapped mantle",
    
    // Sonic Chain
    "s", "sonic", "ws", "wrapped sonic",
    
    // Ethereum
    "eth", "ethereum", "weth", "wrapped ethereum",
    
    // Bitcoin
    "btc", "bitcoin", "wbtc", "wrapped bitcoin",
    
    // Stablecoins
    "usdc", "usd coin", "usdt", "tether", "dai", "busd", "binance usd", "tusd", "true usd",
    
    // Major Layer 1s
    "bnb", "binance coin", "sol", "solana", "ada", "cardano", "avax", "avalanche",
    "dot", "polkadot", "matic", "polygon", "near", "atom", "cosmos", "ftm", "fantom",
    "arb", "arbitrum", "op", "optimism",
    
    // DeFi
    "uni", "uniswap", "aave", "link", "chainlink", "crv", "curve", "mkr", "maker",
    "comp", "compound", "sushi", "sushiswap", "cake", "pancakeswap", "snx", "synthetix",
    "1inch"
  ];
  
  // First check for exact matches of common tokens
  for (const token of commonTokens) {
    if (lowerText.includes(token)) {
      // Map common names to symbols
      if (token === "mantle") return "mnt";
      if (token === "wrapped mantle") return "wmnt";
      if (token === "sonic") return "s";
      if (token === "wrapped sonic") return "ws";
      if (token === "ethereum") return "eth";
      if (token === "wrapped ethereum") return "weth";
      if (token === "bitcoin") return "btc";
      if (token === "wrapped bitcoin") return "wbtc";
      if (token === "usd coin") return "usdc";
      if (token === "tether") return "usdt";
      if (token === "binance usd") return "busd";
      if (token === "true usd") return "tusd";
      if (token === "binance coin") return "bnb";
      if (token === "solana") return "sol";
      if (token === "cardano") return "ada";
      if (token === "avalanche") return "avax";
      if (token === "polkadot") return "dot";
      if (token === "polygon") return "matic";
      if (token === "cosmos") return "atom";
      if (token === "fantom") return "ftm";
      if (token === "arbitrum") return "arb";
      if (token === "optimism") return "op";
      if (token === "uniswap") return "uni";
      if (token === "chainlink") return "link";
      if (token === "curve") return "crv";
      if (token === "maker") return "mkr";
      if (token === "compound") return "comp";
      if (token === "sushiswap") return "sushi";
      if (token === "pancakeswap") return "cake";
      if (token === "synthetix") return "snx";
      return token;
    }
  }
  
  // Try to extract token from "price of X" or "X price" patterns
  const priceOfPattern = /price of (\w+)/i;
  const pricePattern = /(\w+) price/i;
  
  const priceOfMatch = lowerText.match(priceOfPattern);
  if (priceOfMatch && priceOfMatch[1]) {
    return priceOfMatch[1].toLowerCase();
  }
  
  const priceMatch = lowerText.match(pricePattern);
  if (priceMatch && priceMatch[1]) {
    return priceMatch[1].toLowerCase();
  }
  
  // Default to a common token if nothing else is found
  return "btc";
}

// Helper function to extract multiple token symbols from message
function extractMultipleTokenSymbols(messageText: string): string[] {
  const lowerText = messageText.toLowerCase();
  
  // Try to extract tokens from common patterns
  const tokens: string[] = [];
  
  // First, normalize the text by replacing commas and "and" with a standard separator
  let normalizedText = lowerText
    .replace(/,\s*and\s+/g, ', ') // Replace ", and " with ", "
    .replace(/\s+and\s+/g, ', '); // Replace " and " with ", "
  
  // Check for comma-separated list pattern
  const commaPattern = /prices? (?:for|of) ([a-zA-Z0-9, ]+)/i;
  const commaMatch = normalizedText.match(commaPattern);
  
  if (commaMatch && commaMatch[1]) {
    const tokenList = commaMatch[1].split(',').map(t => t.trim().toLowerCase()).filter(t => t.length > 0);
    
    for (const token of tokenList) {
      // Map common names to symbols
      if (token === "mantle") tokens.push("mnt");
      else if (token === "wrapped mantle") tokens.push("wmnt");
      else if (token === "sonic") tokens.push("s");
      else if (token === "wrapped sonic") tokens.push("ws");
      else if (token === "ethereum") tokens.push("eth");
      else if (token === "wrapped ethereum") tokens.push("weth");
      else if (token === "bitcoin") tokens.push("btc");
      else if (token === "wrapped bitcoin") tokens.push("wbtc");
      else if (token === "usd coin") tokens.push("usdc");
      else if (token === "tether") tokens.push("usdt");
      else if (token === "binance usd") tokens.push("busd");
      else if (token === "true usd") tokens.push("tusd");
      else if (token === "binance coin") tokens.push("bnb");
      else if (token === "solana") tokens.push("sol");
      else if (token === "cardano") tokens.push("ada");
      else if (token === "avalanche") tokens.push("avax");
      else if (token === "polkadot") tokens.push("dot");
      else if (token === "polygon") tokens.push("matic");
      else if (token === "cosmos") tokens.push("atom");
      else if (token === "fantom") tokens.push("ftm");
      else if (token === "arbitrum") tokens.push("arb");
      else if (token === "optimism") tokens.push("op");
      else if (token === "uniswap") tokens.push("uni");
      else if (token === "chainlink") tokens.push("link");
      else if (token === "curve") tokens.push("crv");
      else if (token === "maker") tokens.push("mkr");
      else if (token === "compound") tokens.push("comp");
      else if (token === "sushiswap") tokens.push("sushi");
      else if (token === "pancakeswap") tokens.push("cake");
      else if (token === "synthetix") tokens.push("snx");
      else tokens.push(token);
    }
    
    return tokens.length > 0 ? tokens : ["btc", "eth", "mnt", "s"];
  }
  
  // If no specific pattern is found, look for token names anywhere in the text
  const allTokens = [
    { name: "bitcoin", symbol: "btc" },
    { name: "ethereum", symbol: "eth" },
    { name: "mantle", symbol: "mnt" },
    { name: "sonic", symbol: "s" },
    { name: "usdc", symbol: "usdc" },
    { name: "usdt", symbol: "usdt" },
    { name: "dai", symbol: "dai" }
  ];
  
  for (const token of allTokens) {
    if (lowerText.includes(token.name) || lowerText.includes(token.symbol)) {
      tokens.push(token.symbol);
    }
  }
  
  // If still no tokens found, return default set
  return tokens.length > 0 ? tokens : ["btc", "eth", "mnt", "s"];
}

// Example for token price action
const tokenPriceExample: ActionExample[][] = [
  [
    {
      user: "user1",
      content: {
        text: "What's the current price of MNT?"
      }
    },
    {
      user: "assistant",
      content: {
        text: "The current price of MNT (Mantle) is $0.75 USD. This represents a 2.5% increase in the last 24 hours. The current market cap is $2.5B with a 24h trading volume of $150M."
      }
    }
  ],
  [
    {
      user: "user1",
      content: {
        text: "Show me the ETH price"
      }
    },
    {
      user: "assistant",
      content: {
        text: "The current price of ETH (Ethereum) is $3,245.67 USD. This represents a 1.2% decrease in the last 24 hours. The current market cap is $389.5B with a 24h trading volume of $15.2B."
      }
    }
  ]
];

// Example for multiple token prices action
const multipleTokenPricesExample: ActionExample[][] = [
  [
    {
      user: "user1",
      content: {
        text: "What are the prices of BTC, ETH, MNT, and S?"
      }
    },
    {
      user: "assistant",
      content: {
        text: "Here are the current prices:\n\n- BTC (Bitcoin): $65,432.10 USD (+1.5% in 24h)\n- ETH (Ethereum): $3,245.67 USD (-1.2% in 24h)\n- MNT (Mantle): $0.75 USD (+2.5% in 24h)\n- S (Sonic): $0.42 USD (+0.8% in 24h)"
      }
    }
  ],
  [
    {
      user: "user1",
      content: {
        text: "Compare prices for USDC, USDT, and DAI"
      }
    },
    {
      user: "assistant",
      content: {
        text: "Here are the current stablecoin prices:\n\n- USDC (USD Coin): $1.00 USD (0.0% in 24h)\n- USDT (Tether): $1.00 USD (+0.01% in 24h)\n- DAI: $1.00 USD (-0.02% in 24h)"
      }
    }
  ]
];

// Handler for GET_TOKEN_PRICE action
const getTokenPriceHandler: Handler = async (
  runtime: IAgentRuntime,
  message: Memory,
  state?: State,
  options?: { [key: string]: unknown },
  callback?: HandlerCallback
): Promise<boolean> => {
  try {
    // Extract token from message
    const messageText = message.content?.text || "";
    const denom = extractTokenSymbol(messageText);
    
    // Get token price
    const result = await getTokenPrice({ denom });
    
    if (result.success) {
      const data = result.result;
      
      // Format the response
      let response = `The current price of ${data.symbol?.toUpperCase() || denom.toUpperCase()} (${data.name}) is ${data.formattedPrice} USD.`;
      
      // Add price change if available
      if (data.price_change_percentage_24h !== undefined) {
        const changeDirection = data.price_change_percentage_24h >= 0 ? "increase" : "decrease";
        const changeAbs = Math.abs(data.price_change_percentage_24h).toFixed(2);
        response += ` This represents a ${changeAbs}% ${changeDirection} in the last 24 hours.`;
      }
      
      // Add market cap and volume if available
      if (data.market_cap !== undefined && data.volume_24h !== undefined) {
        const marketCapFormatted = new Intl.NumberFormat('en-US', {
          style: 'currency',
          currency: 'USD',
          notation: 'compact',
          maximumFractionDigits: 1
        }).format(data.market_cap);
        
        const volumeFormatted = new Intl.NumberFormat('en-US', {
          style: 'currency',
          currency: 'USD',
          notation: 'compact',
          maximumFractionDigits: 1
        }).format(data.volume_24h);
        
        response += ` The current market cap is ${marketCapFormatted} with a 24h trading volume of ${volumeFormatted}.`;
      }
      
      callback?.({ text: response });
      return true;
    } else {
      callback?.({ text: `Sorry, I couldn't get the price for ${denom}. ${result.error?.message || 'Unknown error'}` });
      return false;
    }
  } catch (error) {
    elizaLogger.error('Error in GET_TOKEN_PRICE action:', error);
    callback?.({ text: "Sorry, I encountered an error while fetching the token price." });
    return false;
  }
};

// Handler for GET_MULTIPLE_TOKEN_PRICES action
const getMultipleTokenPricesHandler: Handler = async (
  runtime: IAgentRuntime,
  message: Memory,
  state?: State,
  options?: { [key: string]: unknown },
  callback?: HandlerCallback
): Promise<boolean> => {
  try {
    // Extract tokens from message
    const messageText = message.content?.text || "";
    const denoms = extractMultipleTokenSymbols(messageText);
    
    // Log the extracted tokens for debugging
    elizaLogger.info(`Extracted tokens for price query: ${JSON.stringify(denoms)}`);
    
    // Get token prices
    const result = await getMultipleTokenPrices({ denoms });
    
    if (result.success) {
      const data = result.result;
      
      // Format the response
      let response = "Here are the current prices:\n\n";
      
      for (const denom of denoms) {
        const tokenData = data.prices[denom];
        
        if (tokenData && !tokenData.error) {
          response += `- ${tokenData.symbol?.toUpperCase() || denom.toUpperCase()} (${tokenData.name}): ${tokenData.formattedPrice} USD`;
          
          // Add price change if available
          if (tokenData.price_change_percentage_24h !== undefined) {
            const changeSymbol = tokenData.price_change_percentage_24h >= 0 ? "+" : "";
            const changeValue = `${changeSymbol}${tokenData.price_change_percentage_24h.toFixed(2)}%`;
            response += ` (${changeValue} in 24h)`;
          }
          
          response += "\n";
        } else if (tokenData && tokenData.error) {
          response += `- ${denom.toUpperCase()}: ${tokenData.error}\n`;
        }
      }
      
      callback?.({ text: response });
      return true;
    } else {
      callback?.({ text: `Sorry, I couldn't get the prices. ${result.error?.message || 'Unknown error'}` });
      return false;
    }
  } catch (error) {
    elizaLogger.error('Error in GET_MULTIPLE_TOKEN_PRICES action:', error);
    callback?.({ text: "Sorry, I encountered an error while fetching the token prices." });
    return false;
  }
};

// GET_TOKEN_PRICE action
export const getTokenPriceAction: Action = {
  name: "GET_TOKEN_PRICE",
  description: getTokenPriceTemplate,
  similes: [
    "PRICE_OF_TOKEN",
    "TOKEN_PRICE",
    "CRYPTO_PRICE",
    "CHECK_PRICE"
  ],
  examples: tokenPriceExample,
  validate: async () => true,
  handler: getTokenPriceHandler
};

// GET_MULTIPLE_TOKEN_PRICES action
export const getMultipleTokenPricesAction: Action = {
  name: "GET_MULTIPLE_TOKEN_PRICES",
  description: getMultipleTokenPricesTemplate,
  similes: [
    "COMPARE_PRICES",
    "MULTIPLE_PRICES",
    "PRICE_COMPARISON",
    "CRYPTO_PRICES"
  ],
  examples: multipleTokenPricesExample,
  validate: async () => true,
  handler: getMultipleTokenPricesHandler
};

// Export all actions
export const actions = [
  getTokenPriceAction,
  getMultipleTokenPricesAction
];

export default actions;
