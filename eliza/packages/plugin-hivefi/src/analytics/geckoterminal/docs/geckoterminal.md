# GeckoTerminal Module

The GeckoTerminal module provides comprehensive DEX analytics by integrating with the GeckoTerminal API. It enables tracking of liquidity pools, trading volumes, and token prices across multiple networks.

## Features

- Multi-chain pool analytics
- Pool TVL tracking
- 24h volume analysis
- Fee generation metrics
- Token price tracking
- Transaction count monitoring
- Cross-chain comparison

## Actions

### 1. Trending Pools (`GET_TRENDING_POOLS`)

Gets trending pools across all networks or for a specific network.

**Test Prompts:**
```
Show me trending pools
What are the trending pools on Arbitrum?
Get hot pools on Mantle
Show popular pools on Optimism
List trending DEX pools
What pools are trending right now?
```

**Example Response:**
```
# Trending Pools Across All Networks

## USDC/WETH Pool
- Address: `0x123...abc`
- TVL: $10.5M
- 24h Volume: $5.2M
- 24h Fees Generated: $15.6K
- 24h Price Change: +2.5%
- 24h Transactions: 1,234
- Token Prices:
  * USDC: $1.00
  * WETH: $3,500.00
```

### 2. Pool Information (`GET_POOL_INFO`)

Gets detailed information about a specific pool on a network.

**Test Prompts:**
```
Show me pool 0x1234567890abcdef1234567890abcdef12345678 on Arbitrum
Get info for pool 0xabcdef1234567890abcdef1234567890abcdef on Mantle
What are the stats for pool 0x9876543210abcdef1234567890abcdef12345678 on Optimism?
Pool details for 0x1234567890abcdef1234567890abcdef12345678 on Base
```

**Example Response:**
```
# Pool Information on Arbitrum

## USDC/WETH Pool
- Address: `0x123...abc`
- TVL: $10.5M
- 24h Volume: $5.2M
- 24h Fees Generated: $15.6K
- 24h Price Change: +2.5%
- 24h Transactions: 1,234
- Token Prices:
  * USDC: $1.00
  * WETH: $3,500.00
```

### 3. Top Pools (`GET_TOP_POOLS`)

Gets top pools by TVL for a specific network with customizable limit.

**Test Prompts:**
```
Show me top pools on Arbitrum
Get top 5 pools on Mantle
What are the biggest pools on Optimism?
List top 10 pools by TVL on Base
Show largest liquidity pools on Ethereum
What are the highest TVL pools on Polygon?
```

**Example Response:**
```
# Top 10 Pools on Arbitrum

## USDC/WETH Pool
- Address: `0x123...abc`
- TVL: $10.5M
- 24h Volume: $5.2M
- 24h Fees Generated: $15.6K
- 24h Price Change: +2.5%
- 24h Transactions: 1,234
- Token Prices:
  * USDC: $1.00
  * WETH: $3,500.00

## WBTC/WETH Pool
[...]
```

### Token Information (GET_TOKEN_INFO)
Get detailed information about a specific token on a network.

**Test Prompts:**
- "Show me token 0x1234567890abcdef1234567890abcdef12345678 on Arbitrum"
- "Get info for USDC on Mantle"
- "What's the status of token 0xabcdef1234567890abcdef1234567890abcdef12 on Base?"

Example response format:
```markdown
# Token Information

## USD Coin (USDC)
- Address: `0x1234567890abcdef1234567890abcdef12345678`
- Decimals: 6
- Price: $1.00
- Market Cap: $23,456,789.00
- 24h Volume: $1,234,567.00
- 24h Price Change: +0.01%
- Total Value Locked: $10,234,567.00
- Total Pools: 156
```

## Supported Networks

The module supports the following networks:
1. Sonic Network (`sonic`)
2. Mantle Network (`mantle`)
3. Arbitrum (`arbitrum`)
4. Optimism (`optimism`)
5. Base (`base`)
6. Polygon (`polygon`)
7. Ethereum (`ethereum`)
8. BNB Chain (`bnb`)

## Pool Metrics

Each pool analysis includes:
- Total Value Locked (TVL)
- 24-hour trading volume
- Fee generation
- Price changes
- Transaction count
- Base token price
- Quote token price
- Pool address
- Token addresses

## Usage Tips

1. **Network Selection**: 
   - Query all networks by omitting the network parameter
   - Specify a network ID for targeted analysis
   - Use official network IDs (e.g., "sonic", "arbitrum", "optimism")

2. **Pool Identification**:
   - Use complete pool addresses (0x...)
   - Network must be specified with pool address
   - Case-insensitive network names

3. **Data Freshness**:
   - Data is cached for 5 minutes
   - Real-time updates for time-sensitive metrics
   - Historical data preservation for trending

4. **Response Format**:
   - Markdown formatted output
   - Hierarchical structure (Network > Pool > Metrics)
   - Human-readable numbers and percentages

## Error Handling

The module includes comprehensive error handling for:
- Invalid network IDs
- Invalid pool addresses
- API connection issues
- Rate limiting
- Missing pool data
- Network-specific failures

## Caching

Data caching implementation:
- 5-minute cache duration
- Network-level caching
- Automatic cache invalidation
- Memory-efficient storage
- Error state preservation

## Example Use Cases

1. **Trending Analysis**:
   ```typescript
   // Get global trending pools
   const trendingPools = "Show me trending pools";
   
   // Get network-specific trending pools
   const networkTrending = "What's trending on Arbitrum?";
   ```

2. **Pool Discovery**:
   ```typescript
   // Get top pools by TVL
   const topPools = "Show top 10 pools on Mantle";
   
   // Get specific pool details
   const poolInfo = "Show pool 0x123... on Optimism";
   ```

3. **Network Analysis**:
   ```typescript
   // Compare top pools across networks
   const networkComparison = "Show me top pools on Arbitrum and Optimism";
   ```

## Integration Tips

1. **Rate Limiting**:
   - Respect API limits (30 calls/minute)
   - Use cached data when appropriate
   - Implement retry mechanisms

2. **Error Recovery**:
   - Handle network-specific failures gracefully
   - Provide fallback data when available
   - Clear error messaging

3. **Data Presentation**:
   - Use formatted markdown output
   - Present hierarchical data clearly
   - Highlight important metrics

4. **Performance**:
   - Leverage caching for repeated queries
   - Batch network requests when possible
   - Monitor response times

## Future Enhancements

Planned features include:
- Token price tracking
- OHLCV data integration
- Trade history analysis
- Pool creation events
- Token pair analytics
- Market impact analysis
- Liquidity depth metrics
- Trading pair correlations 