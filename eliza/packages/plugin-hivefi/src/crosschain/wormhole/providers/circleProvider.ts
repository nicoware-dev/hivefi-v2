import { elizaLogger, IAgentRuntime } from '@elizaos/core';

/**
 * Check if a message is a Circle USDC transfer request
 * @param text The message text
 * @returns True if the message is a Circle USDC transfer request
 */
function isCircleTransferRequest(text: string): boolean {
  // Normalize text
  const normalizedText = text.toLowerCase().trim();
  
  // Check for Circle keywords
  const hasCircleKeyword = normalizedText.includes('circle') || 
                          normalizedText.includes('cctp') || 
                          normalizedText.includes('cross-chain transfer protocol');
  
  // Check for USDC keyword
  const hasUSDCKeyword = normalizedText.includes('usdc');
  
  // Check for transfer keywords
  const hasTransferKeyword = normalizedText.includes('transfer') || 
                            normalizedText.includes('send') || 
                            normalizedText.includes('bridge');
  
  // Check for from/to pattern
  const hasFromToPattern = normalizedText.includes('from') && normalizedText.includes('to');
  
  // Check if the message mentions chains
  const mentionsChains = normalizedText.includes('ethereum') || 
                        normalizedText.includes('polygon') || 
                        normalizedText.includes('arbitrum') || 
                        normalizedText.includes('optimism') || 
                        normalizedText.includes('avalanche') || 
                        normalizedText.includes('base');
  
  
  // Final result
  const result = hasUSDCKeyword && 
                hasTransferKeyword && 
                hasFromToPattern && 
                mentionsChains &&
                (hasCircleKeyword || normalizedText.includes('usdc'));
  
  
  return result;
}

/**
 * Check if a message is a Circle redeem request
 * @param text The message text
 * @returns True if the message is a Circle redeem request
 */
function isCircleRedeemRequest(text: string): boolean {
  const normalizedText = text.toLowerCase();
  
  // Check for redeem keywords
  const redeemKeywords = ['redeem', 'claim', 'receive', 'get', 'complete', 'finalize'];
  const hasRedeemKeyword = redeemKeywords.some(keyword => normalizedText.includes(keyword));
  
  // Check for USDC keywords
  const usdcKeywords = ['usdc', 'usd coin', 'circle', 'cctp', 'bridge'];
  const hasUsdcKeyword = usdcKeywords.some(keyword => normalizedText.includes(keyword));
  
  // Check for transaction ID
  const hasTransactionId = normalizedText.includes('transaction') || 
                          normalizedText.includes('tx') || 
                          normalizedText.includes('0x') ||
                          /transaction id/i.test(normalizedText);
  
  // Check for chain specification
  const chainKeywords = ['on', 'to', 'in', 'at', 'for'];
  const chainPatterns = chainKeywords.map(keyword => new RegExp(`${keyword} (ethereum|polygon|arbitrum|optimism|avalanche|base|solana|sui|aptos)`, 'i'));
  const hasChainSpecification = chainPatterns.some(pattern => pattern.test(normalizedText));
  
  
  // Return true if the message has redeem keywords, USDC keywords, and mentions a transaction ID
  // Or if it explicitly mentions redeeming from Circle or CCTP
  // Chain specification is encouraged but not required
  return (hasRedeemKeyword && hasUsdcKeyword && hasTransactionId) || 
         (hasRedeemKeyword && normalizedText.includes('circle')) ||
         (hasRedeemKeyword && normalizedText.includes('cctp'));
}

/**
 * Provider for Circle USDC transfer and redeem requests
 */
export const circleProvider = {
  get: async (runtime: IAgentRuntime, message: { content: { text?: string } }) => {
    const text = message.content.text || '';
    
    if (isCircleTransferRequest(text)) {
      return {
        action: 'CIRCLE_USDC_TRANSFER',
        confidence: 0.9,
        params: {
          text: message.content.text
        }
      };
    }
    
    if (isCircleRedeemRequest(text)) {
      return {
        action: 'CIRCLE_USDC_REDEEM',
        confidence: 0.9,
        params: {
          text: message.content.text
        }
      };
    }
    
    return null;
  }
}; 