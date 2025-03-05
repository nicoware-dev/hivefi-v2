// Export chain utilities
export * from './chain';

// Export token utilities
export * from './token';

// Export wallet utilities
export * from './wallet';

import { WormholeChain, WormholeToken } from '../types';

/**
 * Check if a message is a request to transfer tokens across chains using Wormhole
 * @param text The message text to check
 * @returns True if the message is a transfer request, false otherwise
 */
export function isTransferRequest(text: string): boolean {
  // Normalize text for easier matching
  const normalizedText = text.toLowerCase();
  
  // Check for Wormhole-specific keywords
  const hasWormholeKeyword = normalizedText.includes('wormhole') || 
                            normalizedText.includes('cross-chain') || 
                            normalizedText.includes('bridge');
  
  // Check for transfer-specific keywords
  const hasTransferKeyword = normalizedText.includes('transfer') || 
                            normalizedText.includes('send') || 
                            normalizedText.includes('move') || 
                            normalizedText.includes('bridge');
  
  // Check for chain-specific patterns
  const hasFromToPattern = normalizedText.includes('from') && normalizedText.includes('to');
  
  // Check for specific chain mentions
  const mentionsChains = Object.values(WormholeChain).some(chain => 
    normalizedText.includes(chain.toLowerCase())
  );
  
  // Check for Mantle and BSC specifically
  const mentionsMantleOrBSC = normalizedText.includes('mantle') || 
                             normalizedText.includes('bsc') || 
                             normalizedText.includes('binance');
  
  // Log the detection results for debugging
  console.log(`[isTransferRequest] Text: "${text}"`);
  console.log(`[isTransferRequest] hasWormholeKeyword: ${hasWormholeKeyword}`);
  console.log(`[isTransferRequest] hasTransferKeyword: ${hasTransferKeyword}`);
  console.log(`[isTransferRequest] hasFromToPattern: ${hasFromToPattern}`);
  console.log(`[isTransferRequest] mentionsChains: ${mentionsChains}`);
  console.log(`[isTransferRequest] mentionsMantleOrBSC: ${mentionsMantleOrBSC}`);
  
  // Determine if this is a transfer request
  // Must have Wormhole keyword AND (transfer keyword OR from-to pattern) AND mention chains
  const isTransfer = hasWormholeKeyword && 
                    (hasTransferKeyword || hasFromToPattern) && 
                    (mentionsChains || mentionsMantleOrBSC);
  
  console.log(`[isTransferRequest] Final result: ${isTransfer}`);
  
  return isTransfer;
}

/**
 * Check if a string matches a redeem request pattern
 * @param text The text to check
 * @returns True if the text matches a redeem pattern
 */
export function isRedeemRequest(text: string): boolean {
  const redeemPatterns = [
    // Patterns that explicitly mention Wormhole
    /(?:redeem|claim)(?:ing)?\s+(?:\w+)?\s*tokens?\s+(?:from|via|using|with|through)\s+(?:wormhole|cross-chain|bridge)/i,
    
    // Generic redeem patterns
    /(?:redeem|claim)(?:ing)?\s+(?:\w+)?\s*tokens?/i,
    
    // Explicit Wormhole mentions
    /wormhole\s+(?:redeem|claim)(?:ing)?\s+(?:\w+)?\s*tokens?/i,
    
    // Cross-chain mentions
    /cross-chain\s+(?:redeem|claim)(?:ing)?\s+(?:\w+)?\s*tokens?/i
  ];
  return redeemPatterns.some(pattern => pattern.test(text));
}

/**
 * Extract chain name from text
 * @param text The text to extract from
 * @returns The extracted chain name or undefined if not found
 */
export function extractChain(text: string): WormholeChain | undefined {
  if (!text) return undefined;
  
  // Normalize text for easier matching
  const normalizedText = text.toLowerCase().trim();
  console.log(`[extractChain] Normalized text: "${normalizedText}"`);
  
  // Direct mapping of common chain names to WormholeChain enum values
  const chainMap: Record<string, WormholeChain> = {
    'ethereum': WormholeChain.ETHEREUM,
    'eth': WormholeChain.ETHEREUM,
    'solana': WormholeChain.SOLANA,
    'sol': WormholeChain.SOLANA,
    'polygon': WormholeChain.POLYGON,
    'matic': WormholeChain.POLYGON,
    'bsc': WormholeChain.BSC,
    'binance': WormholeChain.BSC,
    'binance smart chain': WormholeChain.BSC,
    'avalanche': WormholeChain.AVALANCHE,
    'avax': WormholeChain.AVALANCHE,
    'fantom': WormholeChain.FANTOM,
    'ftm': WormholeChain.FANTOM,
    'celo': WormholeChain.CELO,
    'moonbeam': WormholeChain.MOONBEAM,
    'glmr': WormholeChain.MOONBEAM,
    'arbitrum': WormholeChain.ARBITRUM,
    'arb': WormholeChain.ARBITRUM,
    'optimism': WormholeChain.OPTIMISM,
    'op': WormholeChain.OPTIMISM,
    'aptos': WormholeChain.APTOS,
    'apt': WormholeChain.APTOS,
    'sui': WormholeChain.SUI,
    'base': WormholeChain.BASE,
    'mantle': WormholeChain.MANTLE,
    'mnt': WormholeChain.MANTLE,
    'sonic': WormholeChain.SONIC
  };
  
  // First, try direct matching with the chain map
  for (const [chainName, chainValue] of Object.entries(chainMap)) {
    if (normalizedText.includes(chainName)) {
      console.log(`[extractChain] Found direct match: ${chainValue}`);
      return chainValue;
    }
  }
  
  // If no direct match, try to extract from patterns like "from X" or "to X"
  const fromMatch = normalizedText.match(/from\s+(\w+(?:\s+\w+)?)/i);
  const toMatch = normalizedText.match(/to\s+(\w+(?:\s+\w+)?)/i);
  
  let extractedChain = undefined;
  
  if (fromMatch) {
    const fromChain = fromMatch[1].trim().toLowerCase();
    console.log(`[extractChain] Extracted from pattern: "${fromChain}"`);
    
    for (const [chainName, chainValue] of Object.entries(chainMap)) {
      if (fromChain.includes(chainName)) {
        extractedChain = chainValue;
        break;
      }
    }
  }
  
  if (!extractedChain && toMatch) {
    const toChain = toMatch[1].trim().toLowerCase();
    console.log(`[extractChain] Extracted to pattern: "${toChain}"`);
    
    for (const [chainName, chainValue] of Object.entries(chainMap)) {
      if (toChain.includes(chainName)) {
        extractedChain = chainValue;
        break;
      }
    }
  }
  
  // Special handling for Mantle and BSC
  if (normalizedText.includes('mantle') || normalizedText.includes('mnt')) {
    console.log(`[extractChain] Special handling for Mantle`);
    extractedChain = WormholeChain.MANTLE;
  } else if (normalizedText.includes('bsc') || normalizedText.includes('binance')) {
    console.log(`[extractChain] Special handling for BSC`);
    extractedChain = WormholeChain.BSC;
  }
  
  console.log(`[extractChain] Final result: ${extractedChain}`);
  return extractedChain;
}

/**
 * Extract amount information from text
 * @param text The text to extract from
 * @returns The identified amount or undefined
 */
export function extractAmount(text: string): string | undefined {
  console.log(`[extractAmount] Extracting amount from: "${text}"`);
  
  // Look for amount followed by token or tokens
  const amountTokenMatch = text.match(/(\d*\.?\d+)\s+(?:\w+)?\s*tokens?/i);
  if (amountTokenMatch && amountTokenMatch[1]) {
    console.log(`[extractAmount] Found amount with token: ${amountTokenMatch[1]}`);
    return amountTokenMatch[1];
  }
  
  // Look for amount followed by a token symbol
  const amountSymbolMatch = text.match(/(\d*\.?\d+)\s+(ETH|BTC|USDC|USDT|DAI|MATIC|SOL|AVAX|BNB|FTM|CELO|GLMR|ARB|OP|APT|SUI|MNT)/i);
  if (amountSymbolMatch && amountSymbolMatch[1]) {
    console.log(`[extractAmount] Found amount with symbol: ${amountSymbolMatch[1]}`);
    return amountSymbolMatch[1];
  }
  
  // Look for any number in the text as a fallback
  const numberMatch = text.match(/(\d*\.?\d+)/);
  if (numberMatch && numberMatch[1]) {
    console.log(`[extractAmount] Found generic number: ${numberMatch[1]}`);
    return numberMatch[1];
  }
  
  console.log(`[extractAmount] No amount found`);
  return undefined;
}

/**
 * Extract token information from text
 * @param text The text to extract from
 * @returns The identified token or undefined
 */
export function extractToken(text: string): string | undefined {
  const upperText = text.toUpperCase();
  
  console.log(`[extractToken] Extracting token from: "${text}"`);
  
  // Look for specific token mentions with amount
  const tokenMatch = text.match(/(\d*\.?\d+)\s+(\w+)\s+(?:tokens?|from|to|via|using|with|through)/i);
  if (tokenMatch && tokenMatch[2]) {
    const token = tokenMatch[2].toUpperCase();
    console.log(`[extractToken] Found token with amount: ${token}`);
    
    // Verify it's a known token
    for (const knownToken of Object.values(WormholeToken)) {
      if (token === knownToken) {
        console.log(`[extractToken] Matched known token: ${token}`);
        return token;
      }
    }
  }
  
  // Check for token mentions with "my" pattern
  const myTokenMatch = text.match(/my\s+(\w+)\s+tokens?/i);
  if (myTokenMatch && myTokenMatch[1]) {
    const token = myTokenMatch[1].toUpperCase();
    console.log(`[extractToken] Found token with "my" pattern: ${token}`);
    
    // Verify it's a known token
    for (const knownToken of Object.values(WormholeToken)) {
      if (token === knownToken) {
        console.log(`[extractToken] Matched known token: ${token}`);
        return token;
      }
    }
  }
  
  // Check for common token names using word boundaries
  for (const token of Object.values(WormholeToken)) {
    const regex = new RegExp(`\\b${token}\\b`, 'i');
    if (regex.test(upperText)) {
      console.log(`[extractToken] Matched token with word boundary: ${token}`);
      return token;
    }
  }
  
  // Special handling for Mantle and BSC
  if (text.toLowerCase().includes('mantle') || text.toLowerCase().includes('mnt')) {
    // Check for Mantle-specific tokens
    if (upperText.includes('USDT')) {
      console.log(`[extractToken] Mantle context, found USDT`);
      return 'USDT';
    } else if (upperText.includes('USDC')) {
      console.log(`[extractToken] Mantle context, found USDC`);
      return 'USDC';
    } else if (upperText.includes('ETH')) {
      console.log(`[extractToken] Mantle context, found ETH`);
      return 'ETH';
    } else if (upperText.includes('WETH')) {
      console.log(`[extractToken] Mantle context, found WETH`);
      return 'WETH';
    } else {
      console.log(`[extractToken] Mantle context, defaulting to MNT`);
      return 'MNT';
    }
  } else if (text.toLowerCase().includes('bsc') || text.toLowerCase().includes('binance')) {
    // Check for BSC-specific tokens
    if (upperText.includes('USDT')) {
      console.log(`[extractToken] BSC context, found USDT`);
      return 'USDT';
    } else if (upperText.includes('USDC')) {
      console.log(`[extractToken] BSC context, found USDC`);
      return 'USDC';
    } else if (upperText.includes('ETH')) {
      console.log(`[extractToken] BSC context, found ETH`);
      return 'ETH';
    } else if (upperText.includes('BUSD')) {
      console.log(`[extractToken] BSC context, found BUSD`);
      return 'BUSD';
    } else if (upperText.includes('WETH')) {
      console.log(`[extractToken] BSC context, found WETH`);
      return 'WETH';
    } else {
      console.log(`[extractToken] BSC context, defaulting to BNB`);
      return 'BNB';
    }
  }
  
  // Default to native token if no specific token is mentioned
  console.log(`[extractToken] No specific token found, defaulting to NATIVE`);
  return 'NATIVE';
}

/**
 * Extract transaction ID from text
 * @param text The text to extract from
 * @returns The identified transaction ID or undefined
 */
export function extractTransactionId(text: string): string | undefined {
  // Look for transaction ID patterns (0x followed by hex characters)
  const txIdMatch = text.match(/0x[a-fA-F0-9]{40,}/);
  if (txIdMatch) {
    return txIdMatch[0];
  }
  
  // Look for transaction ID mentioned after specific keywords
  const txIdKeywordMatch = text.match(/(?:transaction|tx|txid|hash)(?:\s+id)?(?:\s*[:=]\s*|\s+is\s+|\s+)([a-zA-Z0-9]{40,})/i);
  if (txIdKeywordMatch && txIdKeywordMatch[1]) {
    return txIdKeywordMatch[1];
  }
  
  return undefined;
} 