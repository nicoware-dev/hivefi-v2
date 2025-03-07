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
git clone https://github.com/nicoware-dev/hivefi-v2
cd hivefi-v2/eliza

# Install dependencies
pnpm install --no-frozen-lockfile
pnpm build

# Copy environment file
cp .env.example .env

# Configure your environment variables
nano .env
```

## Environment Setup

Configure your `.env` file with the following:

```env
# Required for blockchain operations
EVM_PRIVATE_KEY=your_private_key  

# LLM Provider (choose one)
OPENAI_API_KEY=                    # OpenAI API key
ANTHROPIC_API_KEY=                 # For Claude (optional)

# Client Configuration (optional)
DISCORD_APPLICATION_ID=            # Discord bot ID
DISCORD_API_TOKEN=                 # Discord bot token
TELEGRAM_BOT_TOKEN=                # Telegram bot token
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
- [Cross-Chain Operations](../for-developers/plugin/crosschain/crosschain-module.md)
- [Mantle Module](../for-developers/plugin/mantle/mantle-module.md)
- [Sonic Module](../for-developers/plugin/sonic/sonic-module.md)

## Next Steps

1. Explore the [Plugin Guide](./plugin/plugin-guide.md) for detailed plugin development
2. Learn about [n8n Workflows](n8n-workflows.md) for automation
3. Check out [Self-Hosting](self-hosting.md) for deployment options
4. Join our [Discord](https://discord.gg/APAKDaUYAM) developer community


### Getting Help

- Check our [GitHub Issues](https://github.com/nicoware-dev/hivefi-v2/issues)
- Join the #dev-support channel on Discord
- Review the [FAQ](../resources/faq.md)
- Contact our developer support team

Ready to learn more? Check out our [Plugin Guide](./plugin/plugin-guide.md) for detailed development documentation!
