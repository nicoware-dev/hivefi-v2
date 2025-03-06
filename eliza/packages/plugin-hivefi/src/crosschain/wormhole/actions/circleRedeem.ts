import { elizaLogger, IAgentRuntime, Action, ActionExample, Memory, State, HandlerCallback } from '@elizaos/core';
import { redeemCircleUSDC, getTransferReceipt, storeTransferReceipt } from '../api/circleTransfer';
import { extractChain, extractTransactionId } from '../utils';

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
    let destinationChain = extractChain(text);
    logger.info(`Extracted chain: ${destinationChain}`);
    
    // Extract source chain if specified
    let sourceChain = 'ethereum'; // Default to ethereum
    
    // Check for "from X to Y" pattern
    const fromToPattern = /from\s+(\w+)\s+to\s+(\w+)/i;
    const fromToMatch = text.match(fromToPattern);
    
    if (fromToMatch && fromToMatch.length >= 3) {
      sourceChain = fromToMatch[1].toLowerCase();
      // Update destination chain from the pattern as well
      destinationChain = fromToMatch[2].toLowerCase();
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
    
    try {
      // Call the redeemCircleUSDC function with the extracted parameters
      const result = await redeemCircleUSDC(runtime, {
        chain: destinationChain,
        transactionId: transactionId,
        token: 'USDC',
        sourceChain: sourceChain // Pass the source chain to the redeem function
      });
      
      // Update the state with the last Circle transfer
      state.lastCircleTransfer = {
        txHash: transactionId,
        sourceChain: sourceChain,
        destinationChain: destinationChain,
        amount: receipt?.amount || '0.01',
        token: 'USDC'
      };
      
      // Return a success message
      return {
        text: `Let's proceed with redeeming your USDC transfer from the Circle Bridge using the provided transaction ID ${transactionId} on the ${destinationChain} network. This will finalize the transfer and make the USDC available in your destination wallet. Please hold on while I process the redemption.`,
        followUp: {
          text: `I've successfully submitted the redemption transaction for your USDC transfer. You can track it here: ${result.explorerLink}\n\nTransaction hash: ${result.txHash}\n\n${result.message || 'The USDC redemption transaction has been submitted successfully. It may take a few minutes to complete.'}`,
          data: result
        }
      };
    } catch (error: any) {
      logger.error(`Error redeeming Circle USDC transfer: ${error.message}`);
      
      // Return an error message
      return {
        text: `Let's proceed with redeeming your USDC transfer from the Circle Bridge using the provided transaction ID ${transactionId} on the ${destinationChain} network. This will finalize the transfer and make the USDC available in your destination wallet. Please hold on while I process the redemption.`,
        followUp: {
          text: `There was an error redeeming your Circle USDC transfer on ${destinationChain}: ${error.message}. Please try again later or contact support.`,
          data: { error: error.message }
        }
      };
    }
  },
  validate: async (runtime) => {
    // No specific validation needed for Circle redemptions
    return true;
  }
};