# Multichain Module Implementation Plan

This document outlines the step-by-step implementation plan for the multichain module of the HiveFi plugin. The module will enable cross-chain interactions with various EVM-compatible networks and protocols.

## Phase 1: Core Infrastructure

### Step 1: Set Up Basic Structure ✅
- [x] Create the module directory structure
- [x] Define types and interfaces in `types.ts`
- [x] Define chain configurations in `constants.ts`
- [x] Create utility functions in `utils/chain-utils.ts`

### Step 2: Implement Wallet Provider ✅
- [x] Create `providers/wallet-provider.ts` with the `MultichainWalletProvider` class
- [x] Implement wallet initialization for multiple chains
- [x] Implement methods to get wallet for specific chains
- [x] Implement balance checking across chains

### Step 3: Implement Core Actions ✅
- [x] Create `actions/transfer.ts` for native token transfers
- [x] Create `actions/token-transfer.ts` for ERC-20 token transfers
- [x] Create `actions/index.ts` to export all core actions
- [x] Implement action context composition utilities
- [x] Implement response generation utilities

Key Implementation Details:
- Actions use runtime settings to get EVM_PRIVATE_KEY
- Each action follows the ActionExample format for proper type compatibility
- Actions handle their own wallet provider initialization
- Proper error handling and user feedback implemented

### Step 4: Update Main Module Exports ✅
- [x] Update `index.ts` to export all actions and providers
- [x] Export providers alongside actions for runtime use

## Phase 2: Protocol Integrations 🔄

### Step 1: Uniswap Integration
- [ ] Create `protocols/uniswap/types.ts` for Uniswap-specific types
- [ ] Create `protocols/uniswap/constants.ts` for Uniswap addresses and ABIs
- [ ] Create `protocols/uniswap/actions/swap.ts` for token swaps
- [ ] Create `protocols/uniswap/actions/liquidity.ts` for liquidity management
- [ ] Create `protocols/uniswap/actions/index.ts` to export all Uniswap actions
- [ ] Update main `index.ts` to include Uniswap actions

### Step 2: Aave Integration
- [ ] Create `protocols/aave/types.ts` for Aave-specific types
- [ ] Create `protocols/aave/constants.ts` for Aave addresses and ABIs
- [ ] Create `protocols/aave/actions/supply.ts` for token supply
- [ ] Create `protocols/aave/actions/withdraw.ts` for token withdrawal
- [ ] Create `protocols/aave/actions/borrow.ts` for token borrowing
- [ ] Create `protocols/aave/actions/repay.ts` for loan repayment
- [ ] Create `protocols/aave/actions/index.ts` to export all Aave actions
- [ ] Update main `index.ts` to include Aave actions

### Step 3: Beefy Integration
- [ ] Create `protocols/beefy/types.ts` for Beefy-specific types
- [ ] Create `protocols/beefy/constants.ts` for Beefy addresses and ABIs
- [ ] Create `protocols/beefy/actions/deposit.ts` for vault deposits
- [ ] Create `protocols/beefy/actions/withdraw.ts` for vault withdrawals
- [ ] Create `protocols/beefy/actions/index.ts` to export all Beefy actions
- [ ] Update main `index.ts` to include Beefy actions

## Phase 3: Explorer and Network Status

- [ ] Create `providers/explorer-provider.ts` for blockchain explorer integration
- [ ] Implement transaction history fetching
- [ ] Implement gas price estimation
- [ ] Implement network status checking

## Phase 4: Testing and Documentation

### Step 1: Unit Testing
- [ ] Create test cases for wallet provider
- [ ] Create test cases for core actions
- [ ] Create test cases for protocol integrations

### Step 2: Integration Testing
- [ ] Test cross-chain transfers
- [ ] Test protocol interactions across chains
- [ ] Test error handling and edge cases

### Step 3: Documentation
- [x] Update API documentation
- [x] Create usage examples
- [x] Document environment variables and configuration

## Implementation Details

### MultichainWalletProvider

The `MultichainWalletProvider` class is responsible for managing wallets across multiple chains. It:

1. Initializes wallet clients for each supported chain
2. Provides methods to get wallet clients for specific chains
3. Handles balance checking across chains
4. Provides a unified interface for wallet operations

### Chain-Specific Actions

Each action (like transfer or token-transfer) follows this pattern:

1. Extract the chain from the user's prompt using `parseChainFromPrompt`
2. Get the private key from runtime settings (`EVM_PRIVATE_KEY`)
3. Initialize the wallet provider with the private key
4. Get the appropriate wallet for the specified chain
5. Initialize GOAT tools with the wallet and specific plugins (sendETH or erc20)
6. Execute the action using generateText with proper context
7. Handle responses and errors with user-friendly messages

## Environment Variables

The module requires the following environment variables:

```
# Required
EVM_PRIVATE_KEY=your_private_key_here  # 64-character hex string without 0x prefix

# Optional (defaults will be used if not provided)
EVM_RPC_URL=your_preferred_rpc_url     # Override default RPC URL
```

## Next Steps

1. Test the implemented core actions:
   - Native token transfers across different chains
   - ERC-20 token transfers across different chains
   - Error handling for various scenarios

2. Begin implementing protocol integrations:
   - Start with Uniswap as it's the most widely used
   - Follow with Aave for lending/borrowing functionality
   - Add Beefy for yield optimization

3. Add comprehensive testing:
   - Unit tests for each component
   - Integration tests for full workflows
   - Documentation of test cases and scenarios
