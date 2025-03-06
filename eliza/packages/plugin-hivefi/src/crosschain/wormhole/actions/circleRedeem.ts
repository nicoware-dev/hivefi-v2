import { elizaLogger, IAgentRuntime, Action, ActionExample } from '@elizaos/core';
import { redeemCircleUSDC, checkCircleTransferStatus } from '../api/circleTransfer';
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
          text: 'Redeem my USDC transfer from Circle Bridge with transaction ID 0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef'
        }
      },
      {
        user: 'assistant',
        content: {
          text: 'I\'m processing your Circle USDC redemption request. Please wait...'
        }
      },
      {
        user: 'assistant',
        content: {
          text: 'Your USDC has been successfully redeemed. Transaction Hash: {hash}'
        }
      }
    ],
    [
      {
        user: 'user',
        content: {
          text: 'Claim my USDC on Polygon from Circle Bridge'
        }
      }
    ]
  ],
  handler: async (runtime, message, state, options, callback) => {
    // Cast state to our interface
    const circleState = state as CircleTransferState | undefined;
    
    logger.info(`Processing Circle USDC redeem request: "${message.content.text}"`);
    
    try {
      // Extract parameters from message text
      const text = message.content.text || '';
      logger.info(`Extracting parameters from message text: "${text}"`);
      
      // Extract chain
      const chain = extractChain(text);
      if (!chain) {
        return {
          type: 'text',
          content: 'I couldn\'t determine which chain you want to redeem your USDC on. Please specify a chain in your message.'
        };
      }
      logger.info(`Extracted chain: ${chain}`);
      
      // Extract transaction ID
      const transactionId = extractTransactionId(text);
      if (!transactionId) {
        // If no transaction ID is provided, check if there's a recent transfer in the state
        if (circleState && circleState.lastCircleTransfer && circleState.lastCircleTransfer.txHash) {
          logger.info(`Using transaction ID from state: ${circleState.lastCircleTransfer.txHash}`);
          
          // Send initial processing message
          callback?.({
            text: `I'm checking the status of your Circle USDC transfer from ${circleState.lastCircleTransfer.sourceChain} to ${circleState.lastCircleTransfer.destinationChain}. Please wait...`
          });
          
          // Check the status of the transfer
          const status = await checkCircleTransferStatus(circleState.lastCircleTransfer.txHash);
          
          if (status.status === 'pending') {
            return {
              type: 'text',
              content: `⏱️ Your Circle USDC transfer is still in progress.\n\n${status.message}\n\nPlease try again in a few minutes. Circle transfers typically take 5-10 minutes to complete.`
            };
          }
          
          // Send redemption processing message
          callback?.({
            text: `I'm now redeeming your USDC transfer on ${chain}. Please wait while I process this transaction...`
          });
          
          // Proceed with redemption using the transaction ID from state
          const result = await redeemCircleUSDC(runtime, {
            chain: chain,
            transactionId: circleState.lastCircleTransfer.txHash
          });
          
          // Send success message
          callback?.({
            text: `✅ ${result.message}\n\n🔗 Transaction: ${result.explorerLink}\n📝 Hash: ${result.txHash}\n\n${result.status === 'redeemed' ? '🎉 Your USDC is now available in your wallet!' : `⏱️ Status: ${result.status}`}`
          });
          
          return {
            type: 'text',
            content: `✅ ${result.message}\n\n🔗 Transaction: ${result.explorerLink}\n📝 Hash: ${result.txHash}\n\n${result.status === 'redeemed' ? '🎉 Your USDC is now available in your wallet!' : `⏱️ Status: ${result.status}`}`
          };
        }
        
        return {
          type: 'text',
          content: 'I couldn\'t find a transaction ID in your message. Please provide a transaction ID for the Circle USDC transfer you want to redeem.'
        };
      }
      
      logger.info(`Extracted transaction ID: ${transactionId}`);
      
      // All parameters validated, proceed with redemption
      logger.info('All parameters validated, proceeding with Circle USDC redemption');
      
      // Send initial processing message
      callback?.({
        text: `I'm processing your Circle USDC redemption request for transaction ${transactionId} on ${chain}. Please wait...`
      });
      
      // Call the redeem function
      const redeemParams = {
        chain,
        transactionId
      };
      
      logger.info(`Calling redeemCircleUSDC with params: ${JSON.stringify(redeemParams)}`);
      const result = await redeemCircleUSDC(runtime, redeemParams);
      
      // Send success message
      callback?.({
        text: `✅ ${result.message}\n\n🔗 Transaction: ${result.explorerLink}\n📝 Hash: ${result.txHash}\n\n${result.status === 'redeemed' ? '🎉 Your USDC is now available in your wallet!' : `⏱️ Status: ${result.status}`}`
      });
      
      // Return success message with transaction hash and explorer link
      return {
        type: 'text',
        content: `✅ ${result.message}\n\n🔗 Transaction: ${result.explorerLink}\n📝 Hash: ${result.txHash}\n\n${result.status === 'redeemed' ? '🎉 Your USDC is now available in your wallet!' : `⏱️ Status: ${result.status}`}`
      };
    } catch (error: any) {
      logger.error(`Error during Circle USDC redemption: ${error.message}`);
      
      // Return error message
      return {
        type: 'text',
        content: `There was an error with your Circle USDC redemption: ${error.message}`
      };
    }
  },
  validate: async (runtime) => {
    // No specific validation needed for Circle redemptions
    return true;
  }
}; 