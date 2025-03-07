# HiveFi Self-Hosting & Deployment Guide

HiveFi is built to be fully self-hosted, giving you complete control over your data and operations. Follow this guide to set up and run your own instance of HiveFi on your server or local machine. For a quick overview of what you'll be running, check out our [System Overview](../under-the-hood/system-overview.md) or see our [Features](./features.md) list.

## Prerequisites

- **Server/Cloud Instance or Local Machine:** (e.g., AWS, DigitalOcean, or your own PC)
- **Node.js:** Version 23+ installed
- **Git:** To clone the repository
- **pnpm:** Install globally with `npm install -g pnpm`
- **Basic Knowledge:** Familiarity with TypeScript/Node.js is recommended
- **API Keys:** For MultiversX operations (e.g., EVM_PRIVATE_KEY, OPENAI_API_KEY, etc.)


## 🏠 Self-Hosting

HiveFi is and will always be open source! We strongly encourage users to self-host their own instance of HiveFi. This gives you full control over your data and agents.

### Requirements for Self-Hosting
- Server or cloud instance (e.g., AWS, DigitalOcean, or your local machine)
- API keys for required services
- Basic knowledge of TypeScript/Node.js for customization

### Support
While self-hosting is a DIY approach, we provide:
- Detailed documentation
- Community support via Discord
- GitHub issues for bug reports
- Basic setup guidance

## 🚀 Quick Start

### Prerequisites

- [Node.js 23+](https://docs.npmjs.com/downloading-and-installing-node-js-and-npm)
- [Git](https://git-scm.com/downloads)
- [pnpm](https://pnpm.io/installation)

> **Note for Windows Users:** [WSL 2](https://learn.microsoft.com/en-us/windows/wsl/install-manual) and [Visual Studio Build Tools](https://visualstudio.microsoft.com/downloads/) are required.

### Installation

```bash
# Clone the repository
git clone https://github.com/nicoware-dev/hivefi-v2
cd hivefi-v2

# Install dependencies
pnpm install

# Copy environment file
cp .env.example .env
```

### Configuration

Edit `.env` file and add your credentials:

```env
# Required for blockchain operations
EVM_PRIVATE_KEY=your_private_key  # 64-character hex string without 0x prefix


# LLM Provider (choose one)
OPENAI_API_KEY=                    # OpenAI API key
ANTHROPIC_API_KEY=                 # For Claude (optional)

# Client Configuration (optional)
DISCORD_APPLICATION_ID=            # Discord bot ID
DISCORD_API_TOKEN=                 # Discord bot token
TELEGRAM_BOT_TOKEN=                # Telegram bot token
```

### Running the Agent

```bash
# Build the project
pnpm build

# Start a single agent (Recommended for testing)
pnpm start --characters="characters/demo-agent.character.json"

# Start demo agents (7) (Private+Internal)
pnpm start --characters="characters/demo-agent.character.json,characters/meme-agent.character.json,characters/mantle-agent.character.json,characters/sonic-agent.character.json,characters/multichain-agent.character.json,characters/crosschain-agent.character.json,characters/analytics-agent.character.json"

# Start all agents (13) (Public+Private+Internal)
pnpm start --characters="characters/meme-agent.character.json,characters/sales-agent.character.json,characters/demo-agent.character.json,characters/alpha-agent.character.json,characters/predictions-agent.character.json,characters/kol-agent.character.json,characters/web3-advisor-agent.character.json,characters/token-deployer-agent.character.json,characters/nft-deployer-agent.character.json,characters/coordinator-agent.character.json,characters/analytics-agent.character.json,characters/crosschain-agent.character.json,characters/mantle-agent.character.json,characters/sonic-agent.character.json,characters/multichain-agent.character.json"
```

### Running the Web Client

In a new terminal, run the following command:

```bash
cd eliza/client
pnpm run dev
```

## Deployment Options

Ready to get HiveFi up and running? We've got several ways to deploy, depending on what works best for you. Let's walk through your options!

### Running Locally 🏠

- **On Your Own Machine**  
  Perfect for testing things out or getting familiar with the platform. Just follow our standard setup steps, and you'll be up and running in no time. It's also great for development and learning the ropes!

## Cloud Deployment ☁️

Want your HiveFi instance running 24/7? Here are some cloud options we recommend:

- **DigitalOcean** 🌊  
  A budget-friendly choice that's easy to set up. Want to make things even smoother? Try using CapRover on DigitalOcean - it makes management a breeze!

- **Google Cloud Platform (GCP)** 🌐  
  Already using other Google services? GCP might be your best bet. It comes with lots of helpful tools built right in.

- **Amazon Web Services (AWS)** 📦  
  Perfect for production setups, especially if you're expecting heavy traffic. AWS gives you all the scalability you could need.

- **Railway** 🚂  
  Great for developers who want a simple deployment experience. It's particularly handy for smaller projects or when you're prototyping.

## Managing Your Setup

No matter which platform you pick, you'll use the same configuration tools we cover in our docs. Our modular design means you can make changes or add features without disrupting what's already working.

Need more detailed instructions? Check out:
- The [Eliza docs](https://elizaos.github.io/eliza/docs/guides/remote-deployment/) for in-depth deployment guides
- This handy [YouTube tutorial](https://www.youtube.com/watch?v=15-cvpGCHIA) showing how to deploy with DigitalOcean CapRover

Happy deploying! 🚀
