import { CHAIN_TO_DEFILLAMA_SLUG, PROTOCOL_TO_DEFILLAMA_SLUG } from '../config/mappings';
import { elizaLogger } from '@elizaos/core';

/**
 * Extract chain name from message
 */
export function extractChainName(message: string): string | null {
  try {
    const lowerMessage = message.toLowerCase();
    
    // Try exact matches first
    for (const [key, value] of Object.entries(CHAIN_TO_DEFILLAMA_SLUG)) {
      if (lowerMessage.includes(key.toLowerCase())) {
        elizaLogger.debug('Found exact chain match:', { key, value });
        return value;
      }
    }
    
    // Try fuzzy matching for chain names
    const chainPattern = /(?:on|for|in|of|at)\s+([a-z0-9\s]+)(?:\s+chain|\s+network)?/i;
    const chainMatch = message.match(chainPattern);
    
    if (chainMatch) {
      const potentialChain = chainMatch[1].toLowerCase().trim();
      
      // Check if the potential chain exists in our mapping
      for (const [key, value] of Object.entries(CHAIN_TO_DEFILLAMA_SLUG)) {
        if (potentialChain.includes(key.toLowerCase())) {
          elizaLogger.debug('Found fuzzy chain match:', { key, value });
          return value;
        }
      }
    }
    
    elizaLogger.debug('No chain name found in message:', { message });
    return null;
  } catch (error) {
    elizaLogger.error('Error extracting chain name:', { message, error });
    return null;
  }
}

/**
 * Extract protocol name from message
 */
export function extractProtocolName(message: string): string | null {
  try {
    const lowerMessage = message.toLowerCase();
    
    // Try exact matches first
    for (const [key, value] of Object.entries(PROTOCOL_TO_DEFILLAMA_SLUG)) {
      if (lowerMessage.includes(key.toLowerCase())) {
        elizaLogger.debug('Found exact protocol match:', { key, value });
        return value;
      }
    }
    
    // Try fuzzy matching for protocol names
    const protocolPattern = /(?:of|for|in|at)\s+([a-z0-9\s]+?)(?:\s+protocol|\s+defi|\s+dex|\s+exchange)?/i;
    const protocolMatch = message.match(protocolPattern);
    
    if (protocolMatch) {
      const potentialProtocol = protocolMatch[1].toLowerCase().trim();
      
      // Check if the potential protocol exists in our mapping
      for (const [key, value] of Object.entries(PROTOCOL_TO_DEFILLAMA_SLUG)) {
        if (potentialProtocol.includes(key.toLowerCase())) {
          elizaLogger.debug('Found fuzzy protocol match:', { key, value });
          return value;
        }
      }
    }
    
    elizaLogger.debug('No protocol name found in message:', { message });
    return null;
  } catch (error) {
    elizaLogger.error('Error extracting protocol name:', { message, error });
    return null;
  }
}

/**
 * Extract timestamp from message
 */
export function extractTimestamp(message: string): number | null {
  try {
    const lowerMessage = message.toLowerCase();
    const now = Date.now();
    
    // Match time periods
    const dayMatch = lowerMessage.match(/(\d+)\s*days?\s+ago/);
    if (dayMatch) {
      const days = parseInt(dayMatch[1]);
      return now - (days * 24 * 60 * 60 * 1000);
    }
    
    const weekMatch = lowerMessage.match(/(\d+)\s*weeks?\s+ago/);
    if (weekMatch) {
      const weeks = parseInt(weekMatch[1]);
      return now - (weeks * 7 * 24 * 60 * 60 * 1000);
    }
    
    const monthMatch = lowerMessage.match(/(\d+)\s*months?\s+ago/);
    if (monthMatch) {
      const months = parseInt(monthMatch[1]);
      return now - (months * 30 * 24 * 60 * 60 * 1000);
    }
    
    // Match relative time periods
    if (lowerMessage.includes('last week') || lowerMessage.includes('previous week')) {
      return now - (7 * 24 * 60 * 60 * 1000);
    }
    
    if (lowerMessage.includes('last month') || lowerMessage.includes('previous month')) {
      return now - (30 * 24 * 60 * 60 * 1000);
    }
    
    if (lowerMessage.includes('yesterday')) {
      return now - (24 * 60 * 60 * 1000);
    }
    
    elizaLogger.debug('No timestamp found in message:', { message });
    return null;
  } catch (error) {
    elizaLogger.error('Error extracting timestamp:', { message, error });
    return null;
  }
}

/**
 * Extract multiple chain names from message text
 */
export function extractMultipleChainNames(messageText: string): string[] {
  const chains = new Set<string>();
  const text = messageText.toLowerCase();
  
  // Split by common separators and 'and'
  const parts = text
    .replace(/\s+and\s+/g, ', ')
    .split(/[,\s]+/);
  
  for (const part of parts) {
    const cleanPart = part.replace(/['"]/g, '').toLowerCase();
    if (CHAIN_TO_DEFILLAMA_SLUG[cleanPart]) {
      chains.add(CHAIN_TO_DEFILLAMA_SLUG[cleanPart]);
      elizaLogger.debug(`Found chain in multiple extraction: ${cleanPart} -> ${CHAIN_TO_DEFILLAMA_SLUG[cleanPart]}`);
    }
  }
  
  return Array.from(chains);
}

/**
 * Extract multiple protocol names from message text
 */
export function extractMultipleProtocolNames(messageText: string): string[] {
  const protocols = new Set<string>();
  const text = messageText.toLowerCase();
  
  // Split by common separators and 'and'
  const parts = text
    .replace(/\s+and\s+/g, ', ')
    .split(/[,\s]+/);
  
  for (const part of parts) {
    const cleanPart = part.replace(/['"]/g, '').toLowerCase();
    if (PROTOCOL_TO_DEFILLAMA_SLUG[cleanPart]) {
      protocols.add(PROTOCOL_TO_DEFILLAMA_SLUG[cleanPart]);
      elizaLogger.debug(`Found protocol in multiple extraction: ${cleanPart} -> ${PROTOCOL_TO_DEFILLAMA_SLUG[cleanPart]}`);
    }
  }
  
  return Array.from(protocols);
}

/**
 * Extract limit from message
 */
export function extractLimit(message: string): number | null {
  try {
    const lowerMessage = message.toLowerCase();
    
    // Match "top N" or "N chains/protocols"
    const limitMatch = lowerMessage.match(/(?:top|first)\s*(\d+)|(\d+)\s*(?:chains?|protocols?)/i);
    
    if (limitMatch) {
      const limit = parseInt(limitMatch[1] || limitMatch[2]);
      if (!isNaN(limit) && limit > 0) {
        elizaLogger.debug('Found limit in message:', { limit });
        return limit;
      }
    }
    
    elizaLogger.debug('No limit found in message:', { message });
    return null;
  } catch (error) {
    elizaLogger.error('Error extracting limit:', { message, error });
    return null;
  }
} 