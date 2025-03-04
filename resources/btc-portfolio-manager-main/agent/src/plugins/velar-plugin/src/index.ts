import { Plugin, IAgentRuntime, Memory, Evaluator } from '@elizaos/core';
import { isSwapRequest } from './actions/patterns.ts';
import { SWAP_ACTION } from './actions/swap.ts';

const swapRecognizer: Evaluator = {
  name: 'swapRecognizer',
  description: 'Recognizes requests to swap tokens using Velar',
  similes: [],
  examples: [],
  handler: async (runtime: IAgentRuntime, message: Memory) => {
    const text = message.content.text?.toLowerCase() || '';
    console.log('Evaluating text for Velar swap:', text);
    
    if (isSwapRequest(text)) {
      console.log('Recognized Velar swap request');
      return {
        action: SWAP_ACTION.name,
        confidence: 0.9,
        params: {}
      };
    }
    
    return null;
  },
  validate: async () => true
};

export const velarPlugin: Plugin = {
  name: 'velar-plugin',
  description: 'Plugin for swapping tokens using Velar on Stacks blockchain',
  providers: [],
  evaluators: [swapRecognizer],
  services: [],
  actions: [SWAP_ACTION]
};

export default velarPlugin; 