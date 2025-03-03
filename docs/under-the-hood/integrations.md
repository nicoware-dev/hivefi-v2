# HiveFi Integrations

A comprehensive guide to HiveFi's integrations with blockchain networks, DeFi protocols, and external services.

## Blockchain Networks

### Mantle Network

#### Core Integration
- **Network**: Mantle Mainnet
- **Chain ID**: 5000
- **Currency**: MNT
- **RPC Endpoint**: `https://rpc.mantle.xyz`

#### Supported Protocols

##### 1. Merchant Moe (DEX)
```typescript
// Swap Example
const swapConfig = {
  router: '0x...',
  fromToken: 'MNT',
  toToken: 'USDC',
  amount: '1.0',
  slippage: '0.5'
};

await mantleAgent.execute('swap', swapConfig);
```

##### 2. Lendle (Lending)
```typescript
// Supply Example
const supplyConfig = {
  market: '0x...',
  token: 'USDC',
  amount: '100',
  enableCollateral: true
};

await mantleAgent.execute('supply', supplyConfig);
```

##### 3. Init Capital (Lending)
```typescript
// Borrow Example
const borrowConfig = {
  market: '0x...',
  token: 'MNT',
  amount: '10',
  interestRateMode: 'variable'
};

await mantleAgent.execute('borrow', borrowConfig);
```

##### 4. Pendle (Yield Farming)
```typescript
// Stake Example
const stakeConfig = {
  pool: '0x...',
  token: 'LP-MNT-USDC',
  amount: '10'
};

await mantleAgent.execute('stake', stakeConfig);
```

##### 5. Agni Finance (Exchange)
```typescript
// Add Liquidity Example
const liquidityConfig = {
  pair: 'MNT-USDC',
  amount0: '10',
  amount1: '100',
  slippage: '0.5'
};

await mantleAgent.execute('addLiquidity', liquidityConfig);
```

### Sonic Chain

#### Core Integration
- **Network**: Sonic Mainnet
- **Chain ID**: 2000
- **Currency**: S
- **RPC Endpoint**: `https://mainnet.sonic.org/rpc`

#### Supported Protocols

##### 1. Beets (DEX)
```typescript
// Swap Example
const swapConfig = {
  pool: '0x...',
  fromToken: 'S',
  toToken: 'USDC',
  amount: '1.0'
};

await sonicAgent.execute('swap', swapConfig);
```

##### 2. SwapX (DEX)
```typescript
// Trade Example
const tradeConfig = {
  pair: 'S-USDC',
  amount: '1.0',
  slippage: '0.5'
};

await sonicAgent.execute('trade', tradeConfig);
```

##### 3. Shadow Exchange (DEX)
```typescript
// Order Example
const orderConfig = {
  market: '0x...',
  side: 'BUY',
  amount: '100',
  price: '1.05'
};

await sonicAgent.execute('placeOrder', orderConfig);
```

##### 4. Silo Finance (Lending)
```typescript
// Lending Example
const lendConfig = {
  market: '0x...',
  token: 'USDC',
  amount: '100'
};

await sonicAgent.execute('lend', lendConfig);
```

##### 5. Beefy (Yield Farming)
```typescript
// Vault Deposit Example
const vaultConfig = {
  vault: '0x...',
  token: 'LP-S-USDC',
  amount: '10'
};

await sonicAgent.execute('deposit', vaultConfig);
```

### Bitcoin

#### Core Integration
- **Network**: Bitcoin Mainnet
- **Chain**: BTC
- **RPC Endpoint**: `https://btc.getblock.io/mainnet/`

#### Operations
```typescript
// Send Transaction
const txConfig = {
  to: 'bc1q...',
  amount: '0.001',
  feeRate: 'medium'
};

await bitcoinAgent.execute('send', txConfig);

// Check Transaction
const txStatus = await bitcoinAgent.execute('getTransaction', {
  txid: '0x...'
});
```

## Cross-Chain Bridges

### 1. Wormhole
```typescript
// Bridge Transaction
const bridgeConfig = {
  fromChain: 'mantle',
  toChain: 'sonic',
  token: 'USDC',
  amount: '100'
};

await crossChainAgent.execute('bridgeViaWormhole', bridgeConfig);
```

### 2. DeBridge
```typescript
// Bridge Operation
const deBridgeConfig = {
  source: 'mantle',
  destination: 'sonic',
  token: 'USDC',
  amount: '100',
  slippage: '0.5'
};

await crossChainAgent.execute('bridgeViaDeBridge', deBridgeConfig);
```

### 3. Multichain
```typescript
// Bridge Transfer
const multichainConfig = {
  fromChain: 'mantle',
  toChain: 'sonic',
  token: 'USDC',
  amount: '100',
  recipient: '0x...'
};

await crossChainAgent.execute('bridgeViaMultichain', multichainConfig);
```

## External Services

### 1. Market Data

#### CoinGecko
```typescript
// Price Data
const prices = await analyticsAgent.execute('getPrices', {
  tokens: ['MNT', 'S', 'BTC'],
  currency: 'USD'
});
```

#### DefiLlama
```typescript
// TVL Data
const tvl = await analyticsAgent.execute('getTVL', {
  protocols: ['merchant-moe', 'lendle', 'silo-finance']
});
```

### 2. Analytics

#### GeckoTerminal
```typescript
// Market Analysis
const analysis = await analyticsAgent.execute('analyzeMarket', {
  pair: 'MNT-USDC',
  timeframe: '24h'
});
```

#### TokenTerminal
```typescript
// Protocol Metrics
const metrics = await analyticsAgent.execute('getMetrics', {
  protocol: 'mantle',
  metrics: ['revenue', 'tvl', 'volume']
});
```

### 3. Social Integration

#### Discord
```typescript
// Community Interaction
await kolAgent.execute('postUpdate', {
  channel: 'announcements',
  content: 'New feature release!'
});
```

#### Twitter
```typescript
// Social Post
await memeAgent.execute('postMeme', {
  content: 'DeFi yields are looking great!',
  media: 'meme.jpg'
});
```

## Security Considerations

### 1. Transaction Security
```typescript
// Security Configuration
const securityConfig = {
  maxGasPrice: '100',
  maxSlippage: '1',
  approvalTimeout: 300,
  requiredConfirmations: 5
};
```

### 2. API Security
```typescript
// API Configuration
const apiConfig = {
  rateLimit: 10,
  timeout: 30000,
  retries: 3,
  backoff: 'exponential'
};
```

## Error Handling

### 1. Transaction Errors
```typescript
try {
  await mantleAgent.execute('swap', swapConfig);
} catch (error) {
  if (error.code === 'INSUFFICIENT_LIQUIDITY') {
    // Handle liquidity error
  } else if (error.code === 'PRICE_IMPACT_TOO_HIGH') {
    // Handle price impact error
  }
}
```

### 2. Bridge Errors
```typescript
try {
  await crossChainAgent.execute('bridge', bridgeConfig);
} catch (error) {
  if (error.type === 'BRIDGE_TIMEOUT') {
    // Handle timeout
  } else if (error.type === 'DESTINATION_CHAIN_ERROR') {
    // Handle destination chain error
  }
}
```

## Best Practices

### 1. Transaction Management
- Always use appropriate slippage tolerance
- Implement proper gas estimation
- Handle transaction receipts
- Monitor transaction status
- Implement timeout mechanisms

### 2. Error Recovery
- Implement retry mechanisms
- Handle partial failures
- Maintain transaction logs
- Provide status updates
- Enable manual intervention

### 3. Security
- Validate all inputs
- Check allowances
- Monitor gas prices
- Implement rate limiting
- Log all operations

## Next Steps

For more information about:
- System architecture, see [System Overview](system-overview.md)
- Agent implementation, see [Multi-Agent System](multi-agent-system.md)
- Agent capabilities, see [Agents Directory](agents-directory.md)
