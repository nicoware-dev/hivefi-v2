# Multichain Portfolio Module

This module provides a comprehensive view of wallet balances and token positions across multiple blockchain networks using the Zerion API.

## Setup

1. Make sure you have a Zerion API key. If you don't have one, you can get it from [Zerion Developer Portal](https://developers.zerion.io/).

2. Add your Zerion API key to your Eliza settings:
   
   For local development, add it to your `.env` file:
   ```
   ZERION_API_KEY=your_api_key_here
   ```
   
   **Important**: Use the Project ID from Zerion as your API key. This is the value that starts with "Zerion" followed by alphanumeric characters.
   
   For production, make sure to set it in your environment variables or secrets manager.

## Features

- Cross-chain portfolio summary
- Detailed token positions by chain
- 24-hour performance tracking
- Chain distribution analysis
- Position type breakdown (wallet, deposited, staked, etc.)

## Usage Examples

### Portfolio Summary

Get a high-level overview of a wallet's portfolio across all supported chains:

```
Show me a summary of my portfolio for 0x1234567890abcdef1234567890abcdef12345678
```

### Portfolio Details

Get detailed information about all token positions in a wallet across all supported chains:

```
Show me detailed positions in my portfolio for 0x1234567890abcdef1234567890abcdef12345678
```

## Supported Chains

The module supports all major EVM-compatible chains including:
- Ethereum
- Arbitrum
- Optimism
- Polygon
- Base
- BNB Chain
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

## Implementation Details

This module is built on top of the Zerion API and provides a clean interface for accessing wallet data across multiple chains. The implementation includes:

- Comprehensive type definitions
- Efficient caching mechanism
- Detailed error handling
- Human-readable formatting of responses
- Chain name normalization

For more detailed documentation, see the [portfolio.md](./docs/portfolio.md) file. 