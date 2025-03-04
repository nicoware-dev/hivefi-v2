# HiveFi Architecture Documentation

## 1. System Architecture Overview

### 1.1 High-Level Architecture

```
┌─────────────── Application Layer ───────────────┐
│                                                 │
│  ┌─── Web App ───┐  ┌─── External Clients ───┐ │
│  │ React/Vite    │  │ Discord | Telegram      │ │
│  │ TailwindCSS   │  │ Twitter | API          │ │
│  └──────┬────────┘  └──────────┬─────────────┘ │
│         │                      │               │
└─────────┼──────────────────────┼───────────────┘
          │                      │
┌─────────┼──────────────────────┼───────────────┐
│         │                      │               │
│  ┌─────────── Agent Layer ────────────┐       │
│  │                                    │       │
│  │  ┌─────────┐  ┌────────┐  ┌─────┐ │       │
│  │  │Internal │  │Public  │  │Priv.│ │       │
│  │  │ Agents  │  │Agents  │  │Agent│ │       │
│  │  └────┬────┘  └───┬────┘  └──┬──┘ │       │
│  │       │           │          │    │       │
│  └───────┼───────────┼──────────┼────┘       │
│          │           │          │            │
│  ┌───────┼───────────┼──────────┼────┐       │
│  │       │   Superplugin Layer  │    │       │
│  │  ┌────┴─────┬────┴─────┬────┴───┐ │       │
│  │  │Analytics │Blockchain│ Chain  │ │       │
│  │  │ Module   │ Module   │Modules │ │       │
│  │  └──────────┴──────────┴────────┘ │       │
│  └────────────────────────────────────┘       │
│                                              │
└──────────────────────────────────────────────┘
          │           │          │
┌─────────┼───────────┼──────────┼───────────────┐
│    ┌────┴─────┬─────┴────┬────┴─────┐         │
│    │  Mantle  │  Sonic   │MultiChain│         │
│    └──────────┴──────────┴──────────┘         │
│           Blockchain Layer                     │
└──────────────────────────────────────────────────┘
```

### 1.2 Core Components

1. **Application Layer**
   - Web Application (React/Vite)
   - External Client Integrations
   - API Gateway
   - Authentication & Authorization

2. **Agent Layer**
   - Agent Orchestration
   - Message Routing
   - State Management
   - Task Distribution

3. **Superplugin Layer**
   - Plugin Management
   - Action Registry
   - Provider Integration
   - Cross-Chain Operations

4. **Blockchain Layer**
   - Network Connections
   - Transaction Management
   - State Synchronization
   - Bridge Operations

## 2. Agent Architectures

### 2.1 Internal Agents Architecture

```
┌─────────── Internal Agent System ──────────┐
│                                            │
│  ┌─────────── Demo Agent ──────────────┐   │
│  │ ┌─────────┐  ┌────────┐  ┌────────┐ │   │
│  │ │Interface│  │Action  │  │Response│ │   │
│  │ │  Layer  │──│Executor│──│Handler │ │   │
│  │ └─────────┘  └────────┘  └────────┘ │   │
│  └─────────────────────────────────────┘   │
│                                            │
│  ┌─────────── Meme Agent ───────────┐      │
│  │ ┌─────────┐  ┌────────┐  ┌─────┐ │      │
│  │ │Content  │  │Social  │  │Media│ │      │
│  │ │Generator│──│Manager │──│Store│ │      │
│  │ └─────────┘  └────────┘  └─────┘ │      │
│  └──────────────────────────────────┘      │
│                                            │
│  ┌─────────── Sales Agent ─────────┐       │
│  │ ┌─────────┐  ┌────────┐  ┌────┐ │       │
│  │ │Customer │  │Workflow│  │CRM │ │       │
│  │ │Interface│──│Engine  │──│API │ │       │
│  │ └─────────┘  └────────┘  └────┘ │       │
│  └─────────────────────────────────┘       │
│                                            │
└────────────────────────────────────────────┘
                                      
```

### 2.2 Public Agents Architecture

```
┌─────────── Public Agent System ────────────┐
│                                            │
│  ┌─────── Alpha & Predictions ──────────┐  │
│  │ ┌─────────┐  ┌────────┐  ┌─────────┐ │  │
│  │ │Market   │  │Analysis│  │Signal   │ │  │
│  │ │Data Feed│──│Engine  │──│Generator│ │  │
│  │ └─────────┘  └────────┘  └─────────┘ │  │
│  └──────────────────────────────────────┘  │
│                                            │
│  ┌─────── Token & NFT Deploy ───────┐      │
│  │ ┌─────────┐  ┌────────┐  ┌─────┐ │      │
│  │ │Contract │  │Deploy  │  │Asset│ │      │
│  │ │Generator│──│Manager │──│Store│ │      │
│  └──────────────────────────────────┘      │
│                                            │
│  ┌────── Web3 Advisor & KOL ───────┐       │
│  │ ┌─────────┐  ┌────────┐  ┌────┐ │       │
│  │ │Knowledge│  │Response│  │Feed│ │       │
│  │ │Engine   │──│Builder │──│API │ │     │
│  │ └─────────┘  └────────┘  └────┘ │    │
│  └─────────────────────────────────┘       │
│                                            │
└────────────────────────────────────────────┘
                                      
```

### 2.3 Private Agents Architecture

```
┌─────────── Private Agent System ───────────┐
│                                           │
│  ┌─────── Coordinator Agent ────────────┐  │
│  │ ┌─────────┐  ┌────────┐  ┌────────┐ │  │
│  │ │Task     │  │Workflow│  │Agent   │ │  │
│  │ │Router   │──│Engine  │──│Manager │ │  │
│  │ └─────────┘  └────────┘  └────────┘ │  │
│  └───────────────────────────────────┬──┘  │
│                                      │     │
│  ┌─────── Chain Agents ─────────────┐│    │
│  │ ┌─────────┐  ┌────────┐  ┌─────┐ ││    │
│  │ │Network  │  │TX      │  │State │ ││    │
│  │ │Interface│──│Manager │──│Sync  │ ││    │
│  │ └─────────┘  └────────┘  └─────┘ ││    │
│  └──────────────────────────────────┬┘│    │
│                                     │ │    │
│  ┌─────── Analytics & Bridge ──────┐│ │    │
│  │ ┌─────────┐  ┌────────┐  ┌────┐ ││ │    │
│  │ │Data     │  │Bridge  │  │Risk │ ││ │    │
│  │ │Analyzer │──│Manager │──│Eval │ ││ │    │
│  │ └─────────┘  └────────┘  └────┘ ││ │    │
│  └─────────────────────────────────┘│ │    │
│                                     │ │    │
└─────────────────────────────────────┼─┼────┘

```

## 3. Component Interactions

### 3.1 Data Flow

```
┌─── User Request ───┐
│                   │
│  Request ──┐      │
│            ↓      │
│    ┌──────────┐   │
│    │API Gateway│   │
│    └─────┬────┘   │
│          ↓        │
└──────────┼────────┘
           ↓
┌──── Agent Layer ───┐
│    ┌──────────┐   │
│    │Agent     │   │
│    │Selection │   │
│    └─────┬────┘   │
│          ↓        │
│    ┌──────────┐   │
│    │Task      │   │
│    │Processing│   │
│    └─────┬────┘   │
│          ↓        │
└──────────┼────────┘
           ↓
┌── Superplugin ────┐
│    ┌──────────┐   │
│    │Action    │   │
│    │Execution │   │
│    └─────┬────┘   │
│          ↓        │
└──────────┼────────┘
           ↓
┌── Blockchain ─────┐
│    ┌──────────┐   │
│    │Network   │   │
│    │Operation │   │
│    └─────┬────┘   │
│          ↓        │
└──────────┼────────┘
           ↓
┌─── Response ──────┐
│    ┌──────────┐   │
│    │Result    │   │
│    │Processing│   │
│    └─────┬────┘   │
│          ↓        │
│      Response     │
└───────────────────┘
```
