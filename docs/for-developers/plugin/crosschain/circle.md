# Circle Bridge USDC Transfer Module

The Circle Bridge module provides cross-chain USDC transfer capabilities by integrating with Circle's Cross-Chain Transfer Protocol (CCTP). It enables users to seamlessly transfer USDC between different blockchain networks using Circle's official bridge.

## Configuration

This module is configured to use:
- **Mainnet**: All transactions are performed on the main Circle Bridge network
- **Real Wallet**: Uses the EVM_PRIVATE_KEY or WALLET_PRIVATE_KEY runtime setting for wallet functionality
- **Production Ready**: Fully integrated with the Wormhole SDK's Circle Bridge implementation for real transactions

## Features

- Cross-chain USDC transfers via Circle Bridge
- Support for multiple blockchain networks
- Simple and intuitive interface
- Native USDC transfers (not wrapped tokens)
- Official Circle attestation process

## Actions

### Circle USDC Transfer (`CIRCLE_USDC_TRANSFER`)

Transfers USDC from one blockchain to another using the Circle Cross-Chain Transfer Protocol.

**Test Prompts:**
```
Transfer 0.001 USDC from Ethereum to Polygon via Circle
Send 0.01 USDC from Arbitrum to Base using Circle Bridge
Bridge 0.005 USDC from Optimism to Ethereum with CCTP
Move 0.001 USDC from Ethereum to Avalanche with Circle
Transfer 0.01 USDC from Polygon to Arbitrum via Circle Bridge
```

**Example Response:**
```
I've initiated a Circle USDC transfer of 0.001 USDC from ethereum to polygon. You can track the transaction here: https://etherscan.io/tx/0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef

Transaction hash: 0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef

Please note that Circle transfers typically take 5-10 minutes to complete.
```

## Supported Chains

The Circle Bridge module supports USDC transfers between the following blockchain networks:

- Ethereum
- Avalanche
- Optimism
- Arbitrum
- Solana
- Base
- Polygon
- Sui
- Aptos

## Important Notes

1. **USDC Only**: Circle Bridge only supports USDC transfers. It doesn't support other tokens.

2. **Native USDC**: Circle Bridge transfers the native USDC token, not a wrapped version. This means you'll receive the official Circle-issued USDC on the destination chain.

3. **Chain Support**: Not all chains are supported. Notably, Mantle and BSC are not currently supported by Circle Bridge. If you try to transfer USDC from or to an unsupported chain, you'll get an error message listing the supported chains.

4. **Gas Fees**: You need to have the native token of the source chain to pay for gas fees. For example, if you're transferring USDC from Ethereum, you need ETH to pay for gas.

5. **Attestation Process**: Circle Bridge uses an attestation process, which means transfers typically take 5-10 minutes to complete.

## Usage Tips

1. **Specify Circle**: Always mention "Circle", "CCTP", or "Circle Bridge" to distinguish from Wormhole token transfers
2. **Chain Names**: Use common chain names (e.g., "Ethereum", "Polygon", "Arbitrum")
3. **Amount**: Specify the amount of USDC to transfer (e.g., "0.01 USDC") - use small amounts for testing
4. **Source and Destination**: Clearly specify the source and destination chains (e.g., "from Ethereum to Polygon")
5. **Token Type**: You don't need to specify the token type as Circle Bridge only supports USDC

## Error Handling

The module includes comprehensive error handling for:
- Unsupported chains
- Insufficient native token balance for gas fees
- Insufficient USDC balance for transfer
- API connection issues
- Transaction failures
- Wallet configuration issues

## Security Considerations

1. **Private Key**: The module uses the EVM_PRIVATE_KEY or WALLET_PRIVATE_KEY runtime setting. Ensure these are securely stored and not exposed.
2. **Small Amounts**: When testing on mainnet, use small amounts to minimize risk.
3. **Gas Fees**: Be aware that cross-chain transfers will incur gas fees on the source chain.
4. **Transaction Verification**: Always verify transaction details before confirming.

## Comparison with Wormhole

| Feature | Circle Bridge | Wormhole |
|---------|--------------|----------|
| Tokens Supported | USDC only | Multiple tokens (ETH, USDC, USDT, etc.) |
| Chain Support | 9 chains | 15+ chains |
| Token Type | Native USDC | Wrapped tokens |
| Speed | 5-10 minutes | Varies by chain |
| Security | Circle attestation | Wormhole guardians |
| Use Case | Official USDC transfers | General token bridging |

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