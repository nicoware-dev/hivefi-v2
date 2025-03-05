import { Provider, IAgentRuntime, Memory, State } from '@elizaos/core';
import { WormholeChain } from '../types';
import { isTransferRequest, isRedeemRequest } from '../utils';

/**
 * Wormhole provider for cross-chain token transfers
 */
export const wormholeProvider: Provider = {
  get: async (runtime: IAgentRuntime, message: Memory, state?: State) => {
    const text = message.content.text?.toLowerCase() || '';
    
    // Check if this is a transfer or redeem request
    const isTransfer = isTransferRequest(text);
    const isRedeem = isRedeemRequest(text);
    
    // Check if this is specifically a Wormhole request
    const isWormholeRequest = text.toLowerCase().includes('wormhole') || 
                             text.toLowerCase().includes('cross-chain') || 
                             text.toLowerCase().includes('bridge');
    
    if (isTransfer && isWormholeRequest) {
      return {
        action: 'WORMHOLE_CROSS_CHAIN_TRANSFER',
        confidence: 0.9,
        params: {}
      };
    }
    
    if (isRedeem && isWormholeRequest) {
      return {
        action: 'WORMHOLE_CROSS_CHAIN_REDEEM',
        confidence: 0.9,
        params: {}
      };
    }
    
    // If it's a transfer or redeem request but not explicitly mentioning Wormhole,
    // return with lower confidence
    if (isTransfer) {
      return {
        action: 'WORMHOLE_CROSS_CHAIN_TRANSFER',
        confidence: 0.6,
        params: {}
      };
    }
    
    if (isRedeem) {
      return {
        action: 'WORMHOLE_CROSS_CHAIN_REDEEM',
        confidence: 0.6,
        params: {}
      };
    }
    
    return null;
  }
};

/**
 * Export all Wormhole providers
 */
export const providers = [
  wormholeProvider
];

export default providers; 