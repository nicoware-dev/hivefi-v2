# Wormhole Cross-Chain Examples for Mantle and BSC

This document provides examples of using the Wormhole cross-chain module with Mantle and BSC (Binance Smart Chain).

## Supported Tokens

### Mantle
- USDT
- USDC
- ETH
- MNT (native token)
- WETH

### BSC (Binance Smart Chain)
- USDT
- USDC
- BNB (native token)
- ETH
- BUSD
- WETH

## Transfer Examples

### Mantle to Other Chains

```
Transfer 0.01 MNT from Mantle to Ethereum using Wormhole
Send 0.005 USDT from Mantle to BSC via Wormhole bridge
Bridge 0.001 USDC from Mantle to Polygon through Wormhole
Move 0.01 ETH from Mantle to Arbitrum with Wormhole
```

### BSC to Other Chains

```
Transfer 0.01 BNB from BSC to Ethereum using Wormhole
Send 0.005 USDT from BSC to Polygon via Wormhole bridge
Bridge 0.001 BUSD from BSC to Arbitrum through Wormhole
Move 0.01 ETH from BSC to Optimism with Wormhole
```

### Other Chains to Mantle

```
Transfer 0.01 ETH from Ethereum to Mantle using Wormhole
Send 0.005 USDT from Polygon to Mantle via Wormhole bridge
Bridge 0.001 USDC from Arbitrum to Mantle through Wormhole
```

### Other Chains to BSC

```
Transfer 0.01 ETH from Ethereum to BSC using Wormhole
Send 0.005 USDT from Polygon to BSC via Wormhole bridge
Bridge 0.001 USDC from Arbitrum to BSC through Wormhole
```

## Redeem Examples

```
Redeem my tokens from Wormhole on Mantle
Claim my USDT from Wormhole on BSC
Redeem my cross-chain transfer on Mantle
Claim my Wormhole tokens on BSC
```

## Troubleshooting

If you encounter issues with transfers involving Mantle or BSC, try the following:

1. Ensure you're using supported tokens for the specific chains
2. For Mantle, use MNT as the native token
3. For BSC, use BNB as the native token
4. Check that the destination chain supports the token you're trying to transfer
5. For USDC transfers, the Circle CCTP bridge will be used automatically

## Implementation Notes

- Mantle is mapped to Ethereum in the Wormhole SDK for compatibility
- BSC is mapped to Bsc in the Wormhole SDK
- Native token transfers use the appropriate wrapped token on the destination chain
- The system will fall back to a mock implementation if the token wrapping fails 