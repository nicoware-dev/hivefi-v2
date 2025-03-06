# CoinGecko Module

The CoinGecko module provides real-time cryptocurrency price data and market information by integrating with the CoinGecko API. This module enables users to access current prices, market caps, trading volumes, and price changes for a wide range of tokens across multiple blockchains.

## Features

- Real-time token price data
- Market capitalization information
- 24-hour trading volume statistics
- Price change tracking (24-hour)
- Support for hundreds of cryptocurrencies and tokens
- Intelligent token name recognition
- Caching for improved performance

## Supported Tokens

The module supports a comprehensive list of tokens from various blockchain networks:

### Mantle Network
- MNT (Mantle)
- WMNT (Wrapped Mantle)

### Sonic Chain
- S (Sonic)
- WS (Wrapped Sonic)
- SHADOW (Shadow)
- SWPX (SwapX)
- BEETS (Beets)

### Ethereum
- ETH (Ethereum)
- WETH (Wrapped Ethereum)

### Bitcoin
- BTC (Bitcoin)
- WBTC (Wrapped Bitcoin)

### Stablecoins
- USDC (USD Coin)
- USDT (Tether)
- DAI (Dai)
- BUSD (Binance USD)
- TUSD (True USD)
- USDD (USDD)

### Major Layer 1s
- BNB (Binance Coin)
- SOL (Solana)
- ADA (Cardano)
- AVAX (Avalanche)
- DOT (Polkadot)
- MATIC (Polygon)
- NEAR (NEAR Protocol)
- ATOM (Cosmos)
- FTM (Fantom)
- ARB (Arbitrum)
- OP (Optimism)

### DeFi Tokens
- UNI (Uniswap)
- AAVE (Aave)
- LINK (Chainlink)
- CRV (Curve)
- MKR (Maker)
- COMP (Compound)
- SUSHI (SushiSwap)
- CAKE (PancakeSwap)
- SNX (Synthetix)
- 1INCH (1inch)

## Actions

### GET_TOKEN_PRICE

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

### GET_MULTIPLE_TOKEN_PRICES

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

## Usage Tips

1. **Token Recognition**: The module intelligently recognizes token names in various formats. For example, you can use "Bitcoin", "BTC", "Ethereum", "ETH", etc.

2. **Multiple Tokens**: When requesting multiple token prices, separate them with commas or "and" (e.g., "Show me prices for ETH, BTC, and MNT").

3. **Price Comparisons**: You can ask for price comparisons between tokens (e.g., "Compare ETH and BTC prices").

4. **Market Data**: In addition to prices, you can request market capitalization, trading volume, and price changes.

## Data Freshness

- Price data is cached for 5 minutes to optimize performance
- Market data is updated in real-time for significant market movements
- Historical data is preserved for trend analysis

## Error Handling

The module includes comprehensive error handling for:
- Invalid token symbols
- API connection issues
- Rate limiting
- Missing or incomplete data

When an error occurs, the module provides helpful feedback and suggestions for alternative tokens or actions.
