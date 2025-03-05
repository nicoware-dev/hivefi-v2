import { prependListener } from "process";

// Map of chain names to DefiLlama slugs
export const CHAIN_TO_DEFILLAMA_SLUG: Record<string, string> = {
  // Major chains
  'ethereum': 'Ethereum',
  'eth': 'Ethereum',
  'polygon': 'Polygon',
  'matic': 'Polygon',
  'arbitrum': 'Arbitrum',
  'arb': 'Arbitrum',
  'arbitrum one': 'Arbitrum',
  'optimism': 'OP Mainnet',
  'op': 'OP Mainnet',
  'base': 'Base',
  'bsc': 'BSC',
  'binance': 'BSC',
  'bnb': 'BSC',
  'binance smart chain': 'BSC',
  'avalanche': 'Avalanche',
  'avax': 'Avalanche',
  'solana': 'Solana',
  'sol': 'Solana',
  'fantom': 'Fantom',
  'ftm': 'Fantom',
  
  // Layer 2s and Sidechains
  'mantle': 'Mantle',
  'mnt': 'Mantle',
  'sonic': 'Sonic',
  's': 'Sonic',
  'injective': 'Injective',
  'inj': 'Injective',
  'zksync era': 'ZKsync Era',
  'zksync': 'ZKsync Era',
  'era': 'ZKsync Era',
  'linea': 'Linea',
  'scroll': 'Scroll',
  'metis': 'Metis',
  'polygon zkevm': 'Polygon zkEVM',
  'zkevm': 'Polygon zkEVM',
  'starknet': 'Starknet',
  'stark': 'Starknet',
  'mode': 'Mode',
  'manta': 'Manta',
  'blast': 'Blast',
  
  // Other major chains
  'near': 'Near',
  'cosmos': 'CosmosHub',
  'atom': 'CosmosHub',
  'polkadot': 'Polkadot',
  'dot': 'Polkadot',
  'cardano': 'Cardano',
  'ada': 'Cardano',
  'algorand': 'Algorand',
  'algo': 'Algorand',
  'flow': 'Flow',
  'aptos': 'Aptos',
  'sui': 'Sui',
  'tron': 'Tron',
  'trx': 'Tron'
} as const;

// Map of protocol names to DefiLlama slugs
export const PROTOCOL_TO_DEFILLAMA_SLUG: Record<string, string> = {
  // Major DEXes
  'uniswap': 'uniswap',
  'sushiswap': 'sushi',
  'sushi': 'sushi',
  'pancakeswap': 'pancakeswap',
  'cake': 'pancakeswap',
  'curve': 'curve',
  
  // Major Protocols
  'aave': 'aave',
  'compound': 'compound',
  'beefy': 'beefy',
  'eigenlayer': 'eigenlayer',
  'lido': 'lido',
  'pendle': 'pendle',
  'stargate': 'stargate',
  'across': 'across',
  'spark': 'spark',
  'morpho': 'morpho',
  'radiant': 'radiant',
  'benqi': 'benqi',
  'makerdao': 'makerdao',
  'maker': 'makerdao',
  'maker dao': 'makerdao',
  
  // Common protocols with variations
  'uniswap v2': 'uniswap',
  'uniswap v3': 'uniswap',
  'uni': 'uniswap',
  
  'aave v2': 'aave',
  'aave v3': 'aave',
  
  'curve finance': 'curve',
  
  'compound finance': 'compound',
  
  'balancer v2': 'balancer',
  
  'yearn': 'yearn-finance',
  'yearn finance': 'yearn-finance',
  
  'convex': 'convex-finance',
  'convex finance': 'convex-finance',
  
  'lido finance': 'lido',
  
  'pancake': 'pancakeswap',
  
  'frax': 'frax-finance',
  'frax finance': 'frax-finance',
  
  'beefy finance': 'beefy',
  
  // Stablecoins
  'usdc': 'usdc',
  'usdt': 'tether',
  'dai': 'makerdao',
  
  // Yield aggregators
  'yield yak': 'yield-yak',
  'yak': 'yield-yak',
  
  // Mantle Protocols
  'agni': 'agni-finance',
  'agni finance': 'agni-finance',
  'fusionx': 'fusionx',
  'lendle': 'lendle',
  'izumi': 'izumi-finance',
  'izumi finance': 'izumi-finance',
  'merchant moe': 'merchant-moe',
  
  // Sonic Protocols
  'beets': 'beets',
  'silo': 'silo-finance',
  'silo finance': 'silo-finance',
  'shadow-exchange': 'shadow-exchange',
  'shadow exchange': 'shadow-exchange',
  'swapx': 'swapx',
  'swapx algebra': 'swapx',
  'origin-sonic': 'origin-sonic',
  'origin sonic': 'origin-sonic'
} as const; 