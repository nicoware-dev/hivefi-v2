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

# Wormhole Integration

This module provides integration with the Wormhole protocol for cross-chain token transfers.

## Overview

The Wormhole integration allows for transferring tokens between different blockchain networks using the Wormhole protocol. It supports both regular token transfers and Circle USDC transfers (CCTP).

## Implementation Details

### Architecture

The implementation follows a layered approach:

1. **API Layer**: Provides high-level functions for token transfers and redemptions.
2. **Configuration Layer**: Manages chain and token configurations.
3. **Utility Layer**: Provides helper functions for chain and token operations.

### Key Components

- **TokenTransfer**: Handles token transfers between chains.
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

### Token Transfers

To perform a token transfer:

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

3. Get a transfer quote:
   ```typescript
   const transferDetails = {
     token: tokenId,
     amount: amountBigInt,
     automatic: false
   };
   
   const quote = await TokenTransfer.quoteTransfer(
     wh,
     srcChain,
     dstChain,
     transferDetails
   );
   ```

4. Initiate the transfer:
   ```typescript
   // Create a custom signer object that matches what the SDK expects
   const customSigner = {
     address: () => signerAddress,
     chain: wormholeSourceChain,
     signTransaction: async (tx: any) => {
       return await signer.signTransaction(tx);
     },
     signAndSend: async (tx: any) => {
       const signedTx = await signer.signTransaction(tx);
       const txHash = await signer.sendTransaction(signedTx);
       return [txHash];
     }
   };
   
   const srcTxids = await xfer.initiateTransfer(customSigner);
   ```

### Circle USDC Transfers

For Circle USDC transfers:

```typescript
const xfer = await wh.circleTransfer(
  amountBigInt,
  { chain: wormholeSourceChain, address: signerAddress },
  { chain: wormholeDestChain, address: signerAddress },
  false, // Not automatic
  undefined, // No payload
  undefined // No native gas dropoff
);

const srcTxids = await xfer.initiateTransfer(customSigner);
```

### Token Redemptions

To redeem tokens on the destination chain:

1. Recover the transfer from a transaction hash:
   ```typescript
   const xfer = await TokenTransfer.from(wh, {
     txid: transactionId
   });
   ```

2. Wait for the attestation:
   ```typescript
   const attestIds = await xfer.fetchAttestation(60_000); // 60 second timeout
   ```

3. Complete the transfer:
   ```typescript
   const destTxids = await xfer.completeTransfer(customSigner);
   ```

## Implementation Notes

### Signer Implementation

The Wormhole SDK expects a signer object with specific methods. Here's an example of a custom signer implementation:

```typescript
const customSigner = {
  address: () => signerAddress,
  chain: wormholeChain,
  signTransaction: async (tx: any) => {
    return await signer.signTransaction(tx);
  },
  signAndSend: async (tx: any) => {
    const signedTx = await signer.signTransaction(tx);
    const txHash = await signer.sendTransaction(signedTx);
    return [txHash];
  }
};
```

### Mock Implementations

For testing or when real transactions are not possible, mock implementations are provided:

```typescript
const mockXfer = mockTokenTransfer(
  tokenId,
  amountBigInt,
  { chain: wormholeSourceChain, address: signerAddress },
  { chain: wormholeDestChain, address: signerAddress },
  false
);

const mockTxids = await mockXfer.initiateTransfer();
```

## References

- [Wormhole SDK Documentation](https://docs.wormhole.com/wormhole/sdk)
- [TokenBridge Protocol](https://docs.wormhole.com/wormhole/explore-wormhole/token-bridge)
- [CircleBridge Protocol](https://docs.wormhole.com/wormhole/explore-wormhole/cctp)