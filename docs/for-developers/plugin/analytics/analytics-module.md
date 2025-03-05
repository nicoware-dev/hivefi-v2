# Analytics Module

The Analytics Module provides real-time market data, price information, and analytics capabilities for the HiveFi platform. This module integrates with various data providers to offer comprehensive insights across multiple blockchains and tokens.

## Overview

The Analytics Module includes the following key components:

- **CoinGecko Integration**: Real-time price data for tokens across multiple chains
- **Market Data**: Comprehensive market information including prices, market caps, and trading volumes
- **Cross-Chain Analytics**: Data aggregation across Mantle, Sonic, and other supported chains

## CoinGecko Integration

The CoinGecko integration provides real-time price data and market information for a wide range of cryptocurrencies and tokens across multiple blockchains.

### Supported Tokens

The module supports tokens from various chains, including:

- **Mantle Network**: MNT, WMNT
- **Sonic Chain**: S, WS
- **Ethereum**: ETH, WETH
- **Bitcoin**: BTC, WBTC
- **Stablecoins**: USDC, USDT, DAI, BUSD, TUSD
- **Major Layer 1s**: BNB, SOL, ADA, AVAX, DOT, MATIC, NEAR, ATOM, FTM, ARB, OP
- **DeFi Tokens**: UNI, AAVE, LINK, CRV, MKR, COMP, SUSHI, CAKE, SNX, 1INCH
- **Other Popular Tokens**: DOGE, SHIB, APE, GRT, LDO, MANA, SAND, AXS

### Actions

#### GET_TOKEN_PRICE

Retrieves the current price and market data for a specific cryptocurrency or token.

```typescript
// Example usage
await analyticsAgent.execute('GET_TOKEN_PRICE', {
  denom: 'mnt'
});
```

**Similes**: `PRICE_OF_TOKEN`, `TOKEN_PRICE`, `CRYPTO_PRICE`, `CHECK_PRICE`

**Parameters**:
- `denom`: Token symbol to query (e.g., "mnt", "s", "eth", "btc", "usdc")

**Returns**:
- Current price in USD
- Market cap
- 24h trading volume
- 24h price change
- 24h price change percentage

**Example Response**:
```
The current price of MNT (Mantle) is $0.75 USD. This represents a 2.5% increase in the last 24 hours. The current market cap is $2.5B with a 24h trading volume of $150M.
```

**Example Prompts for Testing**:
```
What's the current price of MNT?
```
```
Show me the ETH price
```
```
How much is Bitcoin worth right now?
```
```
What's the price of S token?
```

#### GET_MULTIPLE_TOKEN_PRICES

Retrieves current prices and market data for multiple cryptocurrencies or tokens at once.

```typescript
// Example usage
await analyticsAgent.execute('GET_MULTIPLE_TOKEN_PRICES', {
  denoms: ['mnt', 's', 'eth', 'btc', 'usdc']
});
```

**Similes**: `COMPARE_PRICES`, `MULTIPLE_PRICES`, `PRICE_COMPARISON`, `CRYPTO_PRICES`

**Parameters**:
- `denoms`: Array of token symbols to query (e.g., ["mnt", "s", "eth", "btc", "usdc"])

**Returns**:
- Current prices in USD
- Market caps
- 24h trading volumes
- 24h price changes
- 24h price change percentages

**Example Response**:
```
Here are the current prices:

- BTC (Bitcoin): $65,432.10 USD (+1.5% in 24h)
- ETH (Ethereum): $3,245.67 USD (-1.2% in 24h)
- MNT (Mantle): $0.75 USD (+2.5% in 24h)
- S (Sonic): $0.42 USD (+0.8% in 24h)
- USDC (USD Coin): $1.00 USD (0.0% in 24h)
```

**Example Prompts for Testing**:
```
What are the prices of BTC, ETH, MNT, and S?
```
```
Compare prices for USDC, USDT, and DAI
```
```
Show me the current prices of Mantle, Sonic, and Ethereum
```
```
Get the prices for Bitcoin, Ethereum, Sonic and Mantle
```

### Natural Language Processing

The CoinGecko integration includes advanced natural language processing capabilities to extract token symbols from user messages. This allows users to query token prices using various formats:

- "What's the price of MNT?"
- "Show me the ETH price"
- "Get the current price of Bitcoin"
- "Compare prices for USDC, USDT, and DAI"
- "What are the prices of BTC, ETH, MNT, and S?"

The module can recognize token names in different formats (e.g., "Bitcoin" → "BTC", "Ethereum" → "ETH", "Mantle" → "MNT") and handle various query patterns.

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

## Error Handling

The CoinGecko integration includes comprehensive error handling:

- API error detection and logging
- Rate limit handling
- Fallback mechanisms
- Detailed error messages
- Cache utilization during API failures

## Future Enhancements

Planned enhancements for the Analytics module include:

- **DefiLlama Integration**: TVL data and protocol metrics
- **GeckoTerminal Integration**: DEX data and trading pairs
- **Portfolio Analytics**: Cross-chain portfolio tracking and performance metrics
- **Yield Comparison**: Cross-chain yield opportunities and optimization
- **Risk Assessment**: Protocol risk metrics and security analysis
- **Custom Alerts**: Price and market condition alerts
