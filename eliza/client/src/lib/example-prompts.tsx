import { ExamplePrompt } from '@/components/ui/chat/example-prompts';
import { TrendingUp, Wallet, ArrowRightLeft, Coins, Search, Info, BarChart3, Zap, DollarSign, Layers, Shield, Compass } from 'lucide-react';

// Define example prompts for different agent types
export const getExamplePrompts = (agentName?: string): ExamplePrompt[] => {
  // Default prompts that work with any agent
  const defaultPrompts: ExamplePrompt[] = [
    {
      text: "What is HiveFi?",
      icon: <Info className="h-4 w-4" />,
    },
    {
      text: "What can you help me with?",
      icon: <TrendingUp className="h-4 w-4" />,
    },
    {
      text: "What are the trending pools on Arbitrum?",
      icon: <Coins className="h-4 w-4" />,
    },
    {
      text: "What are the prices of BTC, ETH, MNT, and S?",
      icon: <Search className="h-4 w-4" />,
    },
  ];

  // Agent-specific prompts
  if (agentName?.toLowerCase().includes('demo')) {
    return [
      {
        text: "Transfer 0.001 USDC on Arbitrum to 0xF12d64817029755853bc74a585EcD162f63c5f84",
        icon: <ArrowRightLeft className="h-4 w-4" />,
      },
      {
        text: "Transfer 0.001 USDC from Arbitrum to Polygon via Circle Bridge",
        icon: <Wallet className="h-4 w-4" />,
      },
      {
        text: "Supply 0.1 USDC to Lendle",
        icon: <Zap className="h-4 w-4" />,
      },
      {
        text: "Show me detailed positions in my portfolio for 0xfB0eb7294e39Bb7B0aA6C7eC294be2C968656fb0",
        icon: <Layers className="h-4 w-4" />,
      },
      {
        text: "Swap 0.1 MNT for USDC on Merchant Moe",
        icon: <Compass className="h-4 w-4" />,
      },
      {
        text: "Show TVL for Uniswap, Aave, and Curve",
        icon: <Shield className="h-4 w-4" />,
      },
    ];
  }

  // Trading agent prompts
  if (agentName?.toLowerCase().includes('trade')) {
    return [
      {
        text: "Swap 0.1 ETH for USDC on Jupiter",
        icon: <ArrowRightLeft className="h-4 w-4" />,
      },
      {
        text: "What's the best DEX for trading SOL?",
        icon: <BarChart3 className="h-4 w-4" />,
      },
      {
        text: "Show me the trading volume for BONK",
        icon: <DollarSign className="h-4 w-4" />,
      },
      {
        text: "Compare gas fees across different chains",
        icon: <Zap className="h-4 w-4" />,
      },
    ];
  }

  // Add more agent-specific prompts here as needed
  
  return defaultPrompts;
}; 