import { IAgentRuntime } from '@elizaos/core';
import { isTransferRequest, isRedeemRequest } from '../utils';
import { circleProvider } from './circleProvider';

/**
 * Wormhole provider for cross-chain token transfers
 */
export const wormholeProvider = {
  get: async (runtime: IAgentRuntime, message: { content: { text?: string } }) => {
    const text = message.content.text?.toLowerCase() || '';
    
    // Check if this is a transfer or redeem request
    const isTransfer = isTransferRequest(text);
    const isRedeem = isRedeemRequest(text);
    
    // Check if this is specifically a Wormhole request
    const isWormholeRequest = text.includes('wormhole') || 
                             text.includes('cross-chain') || 
                             text.includes('bridge');
    
    if (isTransfer && isWormholeRequest) {
      return {
        action: 'WORMHOLE_CROSS_CHAIN_TRANSFER',
        confidence: 0.9,
        params: {
          text: message.content.text
        }
      };
    }
    
    if (isRedeem && isWormholeRequest) {
      return {
        action: 'WORMHOLE_CROSS_CHAIN_REDEEM',
        confidence: 0.9,
        params: {
          text: message.content.text
        }
      };
    }
    
    // If it's a transfer or redeem request but not explicitly mentioning Wormhole,
    // return with lower confidence
    if (isTransfer) {
      return {
        action: 'WORMHOLE_CROSS_CHAIN_TRANSFER',
        confidence: 0.6,
        params: {
          text: message.content.text
        }
      };
    }
    
    if (isRedeem) {
      return {
        action: 'WORMHOLE_CROSS_CHAIN_REDEEM',
        confidence: 0.6,
        params: {
          text: message.content.text
        }
      };
    }
    
    return null;
  }
};

/**
 * Export all Wormhole providers
 */
const providers = [
  wormholeProvider,
  circleProvider
];

export default providers; 