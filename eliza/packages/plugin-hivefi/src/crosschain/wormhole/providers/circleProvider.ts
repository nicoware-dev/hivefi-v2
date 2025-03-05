import { elizaLogger, IAgentRuntime } from '@elizaos/core';

const logger = elizaLogger.child({ module: 'CircleProvider' });

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
  
  // Log the results
  logger.info(`[isCircleTransferRequest] Text: "${text}"`);
  logger.info(`[isCircleTransferRequest] hasCircleKeyword: ${hasCircleKeyword}`);
  logger.info(`[isCircleTransferRequest] hasUSDCKeyword: ${hasUSDCKeyword}`);
  logger.info(`[isCircleTransferRequest] hasTransferKeyword: ${hasTransferKeyword}`);
  logger.info(`[isCircleTransferRequest] hasFromToPattern: ${hasFromToPattern}`);
  logger.info(`[isCircleTransferRequest] mentionsChains: ${mentionsChains}`);
  
  // Final result
  const result = hasUSDCKeyword && 
                hasTransferKeyword && 
                hasFromToPattern && 
                mentionsChains &&
                (hasCircleKeyword || normalizedText.includes('usdc'));
  
  logger.info(`[isCircleTransferRequest] Final result: ${result}`);
  
  return result;
}

/**
 * Provider for Circle USDC transfer requests
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
    
    return null;
  }
}; 