import { Plugin, IAgentRuntime, Memory, Evaluator } from '@elizaos/core';
import { isStrategyRequest } from './actions/patterns.ts';
import { STRATEGY_ACTION } from './actions/strategy.ts';

const strategyRecognizer: Evaluator = {
  name: 'strategyRecognizer',
  description: 'Recognizes requests to use BOB strategies',
  similes: [],
  examples: [],
  handler: async (runtime: IAgentRuntime, message: Memory) => {
    const text = message.content.text?.toLowerCase() || '';
    console.log('Evaluating text for BOB strategy:', text);
    
    if (isStrategyRequest(text)) {
      console.log('Recognized BOB strategy request');
      return {
        action: STRATEGY_ACTION.name,
        confidence: 0.9,
        params: {}
      };
    }
    
    return null;
  },
  validate: async () => true
};

export const bobPlugin: Plugin = {
  name: 'bob-plugin',
  description: 'Plugin for managing BOB strategies',
  providers: [],
  evaluators: [strategyRecognizer],
  services: [],
  actions: [STRATEGY_ACTION]
};

export default bobPlugin; 