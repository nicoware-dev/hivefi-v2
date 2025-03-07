# HiveFi System Overview

## Architecture Overview

HiveFi's architecture is designed for scalability, security, and extensibility across multiple blockchain networks. This document provides a detailed look at how the various components work together to create a seamless DeFi automation experience.

## System Components

### 1. Application Layer

#### Web Application
- **Framework**: React with Vite
- **Styling**: TailwindCSS with ShadcnUI
- **State Management**: React Context API / Zustand
- **Authentication**: Privy
- **Key Features**:
  - Responsive dashboard
  - Agent interaction interface
  - Portfolio management
  - Analytics visualization
  - Transaction tracking

#### External Clients
- **Discord Bot**: Community interaction and commands
- **Telegram Bot**: Mobile-first interaction
- **Twitter Bot**: Social engagement and updates
- **REST API**: External integrations

### 2. Agent Layer

#### Internal Agents
- **Demo Agent**: Platform demonstration
- **Meme Agent**: Social content creation
- **Sales Agent**: Customer relations

#### Public Agents
- **Alpha & Predictions**: Market analysis
- **KOL & Web3 Advisor**: Community engagement
- **Token & NFT Deployer**: Asset deployment

#### Private Agents
- **Coordinator**: Task orchestration
- **Chain-Specific**: Blockchain operations
- **Analytics**: Data analysis

### 3. Superplugin Layer

#### Analytics Module
- Market data integration
- Portfolio tracking
- Performance metrics
- Risk analysis

#### Blockchain Module
- Transaction management
- Wallet operations
- Contract interactions
- Security validation

#### Chain Modules
- Chain-specific implementations
- Protocol integrations
- Bridge operations
- Asset management

### 4. Blockchain Layer

#### Mantle Network
- **Features**:
  - Wallet management
  - DEX integrations
  - Lending platforms
  - Yield farming
  - Liquidity provision

#### Sonic Chain
- **Features**:
  - Wallet operations
  - DEX interactions
  - Lending protocols
  - Yield optimization
  - Bridge operations

#### MultiChain Protocols
- **Features**:
  - Operations on protocols deployed across multiple EVM chains
  - Aave lending and borrowing across deployments
  - Uniswap trading across deployments
  - 1inch aggregation across chains
  - Beefy yield farming across deployments
  - Protocol analytics and comparison

## Next Steps

For more detailed information about specific components, please refer to:
- [Multi-Agent System](multi-agent-system.md)
- [Agents Directory](agents-directory.md)
- [Integrations](integrations.md)
