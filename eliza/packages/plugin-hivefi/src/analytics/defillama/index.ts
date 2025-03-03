import { Action, ActionExample, Memory, State, IAgentRuntime, HandlerCallback } from "@elizaos/core";
import { elizaLogger } from "@elizaos/core";
import { 
  getMultiversXTVL, 
  getProtocolByName, 
  getTopMultiversXProtocols 
} from './module';

// Create a simple example
const exampleUser: ActionExample = {
  user: "user",
  content: {
    text: "What is the TVL on MultiversX?",
  }
};

// Helper function to extract protocol name from message
function extractProtocolName(messageText: string): string {
  const lowerText = messageText.toLowerCase();
  
  // Common protocol names to check for - expanded list
  const commonProtocols = [
    "xexchange", "hatom", "ashswap", "onedex", "jexchange", 
    "vestige", "arda", "multiversx", "elrond", "egld"
  ];
  
  // First check for exact matches of common protocols
  for (const protocol of commonProtocols) {
    if (lowerText.includes(protocol)) {
      return protocol;
    }
  }
  
  // Try different regex patterns to extract protocol names
  
  // Pattern 1: "of X protocol" or "of the X protocol"
  const ofPattern = /(?:of|about|for)\s+(?:the\s+)?([a-z0-9\s.]+?)(?:\s+protocol|\s+on\s+multiversx|\s+in\s+multiversx|\s*\?|$)/i;
  const ofMatch = lowerText.match(ofPattern);
  if (ofMatch && ofMatch[1]) {
    return ofMatch[1].trim();
  }
  
  // Pattern 2: "X protocol TVL" or "X's TVL"
  const protocolTvlPattern = /([a-z0-9\s.]+?)(?:'s|\s+protocol)?\s+(?:tvl|total value locked)/i;
  const protocolTvlMatch = lowerText.match(protocolTvlPattern);
  if (protocolTvlMatch && protocolTvlMatch[1]) {
    return protocolTvlMatch[1].trim();
  }
  
  // Pattern 3: "what is X" where X might be a protocol
  const whatIsPattern = /what(?:'s| is) (?:the )?([a-z0-9\s.]+?)(?:\?|$)/i;
  const whatIsMatch = lowerText.match(whatIsPattern);
  if (whatIsMatch && whatIsMatch[1] && !whatIsMatch[1].includes("tvl")) {
    return whatIsMatch[1].trim();
  }
  
  // Pattern 4: "show me X" or "tell me about X"
  const showMePattern = /(?:show|tell) (?:me|us) (?:about )?(?:the )?([a-z0-9\s.]+?)(?:\?|$)/i;
  const showMeMatch = lowerText.match(showMePattern);
  if (showMeMatch && showMeMatch[1] && !showMeMatch[1].includes("tvl")) {
    return showMeMatch[1].trim();
  }
  
  return "";
}

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
      text: "What are the top 5 protocols on MultiversX by TVL?",
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
export const DefiLlamaActions: Action[] = [
  GetMultiversXTVLAction,
  GetProtocolByNameAction,
  GetTopProtocolsAction
];
