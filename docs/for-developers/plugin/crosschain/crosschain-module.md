# Cross-Chain Module

The Cross-Chain module enables seamless token transfers between different blockchain networks using the Wormhole bridge protocol. This module allows users to move assets across chains with simple natural language commands.

## Overview

The Cross-Chain module provides the following key capabilities:

- Cross-chain token transfers via Wormhole bridge
- Token redemption on destination chains
- Support for multiple blockchain networks
- Support for multiple token types
- Simple and intuitive interface

## Wormhole Integration

The Wormhole integration provides cross-chain token transfer capabilities by leveraging the Wormhole protocol. It enables users to seamlessly transfer tokens between different blockchain networks.

### Key Features
- Cross-chain token transfers
- Token redemption on destination chains
- Support for multiple blockchain networks
- Support for multiple token types
- Transaction status tracking

## Supported Chains

The Wormhole cross-chain module supports transfers between the following blockchain networks:

- Ethereum
- Solana
- Polygon
- BSC (Binance Smart Chain)
- Avalanche
- Fantom
- Celo
- Moonbeam
- Arbitrum
- Optimism
- Aptos
- Sui
- Base
- Mantle
- Sonic

### Special Support for Mantle and BSC

The module includes special handling for Mantle and BSC chains, ensuring that transfers between these chains work correctly. The following token combinations are supported:

**Mantle:**
- USDT
- USDC
- ETH
- MNT (Mantle native token)
- WETH

**BSC (Binance Smart Chain):**
- USDT
- USDC
- BNB (Binance native token)
- ETH
- BUSD
- WETH

## Supported Tokens

The Wormhole cross-chain module supports the following token types:

- NATIVE (native token of the chain)
- ETH (Ethereum)
- WETH (Wrapped Ethereum)
- BTC (Bitcoin)
- WBTC (Wrapped Bitcoin)
- USDC (USD Coin)
- USDT (Tether)
- DAI (Dai Stablecoin)
- MATIC (Polygon)
- SOL (Solana)
- AVAX (Avalanche)
- BNB (Binance Coin)
- FTM (Fantom)
- CELO (Celo)
- GLMR (Moonbeam)
- ARB (Arbitrum)
- OP (Optimism)
- APT (Aptos)
- SUI (Sui)
- MNT (Mantle)
- SONIC (Sonic)

Note: Some tokens may only be available on specific chains.

## Cross-Chain Actions

### WORMHOLE_CROSS_CHAIN_TRANSFER

Transfers tokens from one blockchain to another using the Wormhole cross-chain protocol.

**Example Prompts:**
```
Transfer 0.01 ETH from Ethereum to Polygon using Wormhole
Send 0.001 USDC from Ethereum to Solana via Wormhole bridge
Bridge 0.005 WETH from Ethereum to Arbitrum through Wormhole
Move 0.001 USDT from Ethereum to Optimism with Wormhole
Transfer 0.01 USDT from Mantle to BSC via Wormhole
Bridge 0.005 ETH from BSC to Mantle using Wormhole
```

**Response Example:**
```
Successfully initiated cross-chain transfer of 0.001 ETH from ethereum to solana via Wormhole.

Transaction hash: 0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef

The transfer is being processed and should be completed shortly. You can redeem your tokens on the destination chain once the transfer is complete.
```

### WORMHOLE_CROSS_CHAIN_REDEEM

Redeems tokens on the destination chain after they have been transferred via the Wormhole cross-chain protocol.

**Example Prompts:**
```
Redeem my ETH tokens from Wormhole
Claim my USDC tokens on Solana from Wormhole bridge
Redeem my native tokens on Arbitrum via Wormhole
Claim my tokens with transaction ID 0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef from Wormhole
Claim my USDT tokens on BSC from Wormhole
Redeem my ETH on Mantle from Wormhole bridge
```

**Response Example:**
```
Successfully redeemed ETH tokens on solana from Wormhole cross-chain transfer.

Transaction hash: 0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef

Your tokens should be available in your wallet shortly.
```

## Usage Tips

1. **Specify Wormhole**: Always mention "Wormhole", "cross-chain", or "bridge" to distinguish from regular token transfers
2. **Chain Names**: Use common chain names (e.g., "Ethereum", "Solana", "Arbitrum")
3. **Amount**: Specify the amount of tokens to transfer (e.g., "0.01 tokens") - use small amounts for testing
4. **Token Type**: Specify the token type if not using the native token (e.g., "ETH", "USDC")
5. **Source and Destination**: Clearly specify the source and destination chains (e.g., "from Ethereum to Solana")
6. **Redemption**: When redeeming tokens, specify the chain if possible (e.g., "Redeem my tokens on Solana")
7. **Transaction ID**: For redemption, you can optionally provide the transaction ID of the transfer

## Error Handling

The module includes comprehensive error handling for:
- Invalid chain names
- Invalid token types
- Missing parameters (amount, source chain, destination chain)
- Unsupported token-chain combinations
- API connection issues
- Transaction failures
- Wallet configuration issues

## Security Considerations

1. **Private Key**: The module uses the EVM_PRIVATE_KEY environment variable. Ensure this is securely stored and not exposed.
2. **Small Amounts**: When testing, use small amounts to minimize risk.
3. **Gas Fees**: Be aware that cross-chain transfers will incur gas fees on both the source and destination chains.
4. **Transaction Verification**: Always verify transaction details before confirming.

## Future Enhancements

Planned features include:
- Fee estimation
- Transaction status tracking
- Historical transfer lookup
- Multi-token transfers
- Support for additional token types
- Enhanced security features 