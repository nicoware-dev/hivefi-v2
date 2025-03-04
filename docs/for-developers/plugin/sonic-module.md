# Sonic Module

The Sonic Module provides integration with the Sonic Chain network, enabling operations such as token transfers, DEX interactions, and lending protocol operations. This module is part of the HiveFi superplugin architecture and follows the same naming conventions as other chain-specific modules.

## Overview

The Sonic Module includes the following key components:

- **Native Token Operations**: Send and receive S tokens
- **ERC20 Token Operations**: Transfer ERC20 tokens on Sonic Chain
- **Portfolio Management**: View wallet balances and holdings
- **DEX Operations**: Swap tokens and manage liquidity on Beets DEX
- **Lending Operations**: Deposit, borrow, repay, and withdraw from Silo Finance

## Actions

### Native Token Operations

#### SEND_S_SONIC

Transfers native S tokens on the Sonic Chain network.

```typescript
// Example usage
await sonicAgent.execute('SEND_S_SONIC', {
  to: '0x1234567890123456789012345678901234567890',
  amount: '0.1'
});
```

**Similes**: `SEND_SONIC`, `SEND_S_SONIC_CHAIN`, `TRANSFER_S_SONIC`

**Parameters**:
- `to`: Recipient address (0x format)
- `amount`: Amount of S to send

**Example Prompts for Testing**:
```
Send 0.01 S to 0x1234567890123456789012345678901234567890
```
```
Transfer 0.05 S to 0xabcdef1234567890abcdef1234567890abcdef12
```

### ERC20 Token Operations

#### SEND_TOKEN_SONIC

Transfers ERC20 tokens on the Sonic Chain network.

```typescript
// Example usage
await sonicAgent.execute('SEND_TOKEN_SONIC', {
  to: '0x1234567890123456789012345678901234567890',
  token: 'USDC',
  amount: '10'
});
```

**Similes**: `TRANSFER_TOKEN_SONIC`, `MOVE_TOKEN_SONIC`, `SEND_ERC20_SONIC`

**Parameters**:
- `to`: Recipient address (0x format)
- `token`: Token symbol (e.g., 'USDC', 'WETH')
- `amount`: Amount of tokens to send

**Example Prompts for Testing**:
```
Send 10 USDC to 0x1234567890123456789012345678901234567890 on Sonic
```
```
Transfer 5 USDT to 0xabcdef1234567890abcdef1234567890abcdef12 on Sonic Chain
```

### Portfolio Management

#### PORTFOLIO_SONIC

Retrieves wallet balances and portfolio information on Sonic Chain.

```typescript
// Example usage
const portfolio = await sonicAgent.execute('PORTFOLIO_SONIC');
```

**Similes**: `BALANCE_SONIC`, `WALLET_SONIC`, `HOLDINGS_SONIC`

**Returns**:
- Array of token balances with USD values
- Native S token balance
- ERC20 token balances

**Example Prompts for Testing**:
```
Show my Sonic wallet balance
```
```
What tokens do I have on Sonic Chain?
```

### Beets DEX Operations

#### SWAP_BEETS_SONIC

Swaps tokens using the Beets DEX on Sonic Chain.

```typescript
// Example usage
await sonicAgent.execute('SWAP_BEETS_SONIC', {
  fromToken: 'S',
  toToken: 'USDC',
  amount: '0.1',
  slippage: 0.5 // Optional, default is 0.5%
});
```

**Similes**: `TRADE_BEETS_SONIC`, `EXCHANGE_BEETS_SONIC`, `SWAP_TOKENS_BEETS_SONIC`

**Parameters**:
- `fromToken`: Source token symbol
- `toToken`: Destination token symbol
- `amount`: Amount to swap
- `slippage`: (Optional) Maximum slippage percentage

**Example Prompts for Testing**:
```
Swap 0.1 S for USDC on Beets
```
```
Exchange 0.05 S for USDT on Beets DEX
```

#### ADD_LIQUIDITY_BEETS_SONIC

Adds liquidity to Beets DEX pools on Sonic Chain.

```typescript
// Example usage
await sonicAgent.execute('ADD_LIQUIDITY_BEETS_SONIC', {
  pool: 'S-USDC',
  amount0: '0.1',
  amount1: '10'
});
```

**Similes**: `PROVIDE_LIQUIDITY_BEETS_SONIC`, `JOIN_POOL_BEETS_SONIC`, `DEPOSIT_LP_BEETS_SONIC`

**Parameters**:
- `pool`: Pool identifier (e.g., 'S-USDC')
- `amount0`: Amount of first token
- `amount1`: Amount of second token

**Example Prompts for Testing**:
```
Add liquidity to S-USDC pool on Beets
```
```
Provide 0.1 S and 10 USDC to Beets liquidity pool
```

### Silo Finance Lending Operations

#### DEPOSIT_SILO_SONIC

Deposits assets into Silo Finance lending protocol on Sonic Chain.

```typescript
// Example usage
await sonicAgent.execute('DEPOSIT_SILO_SONIC', {
  token: 'USDC',
  amount: '100'
});
```

**Similes**: `SUPPLY_SILO_SONIC`, `LEND_SILO_SONIC`, `PROVIDE_SILO_SONIC`

**Parameters**:
- `token`: Token symbol to deposit
- `amount`: Amount to deposit

**Example Prompts for Testing**:
```
Deposit 100 USDC to Silo
```
```
Supply 50 USDT to Silo Finance on Sonic
```

#### BORROW_SILO_SONIC

Borrows assets from Silo Finance lending protocol on Sonic Chain.

```typescript
// Example usage
await sonicAgent.execute('BORROW_SILO_SONIC', {
  token: 'USDC',
  amount: '50'
});
```

**Similes**: `LOAN_SILO_SONIC`, `TAKE_LOAN_SILO_SONIC`, `GET_LOAN_SILO_SONIC`

**Parameters**:
- `token`: Token symbol to borrow
- `amount`: Amount to borrow

**Example Prompts for Testing**:
```
Borrow 50 USDC from Silo
```
```
Take a loan of 25 USDT from Silo Finance on Sonic
```

#### REPAY_SILO_SONIC

Repays borrowed assets to Silo Finance lending protocol on Sonic Chain.

```typescript
// Example usage
await sonicAgent.execute('REPAY_SILO_SONIC', {
  token: 'USDC',
  amount: '50'
});
```

**Similes**: `PAY_BACK_SILO_SONIC`, `RETURN_LOAN_SILO_SONIC`, `SETTLE_DEBT_SILO_SONIC`

**Parameters**:
- `token`: Token symbol to repay
- `amount`: Amount to repay

**Example Prompts for Testing**:
```
Repay 50 USDC to Silo
```
```
Pay back 25 USDT loan on Silo Finance
```

#### WITHDRAW_SILO_SONIC

Withdraws deposited assets from Silo Finance lending protocol on Sonic Chain.

```typescript
// Example usage
await sonicAgent.execute('WITHDRAW_SILO_SONIC', {
  token: 'USDC',
  amount: '50'
});
```

**Similes**: `REMOVE_SILO_SONIC`, `TAKE_OUT_SILO_SONIC`, `RETRIEVE_SILO_SONIC`

**Parameters**:
- `token`: Token symbol to withdraw
- `amount`: Amount to withdraw

**Example Prompts for Testing**:
```
Withdraw 50 USDC from Silo
```
```
Remove 25 USDT from Silo Finance on Sonic
```

## Configuration

The Sonic module requires the following environment variables:

```env
# Required for Sonic Chain operations
EVM_PRIVATE_KEY=your_private_key
SONIC_RPC_URL=https://mainnet.sonic.org/rpc
```

## Module Structure

```
sonic/
├── actions/
│   ├── index.ts                # Exports all actions
│   ├── transfer.ts             # Native S token transfers
│   ├── erc20Transfer.ts        # ERC20 token transfers
│   ├── portfolio.ts            # Wallet balances and portfolio
│   ├── beets-dex/
│   │   ├── swap.ts             # Token swapping on Beets
│   │   └── add-liquidity.ts    # Liquidity provision on Beets
│   └── silo-lending/
│       ├── deposit.ts          # Deposit to Silo Finance
│       ├── borrow.ts           # Borrow from Silo Finance
│       ├── repay.ts            # Repay loans on Silo Finance
│       └── withdraw.ts         # Withdraw from Silo Finance
├── config/
│   ├── chains.ts               # Chain configuration
│   └── tokens.ts               # Token definitions
├── providers/
│   └── wallet.ts               # Wallet provider
├── templates/                  # Response templates
├── types/                      # TypeScript type definitions
└── index.ts                    # Module entry point
```

## Usage in HiveFi Plugin

The Sonic module is integrated into the HiveFi plugin in the main `index.ts` file:

```typescript
import type { Plugin } from "@elizaos/core";
import { MantleActions } from "./mantle/actions";
import { sonicActions } from "./sonic";

export const hivefiPlugin: Plugin = {
    name: "hivefi",
    description: "HiveFi Plugin for Eliza - Multichain DeFAI Agent Swarm",
    actions: [
        ...MantleActions, // Spread all Mantle actions
        ...sonicActions, // Spread all Sonic actions
        // TODO: Add MultiChain actions
    ],
    // ... other plugin configuration
};
```

## Error Handling

All Sonic module actions include comprehensive error handling:

- Input validation for addresses, amounts, and token symbols
- Transaction failure detection and reporting
- Balance checking before operations
- Detailed error messages for troubleshooting

## Future Enhancements

Planned enhancements for the Sonic module include:

- Additional DEX integrations (SwapX, Shadow Exchange)
- Yield farming operations
- NFT support
- Cross-chain operations with Mantle and other networks
- Enhanced analytics and portfolio tracking
