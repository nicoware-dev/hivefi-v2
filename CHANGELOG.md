# Changelog

All notable changes to the HiveFi project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Coming Soon
- Sonic Chain integration
- Analytics module with CoinGecko, DefiLlama, and GeckoTerminal integrations
- Portfolio tracking with Zerion API
- Analytics dashboard in web application
- Portfolio page with asset allocation and performance metrics
- Crossmint integration for account abstraction / smart wallets
- Cross-chain module with Wormhole and DeBridge integrations
- MultiChain module with GOAT SDK
- Sales Agent for Telegram with email and RAG capabilities
- Transactions history page
- UI/UX improvements with animations
- ThirdWeb plugin integration

## [0.1.0] - 2024-03-04

### Added
- MultiChain Agent for operations across protocols deployed on multiple EVM chains
- RAG (Retrieval-Augmented Generation) for improved and extended knowledge base
- Coordinator Agent implementation with n8n for agent orchestration
- Modular superplugin architecture with chain and purpose specific modules
- Comprehensive documentation with GitBook integration
- Knowledge base for MultiChain protocols (Aave, Uniswap, 1inch, Beefy)
- Character files for all agents with specialized capabilities
- Agent directory page with filtering and details
- Chat history persistence in web application

### Changed
- Refactored architecture from Mantle-only to multichain approach
- Updated system prompts and agent descriptions for multichain focus
- Improved web interface with enhanced responsiveness
- Enhanced UX with better loading states and error handling
- Restructured documentation to reflect multichain capabilities

### Fixed
- Agent coordination issues with new n8n workflow system
- Knowledge base inconsistencies across agents
- Mobile responsiveness issues in web interface
- Character file configuration for specialized agents

## [0.0.1] - 2023-12-15 (Sozu Hack)

### Added
- Initial Multi-Agent System (MAS) architecture
- Eliza agent framework integration
- Mantle Network integration
  - Wallet management
  - Token transfers
  - DEX operations (Merchant Moe)
  - Lending operations (Lendle, Init Capital)
  - Yield farming (Pendle)
- Basic analytics for Mantle Network
- Landing page with feature highlights
- Web application with chat interface
- Agent-based interaction system
- Basic documentation

### Known Limitations
- Mantle-only focus
- Limited agent coordination
- No persistent chat history
- Basic web interface
- Limited mobile responsiveness
