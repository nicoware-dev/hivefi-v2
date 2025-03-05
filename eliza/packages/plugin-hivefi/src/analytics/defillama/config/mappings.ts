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