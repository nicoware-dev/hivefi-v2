# MultiChain Module

The MultiChain module enables users to interact with multiple EVM-compatible blockchain networks through a unified interface. This module provides wallet operations, token transfers, and portfolio management across various chains.

## Overview

The MultiChain module provides the following key capabilities:

- Wallet operations across multiple chains
- Native token transfers
- ERC-20 token transfers
- Portfolio management and tracking
- Chain-specific wallet access
- Transaction status tracking
- Error handling and user feedback

## Supported Chains

The module supports the following EVM-compatible chains:

- Ethereum (Chain ID: 1)
- Optimism (Chain ID: 10)
- Arbitrum (Chain ID: 42161)
- Polygon (Chain ID: 137)
- Mantle (Chain ID: 5000)
- Base (Chain ID: 8453)
- Avalanche (Chain ID: 43114)
- BNB Chain (Chain ID: 56)
- Fantom (Chain ID: 250)

## Module Components

The MultiChain module consists of several components:

### [Token Transfers](multichain/token-transfers.md)

The Token Transfers component enables users to transfer tokens across multiple EVM-compatible chains. It supports both native token transfers and ERC-20 token transfers.

Key features:
- Native token transfers across multiple chains
- ERC-20 token transfers across multiple chains
- Automatic gas estimation
- Transaction status tracking

For detailed information, see the [Token Transfers Documentation](multichain/token-transfers.md).

### [Portfolio Management](multichain/portfolio.md)

The Portfolio Management component enables users to track and manage their assets across multiple chains. It provides a unified view of all holdings and positions.

Key features:
- Cross-chain asset tracking
- Token balance monitoring
- Portfolio valuation
- Historical performance tracking

For detailed information, see the [Portfolio Management Documentation](multichain/portfolio.md).

## MultiChain Actions

### TRANSFER_NATIVE_TOKEN

Transfers native tokens (ETH, MATIC, etc.) on any supported chain.

**Example Prompts:**
```
Transfer 0.01 ETH on Arbitrum to 0x123...
Send 0.5 MATIC on Polygon to 0xabc...
Transfer 0.1 ETH from my wallet to 0x456... on Optimism
```

**Response Example:**
```
Successfully transferred 0.01 ETH on Arbitrum to 0x123...

Transaction hash: 0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef

The transaction has been confirmed and the tokens should be available in the recipient's wallet shortly.
```

### TRANSFER_ERC20_TOKEN

Transfers ERC-20 tokens on any supported chain.

**Example Prompts:**
```
Send 10 USDC on Optimism to 0x123...
Transfer 5 DAI on Ethereum to 0xabc...
Send 100 USDT from my wallet to 0x456... on Arbitrum
```

**Response Example:**
```
Successfully transferred 10 USDC on Optimism to 0x123...

Transaction hash: 0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef

The transaction has been confirmed and the tokens should be available in the recipient's wallet shortly.
```

### GET_PORTFOLIO

Retrieves the user's portfolio across multiple chains.

**Example Prompts:**
```
Show me my portfolio
Get my wallet balances
What tokens do I hold?
Show me my assets across all chains
```

**Response Example:**
```
Your Portfolio:

Ethereum:
- ETH: 1.5 ETH ($5,250.00)
- USDC: 1,000 USDC ($1,000.00)
- WBTC: 0.05 WBTC ($3,412.50)

Arbitrum:
- ETH: 0.5 ETH ($1,750.00)
- USDC: 500 USDC ($500.00)

Total Portfolio Value: $11,912.50
```

## Usage Tips

1. **Chain Specification**: Always specify the chain on which you want to perform an action (e.g., "on Ethereum", "on Arbitrum")
2. **Token Specification**: For ERC-20 transfers, always specify the token symbol (e.g., "USDC", "DAI")
3. **Amount**: Specify the amount of tokens to transfer
4. **Recipient Address**: Provide the full recipient address (0x...)
5. **Gas Fees**: Be aware that all transfers require gas fees in the native token of the chain

## Error Handling

The module includes comprehensive error handling for:
- Invalid chain names
- Invalid token symbols
- Invalid addresses
- Insufficient balance
- Gas estimation failures
- Transaction failures
- Network issues

## Security Considerations

1. **Private Key**: The module uses the EVM_PRIVATE_KEY environment variable. Ensure this is securely stored and not exposed.
2. **Address Verification**: Always double-check recipient addresses before confirming transfers.
3. **Amount Verification**: Verify the amount before confirming transfers to avoid sending incorrect amounts.
4. **Gas Fees**: Be aware that all transfers require gas fees in the native token of the chain.

## Future Enhancements

Planned features include:
- Protocol integrations (Uniswap, Aave, Beefy)
- Cross-chain token transfers via integrated bridges
- Batch transfers
- Scheduled transfers
- Enhanced transaction history
- Gas optimization strategies 