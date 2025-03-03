# HiveFi Agent Tool Descriptions

## Analytics Agent Tools

### marketDataTool
This tool provides real-time market data and price information across supported chains.
- Input: Market data queries (prices, volumes, trends)
- Output: Current market data and analysis
- Example: "Get current prices for MNT, S, and BTC"

### tvlAnalyticsTool
This tool tracks and analyzes Total Value Locked (TVL) across protocols and chains.
- Input: TVL analysis requests
- Output: TVL data and trend analysis
- Example: "What's the TVL trend for Lendle over the past week?"

### portfolioAnalyticsTool
This tool provides portfolio analysis and performance tracking.
- Input: Portfolio analysis requests
- Output: Portfolio metrics and visualizations
- Example: "Show my portfolio distribution across chains"

### yieldAnalyticsTool
This tool analyzes and compares yield opportunities across protocols.
- Input: Yield analysis requests
- Output: Yield comparisons and recommendations
- Example: "Find the highest yielding USDC opportunities"

### protocolMetricsTool
This tool tracks and analyzes protocol-specific metrics.
- Input: Protocol metric queries
- Output: Protocol performance data
- Example: "Compare trading volumes on Merchant Moe vs SwapX"

## Sonic Chain Agent Tools

### sonicWalletTool
This tool manages Sonic wallet operations and balances.
- Input: Wallet operations on Sonic chain
- Output: Transaction execution or balance data
- Example: "Check my S token balance"

### sonicDexTool
This tool handles DEX operations on Sonic chain.
- Input: DEX trading operations
- Output: Trade execution or quotes
- Example: "Swap 10 S for USDC on SwapX"

### sonicLendingTool
This tool manages lending operations on Sonic protocols.
- Input: Lending operations
- Output: Lending transaction execution
- Example: "Supply 100 USDC to Silo Finance"

### sonicYieldTool
This tool handles yield farming operations on Sonic chain.
- Input: Yield farming operations
- Output: Staking transaction execution
- Example: "Stake LP tokens in Beefy vault"

### sonicNftTool
This tool manages NFT operations on Sonic chain.
- Input: NFT operations
- Output: NFT transaction execution
- Example: "List NFT on Sonic marketplace"

## Mantle Chain Agent Tools

### mantleWalletTool
This tool manages Mantle wallet operations and balances.
- Input: Wallet operations on Mantle chain
- Output: Transaction execution or balance data
- Example: "Check my MNT balance"

### mantleDexTool
This tool handles DEX operations on Mantle chain.
- Input: DEX trading operations
- Output: Trade execution or quotes
- Example: "Swap MNT for USDC on Merchant Moe"

### mantleLendingTool
This tool manages lending operations on Mantle protocols.
- Input: Lending operations
- Output: Lending transaction execution
- Example: "Borrow USDC from Lendle"

### mantleYieldTool
This tool handles yield farming operations on Mantle chain.
- Input: Yield farming operations
- Output: Staking transaction execution
- Example: "Stake in Pendle pool"

### mantleNftTool
This tool manages NFT operations on Mantle chain.
- Input: NFT operations
- Output: NFT transaction execution
- Example: "Mint NFT on Mantle"

## Bitcoin Agent Tools

### bitcoinWalletTool
This tool manages Bitcoin wallet operations and balances.
- Input: Bitcoin wallet operations
- Output: Transaction execution or balance data
- Example: "Check my BTC balance"

### bitcoinTransactionTool
This tool handles Bitcoin transaction creation and signing.
- Input: Bitcoin transaction requests
- Output: Transaction execution
- Example: "Send 0.01 BTC to address"

### bitcoinNetworkTool
This tool monitors Bitcoin network status and fees.
- Input: Network status queries
- Output: Network information
- Example: "Get current Bitcoin network fees"

### bitcoinUtxoTool
This tool manages Bitcoin UTXO selection and management.
- Input: UTXO operations
- Output: UTXO data or management
- Example: "Optimize UTXO set for transaction"

### bitcoinMultisigTool
This tool handles Bitcoin multisig operations.
- Input: Multisig operations
- Output: Multisig transaction execution
- Example: "Create multisig transaction"

## Cross Chain Agent Tools

### bridgeOperationTool
This tool manages cross-chain bridge operations.
- Input: Bridge transaction requests
- Output: Bridge operation execution
- Example: "Bridge USDC from Mantle to Sonic"

### bridgeMonitorTool
This tool monitors bridge transaction status.
- Input: Bridge status queries
- Output: Transaction status updates
- Example: "Check status of bridge transaction"

### routeOptimizerTool
This tool finds optimal cross-chain routes.
- Input: Route optimization requests
- Output: Optimal route suggestions
- Example: "Find best route to bridge USDC to Sonic"

### liquidityCheckTool
This tool monitors bridge liquidity across chains.
- Input: Liquidity check requests
- Output: Bridge liquidity information
- Example: "Check Wormhole USDC liquidity"

### crossChainBalanceTool
This tool tracks balances across multiple chains.
- Input: Cross-chain balance queries
- Output: Multi-chain balance data
- Example: "Show my USDC balance across all chains"

## Usage Guidelines

### Tool Selection
- Use appropriate chain-specific tools for each operation
- Combine tools for complex operations
- Follow operation prerequisites

### Error Handling
- Check balances before operations
- Verify gas/fee requirements
- Monitor transaction status
- Handle timeouts and retries

### Security
- Validate all inputs
- Check operation limits
- Monitor for suspicious activity
- Follow security protocols

### Performance
- Batch operations when possible
- Cache frequently used data
- Monitor resource usage
- Implement rate limiting

## Next Steps

For more information about:
- Tool implementation, see [Plugin Guide](../docs/for-developers/plugin-guide.md)
- Agent coordination, see [Multi-Agent System](../docs/under-the-hood/multi-agent-system.md)
- Integration details, see [Integrations](../docs/under-the-hood/integrations.md) 