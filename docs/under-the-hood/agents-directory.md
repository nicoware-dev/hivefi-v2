# HiveFi Agents Directory

A comprehensive guide to all agents in the HiveFi ecosystem, their roles, capabilities, and usage patterns.

## Agent Categories

HiveFi's agents are organized into three main categories:
- Internal Agents: Platform operations
- Public Agents: Shared services
- Private Agents: Custom deployments

## Internal Agents

### Demo Agent

The Demo Agent is a superagent capable of demonstrating all platform capabilities.

#### Capabilities
- Execute demo transactions
- Showcase platform features
- Provide tutorials and guidance
- Answer questions about functionality

#### Usage Example
```typescript
// Demo transaction
await demoAgent.execute('Show me how to swap tokens on Mantle');

// Feature showcase
await demoAgent.execute('Demonstrate cross-chain bridge operation');
```

### Meme Agent

The Meme Agent handles social media content creation and distribution.

#### Capabilities
- Generate memes and social content
- Manage social media posts
- Track engagement metrics
- Schedule content distribution

#### Usage Example
```typescript
// Create meme
await memeAgent.execute('Create a meme about DeFi yields');

// Schedule post
await memeAgent.execute('Schedule Twitter post for market update');
```

### Sales Agent

The Sales Agent manages customer relations and onboarding.

#### Capabilities
- Handle customer inquiries
- Guide platform onboarding
- Collect user feedback
- Manage support tickets

#### Usage Example
```typescript
// Handle inquiry
await salesAgent.execute('Explain HiveFi subscription plans');

// Onboarding assistance
await salesAgent.execute('Guide new user through wallet setup');
```

## Public Agents

### Alpha Agent

The Alpha Agent identifies market opportunities and trading signals.

#### Capabilities
- Market opportunity detection
- Trend analysis
- Signal generation
- Performance tracking

#### Usage Example
```typescript
// Market analysis
await alphaAgent.execute('Find yield opportunities for USDC');

// Trend detection
await alphaAgent.execute('Analyze market sentiment for MNT');
```

### Predictions Agent

The Predictions Agent provides market forecasting and analysis.

#### Capabilities
- Market forecasting
- Trend analysis
- Report generation
- Risk assessment

#### Usage Example
```typescript
// Market forecast
await predictionsAgent.execute('Predict MNT price trend');

// Risk analysis
await predictionsAgent.execute('Analyze risk for lending strategy');
```

### KOL Agent

The KOL Agent manages social media engagement and community interaction.

#### Capabilities
- Social media management
- Community engagement
- Content distribution
- Sentiment analysis

#### Usage Example
```typescript
// Community engagement
await kolAgent.execute('Respond to Discord questions');

// Content creation
await kolAgent.execute('Create educational thread about bridges');
```

### Web3 Advisor Agent

The Web3 Advisor provides technical guidance and protocol recommendations.

#### Capabilities
- Technical guidance
- Protocol recommendations
- Problem resolution
- Best practice advice

#### Usage Example
```typescript
// Technical guidance
await advisorAgent.execute('Explain optimal bridge route');

// Protocol advice
await advisorAgent.execute('Compare lending protocols on Mantle');
```

### Token Deployer Agent

The Token Deployer handles token creation and management.

#### Capabilities
- Token contract deployment
- Liquidity pool creation
- Token configuration
- Contract verification

#### Usage Example
```typescript
// Token deployment
await tokenAgent.execute('Deploy new token on Mantle');

// Liquidity management
await tokenAgent.execute('Create liquidity pool on DEX');
```

### NFT Deployer Agent

The NFT Deployer manages NFT collection creation and deployment.

#### Capabilities
- Collection deployment
- Metadata management
- Minting operations
- Marketplace integration

#### Usage Example
```typescript
// Collection creation
await nftAgent.execute('Deploy NFT collection');

// Metadata management
await nftAgent.execute('Update collection metadata');
```

## Private Agents

### Coordinator Agent

The Coordinator Agent orchestrates tasks among private agents.

#### Capabilities
- Task routing
- Workflow management
- Response aggregation
- Error handling

#### Usage Example
```typescript
// Task orchestration
await coordinatorAgent.execute('Execute cross-chain swap');

// Workflow management
await coordinatorAgent.execute('Monitor bridge transaction');
```

### Analytics Agent

The Analytics Agent provides data analysis and visualization.

#### Capabilities
- Portfolio analysis
- Performance metrics
- Risk assessment
- Custom reporting

#### Usage Example
```typescript
// Portfolio analysis
await analyticsAgent.execute('Generate portfolio report');

// Performance tracking
await analyticsAgent.execute('Calculate strategy returns');
```

### Chain-Specific Agents

#### Mantle Agent

The Mantle Agent handles Mantle network operations.

##### Capabilities
- Wallet management
- DEX interactions
- Lending operations
- Yield farming

##### Usage Example
```typescript
// DEX operation
await mantleAgent.execute('Swap MNT for USDC');

// Lending
await mantleAgent.execute('Supply USDC to Lendle');
```

#### Sonic Agent

The Sonic Agent manages Sonic chain operations.

##### Capabilities
- Wallet operations
- DEX trading
- Lending protocols
- Yield optimization

##### Usage Example
```typescript
// Trading
await sonicAgent.execute('trade on SwapX');

// Yield farming
await sonicAgent.execute('stake in Beefy vault');
```

#### MultiChain Agent

The MultiChain Agent handles operations on protocols deployed across multiple EVM chains.

##### Capabilities
- Multichain protocol operations (Aave, Uniswap, 1inch, Beefy)
- Protocol-specific analytics
- Yield optimization across protocol deployments
- Lending and borrowing on multichain protocols
- DEX operations on multichain protocols

##### Usage Example
```typescript
// Lending on Aave across chains
await multiChainAgent.execute('Find best Aave lending rate for USDC');

// Swap on Uniswap across deployments
await multiChainAgent.execute('Swap ETH for USDC on Uniswap with best rate');

// Yield farming on Beefy across chains
await multiChainAgent.execute('Find highest yield Beefy vault for ETH-USDC');
```

### Cross Chain Agent

The Cross Chain Agent manages bridge operations and cross-chain transactions.

#### Capabilities
- Bridge operations
- Transaction tracking
- Status monitoring
- Error recovery

#### Usage Example
```typescript
// Bridge operation
await crossChainAgent.execute('Bridge USDC from Mantle to Sonic');

// Status check
await crossChainAgent.execute('Check bridge transaction status');
```

## Agent Configuration

### Environment Setup
```env
# Agent Configuration
AGENT_API_KEY=your-api-key
AGENT_ENDPOINT=https://api.hivefi.ai/agent
AGENT_TIMEOUT=30000

# Chain Configuration
MANTLE_RPC_URL=https://rpc.mantle.xyz
SONIC_RPC_URL=https://mainnet.sonic.org/rpc
BTC_RPC_URL=https://btc.getblock.io/mainnet/
```

### Security Settings
```typescript
// Agent security configuration
const agentConfig = {
  maxTransactionAmount: '1000',
  allowedChains: ['mantle', 'sonic', 'bitcoin'],
  requiredApprovals: 1,
  timeoutSeconds: 30
};
```

## Best Practices

### 1. Agent Interaction
- Use clear, specific commands
- Include all required parameters
- Handle responses appropriately
- Implement proper error handling

### 2. Security
- Validate all inputs
- Check transaction limits
- Monitor operation status
- Implement timeouts
- Handle errors gracefully

### 3. Performance
- Batch related operations
- Cache frequent requests
- Monitor resource usage
- Implement rate limiting
- Log important events

## Next Steps

For more information about:
- Agent implementation details, see [Multi-Agent System](multi-agent-system.md)
- System architecture, see [System Overview](system-overview.md)
- Protocol integrations, see [Integrations](integrations.md)
