# Developer Quick Start Guide

Get up and running with HiveFi development in minutes! This guide will help you set up your development environment and start building with our platform.

## Prerequisites

### Required Software
- Node.js v23+
- pnpm
- Git
- Visual Studio Code (recommended)

### API Keys
- OpenAI API key or Anthropic API key
- EVM_PRIVATE_KEY


## Installation

```bash
# Clone the repository
git clone https://github.com/hivefi/hivefi
cd hivefi

# Install dependencies
pnpm install

# Copy environment file
cp .env.example .env

# Configure your environment variables
nano .env
```

## Environment Setup

Configure your `.env` file with the following:

```env
# Required for blockchain operations
EVM_PRIVATE_KEY=your_private_key  # 64-character hex string without 0x prefix
MANTLE_RPC_URL=https://rpc.mantle.xyz
SONIC_RPC_URL=https://mainnet.sonic.org/rpc
EVM_RPC_URL=your_preferred_rpc_url  # For multichain operations

# API Keys for analytics
COINGECKO_API_KEY=your_api_key     # For CoinGecko API
DEFILLAMA_API_KEY=your_api_key     # For DefiLlama API

# LLM Provider (choose one)
OPENAI_API_KEY=                    # OpenAI API key
ANTHROPIC_API_KEY=                 # For Claude (optional)

# Client Configuration (optional)
DISCORD_APPLICATION_ID=            # Discord bot ID
DISCORD_API_TOKEN=                 # Discord bot token
TELEGRAM_BOT_TOKEN=                # Telegram bot token

# Development Settings
NODE_ENV=development
DEBUG=true
```

## Project Structure

```
hivefi/
├── assets/                    # Branding assets and images
│   └── logo/                  # Logo files
├── docs/                      # Documentation
│   ├── architecture/          # Architecture diagrams and specs
│   ├── agents/                # Agent specifications
│   └── api/                   # API documentation
├── eliza/                     # Eliza framework integration
│   ├── client/                # Web application
│   │   ├── public/            # Static assets
│   │   └── src/               # Frontend source code
│   ├── packages/
│   │   └── plugin-hivefi/     # Main superplugin
│   └── characters/            # Agent character files
└── README.md                  # Project overview
```

## First Steps

### 1. Start the Development Server

```bash
# Start the web client
cd eliza/client
pnpm dev

# In another terminal, start the agent
cd eliza
pnpm start --characters="characters/analytics-agent.character.json"
```

### 2. Try Some Example Commands

Once your agent is running, you can try these example commands:

- "What's the current price of ETH?"
- "Show me the TVL of Uniswap"
- "Get trending pools on Arbitrum"
- "Transfer 0.01 USDC from Ethereum to Arbitrum via Wormhole"

### 3. Explore the Documentation

To learn more about HiveFi's capabilities, explore our documentation:

- [Analytics Module](../for-developers/plugin/analytics/analytics-module.md)
- [Cross-Chain Operations](../for-developers/plugin/crosschain-module.md)
- [Mantle Module](../for-developers/plugin/mantle-module.md)
- [Sonic Module](../for-developers/plugin/sonic-module.md)

## Next Steps

1. Explore the [Plugin Guide](plugin-guide.md) for detailed plugin development
2. Learn about [n8n Workflows](n8n-workflows.md) for automation
3. Check out [Self-Hosting](self-hosting.md) for deployment options
4. Join our [Discord](https://discord.gg/hivefiai) developer community

## Troubleshooting

### Common Issues

1. **Connection Issues**
   ```bash
   # Check network configuration
   ping api.hivefi.ai
   # Verify environment variables
   echo $MANTLE_RPC_URL
   ```

2. **Build Errors**
   ```bash
   # Clean install
   pnpm clean
   pnpm install
   # Rebuild
   pnpm build
   ```

3. **Agent Errors**
   ```bash
   # Enable debug logging
   DEBUG=true pnpm start
   # Check agent logs
   tail -f logs/agent.log
   ```

### Getting Help

- Check our [GitHub Issues](https://github.com/hivefi/hivefi/issues)
- Join the #dev-support channel on Discord
- Review the [FAQ](../resources/faq.md)
- Contact our developer support team

## Best Practices

1. **Code Quality**
   - Follow TypeScript best practices
   - Write comprehensive tests
   - Document your code
   - Use ESLint and Prettier

2. **Security**
   - Never commit API keys
   - Validate all inputs
   - Handle errors gracefully
   - Follow security guidelines

3. **Performance**
   - Implement caching
   - Optimize API calls
   - Monitor resource usage
   - Profile your code

Ready to dive deeper? Check out our [Plugin Guide](plugin-guide.md) for detailed development documentation!
