# Multichain Module Documentation

The Multichain module for the HiveFi plugin enables cross-chain interactions with various EVM-compatible networks and protocols. This module provides a unified interface for performing common blockchain operations across multiple chains and interacting with popular DeFi protocols that support multiple networks.

## Core Features

1. **Cross-Chain Wallet Management**
   - Manage wallet addresses across multiple EVM chains
   - View balances across all supported chains
   - Transfer native tokens and ERC-20 tokens on any supported chain

2. **Multichain Protocol Integration**
   - Interact with popular DeFi protocols across multiple chains
   - Unified interface for protocol-specific actions
   - Chain-aware protocol interactions

3. **Network Status and Information**
   - Gas price information across chains
   - Network status monitoring
   - Transaction history and tracking

## Supported Chains

The module supports the following EVM-compatible chains:

- Ethereum (Mainnet)
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

## Module Structure

```
multichain/
├── actions/                  # Core chain-agnostic actions
│   ├── transfer.ts           # Transfer native tokens
│   ├── token-transfer.ts     # Transfer ERC-20 tokens
│   └── ...
├── providers/                # Chain-agnostic providers
│   ├── wallet.ts             # Multichain wallet provider
│   ├── explorer.ts           # Blockchain explorer provider
│   └── ...
├── aave/                     # Aave protocol integration
│   ├── actions/              # Aave-specific actions
│   ├── providers/            # Aave-specific providers
│   └── ...
├── uniswap/                  # Uniswap protocol integration
│   ├── actions/              # Uniswap-specific actions
│   ├── providers/            # Uniswap-specific providers
│   └── ...
├── beefy/                    # Beefy protocol integration
│   ├── actions/              # Beefy-specific actions
│   ├── providers/            # Beefy-specific providers
│   └── ...
└── portfolio/                # Portfolio tracking (already implemented)
    ├── actions/              # Portfolio-specific actions
    ├── providers/            # Portfolio-specific providers
    └── ...
```

## Core Actions

### Native Token Transfer

Transfer native tokens (ETH, MATIC, etc.) on any supported chain.

**Example Prompts:**
- "Transfer 0.01 ETH on Arbitrum to 0x123..."
- "Send 0.5 MATIC on Polygon to 0xabc..."
- "Transfer 0.1 ETH from my wallet to 0x456... on Optimism"

### ERC-20 Token Transfer

Transfer ERC-20 tokens on any supported chain.

**Example Prompts:**
- "Send 10 USDC on Optimism to 0x123..."
- "Transfer 5 DAI on Ethereum to 0xabc..."
- "Send 100 USDT from my wallet to 0x456... on Arbitrum"

### Balance Check

Check balances of native tokens and ERC-20 tokens across chains.

**Example Prompts:**
- "Check my ETH balance on Arbitrum"
- "What's my USDC balance on Optimism?"
- "Show all my token balances on Polygon"

## Protocol-Specific Actions

### Uniswap

Interact with Uniswap on multiple chains for token swaps and liquidity management.

**Supported Chains:** Ethereum, Arbitrum, Optimism, Polygon, Base, BNB Chain, Avalanche

**Actions:**
- Swap tokens
- Add liquidity
- Remove liquidity
- Check pool information

**Example Prompts:**
- "Swap 1 USDC for ETH on Uniswap on Arbitrum"
- "Add liquidity to USDC/ETH pool on Uniswap on Optimism"
- "Remove my liquidity from ETH/DAI pool on Uniswap on Polygon"
- "What's the current price of ETH in USDC on Uniswap on Base?"

### Aave

Interact with Aave on multiple chains for lending and borrowing.

**Supported Chains:** Ethereum, Arbitrum, Optimism, Polygon, Avalanche

**Actions:**
- Supply assets
- Withdraw assets
- Borrow assets
- Repay loans
- Check user position

**Example Prompts:**
- "Supply 100 USDC to Aave on Polygon"
- "Withdraw 50 USDC from Aave on Optimism"
- "Borrow 10 DAI against my ETH on Aave on Arbitrum"
- "Repay 5 DAI loan on Aave on Ethereum"
- "What's my current position on Aave on Avalanche?"

### Beefy

Interact with Beefy Finance on multiple chains for yield optimization.

**Supported Chains:** Ethereum, Arbitrum, Optimism, Polygon, BNB Chain, Avalanche, Fantom

**Actions:**
- Deposit into vaults
- Withdraw from vaults
- Check vault APY
- Check user position

**Example Prompts:**
- "Deposit 10 USDC into Beefy vault on BNB Chain"
- "Withdraw 5 USDC from Beefy vault on Fantom"
- "What's the current APY for USDC vault on Beefy on Arbitrum?"
- "Show my Beefy positions on Polygon"

## Implementation Roadmap

1. **Phase 1: Core Infrastructure**
   - Multichain wallet provider
   - Explorer provider
   - Native token transfer
   - ERC-20 token transfer
   - Balance check

2. **Phase 2: Uniswap Integration**
   - Swap functionality
   - Liquidity management
   - Pool information

3. **Phase 3: Aave Integration**
   - Supply/Withdraw
   - Borrow/Repay
   - Position management

4. **Phase 4: Beefy Integration**
   - Vault deposits/withdrawals
   - APY information
   - Position management

5. **Phase 5: Additional Protocols**
   - Curve
   - Balancer
   - Compound
   - Others based on demand

## Configuration

The module requires the following environment variables:

```
# Wallet Configuration
WALLET_PRIVATE_KEY=your_private_key_here

# RPC Endpoints
ETHEREUM_RPC_URL=https://ethereum-rpc-url
ARBITRUM_RPC_URL=https://arbitrum-rpc-url
OPTIMISM_RPC_URL=https://optimism-rpc-url
POLYGON_RPC_URL=https://polygon-rpc-url
# Add other chain RPC URLs as needed

# API Keys (if needed)
ETHERSCAN_API_KEY=your_etherscan_api_key
ARBISCAN_API_KEY=your_arbiscan_api_key
# Add other explorer API keys as needed
```

## Usage Guidelines

1. **Chain Specification**: Always specify the chain in your prompt when performing an action.
2. **Address Format**: Use the full Ethereum address format (0x...) for all addresses.
3. **Token Amounts**: Specify token amounts in human-readable format (e.g., "1 ETH" not "1000000000000000000").
4. **Gas Settings**: The module will automatically use reasonable gas settings, but you can override them if needed.

## Error Handling

The module includes comprehensive error handling for:
- Invalid addresses
- Insufficient balances
- Failed transactions
- Network issues
- Protocol-specific errors

Each error will be reported with a clear, user-friendly message explaining the issue and suggesting possible solutions.
