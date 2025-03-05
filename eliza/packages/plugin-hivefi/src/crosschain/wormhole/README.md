# Wormhole Cross-Chain Module

This module enables cross-chain token transfers using the Wormhole protocol, allowing users to seamlessly move tokens between different blockchain networks.

## Implementation Status

✅ **Production Ready**

The Wormhole module is now fully implemented with the actual Wormhole SDK and is ready for production use. It includes:

- Real Wormhole SDK integration
- Mainnet configuration
- Wallet integration using runtime settings
- Comprehensive error handling
- Detailed logging for debugging

## Features

- Cross-chain token transfers via Wormhole bridge
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

### Transfer Tokens

```
Transfer 0.01 ETH from Ethereum to Polygon using Wormhole
Send 0.001 USDC from Ethereum to Solana via Wormhole bridge
Bridge 0.005 WETH from Ethereum to Arbitrum through Wormhole
Transfer 0.01 USDT from Mantle to BSC via Wormhole
Bridge 0.005 BNB from BSC to Mantle using Wormhole
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

The module provides two main actions:

1. **WORMHOLE_CROSS_CHAIN_TRANSFER** - Transfers tokens from one blockchain to another
2. **WORMHOLE_CROSS_CHAIN_REDEEM** - Redeems tokens on the destination chain

## Providers

The module includes a provider that detects Wormhole-related requests and routes them to the appropriate action:

- **WormholeProvider** - Detects transfer and redeem requests related to Wormhole

## Supported Chains

The module supports transfers between the following blockchain networks:

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

## Supported Tokens

The module supports the following token types:

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
- Some token-chain combinations may not be supported by Wormhole
- Cross-chain transfers can take time to complete depending on network conditions
- In testing mode, the module will fall back to mock implementations when encountering errors

## Future Enhancements

- Add gas fee estimation
- Implement transaction status tracking
- Add support for more tokens and chains
- Enhance error messages with more specific guidance
- Implement transaction history tracking

## Documentation

For more detailed documentation, see the following:
- [Wormhole Cross-Chain Module Documentation](./docs/wormhole.md)
- [Mantle and BSC Transfer Examples](./docs/mantle_bsc_examples.md)