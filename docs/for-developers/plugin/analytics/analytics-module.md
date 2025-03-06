# Analytics Module

The Analytics Module provides real-time market data, price information, and analytics capabilities for the HiveFi platform. This module integrates with various data providers to offer comprehensive insights across multiple blockchains and tokens.

## Overview

The Analytics Module includes the following key components:

- **CoinGecko Integration**: Real-time price data for tokens across multiple chains
- **DefiLlama Integration**: Total Value Locked (TVL) tracking across chains and protocols
- **GeckoTerminal Integration**: DEX analytics, pool data, and trading volumes
- **Market Data**: Comprehensive market information including prices, market caps, and trading volumes
- **Cross-Chain Analytics**: Data aggregation across Mantle, Sonic, and other supported chains

## CoinGecko Integration

The CoinGecko integration provides real-time price data and market information for a wide range of cryptocurrencies and tokens across multiple blockchains.

### Key Features
- Real-time token price data
- Market capitalization information
- 24-hour trading volume statistics
- Price change tracking (24-hour)
- Support for hundreds of cryptocurrencies and tokens

For detailed information, see the [CoinGecko Module Documentation](coingecko.md).

## DefiLlama Integration

The DefiLlama integration provides comprehensive DeFi analytics by tracking Total Value Locked (TVL) across multiple chains and protocols.

### Key Features
- Chain TVL tracking
- Protocol TVL analysis
- Multi-chain TVL comparison
- Protocol TVL by chain analysis
- Global DeFi statistics

For detailed information, see the [DefiLlama Module Documentation](defillama.md).

## GeckoTerminal Integration

The GeckoTerminal integration provides comprehensive DEX analytics by tracking liquidity pools, trading volumes, and token prices across multiple networks.

### Key Features
- Multi-chain pool analytics
- Pool TVL tracking
- 24h volume analysis
- Fee generation metrics
- Token price tracking

For detailed information, see the [GeckoTerminal Module Documentation](geckoterminal.md).

## Analytics Actions

### Token Price Actions

#### GET_TOKEN_PRICE

Retrieves the current price and market data for a specific cryptocurrency or token.

**Example Prompts:**
```
What's the current price of ETH?
Show me the price of Bitcoin
How much is MNT worth right now?
What's the current value of USDC?
```

**Response Example:**
```
Bitcoin (BTC) Price Information:
💰 Current Price: $68,245.32
📊 Market Cap: $1.34T
📈 24h Volume: $28.7B
📉 24h Change: -1.2% (-$832.67)
```

#### GET_MULTIPLE_TOKEN_PRICES

Retrieves current prices and market data for multiple cryptocurrencies or tokens at once.

**Example Prompts:**
```
Show me prices for ETH, BTC, and MNT
What are the current prices of Bitcoin, Ethereum, and Solana?
Compare prices for USDC, USDT, and DAI
Get market data for MNT, S, and ETH
```

**Response Example:**
```
Current Cryptocurrency Prices:

Bitcoin (BTC):
💰 Price: $68,245.32
📊 Market Cap: $1.34T
📈 24h Volume: $28.7B
📉 24h Change: -1.2% (-$832.67)

Ethereum (ETH):
💰 Price: $3,456.78
📊 Market Cap: $415.2B
📈 24h Volume: $12.3B
📉 24h Change: -0.8% (-$28.12)

Mantle (MNT):
💰 Price: $0.75
📊 Market Cap: $2.5B
📈 24h Volume: $125.4M
📈 24h Change: +5.2% (+$0.037)
```

### TVL Actions

#### GET_CHAIN_TVL

Gets the current TVL and related metrics for a specific blockchain.

**Example Prompts:**
```
What's the TVL of Ethereum?
Show me Mantle's TVL
Get the TVL for Arbitrum
What's the total value locked in Optimism?
```

**Response Example:**
```
Ethereum Chain TVL: $123.45B
24h Change: +2.5%
7d Change: -1.2%
```

#### GET_PROTOCOL_TVL

Gets the current TVL for a specific DeFi protocol.

**Example Prompts:**
```
What's the TVL of Uniswap?
Show me Aave's TVL
Get the TVL for Curve
What's the total value locked in MakerDAO?
```

**Response Example:**
```
Uniswap Protocol TVL: $4.1B
24h Change: +1.2%
7d Change: +3.5%
```

### DEX Analytics Actions

#### GET_TRENDING_POOLS

Gets trending pools across all networks or for a specific network.

**Example Prompts:**
```
Show me trending pools
What are the trending pools on Arbitrum?
Get hot pools on Mantle
Show popular pools on Optimism
```

**Response Example:**
```
# Trending Pools Across All Networks

## USDC/WETH Pool
- TVL: $10.5M
- 24h Volume: $5.2M
- 24h Fees Generated: $15.6K
- 24h Price Change: +2.5%
- 24h Transactions: 1,234
```

#### GET_TOP_POOLS

Gets top pools by TVL for a specific network with customizable limit.

**Example Prompts:**
```
Show me top pools on Arbitrum
Get top 5 pools on Mantle
What are the biggest pools on Optimism?
List top 10 pools by TVL on Base
```

**Response Example:**
```
# Top 10 Pools on Arbitrum

## USDC/WETH Pool
- TVL: $10.5M
- 24h Volume: $5.2M
- 24h Fees Generated: $15.6K
- 24h Price Change: +2.5%
- 24h Transactions: 1,234
```

## Natural Language Processing

The Analytics module includes advanced natural language processing capabilities to extract relevant information from user messages. This allows users to query data using various formats:

- "What's the price of MNT?"
- "Show me the TVL of Uniswap"
- "Get trending pools on Arbitrum"
- "Compare prices for USDC, USDT, and DAI"

The module can recognize token names, protocol names, and chain names in different formats and handle various query patterns.

## Data Freshness

- Price data is cached for 5 minutes to optimize performance
- TVL data is updated hourly for accurate protocol tracking
- Pool data is refreshed every 15 minutes for timely DEX analytics
- Market data is updated in real-time for significant market movements

## Error Handling

The module includes comprehensive error handling for:
- Invalid token/protocol/chain names
- API connection issues
- Rate limiting
- Missing or incomplete data

When an error occurs, the module provides helpful feedback and suggestions for alternative queries or actions.

## Module Structure

```
analytics/
├── index.ts                # Exports all analytics actions
├── utils/
│   └── response.ts         # Utility for standardized responses
└── coingecko/
    ├── index.ts            # CoinGecko actions implementation
    ├── module.ts           # Core CoinGecko API integration
    └── template.ts         # Action description templates
```

### Key Components

#### Token Mapping

The module maintains a comprehensive mapping of token symbols to CoinGecko IDs:

```typescript
const TOKEN_TO_COINGECKO_ID: Record<string, string> = {
  // Mantle Network
  'mnt': 'mantle',
  'wmnt': 'wrapped-mantle',
  
  // Sonic Chain
  's': 'sonic-token',
  'ws': 'wrapped-sonic',
  
  // Ethereum
  'eth': 'ethereum',
  'weth': 'weth',
  
  // ... and many more
};
```

#### Price Caching

To optimize performance and reduce API calls, the module implements a caching mechanism:

```typescript
interface PriceCache {
  [key: string]: {
    price: number;
    timestamp: number;
    name?: string;
    symbol?: string;
    market_cap?: number;
    volume_24h?: number;
    price_change_24h?: number;
    price_change_percentage_24h?: number;
  };
}

const priceCache: PriceCache = {};
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes in milliseconds
```

#### Token Extraction

The module includes sophisticated functions to extract token symbols from natural language queries:

```typescript
function extractTokenSymbol(messageText: string): string {
  // Extract a single token symbol from user message
}

function extractMultipleTokenSymbols(messageText: string): string[] {
  // Extract multiple token symbols from user message
}
```

## Usage in HiveFi Plugin

The Analytics module is integrated into the HiveFi plugin in the main `index.ts` file:

```typescript
import type { Plugin } from "@elizaos/core";
import { MantleActions } from "./mantle/actions";
import { sonicActions } from "./sonic";
import { analyticsActions } from "./analytics";

export const hivefiPlugin: Plugin = {
    name: "hivefi",
    description: "HiveFi Plugin for Eliza - Multichain DeFAI Agent Swarm",
    actions: [
        ...MantleActions,
        ...sonicActions,
        ...analyticsActions,
        // TODO: Add MultiChain actions
    ],
    // ... other plugin configuration
};
```

## Future Enhancements

Planned enhancements for the Analytics module include:

- **Portfolio Analytics**: Cross-chain portfolio tracking and performance metrics
- **Yield Comparison**: Cross-chain yield opportunities and optimization
- **Risk Assessment**: Protocol risk metrics and security analysis
- **Custom Alerts**: Price and market condition alerts
