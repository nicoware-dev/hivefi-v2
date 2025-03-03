# HiveFi n8n Workflows

This directory contains n8n workflow configurations for the HiveFi Coordinator Agent, which orchestrates operations across five specialized Eliza agents. The workflows are designed to enable efficient multi-agent coordination and complex DeFi operations.

## Available Workflows

### Core Workflows
- `coordinator-agent.json` - Main coordinator workflow for agent orchestration
- `agent-tools.json` - Tool definitions for agent interactions

### Agent Integration Workflows
- `analytics-agent.json` - Analytics and reporting workflow
- `sonic-agent.json` - Sonic chain operations workflow
- `mantle-agent.json` - Mantle chain operations workflow
- `bitcoin-agent.json` - Bitcoin operations workflow
- `crosschain-agent.json` - Cross-chain operations workflow

## Coordinator Agent Architecture

```
┌─── User Request ───┐
         │
┌─── Coordinator Agent ───┐
│    Request Analysis     │
│    Task Distribution    │
│    Response Aggregation │
└──────────┬────────────┘
           │
┌──────────┼────────────┐
│          │            │
▼          ▼            ▼
Analytics  Chain       Cross-Chain
Agent     Agents        Agent
(Data)   (Execution)   (Bridges)
```

## Workflow Setup

1. **Import Workflows**
- Open n8n web interface
- Import workflow JSON files
- Configure credentials
- Activate workflows
