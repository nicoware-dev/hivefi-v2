/**
 * Wormhole transfer parameters
 */
export interface TransferParams {
  sourceChain: string;
  destinationChain: string;
  amount: string;
  token?: string;
}

/**
 * Wormhole redeem parameters
 */
export interface RedeemParams {
  chain: string;
  transactionId?: string;
  token?: string;
}

/**
 * Wormhole supported chains
 */
export enum WormholeChain {
  ETHEREUM = 'ethereum',
  SOLANA = 'solana',
  POLYGON = 'polygon',
  BSC = 'bsc',
  AVALANCHE = 'avalanche',
  FANTOM = 'fantom',
  CELO = 'celo',
  MOONBEAM = 'moonbeam',
  ARBITRUM = 'arbitrum',
  OPTIMISM = 'optimism',
  APTOS = 'aptos',
  SUI = 'sui',
  BASE = 'base',
  MANTLE = 'mantle',
  SONIC = 'sonic'
}

/**
 * Wormhole supported tokens
 */
export enum WormholeToken {
  NATIVE = 'NATIVE',
  ETH = 'ETH',
  WETH = 'WETH',
  BTC = 'BTC',
  WBTC = 'WBTC',
  USDC = 'USDC',
  USDT = 'USDT',
  DAI = 'DAI',
  MATIC = 'MATIC',
  SOL = 'SOL',
  AVAX = 'AVAX',
  BNB = 'BNB',
  FTM = 'FTM',
  CELO = 'CELO',
  GLMR = 'GLMR',
  ARB = 'ARB',
  OP = 'OP',
  APT = 'APT',
  SUI = 'SUI',
  MNT = 'MNT',
  SONIC = 'SONIC'
} 