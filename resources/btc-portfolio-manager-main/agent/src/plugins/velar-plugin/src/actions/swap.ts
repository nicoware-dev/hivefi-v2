import { Action, IAgentRuntime, Memory, HandlerCallback, State, composeContext, generateObjectDeprecated, ModelClass } from '@elizaos/core';
import { extractSwapDetails } from './patterns';
import { swapTemplate } from '../template/swapTemplate.ts';
import { VelarSDK, ISwapService, SwapResponse, AmountOutResponse } from '@velarprotocol/velar-sdk';
import { openContractCall, ContractCallOptions } from '@stacks/connect';
import { AnchorMode } from '@stacks/transactions';
import type { StacksNetwork } from '@stacks/network';

export interface SwapParams {
  inToken: string;
  outToken: string;
  amount?: number;
  slippage?: number;
}

const buildSwapDetails = async (
  state: State,
  runtime: IAgentRuntime
): Promise<SwapParams> => {
  const context = composeContext({
    state,
    template: swapTemplate,
  });

  const swapDetails = (await generateObjectDeprecated({
    runtime,
    context,
    modelClass: ModelClass.SMALL,
  })) as SwapParams;

  return swapDetails;
};

export const SWAP_ACTION: Action = {
  name: 'VELAR_SWAP_ACTION',
  description: 'Handles requests to swap tokens using Velar on Stacks blockchain',
  similes: [
    'like exchanging one currency for another',
    'similar to trading baseball cards',
    'like converting dollars to euros',
    'comparable to bartering goods',
    'similar to exchanging gift cards'
  ],
  examples: [
    [
      {
        user: 'assistant',
        content: {
          text: "I'll help you swap tokens using Velar",
          action: 'VELAR_SWAP_ACTION'
        }
      },
      {
        user: 'user',
        content: {
          text: 'Swap 1 STX for VELAR',
          action: 'VELAR_SWAP_ACTION'
        }
      }
    ],
    [
      {
        user: 'assistant',
        content: {
          text: "I'll help you exchange tokens",
          action: 'VELAR_SWAP_ACTION'
        }
      },
      {
        user: 'user',
        content: {
          text: 'Exchange 50 LEO for ROCK tokens',
          action: 'VELAR_SWAP_ACTION'
        }
      }
    ]
  ],
  handler: async (
    runtime: IAgentRuntime,
    message: Memory,
    state: State,
    _options: any,
    callback?: HandlerCallback
  ) => {
    if (!state) {
      state = (await runtime.composeState(message)) as State;
    } else {
      state = await runtime.updateRecentMessageState(state);
    }

    try {
      console.log('Velar swap action handler called');

      const paramOptions = await buildSwapDetails(state, runtime);
      const { inToken, outToken, amount, slippage = 0.5 } = paramOptions;

      // Initialize Velar SDK
      const sdk = new VelarSDK();
      const account = runtime.getSetting('STACKS_ADDRESS');

      if (!account) {
        if (callback) {
          callback({
            text: 'Please connect your Stacks wallet first.',
            content: { error: 'No wallet connected' }
          });
        }
        return false;
      }

      // Get token contract addresses
      const inTokenContract = `SP1Y5YSTAHZ88XYK1VPDH24GY0HPX5J4JECTMY4A1.${inToken.toLowerCase()}`;
      const outTokenContract = `SP1Y5YSTAHZ88XYK1VPDH24GY0HPX5J4JECTMY4A1.${outToken.toLowerCase()}`;

      // Setup swap instance
      const swapInstance: ISwapService = await sdk.getSwapInstance({
        account,
        inToken: inTokenContract,
        outToken: outTokenContract
      });

      // If amount is not provided, get computed amount first
      if (!amount) {
        if (callback) {
          callback({
            text: 'How much would you like to swap?',
            content: { needsAmount: true }
          });
        }
        return true;
      }

      // Get computed amount to show expected output
      const computedAmount: AmountOutResponse = await swapInstance.getComputedAmount({
        amount: Number(amount),
        slippage: Number(slippage)
      });

      // Get swap options
      const swapOptions: SwapResponse = await swapInstance.swap({
        amount: Number(amount)
      });

      // Build contract call options
      const contractCallOptions: ContractCallOptions = {
        ...swapOptions,
        network: 'testnet',
        appDetails: {
          name: 'Bitcoin Portfolio Management',
          icon: 'https://bob.io/icon.png'
        },
        anchorMode: AnchorMode.Any,
        onFinish: (data: any) => {
          if (callback) {
            callback({
              text: `Swap transaction submitted! Transaction ID: ${data.txId}`,
              content: { 
                success: true,
                txId: data.txId
              }
            });
          }
        },
        onCancel: () => {
          if (callback) {
            callback({
              text: 'Swap transaction cancelled.',
              content: { cancelled: true }
            });
          }
        }
      };

      // Show preview and ask for confirmation
      if (callback) {
        callback({
          text: `You'll be swapping ${amount} ${inToken} for approximately ${computedAmount.value} ${outToken} (slippage: ${slippage}%).\n\nWould you like to proceed with the swap?`,
          content: {
            preview: true,
            inToken,
            outToken,
            amount,
            expectedOutput: computedAmount.value,
            slippage
          }
        });
      }

      // Open contract call
      await openContractCall(contractCallOptions);
      return true;

    } catch (error) {
      console.error('Error during token swap:', error);
      if (callback) {
        callback({
          text: `Error swapping tokens: ${error.message}`,
          content: { error: error.message }
        });
      }
      return false;
    }
  },
  validate: async (runtime: IAgentRuntime) => {
    const address = runtime.getSetting('STACKS_ADDRESS');
    return typeof address === 'string' && address.startsWith('SP');
  }
}; 