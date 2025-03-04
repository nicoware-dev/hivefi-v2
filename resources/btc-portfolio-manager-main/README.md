# BTC Portfolio and Investment Manager

(Special Support for sBTC)

A comprehensive portfolio management solution for Bitcoin assets across multiple chains, including Stacks, Rootstock, and BOB. This project enables users to track, manage, and optimize their BTC investments through various DeFi protocols (Velar on Stacks , Runes on Rootstock , 5+ Strategies integrated on BOB).

## 🌟 Features

- Multi-Chain Portfolio Tracking
  - Track BTC assets across Stacks (sBTC), Rootstock, and BOB
  - Real-time portfolio valuation and performance metrics
  - Transaction history and analytics

- AI-Powered Eliza Trading Assistant
  - Natural language interaction for trading and portfolio management
  - Automated strategy suggestions and execution
  - Risk assessment and portfolio optimization

- DeFi Protocol Integration
  - Velar Protocol integration for Stacks trading
  - BOB strategies for yield generation
  - Cross-chain token swaps via Wormhole

- Smart Contract Features
  - ERC-7621 Basket Token Standard implementation on Rootstock
  - Transparent upgradeable proxy contracts
  - Factory contracts for basket token deployment

I'll help you explain how you utilized different sponsor technologies in your submission. Here's a comprehensive breakdown:

1. Stacks Integration:
- Implemented a portfolio management system that interacts with the Stacks blockchain
- Created a user interface for managing sBTC transactions and portfolio tracking
- Built functionality for deposits and withdrawals of sBTC using the Stacks network
- Integrated real-time price tracking and transaction history for sBTC assets
- Created a Velar-Eliza plugin for doing swaps on Stacks
- Implemented portfolio statistics tracking including total balance, deposits, and withdrawals in sBTC

2. Rootstock (RSK) Integration:
- Implemented ERC-7621 Token Basket Standard for Runes investments
- Created factory contracts for deploying new basket tokens
- Built basket token functionality for bundling multiple Runes into a single token
- Added rebalancing capabilities for basket token composition
- Integrated transparent proxy pattern for upgradeable basket contracts
- Developed basket token valuation and NAV calculation
- Created interfaces for basket token minting and redemption
- Implemented basket token liquidity provision mechanisms
- Built comprehensive testing suite for basket token contracts


3. BOB Protocol Integration:
- Created a dedicated BOB plugin in the agent architecture
- Implemented multiple strategy contracts integration (Segment, Solv, Avalon, etc.)
- Built cross-chain investment functionality using BOB Gateway
- Integrated PSBT (Partially Signed Bitcoin Transaction) handling
- Implemented transaction signing and finalization through BOB Gateway

4. Wormhole Integration:
- Developed a comprehensive Wormhole plugin for cross-chain operations
- Implemented token transfer patterns for cross-chain transactions
- Created action recognition system for transfer and redeem operations
- Built pattern matching for various transfer command formats
- Implemented chain-aware transfer functionality
- Added support for native token transfers across different chains
- Created evaluators for detecting and processing transfer requests
- Implemented transaction validation and confirmation flows

Key Features Across All Integrations:
- Real-time transaction status tracking
- Comprehensive error handling
- User-friendly interface for all operations
- Cross-chain compatibility
- Transaction confirmation notifications
- Secure wallet integrations
- Price tracking and portfolio management
- Strategy-based investment options
- Bridge selection interface for cross-chain operations
- Support for multiple transaction types (swap, transfer, invest)
- Modular plugin architecture for extensibility
- Responsive and intuitive user interface
- Real-time price and portfolio updates
- Transaction history tracking
- Secure transaction signing and validation

This implementation demonstrates a comprehensive approach to blockchain interoperability, focusing on user experience while maintaining security and reliability across different blockchain networks.

## 🏗️ Architecture

```mermaid
graph TB
    subgraph Frontend
        UI[Next.js UI]
        Context[React Context]
        Components[UI Components]
    end

    subgraph Agent
        AI[AI Assistant]
        Plugins[Plugin System]
        subgraph Plugins
            VelarPlugin[Velar Plugin]
            BOBPlugin[BOB Plugin]
            WormholePlugin[Wormhole Plugin]
        end
        Evaluators[Action Evaluators]
    end

    subgraph Smart Contracts
        BasketToken[Basket Token Standard]
        Factory[Token Factory]
        Proxy[Upgradeable Proxy]
        Vault[Domain Vault]
    end

    subgraph Protocols
        Velar[Velar Protocol]
        BOB[BOB Protocol]
        Wormhole[Wormhole Bridge]
    end

    UI --> Context
    Context --> Components
    UI --> Agent
    Agent --> Plugins
    Plugins --> Protocols
    Smart Contracts --> Protocols
    UI --> Smart Contracts
```

## 🔧 Technical Stack

- Frontend
  - Next.js 14
  - TailwindCSS
  - shadcn/ui components
  - TypeScript

- Agent
  - Node.js
  - ElizaOS Core
  - Custom plugins for protocol integration
  - Natural language processing

- Smart Contracts
  - Solidity
  - ERC-7621 standard
  - OpenZeppelin contracts
  - Hardhat development environment

## 🚀 Getting Started

### Prerequisites
- Node.js >= 22
- pnpm or npm
- Git

### Installation

1. Clone the repository:
```bash
git clone https://github.com/kamalbuilds/btc-portfolio-manager.git
cd btc-portfolio-manager
```

2. Install frontend dependencies:
```bash
cd frontend
npm install
```

3. Install agent dependencies:
```bash
cd ../agent
pnpm install
```

4. Set up environment variables:
```bash
cp frontend/.env.example frontend/.env
cp agent/.env.example agent/.env
```

5. Start the development servers:

Frontend:
```bash
cd frontend
npm run dev
```

Agent:
```bash
cd agent
pnpm start
```

## 🔐 Smart Contract Addresses

### Testnet Deployments

Rootstock Testnet:
- BasketTokenStandard: `0x1602cF4Ffa1da92d1708d74e5A9985593176171A`
- BasketTokenStandardPair: `0x9dc50A13c06Bc9b46430581180158108A59308f2`
- Factory: `0x54F686d1a8D3600f9f9Ead9ba3F31903438e0E2e`

## 🛠️ Development

### Project Structure
```
btc-portfolio-manager/
├── frontend/           # Next.js frontend application
├── agent/             # AI assistant and plugins
├── bob/              # BOB protocol integration
└── runes-basket-contracts/ # Smart contracts
```

### Key Components

1. Frontend
   - Portfolio dashboard
   - Transaction management
   - Strategy visualization
   - Wallet integration

2. Agent
   - Natural language processing
   - Protocol-specific plugins
   - Action recognition and execution
   - State management

3. Smart Contracts
   - Basket token implementation
   - Factory contracts
   - Proxy contracts
   - Domain vault

## 📜 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 🔗 Links

- [Wormhole Explorer](https://wormholescan.io/)
- [Rootstock Explorer](https://rootstock-testnet.blockscout.com/)
- [Documentation](docs/)


