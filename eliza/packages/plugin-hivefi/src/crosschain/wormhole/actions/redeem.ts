import { Action, ActionExample } from '@elizaos/core';
import { extractToken, extractTransactionId, isRedeemRequest } from '../utils';
import { redeemTokens, isChainSupported, isTokenSupported } from '../api';
import { RedeemParams, WormholeChain } from '../types';

/**
 * Action definition for redeeming tokens transferred via Wormhole
 */
export const redeemAction: Action = {
  name: 'WORMHOLE_CROSS_CHAIN_REDEEM',
  description: 'Redeem tokens that have been transferred between blockchains via the Wormhole cross-chain protocol.',
  similes: [
    'Claim tokens from Wormhole cross-chain transfer',
    'Complete Wormhole cross-chain transaction',
    'Finalize Wormhole token bridge transfer',
    'Receive tokens from Wormhole bridge',
    'Collect tokens from Wormhole cross-chain transfer'
  ],
  examples: [
    [
      {
        user: 'user',
        content: {
          text: 'Redeem my ETH tokens from Wormhole on Solana'
        }
      }
    ],
    [
      {
        user: 'user',
        content: {
          text: 'Claim my USDC tokens on Solana from Wormhole bridge with transaction ID 0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef'
        }
      }
    ],
    [
      {
        user: 'user',
        content: {
          text: 'Complete my Wormhole transfer of USDC from Ethereum to Polygon'
        }
      }
    ]
  ],
  handler: async (runtime, message, state) => {
    console.log('[Wormhole Redeem] Processing redeem request:', message.content.text);
    
    try {
      // Extract parameters from the message
      const text = message.content.text || '';
      console.log('[Wormhole Redeem] Extracting parameters from message text:', text);
      
      // Check if this is a redeem request
      if (!isRedeemRequest(text)) {
        console.log('[Wormhole Redeem] Not a redeem request, skipping');
        return null;
      }
      
      // Extract chain
      const chainMatch = text.match(/on\s+(\w+(?:\s+\w+)?)/i);
      const chainRaw = chainMatch ? chainMatch[1].toLowerCase() : undefined;
      // Clean up the chain by removing any trailing words like "from", "via", etc.
      const chain = chainRaw ? chainRaw.replace(/\s+(from|via|with|through|using)\s*.*$/, '').trim() : undefined;
      console.log('[Wormhole Redeem] Extracted chain:', chain);
      
      // Extract token
      const token = extractToken(text);
      console.log('[Wormhole Redeem] Extracted token:', token);
      
      // Extract transaction ID
      const transactionId = extractTransactionId(text);
      console.log('[Wormhole Redeem] Extracted transaction ID:', transactionId);
      
      // If no chain is specified, ask the user to specify one
      if (!chain) {
        console.log('[Wormhole Redeem] Missing chain parameter');
        return {
          type: 'text',
          content: `I need to know which chain you want to redeem your Wormhole transfer tokens on. Please specify a chain like "Redeem my Wormhole tokens on Ethereum".`
        };
      }
      
      // Validate chain
      if (!isChainSupported(chain)) {
        console.log('[Wormhole Redeem] Invalid chain:', chain);
        return {
          type: 'text',
          content: `Sorry, ${chain} is not supported for Wormhole redemption. Supported chains include: ${Object.values(WormholeChain).join(', ')}.`
        };
      }
      
      // Validate token if specified
      if (token && !isTokenSupported(token, chain)) {
        console.log('[Wormhole Redeem] Invalid token:', token, 'for chain:', chain);
        return {
          type: 'text',
          content: `The token ${token} is not supported for Wormhole redemption on ${chain}. Please specify a supported token.`
        };
      }
      
      // Validate transaction ID
      if (!transactionId) {
        console.log('[Wormhole Redeem] Missing transaction ID');
        return {
          type: 'text',
          content: 'Please provide the transaction ID of the transfer you want to redeem.'
        };
      }
      
      // Perform the redemption
      const params: RedeemParams = {
        chain,
        token,
        transactionId
      };
      
      console.log('[Wormhole Redeem] All parameters validated, proceeding with redemption');
      console.log('[Wormhole Redeem] Calling redeemTokens with params:', params);
      
      const txHash = await redeemTokens(runtime, params);
      console.log('[Wormhole Redeem] Redemption successful, transaction hash:', txHash);
      
      const tokenDisplay = token ? ` ${token}` : '';
      
      return {
        type: 'text',
        content: `Successfully redeemed${tokenDisplay} tokens from Wormhole cross-chain transfer on ${chain}.\n\nTransaction hash: ${txHash}\n\nYour tokens should be available in your wallet shortly.`
      };
    } catch (error: any) {
      console.error('[Wormhole Redeem] Error during redemption:', error);
      
      return {
        type: 'text',
        content: `There was an error processing your Wormhole redemption: ${error.message || 'Unknown error'}`
      };
    }
  },
  validate: async (runtime) => {
    // Check if the required environment variables are set
    const privateKey = runtime.getSetting('EVM_PRIVATE_KEY') || runtime.getSetting('WALLET_PRIVATE_KEY');
    return typeof privateKey === 'string' && privateKey.startsWith('0x');
  }
}; 