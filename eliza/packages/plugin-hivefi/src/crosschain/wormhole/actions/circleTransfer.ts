import { elizaLogger, IAgentRuntime, Action, ActionExample } from '@elizaos/core';
import { transferCircleUSDC, checkCircleTransferStatus } from '../api/circleTransfer';
import { extractChain, extractAmount, extractToken } from '../utils';

const logger = elizaLogger.child({ module: 'CircleTransferAction' });

/**
 * Action for transferring USDC between chains using Circle Bridge
 */
export const circleTransferAction: Action = {
  name: 'CIRCLE_USDC_TRANSFER',
  description: 'Transfer USDC between chains using Circle Bridge',
  similes: [
    'CIRCLE_USDC_TRANSFER',
    'Cross-chain USDC transfer via Circle Bridge',
    'Bridge USDC between blockchains using Circle',
    'Move USDC across different networks with CCTP',
    'Circle Cross-Chain Transfer Protocol USDC transfer'
  ],
  examples: [
    [
      {
        user: 'user',
        content: {
          text: 'Transfer 10 USDC from Ethereum to Polygon using Circle Bridge'
        }
      },
      {
        user: 'assistant',
        content: {
          text: 'The Circle USDC transfer has been initiated. You will receive a confirmation once the transaction is complete.'
        }
      },
      {
        user: 'assistant',
        content: {
          text: '10 USDC transferred from Ethereum to Polygon via Circle Bridge. Transaction Hash: {hash}'
        }
      }
    ],
    [
      {
        user: 'user',
        content: {
          text: 'Send 5 USDC from Arbitrum to Base via Circle'
        }
      }
    ]
  ],
  handler: async (runtime, message, state, options, callback) => {
    logger.info(`Processing Circle USDC transfer request: "${message.content.text}"`);
    
    try {
      // Extract parameters from message text
      const text = message.content.text || '';
      logger.info(`Extracting parameters from message text: "${text}"`);
      
      // Helper function to extract source and destination chains
      function extractSourceAndDestChains(text: string): { sourceChain?: string, destChain?: string } {
        const normalizedText = text.toLowerCase();
        
        // Extract source chain (after "from" keyword)
        const fromMatch = normalizedText.match(/from\s+([a-z0-9]+)/i);
        let sourceChain = fromMatch ? fromMatch[1] : undefined;
        
        // Extract destination chain (after "to" keyword)
        const toMatch = normalizedText.match(/to\s+([a-z0-9]+)/i);
        let destChain = toMatch ? toMatch[1] : undefined;
        
        // Handle common chain name variations
        if (sourceChain) {
          if (sourceChain === 'eth') sourceChain = 'ethereum';
          if (sourceChain === 'matic') sourceChain = 'polygon';
          if (sourceChain === 'avax') sourceChain = 'avalanche';
          if (sourceChain === 'bnb' || sourceChain === 'binance') sourceChain = 'bsc';
        }
        
        if (destChain) {
          if (destChain === 'eth') destChain = 'ethereum';
          if (destChain === 'matic') destChain = 'polygon';
          if (destChain === 'avax') destChain = 'avalanche';
          if (destChain === 'bnb' || destChain === 'binance') destChain = 'bsc';
        }
        
        return { sourceChain, destChain };
      }

      // Extract source and destination chains
      const { sourceChain, destChain } = extractSourceAndDestChains(text);
      if (!sourceChain) {
        return {
          type: 'text',
          content: 'I couldn\'t determine the source chain for your Circle USDC transfer. Please specify a source chain using "from [chain]" in your message.'
        };
      }
      logger.info(`Extracted source chain: ${sourceChain}`);
      
      if (!destChain) {
        return {
          type: 'text',
          content: 'I couldn\'t determine the destination chain for your Circle USDC transfer. Please specify a destination chain using "to [chain]" in your message.'
        };
      }
      logger.info(`Extracted destination chain: ${destChain}`);
      
      // Extract amount
      const amount = extractAmount(text);
      if (!amount) {
        return {
          type: 'text',
          content: 'I couldn\'t determine the amount for your Circle USDC transfer. Please specify an amount in your message.'
        };
      }
      logger.info(`Extracted amount: ${amount}`);
      
      // Extract token - should be USDC
      const token = extractToken(text);
      if (!token) {
        logger.info('No token specified, defaulting to USDC');
      } else if (token.toUpperCase() !== 'USDC') {
        return {
          type: 'text',
          content: `Circle Bridge only supports USDC transfers. You specified ${token}, but I can only transfer USDC.`
        };
      }
      logger.info(`Using token: USDC`);
      
      // All parameters validated, proceed with transfer
      logger.info('All parameters validated, proceeding with Circle USDC transfer');
      
      // Send initial confirmation message
      callback?.({
        text: `I'm initiating a Circle USDC transfer of ${amount} USDC from ${sourceChain} to ${destChain}. Please wait while I process this transaction...`
      });
      
      // Call the transfer function
      const transferParams = {
        sourceChain,
        destinationChain: destChain,
        amount,
        token: 'USDC'
      };
      
      logger.info(`Calling transferCircleUSDC with params: ${JSON.stringify(transferParams)}`);
      const result = await transferCircleUSDC(runtime, transferParams);
      
      // Send success message with transaction details
      callback?.({
        text: `✅ Successfully initiated USDC transfer via Circle Bridge!\n\n💰 Amount: ${amount} USDC\n🔄 From: ${sourceChain}\n🏁 To: ${destChain}\n\n🔗 Transaction: ${result.explorerLink}\n📝 Hash: ${result.txHash}\n\n⏱️ Estimated completion time: 5-10 minutes\n\n You can check the status of your crosschain transfer on https://iris-api.circle.com/attestations/${result.messageHash} \n\n ⚠️ Important: Circle transfers require a two-step process. After the transfer completes (5-10 minutes), you'll need to redeem your USDC on ${destChain} by saying:\n"Redeem my USDC transfer from ${sourceChain} to ${destChain} with transaction ID ${result.txHash}"`
      });
      
      // Store the transfer information in the state for later use
      return {
        type: 'text',
        content: `✅ Successfully initiated USDC transfer via Circle Bridge!\n\n💰 Amount: ${amount} USDC\n🔄 From: ${sourceChain}\n🏁 To: ${destChain}\n\n🔗 Transaction: ${result.explorerLink}\n📝 Hash: ${result.txHash}\n\n⏱️ Estimated completion time: 5-10 minutes\n\n You can check the status of your crosschain transfer on https://iris-api.circle.com/attestations/${result.messageHash} \n\n ⚠️ Important: Circle transfers require a two-step process. After the transfer completes (5-10 minutes), you'll need to redeem your USDC on ${destChain} by saying:\n"Redeem my USDC transfer from ${sourceChain} to ${destChain} with transaction ID ${result.txHash}"`,
        state: {
          lastCircleTransfer: {
            txHash: result.txHash,
            sourceChain: sourceChain,
            destinationChain: destChain,
            amount: amount,
            token: 'USDC'
          }
        }
      };
    } catch (error: any) {
      logger.error(`Error during Circle USDC transfer: ${error.message}`);
      
      // Return error message
      return {
        type: 'text',
        content: `There was an error with your Circle USDC transfer: ${error.message}`
      };
    }
  },
  validate: async (runtime) => {
    // No specific validation needed for Circle transfers
    return true;
  }
}; 