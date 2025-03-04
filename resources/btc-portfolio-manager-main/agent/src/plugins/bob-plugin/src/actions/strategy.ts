import { Action, IAgentRuntime, Memory, HandlerCallback, State, composeContext, generateObjectDeprecated, ModelClass } from '@elizaos/core';
import { extractStrategyName } from './patterns.ts';
import { strategyTemplate } from '../template/strategyTemplate.ts';

export interface StrategyParams {
  strategy: string;
  amount: number;
}

const buildStrategyDetails = async (
  state: State,
  runtime: IAgentRuntime
): Promise<StrategyParams> => {
  const context = composeContext({
    state,
    template: strategyTemplate,
  });

  const strategyDetails = (await generateObjectDeprecated({
    runtime,
    context,
    modelClass: ModelClass.SMALL,
  })) as StrategyParams;

  return strategyDetails;
};

export const STRATEGY_ACTION: Action = {
  name: 'BOB_STRATEGY_ACTION',
  description: 'Handles requests to use BOB strategies',
  similes: [
    'like choosing an investment portfolio',
    'similar to selecting a savings account',
    'like picking a yield farming strategy',
    'comparable to choosing a DeFi vault',
    'similar to selecting a staking option'
  ],
  examples: [
    [
      {
        user: 'user',
        content: {
          text: 'What strategies are available?',
          action: 'BOB_STRATEGY_ACTION'
        }
      },
      {
        user: 'assistant', 
        content: {
          text: "I can help you with that! The available strategies are Segment, Solv, Avalon, Bedrock, Pell and Ionic. Each strategy has different risk and reward profiles. Would you like to know more about any specific strategy?",
          action: 'BOB_STRATEGY_ACTION'
        }
      },
      {
        user: 'assistant',
        content: {
          text: "I'll help you use the Segment strategy",
          action: 'BOB_STRATEGY_ACTION'
        }
      },
      {
        user: 'user',
        content: {
          text: 'I want to use the Segment strategy with 0.5 BTC',
          action: 'BOB_STRATEGY_ACTION'
        }
      }
    ],
    [
      {
        user: 'assistant',
        content: {
          text: "I'll help you invest in the Solv strategy",
          action: 'BOB_STRATEGY_ACTION'
        }
      },
      {
        user: 'user',
        content: {
          text: 'Help me deposit 1 BTC into the Solv strategy',
          action: 'BOB_STRATEGY_ACTION'
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
      console.log('Strategy action handler called');

      const paramOptions = await buildStrategyDetails(state, runtime);
      const strategyName = paramOptions.strategy.toLowerCase();
      const amount = paramOptions.amount;

      // Validate strategy
      if (!isValidStrategy(strategyName)) {
        if (callback) {
          callback({
            text: 'Please specify a valid strategy (Segment, Solv, Avalon, Bedrock, Pell, or Ionic).',
            content: { error: 'Invalid strategy' }
          });
        }
        return false;
      }

      // Validate amount
      if (amount <= 0) {
        if (callback) {
          callback({
            text: 'Please specify a valid amount greater than 0.',
            content: { error: 'Invalid amount' }
          });
        }
        return false;
      }

      // Provide information about the selected strategy
      const strategyInfo = getStrategyInfo(strategyName);
      if (callback) {
        callback({
          text: `Great! I'll help you deposit ${amount} BTC into the ${strategyName} strategy.\n\n${strategyInfo}\n\nWould you like to proceed with the deposit?`,
          content: { 
            strategy: strategyName,
            amount: amount,
            readyToDeposit: true
          }
        });
      }

      return true;
    } catch (error) {
      console.error('Error during strategy setup:', error);
      if (callback) {
        callback({
          text: `Error setting up strategy: ${error.message}`,
          content: { error: error.message }
        });
      }
      return false;
    }
  },
  validate: async () => true
};

function isValidStrategy(strategy: string): boolean {
  const validStrategies = ['segment', 'solv', 'avalon', 'bedrock', 'pell', 'ionic'];
  return validStrategies.includes(strategy.toLowerCase());
}

function getStrategyInfo(strategy: string): string {
  const info: { [key: string]: string } = {
    segment: 'The Segment strategy allows you to earn yield by providing liquidity to Segment Finance. Your BTC will be used to mint seBTC tokens.',
    solv: 'The Solv strategy uses Solv Protocol to convert your BTC into LSTs (Liquid Staking Tokens) for additional yield opportunities.',
    avalon: 'The Avalon strategy provides exposure to Avalon\'s yield generation mechanisms through their specialized vaults.',
    bedrock: 'The Bedrock strategy utilizes Bedrock Finance\'s yield optimization to generate returns on your BTC.',
    pell: 'The Pell strategy leverages Pell\'s innovative yield farming strategies to maximize returns on your BTC.',
    ionic: 'The Ionic strategy uses Ionic Protocol\'s lending and borrowing features to generate yield on your BTC deposits.'
  };
  
  return info[strategy] || 'Strategy information not available.';
} 