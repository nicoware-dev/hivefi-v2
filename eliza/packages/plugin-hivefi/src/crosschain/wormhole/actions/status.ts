import { Action, ActionExample } from '@elizaos/core';
import { extractTransactionId } from '../utils';
import { checkTransferStatus, checkRedeemStatus, getTransferReceipt, getRedeemReceipt } from '../api';

/**
 * Action definition for checking the status of Wormhole transfers and redemptions
 */
export const statusAction: Action = {
  name: 'WORMHOLE_CROSS_CHAIN_STATUS',
  description: 'Check the status of a Wormhole cross-chain transfer or redemption',
  similes: [
    'Check Wormhole transfer status',
    'Track Wormhole transaction',
    'Get Wormhole transfer progress',
    'Monitor Wormhole bridge status',
    'View Wormhole transaction status'
  ],
  examples: [
    [
      {
        user: 'user',
        content: {
          text: 'What\'s the status of my Wormhole transfer with transaction hash 0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef?'
        }
      }
    ],
    [
      {
        user: 'user',
        content: {
          text: 'Check the status of my Wormhole redemption with transaction 0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef'
        }
      }
    ],
    [
      {
        user: 'user',
        content: {
          text: 'Has my Wormhole transfer completed yet? Transaction ID: 0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef'
        }
      }
    ]
  ],
  handler: async (runtime, message, state) => {
    console.log('[Wormhole Status] Processing status request:', message.content.text);
    
    try {
      // Extract parameters from the message
      const text = message.content.text || '';
      console.log('[Wormhole Status] Extracting parameters from message text:', text);
      
      // Extract transaction ID
      const transactionId = extractTransactionId(text);
      console.log('[Wormhole Status] Extracted transaction ID:', transactionId);
      
      // Validate transaction ID
      if (!transactionId) {
        console.log('[Wormhole Status] Missing transaction ID');
        return {
          type: 'text',
          content: 'Please provide the transaction ID of the Wormhole transfer or redemption you want to check.'
        };
      }
      
      // Check if this is a transfer or redemption
      const transferReceipt = getTransferReceipt(transactionId);
      const redeemReceipt = getRedeemReceipt(transactionId);
      
      if (transferReceipt) {
        // This is a transfer
        console.log('[Wormhole Status] Found transfer receipt for transaction:', transactionId);
        
        // Check the status
        const status = await checkTransferStatus(transactionId);
        console.log('[Wormhole Status] Transfer status:', status);
        
        // Format the response based on the status
        let response = `Status of your Wormhole transfer (${transactionId}):\n\n`;
        
        switch (status.status) {
          case 'completed':
            response += `✅ Transfer completed successfully!\n\n`;
            response += `Token: ${transferReceipt.token || 'Native'}\n`;
            response += `Amount: ${transferReceipt.amount}\n`;
            response += `From: ${transferReceipt.sourceChain}\n`;
            response += `To: ${transferReceipt.destinationChain}\n`;
            break;
          case 'attested':
            response += `🔄 Transfer attested and ready for redemption.\n\n`;
            response += `Token: ${transferReceipt.token || 'Native'}\n`;
            response += `Amount: ${transferReceipt.amount}\n`;
            response += `From: ${transferReceipt.sourceChain}\n`;
            response += `To: ${transferReceipt.destinationChain}\n\n`;
            response += `You can now redeem your tokens on ${transferReceipt.destinationChain} by saying "Redeem my tokens on ${transferReceipt.destinationChain} from transaction ${transactionId}".`;
            break;
          case 'pending':
            response += `⏳ Transfer in progress.\n\n`;
            response += `Token: ${transferReceipt.token || 'Native'}\n`;
            response += `Amount: ${transferReceipt.amount}\n`;
            response += `From: ${transferReceipt.sourceChain}\n`;
            response += `To: ${transferReceipt.destinationChain}\n\n`;
            response += `The transfer is being processed. This can take a few minutes. Please check back later.`;
            break;
          case 'error':
            response += `❌ Error with transfer: ${status.message}\n\n`;
            response += `Token: ${transferReceipt.token || 'Native'}\n`;
            response += `Amount: ${transferReceipt.amount}\n`;
            response += `From: ${transferReceipt.sourceChain}\n`;
            response += `To: ${transferReceipt.destinationChain}\n\n`;
            response += `Please try again or contact support if the issue persists.`;
            break;
          default:
            response += `Status: ${status.status}\n`;
            response += `Message: ${status.message}\n\n`;
            response += `Token: ${transferReceipt.token || 'Native'}\n`;
            response += `Amount: ${transferReceipt.amount}\n`;
            response += `From: ${transferReceipt.sourceChain}\n`;
            response += `To: ${transferReceipt.destinationChain}`;
        }
        
        return {
          type: 'text',
          content: response
        };
      } else if (redeemReceipt) {
        // This is a redemption
        console.log('[Wormhole Status] Found redeem receipt for transaction:', transactionId);
        
        // Check the status
        const status = await checkRedeemStatus(transactionId);
        console.log('[Wormhole Status] Redeem status:', status);
        
        // Format the response based on the status
        let response = `Status of your Wormhole redemption (${transactionId}):\n\n`;
        
        switch (status.status) {
          case 'completed':
          case 'confirmed':
            response += `✅ Redemption completed successfully!\n\n`;
            response += `Token: ${redeemReceipt.token || 'Native'}\n`;
            response += `Chain: ${redeemReceipt.chain}\n`;
            response += `Source Transaction: ${redeemReceipt.sourceTransactionId}\n`;
            break;
          case 'pending':
            response += `⏳ Redemption in progress.\n\n`;
            response += `Token: ${redeemReceipt.token || 'Native'}\n`;
            response += `Chain: ${redeemReceipt.chain}\n`;
            response += `Source Transaction: ${redeemReceipt.sourceTransactionId}\n\n`;
            response += `The redemption is being processed. This can take a few minutes. Please check back later.`;
            break;
          case 'failed':
            response += `❌ Redemption failed.\n\n`;
            response += `Token: ${redeemReceipt.token || 'Native'}\n`;
            response += `Chain: ${redeemReceipt.chain}\n`;
            response += `Source Transaction: ${redeemReceipt.sourceTransactionId}\n\n`;
            response += `Please try again or contact support if the issue persists.`;
            break;
          default:
            response += `Status: ${status.status}\n`;
            response += `Message: ${status.message}\n\n`;
            response += `Token: ${redeemReceipt.token || 'Native'}\n`;
            response += `Chain: ${redeemReceipt.chain}\n`;
            response += `Source Transaction: ${redeemReceipt.sourceTransactionId}`;
        }
        
        return {
          type: 'text',
          content: response
        };
      } else {
        // Transaction not found
        console.log('[Wormhole Status] Transaction not found:', transactionId);
        
        return {
          type: 'text',
          content: `I couldn't find any Wormhole transfers or redemptions with transaction ID ${transactionId}. Please make sure you've entered the correct transaction ID.`
        };
      }
    } catch (error: any) {
      console.error('[Wormhole Status] Error checking status:', error);
      
      return {
        type: 'text',
        content: `There was an error checking the status of your Wormhole transaction: ${error.message || 'Unknown error'}`
      };
    }
  },
  validate: async (runtime) => {
    // No specific validation needed for checking status
    return true;
  }
};