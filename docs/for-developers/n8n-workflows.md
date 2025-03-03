# HiveFi n8n Workflows Guide

Learn how to create, manage, and optimize n8n workflows for HiveFi agents.

## Table of Contents
- [Introduction](#introduction)
- [Getting Started](#getting-started)
- [Workflow Basics](#workflow-basics)
- [Agent Integration](#agent-integration)
- [Advanced Features](#advanced-features)
- [Best Practices](#best-practices)
- [Examples](#examples)

## Introduction

n8n is the workflow automation platform that powers HiveFi's agent coordination and automation capabilities. This guide will help you create efficient and reliable workflows for your HiveFi agents.

### Key Concepts

- **Workflows**: Automated sequences of operations
- **Nodes**: Individual operations within workflows
- **Triggers**: Events that start workflow execution
- **Credentials**: Secure access to external services
- **Expression Mode**: Dynamic data manipulation

## Getting Started

### Prerequisites

1. Install n8n
```bash
npm install n8n -g
```

2. Start n8n
```bash
n8n start
```

3. Access the n8n Editor
- Open `http://localhost:5678`
- Default credentials: `admin@example.com` / `password`

### Initial Setup

1. Configure HiveFi Credentials
```json
{
  "name": "HiveFi API",
  "apiKey": "your-api-key",
  "baseUrl": "https://api.hivefi.ai"
}
```

2. Install Required Nodes
- HiveFi Custom Nodes
- Blockchain Integration Nodes
- API Nodes

## Workflow Basics

### Creating a New Workflow

1. Click "New Workflow"
2. Set workflow name and description
3. Add trigger node (e.g., Webhook, Schedule)
4. Add processing nodes
5. Add output nodes
6. Save and activate

### Essential Nodes

```typescript
// Webhook Trigger
{
  "name": "Webhook",
  "type": "n8n-nodes-base.webhook",
  "parameters": {
    "path": "agent-trigger",
    "responseMode": "lastNode"
  }
}

// HTTP Request
{
  "name": "API Call",
  "type": "n8n-nodes-base.httpRequest",
  "parameters": {
    "url": "={{$node.webhook.json.apiUrl}}",
    "method": "POST",
    "authentication": "genericCredentialType"
  }
}

// Function
{
  "name": "Transform",
  "type": "n8n-nodes-base.function",
  "parameters": {
    "functionCode": "return items.map(item => ({
      json: {
        ...item.json,
        processed: true
      }
    }));"
  }
}
```

## Agent Integration

### Connecting to Agents

```typescript
// Agent Connection Node
{
  "name": "HiveFi Agent",
  "type": "n8n-nodes-base.hiveFiAgent",
  "parameters": {
    "agentId": "demo-agent",
    "operation": "execute",
    "input": {
      "action": "getPortfolio",
      "parameters": {
        "address": "={{$node.webhook.json.address}}"
      }
    }
  }
}
```

### Data Flow

1. **Input Processing**
```typescript
// Validate and transform input
function processInput(items) {
  return items.map(item => ({
    json: {
      validated: true,
      data: item.json.data
    }
  }));
}
```

2. **Agent Communication**
```typescript
// Send data to agent
{
  "name": "Agent Action",
  "type": "n8n-nodes-base.hiveFiAgent",
  "parameters": {
    "operation": "sendMessage",
    "message": "={{$json.processedData}}"
  }
}
```

3. **Response Handling**
```typescript
// Process agent response
function handleResponse(items) {
  return items.map(item => ({
    json: {
      success: true,
      result: item.json.agentResponse
    }
  }));
}
```

## Advanced Features

### Error Handling

```typescript
// Error Handler Node
{
  "name": "Error Handler",
  "type": "n8n-nodes-base.errorTrigger",
  "parameters": {
    "conditions": {
      "boolean": [
        {
          "value1": "={{$node.HiveFiAgent.json.success}}",
          "value2": false
        }
      ]
    }
  }
}
```

### Conditional Execution

```typescript
// Switch Node
{
  "name": "Route",
  "type": "n8n-nodes-base.switch",
  "parameters": {
    "conditions": [
      {
        "value1": "={{$json.type}}",
        "value2": "trade"
      },
      {
        "value1": "={{$json.type}}",
        "value2": "analysis"
      }
    ]
  }
}
```

### Parallel Processing

```typescript
// Parallel Execution
{
  "name": "Split",
  "type": "n8n-nodes-base.split",
  "parameters": {
    "batchSize": 5
  }
}
```

## Best Practices

### Performance Optimization

1. **Batch Processing**
```typescript
// Batch Node
{
  "name": "Batch",
  "type": "n8n-nodes-base.batch",
  "parameters": {
    "batchSize": 10,
    "batchInterval": 1000
  }
}
```

2. **Caching**
```typescript
// Cache results
function cacheResults(items) {
  const cache = new Map();
  return items.map(item => {
    const cacheKey = item.json.key;
    if (!cache.has(cacheKey)) {
      cache.set(cacheKey, item.json.value);
    }
    return {
      json: {
        ...item.json,
        cached: cache.get(cacheKey)
      }
    };
  });
}
```

### Security

1. **Input Validation**
```typescript
// Validate input
function validateInput(items) {
  return items.map(item => {
    if (!item.json.address || !ethers.utils.isAddress(item.json.address)) {
      throw new Error('Invalid Ethereum address');
    }
    return item;
  });
}
```

2. **Rate Limiting**
```typescript
// Rate Limit Node
{
  "name": "RateLimit",
  "type": "n8n-nodes-base.rateLimit",
  "parameters": {
    "maxRequests": 10,
    "timeWindow": 60
  }
}
```

## Examples

### Portfolio Management Workflow

```typescript
// 1. Webhook Trigger
{
  "name": "Portfolio Trigger",
  "type": "n8n-nodes-base.webhook",
  "parameters": {
    "path": "portfolio-update"
  }
}

// 2. Get Portfolio Data
{
  "name": "Get Portfolio",
  "type": "n8n-nodes-base.hiveFiAgent",
  "parameters": {
    "operation": "getPortfolio"
  }
}

// 3. Process Data
{
  "name": "Process Portfolio",
  "type": "n8n-nodes-base.function",
  "parameters": {
    "functionCode": `
      return items.map(item => ({
        json: {
          totalValue: item.json.assets.reduce((sum, asset) => sum + asset.value, 0),
          assets: item.json.assets.sort((a, b) => b.value - a.value)
        }
      }));
    `
  }
}

// 4. Send Updates
{
  "name": "Notify",
  "type": "n8n-nodes-base.hiveFiAgent",
  "parameters": {
    "operation": "notify",
    "message": "={{$json.summary}}"
  }
}
```

### Trading Workflow

```typescript
// 1. Market Data Trigger
{
  "name": "Market Update",
  "type": "n8n-nodes-base.webhook",
  "parameters": {
    "path": "market-update"
  }
}

// 2. Analysis
{
  "name": "Analyze",
  "type": "n8n-nodes-base.hiveFiAgent",
  "parameters": {
    "operation": "analyze",
    "data": "={{$json}}"
  }
}

// 3. Trade Decision
{
  "name": "Decide",
  "type": "n8n-nodes-base.switch",
  "parameters": {
    "conditions": [
      {
        "value1": "={{$json.signal}}",
        "value2": "buy"
      },
      {
        "value1": "={{$json.signal}}",
        "value2": "sell"
      }
    ]
  }
}

// 4. Execute Trade
{
  "name": "Trade",
  "type": "n8n-nodes-base.hiveFiAgent",
  "parameters": {
    "operation": "executeTrade",
    "trade": "={{$json.tradeDetails}}"
  }
}
```

## Troubleshooting

### Common Issues

1. **Workflow Not Triggering**
- Check webhook URL and authentication
- Verify trigger node configuration
- Check n8n logs for errors

2. **Data Processing Errors**
- Validate input data format
- Check node connections
- Review function node code

3. **Agent Communication Issues**
- Verify agent credentials
- Check network connectivity
- Review API endpoint configuration

### Debugging Tips

1. **Use Debug Node**
```typescript
{
  "name": "Debug",
  "type": "n8n-nodes-base.debug",
  "parameters": {
    "keepOnlyProperties": [
      "data",
      "error"
    ]
  }
}
```

2. **Enable Verbose Logging**
```bash
n8n start --verbose
```

## Next Steps

1. Explore the [Plugin Development Guide](plugin-guide.md)
2. Join our [Discord](https://discord.gg/hivefiai) #workflow-sharing channel
3. Contribute to our [Workflow Templates](https://github.com/hivefi/workflow-templates)
4. Check out [Self-Hosting Guide](self-hosting.md) for production deployment
