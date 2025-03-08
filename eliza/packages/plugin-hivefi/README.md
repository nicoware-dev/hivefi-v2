# HiveFi Plugin

A comprehensive plugin for HiveFi that provides multichain DeFi functionality and data integration across Mantle, Sonic, and MultiChain protocols. This plugin serves as the core infrastructure for the HiveFi agent swarm, enabling seamless cross-chain operations and protocol interactions.

## Architecture Overview

```
┌─────────── Plugin Architecture ───────────┐
│                                          │
│  ┌─────────── Core Modules ───────────┐  │
│  │ Analytics | Blockchain | Cross-Chain│  │
│  └──────────────┬──────────────────┘  │  │
│                 │                      │  │
│  ┌─────────── Chain Modules ─────────┐   │
│  │   Mantle   |   Sonic   | MultiChain│   │
│  └──────────────┬──────────────────┘     │
│                 │                         │
│  ┌─────── Future Modules ────────┐  │
│  │ Alpha | Predictions | KOL | Deploy │  │
│  └────────────────────────────────────┘  │
│                                          │
└──────────────────────────────────────────┘
```

## Features

### Core Modules

#### Analytics Module
- Real-time price data via CoinGecko
- DEX analytics via GeckoTerminal
- TVL tracking via DefiLlama
- Portfolio analytics and tracking
- Protocol performance metrics
- Market trend analysis

#### Cross-Chain Module
- Bridge operations via Wormhole
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

#### MultiChain Features
- Wallet operations
- Native token transfers
- ERC-20 token transfers
- Portfolio management
- Chain-specific wallet access

### Planned Future Modules

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

## Current Plugin Structure

```
plugin-hivefi/
├── src/
│   ├── index.ts                 # Main plugin entry point
│   ├── analytics/               # Analytics module
│   │   ├── index.ts             # Analytics module entry point
│   │   ├── coingecko/           # CoinGecko integration
│   │   ├── defillama/           # DefiLlama integration
│   │   ├── geckoterminal/       # GeckoTerminal integration
│   │   └── utils/               # Shared analytics utilities
│   ├── crosschain/             # Cross-chain module
│   │   ├── index.ts            # Cross-chain module entry point
│   │   └── wormhole/           # Wormhole bridge integration
│   ├── mantle/                 # Mantle module
│   │   ├── index.ts            # Mantle module entry point
│   │   ├── actions/            # Mantle-specific actions
│   │   ├── providers/          # Mantle-specific providers
│   │   ├── types/              # Mantle-specific types
│   │   ├── templates/          # Response templates
│   │   └── config/             # Configuration
│   ├── sonic/                  # Sonic module
│   │   ├── index.ts            # Sonic module entry point
│   │   ├── actions/            # Sonic-specific actions
│   │   ├── providers/          # Sonic-specific providers
│   │   ├── types/              # Sonic-specific types
│   │   ├── templates/          # Response templates
│   │   └── config/             # Configuration
│   └── multichain/             # MultiChain module
│       ├── index.ts            # MultiChain module entry point
│       ├── constants.ts        # Chain configurations
│       ├── types.ts            # Type definitions
│       ├── actions/            # Core actions
│       ├── providers/          # Wallet providers
│       ├── utils/              # Utility functions
│       ├── portfolio/          # Portfolio management
│       ├── aave/               # Aave integration (planned)
│       ├── beefy/              # Beefy integration (planned)
│       └── uniswap/            # Uniswap integration (planned)
```

## Usage

### Installation

```bash
pnpm add @elizaos/plugin-hivefi
```

## Development

### Prerequisites
- Node.js 23+
- pnpm
- Git

### Setup
```bash
# Clone repository
git clone https://github.com/nicoware-dev/hivefi-v2
cd hivefi-v2

# Install dependencies
pnpm install

# Build plugin
pnpm build
```

### Environment Variables

The module requires the following environment variables:

```bash
# Required for MultiChain operations
EVM_PRIVATE_KEY=your_private_key_here  
```

## Current Status and Roadmap

### Implemented Features
- Analytics module with CoinGecko, DefiLlama, and GeckoTerminal integrations
- Cross-chain module with Wormhole bridge support
- Mantle and Sonic chain-specific modules
- MultiChain module with basic wallet operations and native token transfers
- ERC-20 token transfers in MultiChain module

### In Progress

- Protocol integrations (Uniswap, Aave, Beefy)

### Planned Features
- Additional bridge integrations (DeBridge, LayerZero)
- Advanced portfolio analytics
- Market analysis tools
- Social and community tools
- Development tools for token and NFT deployment

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

MIT
