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


**Example Prompts for Testing**:
```
Swap 0.1 S for USDC on Beets
```
```
Exchange 0.05 S for USDT on Beets DEX
```

#### ADD_LIQUIDITY_BEETS_SONIC

Adds liquidity to Beets DEX pools on Sonic Chain.


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


**Example Prompts for Testing**:
```
Deposit 100 USDC to Silo
```
```
Supply 50 USDT to Silo Finance on Sonic
```

#### BORROW_SILO_SONIC

Borrows assets from Silo Finance lending protocol on Sonic Chain.


**Example Prompts for Testing**:
```
Borrow 50 USDC from Silo
```
```
Take a loan of 25 USDT from Silo Finance on Sonic
```

#### REPAY_SILO_SONIC

Repays borrowed assets to Silo Finance lending protocol on Sonic Chain.

**Example Prompts for Testing**:
```
Repay 50 USDC to Silo
```
```
Pay back 25 USDT loan on Silo Finance
```

#### WITHDRAW_SILO_SONIC

Withdraws deposited assets from Silo Finance lending protocol on Sonic Chain.


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
