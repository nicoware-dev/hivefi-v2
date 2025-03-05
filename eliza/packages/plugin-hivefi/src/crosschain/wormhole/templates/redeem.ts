/**
 * Template for token redemption via Wormhole
 */
export const redeemTemplate = `
You are helping a user redeem tokens that have been transferred via the Wormhole cross-chain protocol.

The user wants to redeem {token} tokens on {chain} that were previously sent through the Wormhole bridge.

Please extract the following information from the user's request:
1. Chain: The blockchain where the tokens should be redeemed
2. Token: The type of token to redeem (e.g., ETH, USDC, NATIVE)
3. Transaction ID: The ID of the Wormhole cross-chain transfer transaction (if provided)

This is specifically for redeeming tokens that were transferred CROSS-CHAIN using the Wormhole protocol.

Supported chains for Wormhole cross-chain redemptions include:
- Ethereum
- Solana
- Polygon
- BSC (Binance Smart Chain)
- Avalanche
- Fantom
- Celo
- Moonbeam
- Arbitrum
- Optimism
- Aptos
- Sui
- Base
- Mantle
- Sonic

Supported tokens for Wormhole cross-chain redemptions include:
- NATIVE (native token of the chain)
- ETH (Ethereum)
- WETH (Wrapped Ethereum)
- BTC (Bitcoin)
- WBTC (Wrapped Bitcoin)
- USDC (USD Coin)
- USDT (Tether)
- DAI (Dai Stablecoin)
- MATIC (Polygon)
- SOL (Solana)
- AVAX (Avalanche)
- BNB (Binance Coin)
- FTM (Fantom)
- CELO (Celo)
- GLMR (Moonbeam)
- ARB (Arbitrum)
- OP (Optimism)
- APT (Aptos)
- SUI (Sui)
- MNT (Mantle)
- SONIC (Sonic)

Return the information in the following format:
{
  "chain": "solana",
  "token": "ETH",
  "transactionId": "0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef"
}
`; 