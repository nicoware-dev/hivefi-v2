export interface RedeemParams {
  chain: string;
  transactionId: string;
  token?: string;
  sourceChain?: string;
}

export interface TransferParams {
  sourceChain: string;
  destinationChain: string;
  token: string;
  amount: string;
  recipient?: string;
}

export enum WormholeChain {
  ETHEREUM = 'ethereum',
  POLYGON = 'polygon',
  ARBITRUM = 'arbitrum',
  OPTIMISM = 'optimism',
  AVALANCHE = 'avalanche',
  BASE = 'base',
  SOLANA = 'solana',
  BSC = 'bsc'
}

export enum WormholeToken {
  USDC = 'USDC',
  WETH = 'WETH',
  WBTC = 'WBTC',
  DAI = 'DAI'
} 