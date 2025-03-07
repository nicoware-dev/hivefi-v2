# HiveFi: Multichain DeFAI Agent Swarm

<div align="center">
  <img src="assets/logo/logo.svg" alt="HiveFi Logo" width="200"/>
  <h3>Revolutionizing Multichain DeFi with AI-Powered Agent Swarms</h3>
  <p>Simplify your DeFi experience across multiple blockchains with the power of Multi-Agent Systems (MAS)</p>
  <p align="center">
    <a href="https://discord.gg/hivefiai">
      <img src="https://img.shields.io/badge/Discord-Join%20Us-blue?style=for-the-badge&logo=discord" alt="Discord" />
    </a>
    <a href="https://x.com/hivefi_ai">
      <img src="https://img.shields.io/badge/X-Follow%20Us-blue?style=for-the-badge&logo=x" alt="X" />
    </a>
    <a href="https://www.youtube.com/watch?v=demo-video">
      <img src="https://img.shields.io/badge/YouTube-Demo%20Video-red?style=for-the-badge&logo=youtube" alt="Demo Video" />
    </a>
    <a href="https://linktr.ee/hivefi">
      <img src="https://img.shields.io/badge/Linktree-Visit%20Us-green?style=for-the-badge&logo=linktree" alt="Linktree" />
    </a>
    <a href="https://hivefi.vercel.app/">
      <img src="https://img.shields.io/badge/Website-Visit%20App-purple?style=for-the-badge&logo=vercel" alt="Website" />
    </a>
  </p>
</div>

---

## 📚 Table of Contents

- [🌟 Overview](#-overview)
  - [Why Multi-Agent Systems (MAS)?](#why-multi-agent-systems-mas)
- [✨ Features](#-features)
  - [Core Features](#core-features)
  - [Blockchain Features](#blockchain-features)
  - [Web App Features](#-web-app-features)
- [🧰 Tech Stack](#-tech-stack)
- [🤖 Agent Categories](#-agent-categories)
  - [Internal Agents (Platform Operations)](#-internal-agents-platform-operations)
  - [Public Agents (Shared Services)](#-public-agents-shared-services)
  - [Private Agents (Custom Deployments)](#-private-agents-custom-deployments)
- [🏠 Self-Hosting](#-self-hosting)
  - [Requirements for Self-Hosting](#requirements-for-self-hosting)
  - [Support](#support)
- [🚀 Quick Start](#-quick-start)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
  - [Configuration](#configuration)
  - [Running the Agent](#running-the-agent)
  - [Running the Web Client](#running-the-web-client)
- [🧪 How to Use](#-how-to-use)
- [🔍 Important Notes](#-important-notes)
- [🛠️ Development](#️-development)
  - [Project Structure](#project-structure)
- [🤝 Contributing](#-contributing)
- [📄 License](#-license)

## 🌟 Overview

HiveFi is an innovative open-source project revolutionizing the DeFi landscape through AI-powered agent swarms. By employing a sophisticated multi-agent system, HiveFi streamlines and automates DeFi operations across multiple blockchains, offering users a seamless and efficient experience. Its modular design ensures scalability and adaptability, empowering users to navigate the complexities of cross-chain DeFi with ease and confidence.

### Why Multi-Agent Systems (MAS)?

Our platform leverages a Multi-Agent System architecture where each agent specializes in specific tasks—from fetching metrics to executing trades—enabling modular, scalable, and efficient operations. This approach ensures:

- **🎯 Specialization**: Optimized performance through task-specific agents
- **📈 Scalability**: Easy addition of new agents and features
- **🛡️ Robustness**: Continued operation even if individual agents fail
- **⚡ Efficiency**: Parallel task execution for improved performance
- **🔄 Adaptability**: Seamless integration with new protocols and chains

<div align="center">
  <img src="assets/architecture.png" alt="HiveFi Architecture" width="800"/>
  <p><em>HiveFi Architecture</em></p>
</div>

## ✨ Features

### Core Features

- 💬 Natural language processing
- 🤖 Multi-Agent System (MAS) architecture
- 🔅 Integrated website & web app
- 🔗 Support for multiple LLM providers (OpenAI, Anthropic, etc.)
- 📚 RAG Knowledge base with DeFi expertise
- 💰 Real-time prices using CoinGecko API
- 🚀 Real-time TVL using DefiLlama API
- 📊 DEX analytics via GeckoTerminal
- 📈 Data visualization and analytics
- 🚀 Highly extensible superplugin architecture

### Blockchain Features

#### Analytics Module
- 📊 Real-time price data via CoinGecko
- 📈 DEX analytics via GeckoTerminal
- 💹 TVL tracking via DefiLlama
- 💼 Portfolio analytics and tracking
- 📉 Protocol performance metrics
- 📊 Market trend analysis

#### Cross-Chain Module
- 🌉 Bridge operations via Wormhole
- 🔄 Cross-chain transaction monitoring
- 💧 Liquidity tracking
- 🛣️ Route optimization
- ✅ Status verification

#### Mantle Network
- 💰 Wallet management
- 💸 Token transfers
- 💱 DEX operations (Merchant Moe, Agni Finance)
- 💸 Lending operations (Lendle, Init Capital)
- 🌾 Yield farming (Pendle)
- 💧 Protocol interactions

#### Sonic Chain
- 💰 Wallet management
- 💸 Token transfers
- 💱 DEX operations (Beets, SwapX, Shadow Exchange)
- 💸 Lending operations (Silo Finance, Aave)
- 🌾 Yield optimization (Beefy)
- 💧 Protocol integrations

#### MultiChain Module
- 💰 Wallet operations
- 💸 Native token transfers
- 💱 ERC-20 token transfers
- 💼 Portfolio management
- 🔑 Chain-specific wallet access

### 🖥️ Web App Features
- 🚀 Landing page
- 📄 Agents directory
- 🤖 Chat with agent swarm through web interface
- 👛 Multichain wallet connector
- 📊 Portfolio & analytics dashboard
- 📝 Transaction history
- ⚙️ Settings and preferences

<div align="center">
  <img src="assets/webapp.png" alt="HiveFi Web Interface" width="800"/>
  <p><em>HiveFi Web Interface</em></p>
</div>

## 🧰 Tech Stack

- **Frontend**: React, TypeScript, TailwindCSS, ShadcnUI
- **State Management**: React Context API / Zustand
- **Authentication**: Privy
- **Blockchain Integration**: thirdweb, web3.js/ethers.js
- **Build & Deployment**: Vite, Vercel
- **Agent Framework**: Eliza
- **Workflow Automation & Orchestration**: n8n
- **Package Management**: pnpm

## 🤖 Agent Categories

### 🏢 Internal Agents (Platform Operations)
1. **Meme Agent**: Social media content creation and distribution
2. **Sales Agent**: Customer relations and onboarding
3. **Demo Agent**: Platform demonstration and showcase

### 🌐 Public Agents (Shared Services)
4. **Alpha Agent**: Market opportunity identification
5. **Predictions Agent**: Market forecasting and trend analysis
6. **KOL Agent**: Social media engagement and management
7. **Web3 Advisor Agent**: Technical guidance across chains
8. **Token Deployer Agent**: Token deployment and management
9. **NFT Deployer Agent**: NFT collection deployment

### 🔒 Private Agents (Custom Deployments)
10. **Coordinator Agent**: Multi-agent orchestration and task delegation
11. **Analytics Agent**: Cross-chain data analysis and visualization
12. **Cross Chain Agent**: Cross-chain operations management
13. **Mantle Agent**: Mantle-specific operations
14. **Sonic Agent**: Sonic-specific operations
15. **MultiChain Agent**: Multichain Protocols operations and integrations

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
git clone https://github.com/hivefi/hivefi
cd hivefi

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

## 🧪 How to Use

Interact with the agents using these example prompts:

### Network Information
```
What is Mantle Network?
Tell me about Sonic Chain.
```

### Market Data
```
Get prices for ETH, BTC, MNT, and S
What's Uniswap's TVL on Arbitrum?
Show TVL for Uniswap, Aave, and Curve
Show me global DeFi stats
Show me top pools on Arbitrum
```

### Wallet Operations
```
Show me my Mantle wallet address and balances
Show me detailed positions in my portfolio for 0xfb0eb7294e39bb7b0aa6c7ec294be2c968656fb0 across all chains
```

### Multichain Token Transfers
```
Send 0.1 MNT to 0xF12d64817029755853bc74a585EcD162f63c5f84 on Mantle
Send 0.01 S to 0xF12d64817029755853bc74a585EcD162f63c5f84 on Sonic
Transfer 0.001 USDC on Arbitrum to 0xF12d64817029755853bc74a585EcD162f63c5f84
```

### Multichain DeFi Operations
```
Swap 0.1 MNT for USDC on Merchant Moe on Mantle
Supply 0.1 USDC to Lendle on Mantle
Stake 0.1 S with Beets LST on Sonic
```

### Cross-Chain Operations
```
Transfer 0.01 USDC from Polygon to Arbitrum via Circle Bridge
Send 0.01 USDC from Arbitrum to Polygon using Circle Bridge
```

## 🔍 Important Notes

- Ensure you have sufficient funds for transaction fees
- Always double-check addresses and amounts before executing transactions
- For cross-chain operations, verify that the bridge supports the tokens and chains you're using
- Private keys are stored locally and never transmitted to external servers
- Some features are still in development or simulation mode

## 🛠️ Development

### Project Structure

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
│   │       ├── src/
│   │       │   ├── index.ts   # Main plugin entry point
│   │       │   ├── analytics/ # Analytics module
│   │       │   │   ├── index.ts # Analytics module entry point
│   │       │   │   ├── coingecko/ # CoinGecko integration
│   │       │   │   ├── defillama/ # DefiLlama integration
│   │       │   │   ├── geckoterminal/ # GeckoTerminal integration
│   │       │   │   └── utils/ # Shared analytics utilities
│   │       │   ├── crosschain/ # Cross-chain module
│   │       │   │   ├── index.ts # Cross-chain module entry point
│   │       │   │   └── wormhole/ # Wormhole bridge integration
│   │       │   ├── mantle/    # Mantle module
│   │       │   │   ├── index.ts # Mantle module entry point
│   │       │   │   ├── actions/ # Mantle-specific actions
│   │       │   │   ├── providers/ # Mantle-specific providers
│   │       │   │   ├── types/ # Mantle-specific types
│   │       │   │   ├── templates/ # Response templates
│   │       │   │   └── config/ # Configuration
│   │       │   ├── sonic/     # Sonic module
│   │       │   │   ├── index.ts # Sonic module entry point
│   │       │   │   ├── actions/ # Sonic-specific actions
│   │       │   │   ├── providers/ # Sonic-specific providers
│   │       │   │   ├── types/ # Sonic-specific types
│   │       │   │   ├── templates/ # Response templates
│   │       │   │   └── config/ # Configuration
│   │       │   └── multichain/ # MultiChain module
│   │       │       ├── index.ts # MultiChain module entry point
│   │       │       ├── constants.ts # Chain configurations
│   │       │       ├── types.ts # Type definitions
│   │       │       ├── actions/ # Core actions
│   │       │       ├── providers/ # Wallet providers
│   │       │       ├── utils/ # Utility functions
│   │       │       └── portfolio/ # Portfolio management
│   └── characters/            # Agent character files
└── README.md                  # Project overview
```

## 📊 Current Status and Roadmap

### Implemented Features
- Analytics module with CoinGecko, DefiLlama, and GeckoTerminal integrations
- Cross-chain module with Wormhole bridge support
- Mantle and Sonic chain-specific modules
- MultiChain module with basic wallet operations and native token transfers
- Web interface with portfolio dashboard

### In Progress
- Protocol integrations (Uniswap, Aave, Beefy)

### Planned Features
- Additional bridge integrations (DeBridge)
- Advanced market analysis tools
- Social and community tools
- Development tools for token and NFT deployment

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

<div align="center">
  <p>Built with ❤️ by the HiveFi team</p>
  <p>
    <a href="https://discord.gg/hivefiai">
      <img src="https://img.shields.io/badge/Discord-Join-7289DA?style=for-the-badge&logo=discord" alt="Discord" />
    </a>
    <a href="https://x.com/hivefi_ai">
      <img src="https://img.shields.io/badge/X-Follow%20Us-blue?style=for-the-badge&logo=twitter" alt="X" />
    </a>
  </p>
</div>
