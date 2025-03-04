# HiveFi Agent Descriptions

## MultiChain Agent

### multiChainAgent
This tool connects to the MultiChain Agent that handles operations on protocols deployed across multiple EVM chains.
- Input: Any operation on multichain protocols like Aave, Uniswap, 1inch, and Beefy
- Output: Transaction execution or protocol data
- Example: "Find best lending rate for USDC across Aave markets"

#### Capabilities
- Lending and borrowing on Aave across deployments
- Trading on Uniswap across deployments
- Yield farming on Beefy across chains
- DEX aggregation via 1inch across networks
- Protocol analytics and comparison

## Analytics Agent

### analyticsAgent
This tool connects to the Analytics Agent that provides data analysis and visualization across chains.
- Input: Any analytics, metrics, prices,or reporting request
- Output: Detailed analytics and visualizations
- Example: "What's the total TVL across all supported chains?"

#### Capabilities
- Price tracking and analysis (Coingecko)
- Protocol and Chain TVL metrics (DefiLlama)
- Token price and pools metrics (GeckoTerminal)
- Portfolio analysis and tracking (Zerion)
- Protocol performance metrics
- Yield opportunity comparison
- Risk assessment and monitoring
- Custom reporting and visualization

## Sonic Chain Agent

### sonicAgent
This tool connects to the Sonic Chain Agent that handles all Sonic-specific operations.
- Input: Any Sonic chain operation or query
- Output: Transaction execution or chain data
- Example: "Swap 10 S for USDC on SwapX"

#### Capabilities
- Wallet management on Sonic chain
- DEX operations (SwapX, Beets, Shadow Exchange)
- Lending operations (Silo Finance)
- Sonic Liquid Staking (Beets LST)
- Sonic NFTs

## Mantle Chain Agent

### mantleAgent
This tool connects to the Mantle Chain Agent that manages all Mantle-specific operations.
- Input: Any Mantle chain operation or query
- Output: Transaction execution or chain data
- Example: "Supply 100 USDC to Lendle"

#### Capabilities
- Wallet operations on Mantle network
- DEX trading (Merchant Moe, Agni Finance)
- Lending operations (Lendle, Init Capital)
- Yield farming (Pendle)
- NFT operations on Mantle

## Cross Chain Agent

### crossChainAgent
This tool connects to the Cross Chain Agent that manages bridge operations and cross-chain transactions using Wormhole and deBridge.
- Input: Any cross-chain operation or bridge request
- Output: Bridge transaction execution or status
- Example: "Bridge 100 USDC from Mantle to Sonic using Wormhole"

#### Capabilities
- Bridge operations management
- Cross-chain transaction tracking
- Bridge status monitoring
- Liquidity verification
- Error recovery for bridge operations
