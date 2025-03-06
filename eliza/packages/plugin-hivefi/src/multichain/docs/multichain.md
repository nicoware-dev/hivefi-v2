# Multichain Module Documentation

The Multichain module for the HiveFi plugin enables cross-chain interactions with various EVM-compatible networks and protocols. This module provides a unified interface for performing common blockchain operations across multiple chains and interacting with popular DeFi protocols that support multiple networks.

## Current Implementation Status

### ✅ Implemented Features
1. **Cross-Chain Wallet Management**
   - Wallet initialization from EVM private key
   - Support for multiple EVM chains
   - Chain-specific wallet access
   - Error handling and user feedback

2. **Core Actions**
   - Native token transfers across chains
   - ERC-20 token transfers across chains (simulation mode)
   - Action context composition
   - Response generation

### 🔄 In Progress
1. **ERC-20 Token Transfers**
   - Currently in simulation mode
   - Needs integration with actual transaction sending

2. **Protocol Integrations**
   - Uniswap integration
   - Aave integration
   - Beefy integration

### 📋 Planned Features
1. **Network Status and Information**
   - Gas price information
   - Network status monitoring
   - Transaction history

## Core Actions

### Native Token Transfer (TRANSFER_NATIVE_TOKEN)

Transfer native tokens (ETH, MATIC, etc.) on any supported chain.

**Example Prompts:**
```
Transfer 0.01 ETH on Arbitrum to 0x123...
Send 0.5 MATIC on Polygon to 0xabc...
Transfer 0.1 ETH from my wallet to 0x456... on Optimism
```

**Requirements:**
- EVM_PRIVATE_KEY must be set in runtime settings
- Valid destination address
- Sufficient balance for transfer + gas

### ERC-20 Token Transfer (TRANSFER_ERC20_TOKEN)

Transfer ERC-20 tokens on any supported chain (currently in simulation mode).

**Currently Supported Tokens:**
- USDC (USD Coin)
- USDT (Tether USD)
- DAI (Dai Stablecoin)

**Supported Chains:**
- Ethereum (Chain ID: 1)
- Optimism (Chain ID: 10)
- Arbitrum (Chain ID: 42161)
- Polygon (Chain ID: 137)

**Example Prompts:**
```
Send 10 USDC on Optimism to 0x123...
Transfer 5 DAI on Ethereum to 0xabc...
Send 100 USDT from my wallet to 0x456... on Arbitrum
```

**Requirements:**
- EVM_PRIVATE_KEY must be set in runtime settings
- Valid destination address
- Sufficient token balance
- Sufficient native token for gas

**Current Limitations:**
- The ERC-20 transfer action is currently in simulation mode
- It demonstrates the steps that would be taken but doesn't execute actual transactions
- Full transaction support will be added in a future update

## Testing Instructions

### Prerequisites
1. Set up environment variables:
   ```bash
   # Required
   export EVM_PRIVATE_KEY=your_private_key_here  # 64-character hex string without 0x prefix
   
   # Optional
   export EVM_RPC_URL=your_preferred_rpc_url     # Override default RPC URL
   ```

2. Ensure your wallet has:
   - Native tokens for gas on target chains
   - ERC-20 tokens if testing token transfers

### Test Scenarios

1. **Native Token Transfers**
   ```
   # Basic transfer
   "Transfer 0.001 ETH on Arbitrum to 0x123..."
   
   # Transfer with specific details
   "Send exactly 0.05 MATIC on Polygon to 0xabc..."
   
   # Error cases
   "Transfer 1000 ETH on Optimism to 0x456..."  # Insufficient balance
   "Send 0.1 ETH on InvalidChain to 0x789..."   # Invalid chain
   ```

2. **ERC-20 Token Transfers (Simulation)**
   ```
   # Basic token transfer
   "Send 5 USDC on Optimism to 0x123..."
   
   # Transfer with specific details
   "Transfer exactly 10 DAI on Ethereum to 0xabc..."
   
   # Error cases
   "Send 1000000 USDC on Arbitrum to 0x456..."  # Insufficient balance
   "Transfer 10 PEPE on Polygon to 0x789..."    # Unsupported token
   ```

### Expected Behavior

1. **Successful Native Token Transfers**
   - Agent acknowledges the request
   - Confirms transaction details
   - Processes the transaction
   - Returns transaction status and hash

2. **Successful ERC-20 Token Transfers (Simulation)**
   - Agent acknowledges the request
   - Explains the steps that would be taken
   - Provides a simulated transaction hash
   - No actual tokens are transferred

3. **Error Handling**
   - Invalid chain: Clear error message suggesting valid chains
   - Invalid token: Error message listing supported tokens
   - Insufficient balance: Error message showing current balance
   - Configuration issues: Instructions for setting up EVM_PRIVATE_KEY
   - Network issues: Appropriate error message with retry suggestion

## Configuration

The module requires the following environment variables:

```bash
# Required
EVM_PRIVATE_KEY=your_private_key_here  # 64-character hex string without 0x prefix

# Optional
EVM_RPC_URL=your_preferred_rpc_url     # Override default RPC URL
```

## Error Messages

Common error messages and their meanings:

1. "EVM_PRIVATE_KEY not configured"
   - Solution: Set the EVM_PRIVATE_KEY environment variable

2. "Invalid chain specified"
   - Solution: Use one of the supported chains

3. "Invalid token symbol. Supported tokens: USDC, USDT, DAI"
   - Solution: Use one of the supported tokens

4. "X is not supported on this chain. Supported chains for X: ..."
   - Solution: Use a supported chain for the specified token

5. "Invalid address format"
   - Solution: Use a valid Ethereum-style address (0x...)

## Next Steps

1. Complete the ERC-20 token transfer implementation
   - Integrate with actual transaction sending
   - Add balance checking
   - Add transaction status tracking

2. Add support for more ERC-20 tokens
   - Research how to add custom token definitions
   - Add popular tokens like WETH, WBTC, etc.

3. Implement protocol integrations
   - Start with Uniswap for token swaps
   - Add Aave for lending/borrowing
   - Add Beefy for yield optimization

4. Add comprehensive error handling
   - More detailed error messages
   - Better recovery suggestions
   - Transaction simulation before sending
