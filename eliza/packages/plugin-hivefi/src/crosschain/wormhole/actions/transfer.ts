import { Action, ActionExample } from '@elizaos/core';
import { TransferParams, WormholeChain, WormholeToken } from '../types';
import { extractChain, extractAmount, extractToken, isTransferRequest } from '../utils';
import { transferTokens, isChainSupported, isTokenSupported } from '../api';

/**
 * Action to transfer tokens across chains using Wormhole
 */
export const transferAction: Action = {
  name: 'WORMHOLE_CROSS_CHAIN_TRANSFER',
  description: 'Transfer tokens between different blockchains using the Wormhole cross-chain protocol',
  similes: [
    'Cross-chain token transfer via Wormhole',
    'Bridge tokens between blockchains using Wormhole',
    'Move tokens across different networks with Wormhole',
    'Wormhole cross-chain bridge transfer'
  ],
  examples: [
    [
      {
        user: 'user',
        content: {
          text: 'Transfer 0.01 ETH from Ethereum to Polygon using Wormhole'
        }
      }
    ],
    [
      {
        user: 'user',
        content: {
          text: 'Send 0.001 USDC from Ethereum to Solana via Wormhole bridge'
        }
      }
    ],
    [
      {
        user: 'user',
        content: {
          text: 'Transfer 0.01 USDT from Mantle to BSC via Wormhole'
        }
      }
    ],
    [
      {
        user: 'user',
        content: {
          text: 'Bridge 0.005 BNB from BSC to Mantle using Wormhole'
        }
      }
    ]
  ],
  handler: async (runtime, message, state) => {
    console.log('[Wormhole Transfer] Processing transfer request:', message.content.text);
    
    try {
      // Extract parameters from the message
      const text = message.content.text || '';
      console.log('[Wormhole Transfer] Extracting parameters from message text:', text);
      
      // Check if this is a transfer request
      if (!isTransferRequest(text)) {
        console.log('[Wormhole Transfer] Not a transfer request, skipping');
        return null;
      }
      
      // Extract source chain
      let sourceChain;
      if (text.toLowerCase().includes('from')) {
        const fromPart = text.toLowerCase().split('from')[1]?.split('to')[0] || '';
        sourceChain = extractChain(fromPart);
        console.log('[Wormhole Transfer] Extracted source chain from "from" part:', sourceChain);
      }
      
      // If source chain wasn't found, try to extract it from the entire text
      if (!sourceChain) {
        sourceChain = extractChain(text);
        console.log('[Wormhole Transfer] Extracted source chain from entire text:', sourceChain);
      }
      
      // Extract destination chain
      let destinationChain;
      if (text.toLowerCase().includes('to')) {
        const toPart = text.toLowerCase().split('to')[1] || '';
        destinationChain = extractChain(toPart);
        console.log('[Wormhole Transfer] Extracted destination chain from "to" part:', destinationChain);
      }
      
      // If destination chain wasn't found, try to extract it from the entire text
      if (!destinationChain && sourceChain) {
        // If we have a source chain, look for another chain mention
        const allChains = Object.values(WormholeChain);
        for (const chain of allChains) {
          if (chain !== sourceChain && text.toLowerCase().includes(chain.toLowerCase())) {
            destinationChain = chain;
            console.log('[Wormhole Transfer] Found destination chain from entire text:', destinationChain);
            break;
          }
        }
      }
      
      // Extract amount
      const amount = extractAmount(text);
      console.log('[Wormhole Transfer] Extracted amount:', amount);
      
      // Extract token
      const token = extractToken(text);
      console.log('[Wormhole Transfer] Extracted token:', token);
      
      // Validate parameters
      if (!sourceChain) {
        console.log('[Wormhole Transfer] Missing source chain parameter');
        return {
          type: 'text',
          content: 'Please specify the source blockchain for your Wormhole transfer. For example: "Transfer 0.01 ETH from Ethereum to Solana using Wormhole"'
        };
      }
      
      if (!destinationChain) {
        console.log('[Wormhole Transfer] Missing destination chain parameter');
        return {
          type: 'text',
          content: 'Please specify the destination blockchain for your Wormhole transfer. For example: "Transfer 0.01 ETH from Ethereum to Solana using Wormhole"'
        };
      }
      
      if (!amount) {
        console.log('[Wormhole Transfer] Missing amount parameter');
        return {
          type: 'text',
          content: 'Please specify the amount of tokens to transfer. For example: "Transfer 0.01 ETH from Ethereum to Solana using Wormhole"'
        };
      }
      
      // Validate source chain
      if (!isChainSupported(sourceChain)) {
        console.log('[Wormhole Transfer] Invalid source chain:', sourceChain);
        return {
          type: 'text',
          content: `Sorry, ${sourceChain} is not supported as a source chain for Wormhole transfers. Supported chains include: ${Object.values(WormholeChain).join(', ')}.`
        };
      }
      
      // Validate destination chain
      if (!isChainSupported(destinationChain)) {
        console.log('[Wormhole Transfer] Invalid destination chain:', destinationChain);
        return {
          type: 'text',
          content: `Sorry, ${destinationChain} is not supported as a destination chain for Wormhole transfers. Supported chains include: ${Object.values(WormholeChain).join(', ')}.`
        };
      }
      
      // Validate token if specified
      if (token && !isTokenSupported(token, sourceChain)) {
        console.log('[Wormhole Transfer] Invalid token:', token, 'for chain:', sourceChain);
        return {
          type: 'text',
          content: `Sorry, ${token} is not supported for Wormhole transfers from ${sourceChain}. Please try a different token.`
        };
      }
      
      // Prepare transfer parameters
      const params: TransferParams = {
        sourceChain,
        destinationChain,
        amount,
        token
      };
      
      console.log('[Wormhole Transfer] All parameters validated, proceeding with transfer');
      console.log('[Wormhole Transfer] Calling transferTokens with params:', params);
      
      // Call the API to transfer tokens
      const result = await transferTokens(runtime, params);
      console.log('[Wormhole Transfer] Transfer initiated, transaction hash:', result.txHash);
      
      // Return success response
      const tokenDisplay = token && token !== 'NATIVE' ? ` ${token}` : '';
      
      return {
        type: 'text',
        content: `Successfully initiated cross-chain transfer of ${amount}${tokenDisplay} from ${sourceChain} to ${destinationChain} via Wormhole.\n\nTransaction hash: ${result.txHash}\nTransaction link: ${result.explorerLink}\n\nThe transfer is being processed and should be completed shortly. You can redeem your tokens on the destination chain once the transfer is complete by saying "Redeem my tokens on ${destinationChain} from transaction ${result.txHash}".`
      };
    } catch (error: any) {
      console.error('[Wormhole Transfer] Error during transfer:', error);
      
      // Provide a more detailed error message based on the error type
      let errorMessage = error.message || 'Unknown error';
      let additionalInfo = '';
      
      if (errorMessage.includes('toUniversalAddress')) {
        errorMessage = 'Error formatting addresses for the Wormhole SDK';
        additionalInfo = 'This is likely an internal issue with the address format.';
      } else if (errorMessage.includes('exceeded maximum retry limit')) {
        errorMessage = 'Network connection issue with the blockchain RPC';
        additionalInfo = 'The RPC endpoint may be experiencing high traffic or rate limiting.';
      } else if (errorMessage.includes('insufficient funds')) {
        errorMessage = 'Insufficient funds for the transfer';
        additionalInfo = 'Please make sure you have enough tokens and gas for the transfer.';
      } else if (errorMessage.includes('not supported')) {
        // Already a clear error message about chain or token support
        additionalInfo = 'Please try a different chain or token combination.';
      }
      
      return {
        type: 'text',
        content: `There was an error processing your Wormhole transfer: ${errorMessage}\n\n${additionalInfo}\n\nPlease try again later or with different parameters.`
      };
    }
  },
  validate: async (runtime) => {
    // Check if the required environment variables are set
    const privateKey = runtime.getSetting('EVM_PRIVATE_KEY') || runtime.getSetting('WALLET_PRIVATE_KEY');
    return typeof privateKey === 'string' && privateKey.startsWith('0x');
  }
}; 