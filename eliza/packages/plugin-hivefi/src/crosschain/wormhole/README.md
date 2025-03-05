# Wormhole Cross-Chain Module

This module enables cross-chain token transfers using the Wormhole protocol and Circle Bridge, allowing users to seamlessly move tokens between different blockchain networks.

## Implementation Status

✅ **Production Ready**

The module is now fully implemented with the actual Wormhole SDK and Circle Bridge integration, and is ready for production use. It includes:

- Real Wormhole SDK integration
- Circle Bridge USDC transfers
- Mainnet configuration
- Wallet integration using runtime settings
- Comprehensive error handling
- Detailed logging for debugging

## Features

- Cross-chain token transfers via Wormhole bridge
- Native USDC transfers via Circle Bridge
- Token redemption on destination chains
- Support for multiple blockchain networks
- Support for multiple token types
- Intuitive natural language interface

## Configuration

To use this module, you need to configure the following runtime settings:

```
EVM_PRIVATE_KEY=your_private_key
```

or

```
WALLET_PRIVATE_KEY=your_private_key
```

## Usage Examples

### Wormhole Token Transfers

```
Transfer 0.01 ETH from Ethereum to Polygon using Wormhole
Send 0.001 USDC from Ethereum to Solana via Wormhole bridge
Bridge 0.005 WETH from Ethereum to Arbitrum through Wormhole
Transfer 0.01 USDT from Mantle to BSC via Wormhole
Bridge 0.005 BNB from BSC to Mantle using Wormhole
```

### Circle USDC Transfers

```
Transfer 0.001 USDC from Ethereum to Polygon via Circle
Send 0.01 USDC from Arbitrum to Base using Circle Bridge
Bridge 0.005 USDC from Optimism to Ethereum with CCTP
Move 0.001 USDC from Ethereum to Avalanche with Circle
Transfer 0.01 USDC from Polygon to Arbitrum via Circle Bridge
```

### Redeem Tokens

```
Redeem my ETH tokens from Wormhole
Claim my USDC tokens on Solana from Wormhole bridge
Redeem my tokens with transaction ID 0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef
Claim my USDT tokens on BSC from Wormhole
Redeem my ETH on Mantle from Wormhole bridge
```

## Actions

The module provides three main actions:

1. **WORMHOLE_CROSS_CHAIN_TRANSFER** - Transfers tokens from one blockchain to another using Wormhole
2. **CIRCLE_USDC_TRANSFER** - Transfers USDC from one blockchain to another using Circle Bridge
3. **WORMHOLE_CROSS_CHAIN_REDEEM** - Redeems tokens on the destination chain

## Providers

The module includes providers that detect cross-chain transfer requests and route them to the appropriate action:

- **WormholeProvider** - Detects transfer and redeem requests related to Wormhole
- **CircleProvider** - Detects USDC transfer requests related to Circle Bridge

## Supported Chains

### Wormhole Supported Chains

The Wormhole integration supports transfers between the following blockchain networks:

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

Note: Special support has been added for Mantle and BSC chains.

### Circle Bridge Supported Chains

The Circle Bridge integration supports USDC transfers between the following blockchain networks:

- Ethereum
- Avalanche
- Optimism
- Arbitrum
- Solana
- Base
- Polygon
- Sui
- Aptos

## Supported Tokens

### Wormhole Supported Tokens

The Wormhole integration supports the following token types:

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

Note: For Mantle, the supported tokens are USDT, USDC, ETH, MNT, and WETH.
Note: For BSC, the supported tokens are USDT, USDC, BNB, ETH, BUSD, and WETH.

### Circle Bridge Supported Tokens

The Circle Bridge integration supports only USDC transfers.

## When to Use Circle Bridge vs. Wormhole

- **Use Circle Bridge when**:
  - You specifically want to transfer USDC
  - You want the native USDC token on the destination chain
  - You're transferring between supported chains
  - You want the official Circle-backed transfer method

- **Use Wormhole when**:
  - You want to transfer tokens other than USDC
  - You need to transfer to/from chains not supported by Circle (e.g., Mantle, BSC)
  - You're comfortable with wrapped token representations
  - You need more flexibility in token types and chain options

## Debugging

The module includes detailed logging to help with debugging. Look for console logs that show:

- Incoming message processing
- Parameter extraction
- Validation results
- API calls
- Transaction hashes
- Error messages

## Known Limitations

- Gas fees are not automatically calculated or displayed to the user
- Some token-chain combinations may not be supported
- Cross-chain transfers can take time to complete depending on network conditions
- Circle Bridge only supports USDC transfers

## Future Enhancements

- Add gas fee estimation
- Implement transaction status tracking
- Add support for more tokens and chains
- Enhance error messages with more specific guidance
- Implement transaction history tracking

## Documentation

For more detailed documentation, see the following:
- [Wormhole Cross-Chain Module Documentation](./docs/wormhole.md)
- [Circle Bridge USDC Transfer Documentation](./docs/circle.md)
- [Mantle and BSC Transfer Examples](./docs/mantle_bsc_examples.md)

# Implementation Details

## Overview

The implementation allows for transferring tokens between different blockchain networks using both the Wormhole protocol and Circle Bridge. It supports regular token transfers via Wormhole and native USDC transfers via Circle Bridge.

## Architecture

The implementation follows a layered approach:

1. **API Layer**: Provides high-level functions for token transfers and redemptions.
2. **Configuration Layer**: Manages chain and token configurations.
3. **Utility Layer**: Provides helper functions for chain and token operations.

## Key Components

- **TokenTransfer**: Handles token transfers between chains using Wormhole.
- **CircleTransfer**: Handles USDC transfers between chains using Circle Bridge.
- **TokenRedeem**: Handles token redemptions on destination chains.
- **Instance**: Manages the Wormhole SDK instance.
- **Config**: Provides configuration for chains, tokens, and RPC endpoints.

## Using the Wormhole SDK

### Initialization

The Wormhole SDK is initialized with the EVM platform support:

```typescript
const wormholeInstance = await wormhole('Mainnet', [evm], {
  chains: chainConfig
});
```

### Token Transfers via Wormhole

To perform a token transfer using Wormhole:

1. Create a token ID:
   ```typescript
   const tokenId = { 
     chain: wormholeSourceChain, 
     address: tokenAddress 
   } as TokenId;
   ```

2. Create a token transfer:
   ```typescript
   const xfer = await wh.tokenTransfer(
     tokenId,
     amountBigInt,
     { chain: wormholeSourceChain, address: signerAddress },
     { chain: wormholeDestChain, address: signerAddress },
     false, // Not automatic
     undefined, // No payload
     undefined // No native gas dropoff
   );
   ```

3. Initiate the transfer:
   ```typescript
   const srcTxids = await xfer.initiateTransfer(signer);
   ```

### USDC Transfers via Circle Bridge

To perform a USDC transfer using Circle Bridge:

1. Create a Circle transfer:
   ```typescript
   const xfer = await wh.circleTransfer(
     amountBigInt,
     sourceAddress,
     destAddress,
     false, // Not automatic
     undefined, // No payload
     undefined // No native gas dropoff
   );
   ```

2. Initiate the transfer:
   ```typescript
   const srcTxids = await xfer.initiateTransfer(signer);
   ```