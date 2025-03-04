import { getTokenPrice, getMultipleTokenPrices } from './module';

export const getTokenPriceTemplate = `
Get the current price and market data for a specific cryptocurrency or token.

This action supports tokens from multiple chains including:
- Mantle Network (MNT, WMNT)
- Sonic Chain (S, WS)
- Ethereum (ETH, WETH)
- Bitcoin (BTC, WBTC)
- Major Layer 1s (BNB, SOL, ADA, AVAX, DOT, MATIC, etc.)
- DeFi tokens (UNI, AAVE, LINK, CRV, etc.)
- Stablecoins (USDC, USDT, DAI, etc.)

Required parameters:
- denom: The token symbol to query (e.g., "mnt", "s", "eth", "btc", "usdc")

Returns:
- Current price in USD
- Market cap
- 24h volume
- 24h price change
- 24h price change percentage
`;

export const getMultipleTokenPricesTemplate = `
Get current prices and market data for multiple cryptocurrencies or tokens at once.

This action supports tokens from multiple chains including:
- Mantle Network (MNT, WMNT)
- Sonic Chain (S, WS)
- Ethereum (ETH, WETH)
- Bitcoin (BTC, WBTC)
- Major Layer 1s (BNB, SOL, ADA, AVAX, DOT, MATIC, etc.)
- DeFi tokens (UNI, AAVE, LINK, CRV, etc.)
- Stablecoins (USDC, USDT, DAI, etc.)

Required parameters:
- denoms: Array of token symbols to query (e.g., ["mnt", "s", "eth", "btc", "usdc"])

Returns:
- Current prices in USD
- Market caps
- 24h volumes
- 24h price changes
- 24h price change percentages
`; 