import { elizaLogger, IAgentRuntime, Action, ActionExample, Memory, State, HandlerCallback } from '@elizaos/core';
import { redeemCircleUSDC, getTransferReceipt, storeTransferReceipt } from '../api/circleTransfer';
import { extractChain, extractTransactionId } from '../utils';
import { WormholeChain } from '../types';

const logger = elizaLogger.child({ module: 'CircleRedeemAction' });

// Define the state interface
interface CircleTransferState {
  lastCircleTransfer?: {
    txHash: string;
    sourceChain: string;
    destinationChain: string;
    amount: string;
    token: string;
  };
}

/**
 * Action for redeeming USDC transfers made using Circle Bridge
 */
export const circleRedeemAction: Action = {
  name: 'CIRCLE_USDC_REDEEM',
  description: 'Redeem USDC transfers made using Circle Bridge',
  similes: [
    'CIRCLE_USDC_REDEEM',
    'Claim USDC from Circle Bridge',
    'Complete Circle USDC transfer',
    'Finalize CCTP USDC transfer',
    'Receive Circle-bridged USDC'
  ],
  examples: [
    [
      {
        user: 'user',
        content: {
          text: 'Redeem my USDC transfer from Circle Bridge with transaction ID 0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef on Polygon'
        }
      },
      {
        user: 'assistant',
        content: {
          text: 'I\'ll redeem your Circle USDC transfer on Polygon. Processing now...'
        }
      },
      {
        user: 'assistant',
        content: {
          text: 'Your Circle USDC transfer has been redeemed on Polygon. The USDC should now be available in your wallet.'
        }
      }
    ]
  ],
  handler: async (runtime, message, state, options, callback) => {
    // Extract the text from the message object
    const text = message?.content?.text || '';
    
    logger.info(`Processing Circle USDC redeem request: "${text}"`);
    logger.info(`Extracting parameters from message text: "${text}"`);
    
    // Extract transaction ID
    const transactionId = extractTransactionId(text);
    logger.info(`Extracted transaction ID: ${transactionId}`);
    
    // Extract destination chain
    let destinationChain = extractChain(text) as WormholeChain;
    logger.info(`Extracted chain: ${destinationChain}`);
    
    // Extract source chain if specified
    let sourceChain = 'ethereum' as WormholeChain; // Default to ethereum
    
    // Extract source and destination chains from the message
    const fromToMatch = text.match(/from\s+(\w+)\s+to\s+(\w+)/i);
    if (fromToMatch) {
      // Convert to WormholeChain type
      sourceChain = fromToMatch[1].toLowerCase() as WormholeChain;
      // Update destination chain from the pattern as well
      destinationChain = fromToMatch[2].toLowerCase() as WormholeChain;
      logger.info(`Extracted source chain from message: ${sourceChain}`);
      logger.info(`Updated destination chain from message: ${destinationChain}`);
    }
    
    // Check if we have a transaction ID
    if (!transactionId) {
      return {
        text: "I need a transaction ID to redeem your Circle USDC transfer. Please provide the transaction ID and specify both the source and destination chains, for example: 'Redeem my USDC transfer from Polygon to Arbitrum with transaction ID 0x1234...'"
      };
    }
    
    // Check if we have a destination chain
    if (!destinationChain) {
      return {
        text: `I need to know which chain to redeem your USDC on for transaction ID ${transactionId}. Please specify both the source and destination chains, for example: 'Redeem my USDC transfer from Polygon to Arbitrum with transaction ID ${transactionId}'`
      };
    }
    
    // Get existing receipt or create a new one
    let receipt = getTransferReceipt(transactionId);
    
    if (receipt) {
      logger.info(`Transfer receipt: ${JSON.stringify(receipt)}`);
    } else {
      // Create a new receipt with the source chain from the message
      receipt = {
        type: 'circle',
        sourceTxHash: transactionId,
        sourceChain: sourceChain,
        destinationChain: destinationChain,
        amount: '0.01',
        token: 'USDC',
        status: 'completed',
        timestamp: Date.now(),
        messageBytes: null,
        messageHash: null
      };
      
      // Store the receipt
      storeTransferReceipt(transactionId, receipt);
      logger.info(`Created new receipt with source chain ${sourceChain}: ${JSON.stringify(receipt)}`);
    }
    
    // Call the redeem function
    try {
      const result = await redeemCircleUSDC(runtime, {
        chain: destinationChain,
        transactionId,
        sourceChain: sourceChain // Pass the source chain to the redeem function
      });
      
      // If the attestation is not ready yet, provide a helpful message
      if (result.status === 'pending') {
        // Get the message hash from the result or use the transaction ID as fallback
        const messageHashForLink = result.messageHash || transactionId;
        
        callback?.({
          text: `The attestation for your Circle USDC transfer is not ready yet. This is normal and typically takes 5-10 minutes.\n\nTransaction ID: ${transactionId}\nSource Chain: ${sourceChain}\nDestination Chain: ${destinationChain}\n\nYou can check the status at: https://iris-api.circle.com/attestations/${messageHashForLink}\n\nPlease try redeeming again in a few minutes by saying:\n"Redeem my USDC transfer from ${sourceChain} to ${destinationChain} with transaction ID ${transactionId}"`
        });
        
        return {
          type: 'text',
          content: `The attestation for your Circle USDC transfer is not ready yet. This is normal and typically takes 5-10 minutes.\n\nTransaction ID: ${transactionId}\nSource Chain: ${sourceChain}\nDestination Chain: ${destinationChain}\n\nYou can check the status at: https://iris-api.circle.com/attestations/${messageHashForLink}\n\nPlease try redeeming again in a few minutes by saying:\n"Redeem my USDC transfer from ${sourceChain} to ${destinationChain} with transaction ID ${transactionId}"`,
          state: {
            lastCircleTransfer: {
              txHash: transactionId,
              sourceChain: sourceChain,
              destinationChain: destinationChain,
              messageHash: messageHashForLink
            }
          }
        };
      }
      
      // If redemption was successful, provide a success message
      callback?.({
        text: `✅ Successfully redeemed your USDC transfer!\n\n💰 Transaction: ${result.txHash}\n🔗 Explorer: ${result.explorerLink}\n\nYour USDC should now be available in your wallet on ${destinationChain}.`
      });
      
      // Update the state with the last Circle transfer
      if (state) {
        state.lastCircleTransfer = {
          txHash: transactionId,
          sourceChain: sourceChain,
          destinationChain: destinationChain,
          status: 'redeemed'
        };
      }
      
      return {
        type: 'text',
        content: `✅ Successfully redeemed your USDC transfer!\n\n💰 Transaction: ${result.txHash}\n🔗 Explorer: ${result.explorerLink}\n\nYour USDC should now be available in your wallet on ${destinationChain}.`,
        state: {
          lastCircleTransfer: {
            txHash: transactionId,
            sourceChain: sourceChain,
            destinationChain: destinationChain,
            status: 'redeemed'
          }
        }
      };
    } catch (error: any) {
      logger.error(`Error redeeming Circle USDC transfer: ${error.message}`);
      
      // Check if the error is related to the attestation not being ready
      if (error.message.includes('attestation') || error.message.includes('not ready') || error.message.includes('pending')) {
        callback?.({
          text: `The attestation for your Circle USDC transfer is not ready yet. This is normal and typically takes 5-10 minutes.\n\nTransaction ID: ${transactionId}\nSource Chain: ${sourceChain}\nDestination Chain: ${destinationChain}\n\nPlease try redeeming again in a few minutes by saying:\n"Redeem my USDC transfer from ${sourceChain} to ${destinationChain} with transaction ID ${transactionId}"`
        });
        
        return {
          type: 'text',
          content: `The attestation for your Circle USDC transfer is not ready yet. This is normal and typically takes 5-10 minutes.\n\nTransaction ID: ${transactionId}\nSource Chain: ${sourceChain}\nDestination Chain: ${destinationChain}\n\nPlease try redeeming again in a few minutes by saying:\n"Redeem my USDC transfer from ${sourceChain} to ${destinationChain} with transaction ID ${transactionId}"`,
          state: {
            lastCircleTransfer: {
              txHash: transactionId,
              sourceChain: sourceChain,
              destinationChain: destinationChain
            }
          }
        };
      }
      
      // For other errors, return a generic error message
      return {
        type: 'text',
        content: `There was an error redeeming your Circle USDC transfer: ${error.message}`
      };
    }
  },
  validate: async (runtime) => {
    // No specific validation needed for Circle redemptions
    return true;
  }
};