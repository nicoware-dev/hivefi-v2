import type { Action, ActionExample, Memory, State, IAgentRuntime, HandlerCallback } from "@elizaos/core";
import { elizaLogger } from "@elizaos/core";
import { 
  getMultiversXTVL, 
  getProtocolByName, 
  getTopMultiversXProtocols,
  getChainTVL,
  getGlobalDeFiStats,
  getTopChains,
  compareChainsTVL,
  compareProtocolsTVL,
  getChainHistoricalTVL,
  getProtocolHistoricalTVL,
  getProtocolTVLByChain,
  getProtocolHistoricalTVLByChain,
  getTopProtocolsByChain
} from './module';
import {
  getChainTVLTemplate,
  getProtocolByNameTemplate,
  getTopProtocolsByChainTemplate,
  getGlobalDeFiStatsTemplate,
  getTopChainsTemplate,
  compareChainsTVLTemplate,
  compareProtocolsTVLTemplate
} from './template';

// Create a simple example
const exampleUser: ActionExample = {
  user: "user",
  content: {
    text: "What is the TVL on MultiversX?",
  }
};

// Add type interfaces
interface ChainTVLData {
  chain: string;
  formattedTVL: string;
}

interface HistoricalDataPoint {
  timestamp: number;
  tvl: number;
  formattedTVL: string;
}

interface Protocol {
  name: string;
  formattedTVL: string;
  change_1d?: number;
}

// Helper function to extract chain name from message
function extractChainName(messageText: string): string | null {
  const lowerText = messageText.toLowerCase();
  
  // Common patterns to match
  const patterns = [
    /(?:on|for|in|of|about)\s+(?:the\s+)?([a-z0-9\s]+?)(?:\s+chain|\s+network|\s+blockchain|\s*$)/i,
    /([a-z0-9\s]+?)(?:\s+chain|\s+network|\s+blockchain)\s+(?:tvl|stats|data)/i,
    /^([a-z0-9\s]+?)(?:\s+chain|\s+network|\s+blockchain)$/i
  ];
  
  for (const pattern of patterns) {
    const match = lowerText.match(pattern);
    if (match && match[1]) {
      return match[1].trim();
    }
  }
  
  return null;
}

// Helper function to extract protocol name from message
function extractProtocolName(messageText: string): string | null {
  const lowerText = messageText.toLowerCase();
  
  // Common patterns to match
  const patterns = [
    /(?:on|for|in|of|about)\s+(?:the\s+)?([a-z0-9\s.-]+?)(?:\s+protocol|\s+dapp|\s+platform|\s*$)/i,
    /([a-z0-9\s.-]+?)(?:\s+protocol|\s+dapp|\s+platform)\s+(?:tvl|stats|data)/i,
    /^([a-z0-9\s.-]+?)(?:\s+protocol|\s+dapp|\s+platform)$/i
  ];
  
  for (const pattern of patterns) {
    const match = lowerText.match(pattern);
    if (match && match[1]) {
      return match[1].trim();
    }
  }
  
  return null;
}

// Helper function to extract timestamp from message
function extractTimestamp(messageText: string): number | null {
  const lowerText = messageText.toLowerCase();
  
  // Common date/time patterns
  const now = Date.now();
  const oneDay = 24 * 60 * 60 * 1000;
  const oneWeek = 7 * oneDay;
  const oneMonth = 30 * oneDay;
  const oneYear = 365 * oneDay;
  
  if (lowerText.includes('yesterday')) {
    return now - oneDay;
  } else if (lowerText.includes('last week')) {
    return now - oneWeek;
  } else if (lowerText.includes('last month')) {
    return now - oneMonth;
  } else if (lowerText.includes('last year')) {
    return now - oneYear;
  }
  
  // Try to match specific date formats
  const dateMatch = lowerText.match(/(\d{4})-(\d{2})-(\d{2})/);
  if (dateMatch) {
    const [_, year, month, day] = dateMatch;
    return new Date(parseInt(year), parseInt(month) - 1, parseInt(day)).getTime();
  }
  
  return null;
}

// Fix handler type to make state optional
type CustomHandler = (
  runtime: IAgentRuntime,
  message: Memory,
  state?: State,
  _options?: { [key: string]: unknown },
  callback?: HandlerCallback
) => Promise<boolean>;

// Update handler implementations to use CustomHandler type
const getChainTVLHandler: CustomHandler = async (
  runtime: IAgentRuntime,
  message: Memory,
  state?: State,
  _options?: { [key: string]: unknown },
  callback?: HandlerCallback
): Promise<boolean> => {
  try {
    const chain = extractChainName(message.content?.text || "");
    
    if (!chain) {
      callback?.({
        text: "Please specify a chain name. For example: 'What's the TVL of Ethereum?' or 'Show me Mantle's TVL'"
      });
      return false;
    }
    
    const result = await getChainTVL({ chain });
    
    if (!result.success) {
      callback?.({
        text: `Failed to get TVL data: ${result.error?.message}`
      });
      return false;
    }
    
    const data = result.result;
    let response = `${data.name} Chain TVL: ${data.formattedTVL}\n`;
    
    if (data.change_1d) {
      response += `24h Change: ${data.change_1d > 0 ? '+' : ''}${data.change_1d.toFixed(2)}%\n`;
    }
    if (data.change_7d) {
      response += `7d Change: ${data.change_7d > 0 ? '+' : ''}${data.change_7d.toFixed(2)}%\n`;
    }
    
    callback?.({ text: response, content: data });
    return true;
  } catch (error) {
    elizaLogger.error('Error in GET_CHAIN_TVL handler:', error);
    callback?.({
      text: "Sorry, I encountered an error while fetching the chain TVL data."
    });
    return false;
  }
};

const getProtocolTVLHandler: CustomHandler = async (
  runtime: IAgentRuntime,
  message: Memory,
  state?: State,
  _options?: { [key: string]: unknown },
  callback?: HandlerCallback
): Promise<boolean> => {
  try {
    const protocol = extractProtocolName(message.content?.text || "");
    
    if (!protocol) {
      callback?.({
        text: "Please specify a protocol name. For example: 'What's the TVL of Uniswap?' or 'Show me Aave's TVL'"
      });
      return false;
    }
    
    const result = await getProtocolByName({ name: protocol });
    
    if (!result.success) {
      callback?.({
        text: `Failed to get protocol data: ${result.error?.message}`
      });
      return false;
    }
    
    const data = result.result;
    let response = `${data.name} Protocol TVL: ${data.formattedTVL}\n`;
    
    if (data.change_1d) {
      response += `24h Change: ${data.change_1d > 0 ? '+' : ''}${data.change_1d.toFixed(2)}%\n`;
    }
    if (data.change_7d) {
      response += `7d Change: ${data.change_7d > 0 ? '+' : ''}${data.change_7d.toFixed(2)}%\n`;
    }
    
    if (data.chains && data.chains.length > 0) {
      response += `\nDeployed on: ${data.chains.join(", ")}\n`;
    }
    
    if (data.chainTvls && data.chainTvls.length > 0) {
      response += "\nTVL by Chain:\n";
      data.chainTvls.forEach(({ chain, formattedTVL }) => {
        response += `${chain}: ${formattedTVL}\n`;
      });
    }
    
    callback?.({ text: response, content: data });
    return true;
  } catch (error) {
    elizaLogger.error('Error in GET_PROTOCOL_TVL handler:', error);
    callback?.({
      text: "Sorry, I encountered an error while fetching the protocol TVL data."
    });
    return false;
  }
};

const getChainHistoricalTVLHandler: CustomHandler = async (
  runtime: IAgentRuntime,
  message: Memory,
  state?: State,
  _options?: { [key: string]: unknown },
  callback?: HandlerCallback
): Promise<boolean> => {
  try {
    const chain = extractChainName(message.content?.text || "");
    const timestamp = extractTimestamp(message.content?.text || "") || undefined;
    
    if (!chain) {
      callback?.({
        text: "Please specify a chain name. For example: 'What was Ethereum's TVL last week?' or 'Show me Mantle's historical TVL'"
      });
      return false;
    }
    
    const result = await getChainHistoricalTVL({ chain, timestamp });
    
    if (!result.success) {
      callback?.({
        text: `Failed to get historical TVL data: ${result.error?.message}`
      });
      return false;
    }
    
    const data = result.result;
    let response = "";
    
    if (timestamp) {
      response = `${data.chain} Chain TVL at ${new Date(data.timestamp).toLocaleString()}: ${data.formattedTVL}\n`;
    } else {
      response = `${data.chain} Chain Historical TVL:\n\n`;
      const recentData = data.data.slice(-5); // Show last 5 data points
      recentData.forEach(point => {
        response += `${new Date(point.timestamp).toLocaleDateString()}: ${point.formattedTVL}\n`;
      });
    }
    
    callback?.({ text: response, content: data });
    return true;
  } catch (error) {
    elizaLogger.error('Error in GET_CHAIN_HISTORICAL_TVL handler:', error);
    callback?.({
      text: "Sorry, I encountered an error while fetching the historical chain TVL data."
    });
    return false;
  }
};

const getProtocolTVLByChainHandler: CustomHandler = async (
  runtime: IAgentRuntime,
  message: Memory,
  state?: State,
  _options?: { [key: string]: unknown },
  callback?: HandlerCallback
): Promise<boolean> => {
  try {
    const protocol = extractProtocolName(message.content?.text || "");
    const chain = extractChainName(message.content?.text || "");
    
    if (!protocol || !chain) {
      callback?.({
        text: "Please specify both a protocol and chain name. For example: 'What's Uniswap's TVL on Ethereum?' or 'Show me Aave's TVL on Optimism'"
      });
      return false;
    }
    
    const result = await getProtocolTVLByChain({ protocol, chain });
    
    if (!result.success) {
      callback?.({
        text: `Failed to get protocol TVL data: ${result.error?.message}`
      });
      return false;
    }
    
    const data = result.result;
    const response = `${data.protocol} TVL on ${data.chain}: ${data.formattedTVL} (${data.percentage} of total TVL)\n`;
    
    callback?.({ text: response, content: data });
    return true;
  } catch (error) {
    elizaLogger.error('Error in GET_PROTOCOL_TVL_BY_CHAIN handler:', error);
    callback?.({
      text: "Sorry, I encountered an error while fetching the protocol TVL data for the specified chain."
    });
    return false;
  }
};

const getTopProtocolsByChainHandler: CustomHandler = async (
  runtime: IAgentRuntime,
  message: Memory,
  state?: State,
  _options?: { [key: string]: unknown },
  callback?: HandlerCallback
): Promise<boolean> => {
  try {
    const chain = extractChainName(message.content?.text || "");
    if (!chain) {
      callback?.({
        text: "Please specify a chain name. For example: 'Show me top protocols on Ethereum'"
      });
      return false;
    }

    const result = await getTopProtocolsByChain({ chain, limit: 10 });
    if (!result.success) {
      callback?.({
        text: `Failed to get top protocols: ${result.error?.message}`
      });
      return false;
    }

    const protocols = result.result.protocols as Protocol[];
    let response = `Top Protocols on ${chain} by TVL:\n\n`;
    protocols.forEach((protocol, index) => {
      response += `${index + 1}. ${protocol.name}: ${protocol.formattedTVL}`;
      if (protocol.change_1d) {
        response += ` (${protocol.change_1d > 0 ? '+' : ''}${protocol.change_1d.toFixed(2)}% 24h)`;
      }
      response += '\n';
    });

    callback?.({ text: response, content: result.result });
    return true;
  } catch (error) {
    elizaLogger.error('Error in GET_TOP_PROTOCOLS_BY_CHAIN handler:', error);
    callback?.({
      text: "Sorry, I encountered an error while fetching the top protocols data."
    });
    return false;
  }
};

// Add type annotations for remaining functions
const formatChainData = ({ chain, formattedTVL }: ChainTVLData): string => {
  return `${chain} TVL: ${formattedTVL}`;
};

const formatHistoricalData = (point: HistoricalDataPoint): string => {
  return `${new Date(point.timestamp).toLocaleDateString()}: ${point.formattedTVL}`;
};

// Define actions with improved implementation
export const GetMultiversXTVLAction: Action = {
  name: "GET_MULTIVERSX_TVL",
  description: "Get the total value locked (TVL) for the MultiversX ecosystem",
  similes: [
    "GET_MULTIVERSX_TVL", 
    "SHOW_MULTIVERSX_TVL", 
    "DISPLAY_MULTIVERSX_TVL", 
    "CHECK_MULTIVERSX_TVL", 
    "FETCH_MULTIVERSX_TVL",
    "GET_TVL",
    "SHOW_TVL",
    "CHECK_TVL",
    "FETCH_TVL",
    "TVL_CHECK",
    "MULTIVERSX_TVL",
    "TOTAL_VALUE_LOCKED",
    "ECOSYSTEM_TVL",
    "CHAIN_TVL"
  ],
  examples: [[exampleUser]],
  validate: async () => true,
  handler: async (
    runtime: IAgentRuntime,
    message: Memory,
    state: State,
    _options: { [key: string]: unknown },
    callback?: HandlerCallback
  ): Promise<boolean> => {
    elizaLogger.info(`DefiLlama action: GET_MULTIVERSX_TVL triggered`);
    
    try {
      // First message to indicate we're looking up the data
      if (callback) {
        callback({
          text: `I'll check the current Total Value Locked (TVL) in the MultiversX ecosystem for you. Just a moment while I fetch the latest data...`
        });
      }
      
      // Call the module function
      const response = await getMultiversXTVL();
      
      if (!response.success) {
        elizaLogger.error(`DefiLlama TVL error: ${response.error?.message}`);
        if (callback) {
          callback({
            text: `I couldn't retrieve the TVL data for MultiversX. There was an error: ${response.error?.message}`
          });
        }
        return true;
      }
      
      // Format the response for the user
      const totalTVL = response.result.totalTVL || 0;
      const protocolCount = response.result.protocols?.length || 0;
      
      const formattedTVL = new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        maximumFractionDigits: 0
      }).format(totalTVL);
      
      let responseText = `The total value locked (TVL) in the MultiversX ecosystem is currently ${formattedTVL} across ${protocolCount} protocols.`;
      
      // Add note if using default data
      if (response.result.isDefaultData) {
        responseText += `\n\n*Note: This data is estimated and may not reflect real-time values as I'm currently unable to connect to the DefiLlama API.*`;
      }
      
      if (callback) {
        callback({
          text: responseText,
          content: response.result
        });
      }
      return true;
    } catch (error) {
      elizaLogger.error(`Error in GET_MULTIVERSX_TVL handler: ${error instanceof Error ? error.message : 'Unknown error'}`);
      if (callback) {
        callback({
          text: "I'm sorry, I encountered an error while retrieving the TVL data for MultiversX."
        });
      }
      return true;
    }
  }
};

export const GetProtocolByNameAction: Action = {
  name: "GET_PROTOCOL_BY_NAME",
  description: "Get detailed information about a specific DeFi protocol on MultiversX",
  similes: [
    "GET_PROTOCOL_BY_NAME", 
    "SHOW_PROTOCOL_BY_NAME", 
    "DISPLAY_PROTOCOL_BY_NAME", 
    "CHECK_PROTOCOL_BY_NAME", 
    "FETCH_PROTOCOL_BY_NAME",
    "GET_PROTOCOL",
    "SHOW_PROTOCOL",
    "CHECK_PROTOCOL",
    "FETCH_PROTOCOL",
    "PROTOCOL_INFO",
    "PROTOCOL_DATA",
    "PROTOCOL_DETAILS",
    "PROTOCOL_STATS"
  ],
  examples: [[{
    user: "user",
    content: {
      text: "Tell me about xExchange on MultiversX",
    }
  }]],
  validate: async () => true,
  handler: async (
    runtime: IAgentRuntime,
    message: Memory,
    state: State,
    _options: { [key: string]: unknown },
    callback?: HandlerCallback
  ): Promise<boolean> => {
    elizaLogger.info(`DefiLlama action: GET_PROTOCOL_BY_NAME triggered`);
    
    try {
      // Extract protocol name from message
      const messageText = message.content.text;
      const protocolName = extractProtocolName(messageText);
      
      if (!protocolName) {
        if (callback) {
          callback({
            text: "I'd be happy to provide information about a specific protocol on MultiversX. Could you please specify which protocol you're interested in? For example, you can ask about 'xExchange' or 'Hatom'."
          });
        }
        return true;
      }
      
      elizaLogger.info(`Looking up protocol: ${protocolName}`);
      
      // First message to indicate we're looking up the data
      if (callback) {
        callback({
          text: `I'll look up information about ${protocolName} on MultiversX. One moment while I gather that data...`
        });
      }
      
      // Call the module function
      const response = await getProtocolByName({ name: protocolName });
      
      if (!response.success) {
        elizaLogger.error(`DefiLlama protocol error: ${response.error?.message}`);
        if (callback) {
          callback({
            text: `I couldn't find information about ${protocolName} on MultiversX. ${response.error?.message}`
          });
        }
        return true;
      }
      
      const protocol = response.result.protocol;
      
      // Construct response in a more conversational way
      let responseText = `Here's what I found about **${protocol.name}** on MultiversX:\n\n`;
      
      responseText += `• **Total Value Locked (TVL)**: ${protocol.formattedTVL}\n`;
      
      if (protocol.category) {
        responseText += `• **Category**: ${protocol.category}\n`;
      }
      
      if (protocol.symbol) {
        responseText += `• **Token Symbol**: ${protocol.symbol}\n`;
      }
      
      if (protocol.description) {
        responseText += `\n${protocol.description}\n`;
      }
      
      if (protocol.url) {
        responseText += `\nWebsite: ${protocol.url}`;
      }
      
      if (protocol.twitter) {
        responseText += `\nTwitter: https://twitter.com/${protocol.twitter}`;
      }
      
      if (callback) {
        callback({
          text: responseText,
          content: response.result
        });
      }
      return true;
    } catch (error) {
      elizaLogger.error(`Error in GET_PROTOCOL_BY_NAME handler: ${error instanceof Error ? error.message : 'Unknown error'}`);
      if (callback) {
        callback({
          text: "I'm sorry, I encountered an error while retrieving the protocol information."
        });
      }
      return true;
    }
  }
};

export const GetTopProtocolsAction: Action = {
  name: "GET_TOP_PROTOCOLS",
  description: "Get the top protocols on MultiversX by TVL",
  similes: [
    "GET_TOP_PROTOCOLS", 
    "SHOW_TOP_PROTOCOLS", 
    "DISPLAY_TOP_PROTOCOLS", 
    "CHECK_TOP_PROTOCOLS", 
    "FETCH_TOP_PROTOCOLS",
    "TOP_PROTOCOLS",
    "LARGEST_PROTOCOLS",
    "BIGGEST_PROTOCOLS",
    "HIGHEST_TVL_PROTOCOLS",
    "PROTOCOL_RANKING",
    "PROTOCOL_LEADERBOARD",
    "TVL_RANKING",
    "TVL_LEADERBOARD"
  ],
  examples: [[{
    user: "user",
    content: {
      text: "What are the top 5 protocols on Sonic by TVL?",
    }
  }]],
  validate: async () => true,
  handler: async (
    runtime: IAgentRuntime,
    message: Memory,
    state: State,
    _options: { [key: string]: unknown },
    callback?: HandlerCallback
  ): Promise<boolean> => {
    elizaLogger.info(`DefiLlama action: GET_TOP_PROTOCOLS triggered`);
    
    try {
      // Extract limit from message if present
      const messageText = message.content.text.toLowerCase();
      let limit = 5; // Default limit
      
      // Try to extract a number from the message
      const numberMatch = messageText.match(/\b(\d+)\b/);
      if (numberMatch && numberMatch[1]) {
        const extractedNumber = parseInt(numberMatch[1], 10);
        if (!isNaN(extractedNumber) && extractedNumber > 0 && extractedNumber <= 20) {
          limit = extractedNumber;
        }
      }
      
      // First message to indicate we're looking up the data
      if (callback) {
        callback({
          text: `I'll find the top ${limit} protocols on MultiversX by Total Value Locked (TVL). One moment while I gather that information...`
        });
      }
      
      // Call the module function
      const response = await getTopMultiversXProtocols({ limit });
      
      if (!response.success) {
        elizaLogger.error(`DefiLlama top protocols error: ${response.error?.message}`);
        if (callback) {
          callback({
            text: `I couldn't retrieve the top protocols on MultiversX. There was an error: ${response.error?.message}`
          });
        }
        return true;
      }
      
      const { protocols, totalCount } = response.result;
      
      if (!protocols || protocols.length === 0) {
        if (callback) {
          callback({
            text: "I couldn't find any protocols on MultiversX tracked by DefiLlama."
          });
        }
        return true;
      }
      
      // Construct response in a more conversational way
      let responseText = `Here are the top ${protocols.length} protocols on MultiversX by TVL:\n\n`;
      
      protocols.forEach((protocol: any, index: number) => {
        const formattedTVL = protocol.formattedTVL || new Intl.NumberFormat('en-US', {
          style: 'currency',
          currency: 'USD',
          maximumFractionDigits: 0
        }).format(protocol.tvl || 0);
        
        responseText += `${index + 1}. **${protocol.name}**: ${formattedTVL}`;
        
        if (protocol.category) {
          responseText += ` (${protocol.category})`;
        }
        
        responseText += '\n';
      });
      
      if (totalCount > protocols.length) {
        responseText += `\nThese are ${protocols.length} out of ${totalCount} protocols currently on MultiversX. Would you like information about a specific protocol?`;
      }
      
      // Add note if using default data
      if (response.result.isDefaultData) {
        responseText += `\n\n*Note: This data is estimated and may not reflect real-time values as I'm currently unable to connect to the DefiLlama API.*`;
      }
      
      if (callback) {
        callback({
          text: responseText,
          content: response.result
        });
      }
      return true;
    } catch (error) {
      elizaLogger.error(`Error in GET_TOP_PROTOCOLS handler: ${error instanceof Error ? error.message : 'Unknown error'}`);
      if (callback) {
        callback({
          text: "I'm sorry, I encountered an error while retrieving the top protocols on MultiversX."
        });
      }
      return true;
    }
  }
};

// Export all actions
export const actions = [
  {
    name: 'GET_CHAIN_TVL',
    similes: ['CHAIN_TVL', 'TVL_OF_CHAIN', 'TOTAL_VALUE_LOCKED'],
    description: 'Get TVL data for a specific blockchain',
    handler: getChainTVLHandler,
    validate: async () => true,
    examples: [[
      {
        user: 'user1',
        content: { text: 'What is the TVL of Ethereum?' }
      },
      {
        user: 'assistant',
        content: { text: 'Ethereum Chain TVL: $123.45B\n24h Change: +2.5%\n7d Change: -1.2%' }
      }
    ]]
  },
  {
    name: 'GET_PROTOCOL_TVL',
    similes: ['PROTOCOL_TVL', 'TVL_OF_PROTOCOL', 'PROTOCOL_VALUE_LOCKED'],
    description: 'Get TVL data for a specific DeFi protocol',
    handler: getProtocolTVLHandler,
    validate: async () => true,
    examples: [[
      {
        user: 'user1',
        content: { text: 'What is the TVL of Uniswap?' }
      },
      {
        user: 'assistant',
        content: { text: 'Uniswap Protocol TVL: $123.45B\n24h Change: +2.5%\n7d Change: -1.2%' }
      }
    ]]
  },
  {
    name: 'GET_CHAIN_HISTORICAL_TVL',
    similes: ['CHAIN_HISTORICAL_TVL', 'HISTORICAL_TVL_OF_CHAIN'],
    description: 'Get historical TVL data for a specific blockchain',
    handler: getChainHistoricalTVLHandler,
    validate: async () => true,
    examples: [[
      {
        user: 'user1',
        content: { text: 'What was Ethereum\'s TVL last week?' }
      },
      {
        user: 'assistant',
        content: { text: 'Ethereum Chain Historical TVL:\n\n2024-03-01: $123.45B\n2024-03-02: $125.67B' }
      }
    ]]
  },
  {
    name: 'GET_PROTOCOL_TVL_BY_CHAIN',
    similes: ['PROTOCOL_CHAIN_TVL', 'TVL_OF_PROTOCOL_ON_CHAIN'],
    description: 'Get TVL data for a specific protocol on a specific chain',
    handler: getProtocolTVLByChainHandler,
    validate: async () => true,
    examples: [[
      {
        user: 'user1',
        content: { text: 'What is Uniswap\'s TVL on Ethereum?' }
      },
      {
        user: 'assistant',
        content: { text: 'Uniswap TVL on Ethereum: $123.45B (100% of total TVL)' }
      }
    ]]
  },
  {
    name: 'GET_TOP_PROTOCOLS_BY_CHAIN',
    similes: ['TOP_PROTOCOLS_ON_CHAIN', 'CHAIN_TOP_PROTOCOLS'],
    description: 'Get top protocols by TVL for a specific blockchain',
    handler: getTopProtocolsByChainHandler,
    validate: async () => true,
    examples: [[
      {
        user: 'user1',
        content: { text: 'Show me the top protocols on Ethereum' }
      },
      {
        user: 'assistant',
        content: { text: 'Top Protocols on Ethereum by TVL:\n\n1. MakerDAO: $12.34B\n2. Lido: $9.87B' }
      }
    ]]
  }
];

export default actions;
