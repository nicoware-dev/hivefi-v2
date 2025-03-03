# HiveFi Plugin

A comprehensive plugin for HiveFi that provides multichain DeFi functionality and data integration across Mantle, Sonic, and Bitcoin networks. This plugin serves as the core infrastructure for the HiveFi agent swarm, enabling seamless cross-chain operations and protocol interactions.

## Architecture Overview

```
┌─────────── Plugin Architecture ───────────┐
│                                          │
│  ┌─────────── Core Modules ───────────┐  │
│  │ Analytics | Blockchain | Cross-Chain│  │
│  └──────────────┬──────────────────┘  │  │
│                 │                      │  │
│  ┌─────────── Chain Modules ─────────┐   │
│  │   Mantle   |   Sonic   |  Bitcoin │   │
│  └──────────────┬──────────────────┘     │
│                 │                         │
│  ┌─────────── Agent Modules ──────────┐  │
│  │ Alpha | Predictions | KOL | Deploy │  │
│  └────────────────────────────────────┘  │
│                                          │
└──────────────────────────────────────────┘
```

## Features

### Core Modules

#### Analytics Module
- Real-time price data via CoinGecko
- TVL tracking via DefiLlama
- Portfolio analytics and tracking
- Protocol performance metrics
- Market trend analysis
- Risk assessment tools

#### Blockchain Module
- Wallet management
- Transaction handling
- Contract interactions
- Gas optimization
- Security validation

#### Cross-Chain Module
- Bridge operations (Wormhole, DeBridge, Multichain)
- Cross-chain transaction monitoring
- Liquidity tracking
- Route optimization
- Status verification

### Chain-Specific Modules

#### Mantle Network
- DEX operations (Merchant Moe, Agni Finance)
- Lending operations (Lendle, Init Capital)
- Yield farming (Pendle)
- Token transfers
- Protocol interactions

#### Sonic Chain
- DEX operations (Beets, SwapX, Shadow Exchange)
- Lending operations (Silo Finance, Aave)
- Yield optimization (Beefy)
- Token management
- Protocol integrations

#### Bitcoin Network
- Wallet operations
- UTXO management
- Transaction handling
- Network monitoring
- Fee estimation

### Agent-Specific Modules

#### Market Analysis
- Alpha detection
- Trend prediction
- Pattern recognition
- Risk evaluation
- Strategy optimization

#### Social & Community
- Content generation
- Community management
- Trend monitoring
- Engagement tracking
- Performance analytics

#### Development Tools
- Token deployment
- NFT collection management
- Smart contract interaction
- Security validation
- Documentation generation

## Plugin Structure

```
plugin-hivefi/
├── src/
│   ├── index.ts                 # Agent-specific action selection
│   ├── analytics/               # Analytics module
│   │   └── actions/
│   │       ├── coingecko/
│   │       ├── defillama/
│   │       ├── portfolio/
│   │       └── market/
│   ├── crosschain/             # Cross-chain module
│   │   └── actions/
│   │       ├── wormhole/
│   │       ├── debridge/
│   │       └── multichain/
│   ├── mantle/                 # Mantle module
│   │   ├── actions/
│   │   │   ├── merchant-moe/
│   │   │   ├── init-capital/
│   │   │   ├── lendle/
│   │   │   ├── pendle/
│   │   │   └── agni/
│   │   └── providers/
│   ├── sonic/                  # Sonic module
│   │   ├── actions/
│   │   │   ├── beets/
│   │   │   ├── swapx/
│   │   │   ├── shadow/
│   │   │   ├── silo/
│   │   │   ├── aave/
│   │   │   └── beefy/
│   │   └── providers/
│   ├── bitcoin/               # Bitcoin module
│   │   └── actions/
│   │       └── transfer/
│   ├── alpha/                # Alpha module
│   ├── predictions/          # Predictions module
│   ├── kol/                 # KOL module
│   ├── tokendeployer/       # Token deployer module
│   └── nftdeployer/         # NFT deployer module
├── templates/               # Response templates
├── types/                  # TypeScript definitions
└── utils/                  # Shared utilities
```

## Usage

### Installation

```bash
pnpm add @elizaos/plugin-hivefi
```

### Basic Setup

```typescript
import { HiveFiPlugin } from '@elizaos/plugin-hivefi';

// Initialize plugin with configuration
const plugin = new HiveFiPlugin({
  mantleRpc: process.env.MANTLE_RPC_URL,
  sonicRpc: process.env.SONIC_RPC_URL,
  bitcoinRpc: process.env.BTC_RPC_URL,
  apiKeys: {
    coingecko: process.env.COINGECKO_API_KEY,
    defillama: process.env.DEFILLAMA_API_KEY
  }
});
```

### Example: Cross-Chain Operation

```typescript
// Bridge USDC from Mantle to Sonic
const result = await plugin.crosschain.bridge({
  fromChain: 'mantle',
  toChain: 'sonic',
  token: 'USDC',
  amount: '100',
  bridge: 'wormhole'
});
```

### Example: Analytics Query

```typescript
// Get TVL across chains
const tvl = await plugin.analytics.getTVL({
  chains: ['mantle', 'sonic'],
  protocols: ['merchant-moe', 'silo-finance']
});
```

## Development

### Prerequisites
- Node.js 23+
- pnpm
- Git

### Setup
```bash
# Clone repository
git clone https://github.com/hivefi/hivefi
cd hivefi

# Install dependencies
pnpm install

# Build plugin
pnpm build
```

### Testing
```bash
# Run tests
pnpm test

# Run specific test suite
pnpm test:mantle
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

MIT
