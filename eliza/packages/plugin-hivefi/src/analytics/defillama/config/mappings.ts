// Map of chain names to DefiLlama slugs
export const CHAIN_TO_DEFILLAMA_SLUG: Record<string, string> = {
  // Major chains
  'ethereum': 'ethereum',
  'eth': 'ethereum',
  'polygon': 'polygon',
  'matic': 'polygon',
  'arbitrum': 'arbitrum',
  'arb': 'arbitrum',
  'arbitrum one': 'arbitrum',
  'optimism': 'optimism',
  'op': 'optimism',
  'base': 'base',
  'bsc': 'bsc',
  'binance': 'bsc',
  'bnb': 'bsc',
  'binance smart chain': 'bsc',
  'avalanche': 'avalanche',
  'avax': 'avalanche',
  'solana': 'solana',
  'sol': 'solana',
  'fantom': 'fantom',
  'ftm': 'fantom',
  
  // Layer 2s and Sidechains
  'mantle': 'mantle',
  'mnt': 'mantle',
  'sonic': 'sonic',
  's': 'sonic',
  'injective': 'injective',
  'inj': 'injective',
  'zksync era': 'era',
  'zksync': 'era',
  'era': 'era',
  'linea': 'linea',
  'scroll': 'scroll',
  'metis': 'metis',
  'polygon zkevm': 'polygon_zkevm',
  'zkevm': 'polygon_zkevm',
  'starknet': 'starknet',
  'stark': 'starknet',
  'mode': 'mode',
  'manta': 'manta',
  'blast': 'blast',
  
  // Other major chains
  'near': 'near',
  'cosmos': 'cosmos',
  'atom': 'cosmos',
  'polkadot': 'polkadot',
  'dot': 'polkadot',
  'cardano': 'cardano',
  'ada': 'cardano',
  'algorand': 'algorand',
  'algo': 'algorand',
  'flow': 'flow',
  'aptos': 'aptos',
  'sui': 'sui',
  'tron': 'tron',
  'trx': 'tron'
} as const;

// Map of protocol names to DefiLlama slugs
export const PROTOCOL_TO_DEFILLAMA_SLUG: Record<string, string> = {
  // Major DEXes
  'uniswap': 'uniswap',
  'uniswap v3': 'uniswap-v3',
  'uniswap v2': 'uniswap-v2',
  'sushiswap': 'sushi',
  'sushi': 'sushi',
  'pancakeswap': 'pancakeswap',
  'cake': 'pancakeswap',
  'curve': 'curve',
  
  // Major Lending
  'aave': 'aave',
  'aave v3': 'aave-v3',
  'aave v2': 'aave-v2',
  'compound': 'compound',
  'compound v3': 'compound-v3',
  'compound v2': 'compound-v2',
  
  // Mantle Protocols
  'agni': 'agni-finance',
  'agni finance': 'agni-finance',
  'fusionx': 'fusionx',
  'lendle': 'lendle',
  'izumi': 'izumi-finance',
  'izumi finance': 'izumi-finance',
  
  // Injective/Sonic Protocols
  'helix': 'helix',
  'astroport': 'astroport-injective',
  'frontrunner': 'frontrunner-injective',
  'silo': 'silo-finance'
} as const; 