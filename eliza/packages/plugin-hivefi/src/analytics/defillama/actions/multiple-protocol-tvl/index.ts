import type { Action, Handler } from "@elizaos/core";
import { elizaLogger } from "@elizaos/core";
import { getAllProtocols } from "../../api/client";
import { extractMultipleProtocolNames } from "../../utils/extract";
import { formatCurrency } from "../../utils/format";
import { PROTOCOL_TO_DEFILLAMA_SLUG } from "../../config/mappings";
import type { ProtocolTVLData } from "../../types";

const handler: Handler = async (runtime, message, state, _options, callback) => {
  try {
    // Extract protocol names from message
    const messageText = message.content?.text || "";
    elizaLogger.info(`Processing message for multiple protocol TVL: "${messageText}"`);
    
    const protocols = extractMultipleProtocolNames(messageText);
    elizaLogger.info(`Extracted protocols: ${protocols.join(', ') || 'none'}`);
    
    if (protocols.length === 0) {
      callback?.({
        text: "Please specify at least one protocol to check. For example:\n" +
             "'Show TVL for Uniswap, Aave, and Curve' or\n" +
             "'Compare TVL for Uniswap and Curve'"
      });
      return false;
    }
    
    // Fetch all protocols data
    const result = await getAllProtocols();
    if (!result.success) {
      callback?.({
        text: `Failed to get protocol data: ${result.error?.message}`
      });
      return false;
    }
    
    const allProtocols = result.result;
    
    // Find the requested protocols
    const foundProtocols: ProtocolTVLData[] = [];
    const notFoundProtocols: string[] = [];
    
    // Log basic info about the API response - minimal logging
    elizaLogger.info(`Total protocols from API: ${allProtocols.length}`);
    
    for (const protocolName of protocols) {
      elizaLogger.info(`Looking for protocol with name: ${protocolName}`);
      
      // Get the DefiLlama slug for the protocol if it exists in our mappings
      const protocolSlug = PROTOCOL_TO_DEFILLAMA_SLUG[protocolName.toLowerCase()] || protocolName.toLowerCase();
      elizaLogger.info(`Using protocol slug: ${protocolSlug}`);
      
      // Find the protocol by slug or name (case insensitive)
      const protocol = allProtocols.find((p: ProtocolTVLData) => {
        const slugMatch = p.slug && p.slug.toLowerCase() === protocolSlug.toLowerCase();
        const nameMatch = p.name && p.name.toLowerCase() === protocolName.toLowerCase();
        const nameSlugMatch = p.name && p.name.toLowerCase() === protocolSlug.toLowerCase();
        
        return slugMatch || nameMatch || nameSlugMatch;
      });
      
      if (protocol) {
        elizaLogger.info(`Found protocol: ${protocol.name} with TVL: ${protocol.tvl}`);
        foundProtocols.push(protocol);
      } else {
        elizaLogger.info(`Protocol not found with slug: ${protocolSlug}`);
        
        // Try a more flexible search as a fallback
        const fuzzyMatch = allProtocols.find((p: ProtocolTVLData) => 
          (p.slug && p.slug.toLowerCase().includes(protocolSlug.toLowerCase())) ||
          (p.name && p.name.toLowerCase().includes(protocolName.toLowerCase()))
        );
        
        if (fuzzyMatch) {
          elizaLogger.info(`Found fuzzy match: ${fuzzyMatch.name} with TVL: ${fuzzyMatch.tvl}`);
          foundProtocols.push(fuzzyMatch);
        } else {
          // Special case handling for common protocols
          if (protocolName.toLowerCase() === 'uniswap') {
            const uniswapMatch = allProtocols.find((p: ProtocolTVLData) => 
              p.name?.toLowerCase().includes('uni') || 
              (p.slug && p.slug.toLowerCase().includes('uni'))
            );
            if (uniswapMatch) {
              elizaLogger.info(`Found special case match for Uniswap: ${uniswapMatch.name}`);
              foundProtocols.push(uniswapMatch);
            } else {
              notFoundProtocols.push(protocolName);
            }
          } else if (protocolName.toLowerCase() === 'aave') {
            const aaveMatch = allProtocols.find((p: ProtocolTVLData) => 
              p.name?.toLowerCase().includes('aave') || 
              (p.slug && p.slug.toLowerCase().includes('aave'))
            );
            if (aaveMatch) {
              elizaLogger.info(`Found special case match for Aave: ${aaveMatch.name}`);
              foundProtocols.push(aaveMatch);
            } else {
              notFoundProtocols.push(protocolName);
            }
          } else {
            notFoundProtocols.push(protocolName);
          }
        }
      }
    }
    
    // If no protocols were found, return an error
    if (foundProtocols.length === 0) {
      const notFoundList = notFoundProtocols.join(', ');
      callback?.({
        text: `Sorry, I couldn't find data for the requested protocols: ${notFoundList}. Please check the protocol names and try again.`
      });
      return false;
    }
    
    // Filter out protocols with zero TVL
    const validProtocols = foundProtocols.filter(p => p.tvl > 0);
    
    // Sort protocols by TVL (descending)
    validProtocols.sort((a, b) => b.tvl - a.tvl);
    
    // Format the response
    let response = "";
    
    if (validProtocols.length === 1) {
      const protocol = validProtocols[0];
      response = `${protocol.name} Total TVL: ${formatCurrency(protocol.tvl)}\n`;
      
      if (protocol.change_1d !== undefined && protocol.change_1d !== null) {
        response += `24h Change: ${protocol.change_1d > 0 ? '+' : ''}${protocol.change_1d.toFixed(2)}%\n`;
      }
      
      if (protocol.change_7d !== undefined && protocol.change_7d !== null) {
        response += `7d Change: ${protocol.change_7d > 0 ? '+' : ''}${protocol.change_7d.toFixed(2)}%\n`;
      }
      
      if (protocol.category) {
        response += `Category: ${protocol.category}\n`;
      }
      
      // Add chain breakdown if available
      if (protocol.chainTvls && Object.keys(protocol.chainTvls).length > 0) {
        response += "\nTop Chains by TVL:\n";
        
        // Handle different formats of chainTvls
        let chains: [string, number][] = [];
        
        if (Array.isArray(protocol.chainTvls)) {
          // If chainTvls is an array of objects
          chains = protocol.chainTvls
            .map(c => [c.chain, c.tvl] as [string, number])
            .filter(([chain]) => !chain.includes('-')); // Filter out special categories
        } else {
          // If chainTvls is a Record<string, number>
          chains = Object.entries(protocol.chainTvls)
            .filter(([chain]) => !chain.includes('-')); // Filter out special categories
        }
        
        // Sort and take top 3
        chains = chains
          .sort(([, a], [, b]) => b - a)
          .slice(0, 3);
        
        for (const [chain, tvl] of chains) {
          const chainTvl = Number(tvl);
          const percentage = ((chainTvl / protocol.tvl) * 100).toFixed(1);
          response += `${chain}: ${formatCurrency(chainTvl)} (${percentage}%)\n`;
        }
      }
    } else {
      // Multiple protocols comparison
      response = "Protocol TVL Comparison:\n\n";
      
      for (const protocol of validProtocols) {
        response += `${protocol.name}: ${formatCurrency(protocol.tvl)}`;
        
        if (protocol.change_1d !== undefined && protocol.change_1d !== null) {
          response += ` (24h: ${protocol.change_1d > 0 ? '+' : ''}${protocol.change_1d.toFixed(2)}%)`;
        }
        
        if (protocol.change_7d !== undefined && protocol.change_7d !== null) {
          response += ` (7d: ${protocol.change_7d > 0 ? '+' : ''}${protocol.change_7d.toFixed(2)}%)`;
        }
        
        if (protocol.category) {
          response += `\nCategory: ${protocol.category}`;
        }
        
        // Add top chain for each protocol
        if (protocol.chainTvls && Object.keys(protocol.chainTvls).length > 0) {
          // Handle different formats of chainTvls
          let chains: [string, number][] = [];
          
          if (Array.isArray(protocol.chainTvls)) {
            // If chainTvls is an array of objects
            chains = protocol.chainTvls
              .map(c => [c.chain, c.tvl] as [string, number])
              .filter(([chain]) => !chain.includes('-')); // Filter out special categories
          } else {
            // If chainTvls is a Record<string, number>
            chains = Object.entries(protocol.chainTvls)
              .filter(([chain]) => !chain.includes('-')); // Filter out special categories
          }
          
          // Sort and take top 2
          const topChains = chains
            .sort(([, a], [, b]) => b - a)
            .slice(0, 2);
          
          if (topChains.length > 0) {
            response += `\nTop chains: `;
            response += topChains.map(([chain, tvl]) => {
              const chainTvl = Number(tvl);
              const percentage = ((chainTvl / protocol.tvl) * 100).toFixed(1);
              return `${chain} ${formatCurrency(chainTvl)} (${percentage}%)`;
            }).join(', ');
          }
        }
        
        response += "\n\n";
      }
      
      // Add total TVL of all protocols
      const totalTVL = validProtocols.reduce((sum, p) => sum + p.tvl, 0);
      response += `Total Combined TVL: ${formatCurrency(totalTVL)}`;
    }
    
    // Add not found protocols to the response if any
    if (notFoundProtocols.length > 0) {
      response += `\n\nNote: Could not find data for: ${notFoundProtocols.join(', ')}`;
    }
    
    callback?.({
      text: response
    });
    
    return true;
  } catch (error) {
    elizaLogger.error('Error in GET_MULTIPLE_PROTOCOL_TVL handler:', error);
    callback?.({
      text: "Sorry, I encountered an error while fetching multiple protocol TVL data. Please try again in a moment."
    });
    return false;
  }
};

export const multipleProtocolTVLAction: Action = {
  name: 'GET_MULTIPLE_PROTOCOL_TVL',
  description: 'Get and compare TVL data for multiple protocols',
  similes: [
    // Direct matches
    'GET_MULTIPLE_PROTOCOL_TVL',
    'MULTIPLE_PROTOCOL_TVL',
    'COMPARE_PROTOCOL_TVL',
    'COMPARE_PROTOCOLS',
    'PROTOCOL_COMPARISON',
    'PROTOCOL_TVL_COMPARISON',
    // Question patterns
    'WHATS_THE_TVL_OF_PROTOCOLS',
    'HOW_MUCH_TVL_DO_PROTOCOLS_HAVE',
    'WHAT_IS_TVL_OF_PROTOCOLS',
    'COMPARE_TVL_BETWEEN_PROTOCOLS',
    // Common variations
    'SHOW_TVL_FOR_PROTOCOLS',
    'DISPLAY_TVL_FOR_PROTOCOLS',
    'LIST_TVL_FOR_PROTOCOLS',
    // Specific examples
    'UNISWAP_AND_AAVE_TVL',
    'CURVE_AND_COMPOUND_TVL',
    'COMPARE_UNISWAP_AAVE_CURVE'
  ],
  handler,
  validate: async () => true,
  examples: [[
    {
      user: 'user1',
      content: { text: "Show TVL for Uniswap, Aave, and Curve" }
    },
    {
      user: 'assistant',
      content: { text: 'Protocol TVL Comparison:\n\nUniswap: $5.4B (24h: +1.2%) (7d: +3.5%)\nCategory: DEX\nTop chains: Ethereum $4.1B (75.9%), Arbitrum $820.5M (15.2%)\n\nAave: $12.3B (24h: +0.8%) (7d: +2.1%)\nCategory: Lending\nTop chains: Ethereum $8.2B (66.7%), Arbitrum $2.5B (20.3%)\n\nCurve: $3.8B (24h: -0.5%) (7d: +1.2%)\nCategory: DEX\nTop chains: Ethereum $3.2B (84.2%), Arbitrum $320M (8.4%)\n\nTotal Combined TVL: $21.5B' }
    }
  ], [
    {
      user: 'user1',
      content: { text: "Compare TVL for Uniswap and Curve" }
    },
    {
      user: 'assistant',
      content: { text: 'Protocol TVL Comparison:\n\nUniswap: $5.4B (24h: +1.2%) (7d: +3.5%)\nCategory: DEX\nTop chains: Ethereum $4.1B (75.9%), Arbitrum $820.5M (15.2%)\n\nCurve: $3.8B (24h: -0.5%) (7d: +1.2%)\nCategory: DEX\nTop chains: Ethereum $3.2B (84.2%), Arbitrum $320M (8.4%)\n\nTotal Combined TVL: $9.2B' }
    }
  ]]
}; 