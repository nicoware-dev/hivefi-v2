# Mantle Module

The Mantle Module provides integration with the Mantle Network, enabling operations such as token transfers, DEX interactions, lending protocol operations, and staking. This module is part of the HiveFi superplugin architecture and follows a consistent naming convention for all actions.

## Overview

The Mantle Module includes the following key components:

- **Native Token Operations**: Send and receive MNT tokens
- **ERC20 Token Operations**: Transfer ERC20 tokens on Mantle Network
- **Portfolio Management**: View wallet balances and holdings
- **DEX Operations**: Swap tokens on Merchant Moe
- **Lending Operations**: Deposit, borrow, repay, and withdraw from Lendle
- **Staking Operations**: Stake and unstake MNT using METH protocol

## Actions

### Native Token Operations

#### SEND_MNT

Transfers native MNT tokens on the Mantle Network.

```typescript
// Example usage
await mantleAgent.execute('SEND_MNT', {
  to: '0x1234567890123456789012345678901234567890',
  amount: '0.1'
});
```

**Similes**: `SEND_MANTLE`, `SEND_MNT_MANTLE`, `SEND_MNT_MANTLE_NETWORK`

**Parameters**:
- `to`: Recipient address (0x format)
- `amount`: Amount of MNT to send

### ERC20 Token Operations

#### SEND_TOKEN_MANTLE

Transfers ERC20 tokens on the Mantle Network.

```typescript
// Example usage
await mantleAgent.execute('SEND_TOKEN_MANTLE', {
  to: '0x1234567890123456789012345678901234567890',
  token: 'USDC',
  amount: '10'
});
```

**Similes**: `TRANSFER_TOKEN_MANTLE`, `MOVE_TOKEN_MANTLE`, `SEND_ERC20_MANTLE`

**Parameters**:
- `to`: Recipient address (0x format)
- `token`: Token symbol (e.g., 'USDC', 'USDT')
- `amount`: Amount of tokens to send

### Portfolio Management

#### PORTFOLIO_MANTLE

Retrieves wallet balances and portfolio information on Mantle Network.

```typescript
// Example usage
const portfolio = await mantleAgent.execute('PORTFOLIO_MANTLE');
```

**Similes**: `BALANCE_MANTLE`, `WALLET_MANTLE`, `HOLDINGS_MANTLE`

**Returns**:
- Array of token balances with USD values
- Native MNT token balance
- ERC20 token balances

### Merchant Moe DEX Operations

#### SWAP_MERCHANT_MANTLE

Swaps tokens using the Merchant Moe DEX on Mantle Network.

```typescript
// Example usage
await mantleAgent.execute('SWAP_MERCHANT_MANTLE', {
  fromToken: 'MNT',
  toToken: 'USDC',
  amount: '0.1',
  slippage: 0.5 // Optional, default is 0.5%
});
```

**Similes**: `TRADE_MERCHANT_MANTLE`, `EXCHANGE_MERCHANT_MANTLE`, `SWAP_TOKENS_MERCHANT_MANTLE`

**Parameters**:
- `fromToken`: Source token symbol
- `toToken`: Destination token symbol
- `amount`: Amount to swap
- `slippage`: (Optional) Maximum slippage percentage

### Lendle Lending Operations

#### DEPOSIT_LENDLE_MANTLE

Deposits assets into Lendle lending protocol on Mantle Network.

```typescript
// Example usage
await mantleAgent.execute('DEPOSIT_LENDLE_MANTLE', {
  token: 'USDC',
  amount: '100'
});
```

**Similes**: `SUPPLY_LENDLE_MANTLE`, `LEND_TOKENS_LENDLE`, `PROVIDE_LIQUIDITY_LENDLE`

**Parameters**:
- `token`: Token symbol to deposit
- `amount`: Amount to deposit

#### BORROW_LENDLE_MANTLE

Borrows assets from Lendle lending protocol on Mantle Network.

```typescript
// Example usage
await mantleAgent.execute('BORROW_LENDLE_MANTLE', {
  token: 'USDC',
  amount: '50'
});
```

**Similes**: `LOAN_LENDLE_MANTLE`, `TAKE_LOAN_LENDLE`, `GET_LOAN_LENDLE`

**Parameters**:
- `token`: Token symbol to borrow
- `amount`: Amount to borrow

#### REPAY_LENDLE_MANTLE

Repays borrowed assets to Lendle lending protocol on Mantle Network.

```typescript
// Example usage
await mantleAgent.execute('REPAY_LENDLE_MANTLE', {
  token: 'USDC',
  amount: '50'
});
```

**Similes**: `PAY_BACK_LENDLE_MANTLE`, `RETURN_LOAN_LENDLE`, `SETTLE_DEBT_LENDLE`

**Parameters**:
- `token`: Token symbol to repay
- `amount`: Amount to repay

#### WITHDRAW_LENDLE_MANTLE

Withdraws deposited assets from Lendle lending protocol on Mantle Network.

```typescript
// Example usage
await mantleAgent.execute('WITHDRAW_LENDLE_MANTLE', {
  token: 'USDC',
  amount: '50'
});
```

**Similes**: `REMOVE_LENDLE_MANTLE`, `TAKE_OUT_LENDLE`, `RETRIEVE_LENDLE`

**Parameters**:
- `token`: Token symbol to withdraw
- `amount`: Amount to withdraw

### METH Staking Operations

#### STAKE_METH_MANTLE

Stakes MNT tokens to receive METH (Mantle Staked ETH) tokens.

```typescript
// Example usage
await mantleAgent.execute('STAKE_METH_MANTLE', {
  amount: '1.0'
});
```

**Similes**: `STAKE_MNT_MANTLE`, `STAKE_MANTLE`, `STAKE_FOR_METH`

**Parameters**:
- `amount`: Amount of MNT to stake

#### UNSTAKE_METH_MANTLE

Unstakes METH tokens to receive MNT tokens.

```typescript
// Example usage
await mantleAgent.execute('UNSTAKE_METH_MANTLE', {
  amount: '1.0',
  minMntAmount: '0.95' // Optional, minimum MNT to receive
});
```

**Similes**: `UNSTAKE_MANTLE`, `REDEEM_METH`, `CONVERT_METH_TO_MNT`

**Parameters**:
- `amount`: Amount of METH to unstake
- `minMntAmount`: (Optional) Minimum amount of MNT to receive

## Configuration

The Mantle module requires the following environment variables:

```env
# Required for Mantle Network operations
EVM_PRIVATE_KEY=your_private_key
MANTLE_RPC_URL=https://rpc.mantle.xyz
```

## Module Structure

```
mantle/
├── actions/
│   ├── index.ts                # Exports all actions
│   ├── transfer.ts             # Native MNT token transfers
│   ├── erc20Transfer.ts        # ERC20 token transfers
│   ├── portfolio.ts            # Wallet balances and portfolio
│   ├── merchant-moe/
│   │   └── swap.ts             # Token swapping on Merchant Moe
│   ├── lendle/
│   │   ├── deposit.ts          # Deposit to Lendle
│   │   ├── borrow.ts           # Borrow from Lendle
│   │   ├── repay.ts            # Repay loans on Lendle
│   │   ├── withdraw.ts         # Withdraw from Lendle
│   │   ├── config.ts           # Lendle configuration
│   │   └── utils.ts            # Utility functions for Lendle
│   └── meth/
│       ├── stake.ts            # Stake MNT for METH
│       └── unstake.ts          # Unstake METH for MNT
├── config/
│   ├── chains.ts               # Chain configuration
│   └── tokens.ts               # Token definitions
├── providers/
│   ├── wallet.ts               # Wallet provider
│   ├── coingecko.ts            # CoinGecko price provider
│   └── defillama.ts            # DefiLlama TVL provider
├── templates/                  # Response templates
├── types/                      # TypeScript type definitions
└── index.ts                    # Module entry point
```

## Usage in HiveFi Plugin

The Mantle module is integrated into the HiveFi plugin in the main `index.ts` file:

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

All Mantle module actions include comprehensive error handling:

- Input validation for addresses, amounts, and token symbols
- Transaction failure detection and reporting
- Balance checking before operations
- Gas estimation and optimization
- Detailed error messages for troubleshooting

## Future Enhancements

Planned enhancements for the Mantle module include:

- Additional DEX integrations (Agni Finance)
- Integration with Init Capital lending protocol
- Yield farming operations on Pendle
- NFT support
- Cross-chain operations with Sonic and other networks
- Enhanced analytics and portfolio tracking
