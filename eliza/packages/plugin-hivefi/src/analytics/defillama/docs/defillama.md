# DefiLlama Module

The DefiLlama module provides comprehensive DeFi analytics by integrating with the DefiLlama API. It enables tracking of Total Value Locked (TVL) across multiple chains and protocols.

## Features

- Chain TVL tracking
- Protocol TVL analysis
- Multi-chain TVL comparison
- Protocol TVL by chain analysis
- Global DeFi statistics
- Extensive protocol name mappings
- Smart chain matching

## Actions

### 1. Chain TVL (`GET_CHAIN_TVL`)

Gets the current TVL and related metrics for a specific blockchain.

**Test Prompts:**
```
What's the TVL of Ethereum?
Show me Mantle's TVL
Get the TVL for Arbitrum
What's the total value locked in Optimism?
```

**Example Response:**
```
Ethereum Chain TVL: $123.45B
24h Change: +2.5%
7d Change: -1.2%
```

### 2. Protocol TVL (`GET_PROTOCOL_TVL`)

Gets the current TVL for a specific DeFi protocol.

**Test Prompts:**
```
What's the TVL of Uniswap?
Show me Aave's TVL
Get the TVL for Curve
What's the total value locked in MakerDAO?
```

**Example Response:**
```
Uniswap Protocol TVL: $4.1B
24h Change: +1.2%
7d Change: +3.5%
```

### 3. Multiple Chain TVL (`GET_MULTIPLE_CHAIN_TVL`)

Gets TVL data for multiple blockchains in a single request.

**Test Prompts:**
```
Show TVL for Ethereum, Arbitrum, and Optimism
Get TVL of Mantle and Sonic
Compare TVL of Ethereum, BSC, and Avalanche
What's the TVL of all Layer 2s?
```

**Example Response:**
```
Chain TVL Comparison:

Ethereum: $50.67B
24h Change: +2.5%
7d Change: -1.2%

Arbitrum: $15.5B
24h Change: +3.2%
7d Change: +5.6%

Optimism: $14.4B
24h Change: +1.8%
7d Change: +2.3%

Total Combined TVL: $80.57B
```

### 4. Multiple Protocol TVL (`GET_MULTIPLE_PROTOCOL_TVL`)

Gets TVL data for multiple protocols in a single request. Now supports an expanded list of protocols with alternative names and variations.

**Test Prompts:**
```
Show TVL for Uniswap, Aave, and Curve
Compare TVL of major DEXes
What's the TVL of lending protocols?
Get TVL for Mantle protocols
What's the TVL of Beefy and SwapX?
```

**Example Response:**
```
Protocol TVL Comparison:

Aave: $12.3B (24h: +0.8%) (7d: +2.1%)
Category: Lending
Top chains: Ethereum $8.2B (66.7%), Arbitrum $2.5B (20.3%)

Uniswap: $4.1B (24h: +1.2%) (7d: +3.5%)
Category: DEX
Top chains: Ethereum $3.1B (75.6%), Arbitrum $820.5M (20.0%)

Curve: $3.8B (24h: -0.5%) (7d: +1.2%)
Category: DEX
Top chains: Ethereum $3.2B (84.2%), Arbitrum $320M (8.4%)

Total Combined TVL: $20.2B
```

### 5. Protocol TVL by Chain (`GET_PROTOCOL_TVL_CHAIN`)

Gets TVL data for a specific protocol on a specific chain. Now with improved chain matching to handle special cases and non-chain entries.

**Test Prompts:**
```
What's Uniswap's TVL on Arbitrum?
Show me Aave's TVL on Optimism
Get Curve's TVL on Ethereum
How much TVL does Uniswap have on Polygon?
What's the TVL of Beefy on Polygon?
```

**Example Response:**
```
Uniswap Protocol TVL on Arbitrum: $820.5M (20.0% of total TVL)
24h Change: +1.2%
7d Change: +3.5%

Total Protocol TVL (all chains): $4.1B
```

### 6. Top Protocols by Chain (`TOP_PROTOCOLS_CHAIN`)

Gets the top protocols by TVL for a specific chain.

**Test Prompts:**
```
Show top protocols on Arbitrum
What are the biggest protocols on Optimism?
List top 10 protocols on Ethereum
Which protocols have the most TVL on BSC?
```

**Example Response:**
```
Top Protocols on Arbitrum:

1. GMX: $920.5M
2. Aave: $820.3M
3. Uniswap: $750.2M
4. Curve: $580.1M
5. Balancer: $320.5M

Total Chain TVL: $4.8B
```

### 7. Global Stats (`GET_GLOBAL_STATS`)

Gets global DeFi statistics including total TVL and top chains.

**Test Prompts:**
```
Show me global DeFi stats
What's the total TVL in DeFi?
Show me the top chains by TVL
Give me a DeFi market overview
```

**Example Response:**
```
Global DeFi Statistics:

Total Value Locked: $95.84B
Active Chains: 257

Top 5 Chains by TVL:

1. Ethereum: $50.13B (52.31% of total)
   24h Change: +2.5%
   7d Change: -1.2%

2. Solana: $7.52B (7.84% of total)
   24h Change: +1.8%
   7d Change: +3.4%

3. Bitcoin: $5.77B (8.02% of total)
   24h Change: -0.5%
   7d Change: +1.2%

4. BSC: $4.98B (5.19% of total)
   24h Change: +3.2%
   7d Change: +5.6%

5. Tron: $4.8B (4.80% of total)
   24h Change: +1.5%
   7d Change: +2.8%
```

## Usage Tips

1. **Chain Names**: Use common chain names or abbreviations (e.g., "Ethereum", "ETH", "Arbitrum", "ARB")
2. **Protocol Names**: Use official protocol names or common variations (e.g., "Uniswap", "Uni", "Aave", "Aave v3")
3. **Multiple Items**: When requesting multiple chains/protocols, separate them with commas or "and" (e.g., "Ethereum, Arbitrum and Optimism")
4. **Limits**: You can specify the number of results (e.g., "Show top 10 protocols")

## Supported Protocols

The module now supports an expanded list of protocols, including:

- **Major DEXes**: Uniswap, SushiSwap, PancakeSwap, Curve, Balancer
- **Lending Protocols**: Aave, Compound, Spark, Morpho, Radiant
- **Yield Aggregators**: Beefy, Yearn Finance, Yield Yak
- **Staking Protocols**: Lido, Eigenlayer
- **Stablecoins**: USDC, USDT, DAI
- **Chain-Specific Protocols**:
  - **Mantle**: Agni Finance, FusionX, Lendle, Izumi Finance, Merchant Moe
  - **Sonic**: Beets, Silo Finance, Shadow Exchange, SwapX, Origin Sonic

## Recent Improvements

- **Enhanced Protocol Mappings**: Added support for many more protocols with their correct DeFiLlama slugs
- **Alternative Names**: Added support for protocol variations (e.g., "Uniswap v3", "Aave v2")
- **Improved Chain Matching**: Better handling of chain names and special cases
- **Optimized Performance**: Reduced excessive logging for smoother operation
- **Better Response Formatting**: Cleaner and more focused responses

## Error Handling

The module includes comprehensive error handling for:
- Invalid chain or protocol names
- API connection issues
- Rate limiting
- Missing or invalid data

## Caching

Data is cached for 5 minutes to:
- Reduce API calls
- Improve response times
- Handle rate limiting
- Provide fallback data

## Future Enhancements

Planned features include:
- Protocol comparison with historical trends
- Yield data integration
- Stablecoin statistics
- Volume metrics
- Fee analysis
- Additional chain-specific protocol support