# Multichain Portfolio Module

The Multichain Portfolio module provides a comprehensive view of wallet balances and token positions across multiple blockchain networks. It leverages the Zerion API to fetch real-time data about wallet holdings across various chains.

## Setup

1. Make sure you have a Zerion API key. If you don't have one, you can get it from [Zerion Developer Portal](https://developers.zerion.io/).

2. Add your Zerion API key to your Eliza settings:
   
   For local development, add it to your `.env` file:
   ```
   ZERION_API_KEY=your_api_key_here
   ```
   
   For production, make sure to set it in your environment variables or secrets manager.

## Features

- **Cross-Chain Portfolio Summary**: Get an overview of your wallet's total value, distribution across chains, and position types.
- **Detailed Token Positions**: View detailed information about each token in your wallet, organized by chain.
- **24-Hour Performance**: Track how your portfolio has performed over the last 24 hours.
- **Chain Distribution Analysis**: See how your assets are distributed across different blockchain networks.
- **Position Type Breakdown**: Understand how your assets are allocated (wallet holdings, deposited in protocols, staked, etc.).

## Actions

### 1. Portfolio Summary (`MULTICHAIN_PORTFOLIO_SUMMARY`)

Gets a high-level overview of a wallet's portfolio across all supported chains.

**Test Prompts:**
```
Show me a summary of my portfolio for 0xfb0eb7294e39bb7b0aa6c7ec294be2c968656fb0
Get portfolio summary for 0x1234567890abcdef1234567890abcdef12345678
What's the value of wallet 0x1234567890abcdef1234567890abcdef12345678
```

**Example Response:**
```
Multichain Portfolio for 0x1234567890abcdef1234567890abcdef12345678

Total Value: $12,345.67
24h Change: +2.5%

Chain Distribution:
• Ethereum: $5,678.90 (46.0%)
• Arbitrum: $2,345.67 (19.0%)
• Optimism: $1,234.56 (10.0%)
• Polygon: $987.65 (8.0%)
• Base: $765.43 (6.2%)

Position Types:
• Wallet: $8,765.43 (71.0%)
• Deposited: $2,345.67 (19.0%)
• Staked: $1,234.56 (10.0%)

View on Zerion: https://app.zerion.io/0x1234567890abcdef1234567890abcdef12345678/overview
```

### 2. Portfolio Details (`MULTICHAIN_PORTFOLIO_DETAILS`)

Gets detailed information about all token positions in a wallet across all supported chains.

**Test Prompts:**
```
Show me detailed positions in my portfolio for 0xfb0eb7294e39bb7b0aa6c7ec294be2c968656fb0
List all tokens in wallet 0x1234567890abcdef1234567890abcdef12345678
What tokens does 0x1234567890abcdef1234567890abcdef12345678 hold?
```

**Example Response:**
```
Multichain Portfolio for 0x1234567890abcdef1234567890abcdef12345678

Total Value: $12,345.67

Assets by Chain:

Ethereum ($5,678.90 - 46.0%):
  • ETH (Ethereum): 2.5 = $4,500.00 (+1.2% 24h)
  • USDC (USD Coin): 1,000.00 = $1,000.00 (0.0% 24h)
  • LINK (Chainlink): 12.5 = $178.90 (-0.8% 24h)

Arbitrum ($2,345.67 - 19.0%):
  • ETH (Ethereum): 1.0 = $1,800.00 (+1.2% 24h)
  • ARB (Arbitrum): 500.0 = $545.67 (+3.5% 24h)

Optimism ($1,234.56 - 10.0%):
  • ETH (Ethereum): 0.5 = $900.00 (+1.2% 24h)
  • OP (Optimism): 300.0 = $334.56 (+2.1% 24h)

View on Zerion: https://app.zerion.io/0x1234567890abcdef1234567890abcdef12345678/overview
```

## Usage Tips

1. **Wallet Address**: You must provide a valid Ethereum wallet address (42 characters starting with 0x).
2. **Refresh Rate**: Data is cached for 5 minutes to reduce API calls. For the most up-to-date information, wait at least 5 minutes between requests.
3. **Chain Support**: The module supports all major EVM-compatible chains including Ethereum, Arbitrum, Optimism, Polygon, Base, BNB Chain, Avalanche, Mantle, and more.
4. **Token Support**: All tokens indexed by Zerion are supported, including mainstream tokens and more obscure assets.

## Supported Chains

The module supports a wide range of blockchain networks, including:

- Ethereum
- Arbitrum
- Optimism
- Polygon
- Base
- BNB Chain (formerly BSC)
- Avalanche
- Mantle
- zkSync Era
- Zora
- Linea
- Fantom
- Celo
- Gnosis
- Moonbeam
- Harmony
- Metis
- Sonic

## Error Handling

The module includes comprehensive error handling for:
- Invalid wallet addresses
- API connection issues
- Rate limiting
- Missing or invalid data

## Caching

Data is cached for 5 minutes to:
- Reduce API calls
- Improve response times
- Handle rate limiting
- Provide fallback data

## Future Enhancements

Planned features include:
- Historical portfolio performance
- Token price alerts
- Portfolio comparison
- DeFi position tracking (lending, borrowing, staking)
- NFT portfolio integration
- Custom portfolio tracking 