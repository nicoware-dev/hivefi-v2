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

**Example Prompts for Testing**:
```
Send 0.01 MNT to 0x1234567890123456789012345678901234567890
```
```
Transfer 0.05 MNT to 0xabcdef1234567890abcdef1234567890abcdef12
```

### ERC20 Token Operations

#### SEND_TOKEN_MANTLE

Transfers ERC20 tokens on the Mantle Network.

**Example Prompts for Testing**:
```
Send 10 USDC to 0x1234567890123456789012345678901234567890 on Mantle
```
```
Transfer 5 USDT to 0xabcdef1234567890abcdef1234567890abcdef12 on Mantle network
```

### Portfolio Management

#### PORTFOLIO_MANTLE

Retrieves wallet balances and portfolio information on Mantle Network.


**Example Prompts for Testing**:
```
Show my Mantle wallet balance
```
```
What tokens do I have on Mantle?
```

### Merchant Moe DEX Operations

#### SWAP_MERCHANT_MANTLE

Swaps tokens using the Merchant Moe DEX on Mantle Network.


**Example Prompts for Testing**:
```
Swap 0.1 MNT for USDC on Merchant Moe
```
```
Exchange 0.05 MNT for USDT on Mantle
```

### Lendle Lending Operations

#### DEPOSIT_LENDLE_MANTLE

Deposits assets into Lendle lending protocol on Mantle Network.


**Example Prompts for Testing**:
```
Deposit 100 USDC to Lendle
```
```
Supply 50 USDT to Lendle on Mantle
```

#### BORROW_LENDLE_MANTLE

Borrows assets from Lendle lending protocol on Mantle Network.


**Example Prompts for Testing**:
```
Borrow 50 USDC from Lendle
```
```
Take a loan of 25 USDT from Lendle on Mantle
```

#### REPAY_LENDLE_MANTLE

Repays borrowed assets to Lendle lending protocol on Mantle Network.

**Example Prompts for Testing**:
```
Repay 50 USDC to Lendle
```
```
Pay back 25 USDT loan on Lendle
```

#### WITHDRAW_LENDLE_MANTLE

Withdraws deposited assets from Lendle lending protocol on Mantle Network.

**Example Prompts for Testing**:
```
Withdraw 50 USDC from Lendle
```
```
Remove 25 USDT from Lendle on Mantle
```

### METH Staking Operations

#### STAKE_METH_MANTLE

Stakes MNT tokens to receive METH (Mantle Staked ETH) tokens.

**Example Prompts for Testing**:
```
Stake 1.0 MNT for METH
```
```
Stake 0.5 MNT on Mantle
```

#### UNSTAKE_METH_MANTLE

Unstakes METH tokens to receive MNT tokens.


**Example Prompts for Testing**:
```
Unstake 1.0 METH to MNT
```
```
Redeem 0.5 METH for MNT on Mantle
```

## Configuration

The Mantle module requires the following environment variables:

```env
# Required for Mantle Network operations
EVM_PRIVATE_KEY=your_private_key
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
