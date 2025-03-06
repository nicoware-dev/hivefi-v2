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
- `multichain-agent.json` - Multichain protocols operations workflow
- `crosschain-agent.json` - Cross-chain operations workflow

## Coordinator Agent Architecture

![HiveFi n8n Workflow Diagram](n8n-architecture.png)


## Eliza Agent Workflow

![HiveFi Eliza Agent Workflow](eliza-agent-workflow.png)

## Workflow Setup

1. **Import Workflows**
- Open n8n web interface
- Import workflow JSON files
- Configure credentials
- Activate workflows
