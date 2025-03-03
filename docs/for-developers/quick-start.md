# Developer Quick Start Guide

Get up and running with HiveFi development in minutes! This guide will help you set up your development environment and start building with our platform.

## Prerequisites

### Required Software
- Node.js v23+
- pnpm
- Git
- n8n (for workflow automation)
- Visual Studio Code (recommended)

### API Keys
- OpenAI API key or Anthropic API key
- Blockchain node provider keys (Infura, Alchemy, etc.)
- CoinGecko API key (optional)
- DefiLlama API key (optional)

## Installation

```bash
# Clone the repository
git clone https://github.com/hivefi/hivefi
cd hivefi

# Install dependencies
pnpm install

# Copy environment file
cp .env.example .env

# Configure your environment variables
nano .env
```

## Environment Setup

Configure your `.env` file with the following:

```env
# Required API Keys
OPENAI_API_KEY=your_openai_key
ANTHROPIC_API_KEY=your_anthropic_key

# Blockchain Providers
MANTLE_RPC_URL=your_mantle_rpc_url
SONIC_RPC_URL=your_sonic_rpc_url
BTC_RPC_URL=your_btc_rpc_url

# Optional API Keys
COINGECKO_API_KEY=your_coingecko_key
DEFILLAMA_API_KEY=your_defillama_key

# Development Settings
NODE_ENV=development
DEBUG=true
```

## Project Structure

```
hivefi/
├── eliza/                     # Eliza framework
│   ├── packages/
│   │   └── plugin-hivefi/     # Main plugin
│   └── client/               # Web interface
├── n8n/                      # Workflow automation
└── docs/                     # Documentation
```

## First Steps

### 1. Start the Development Server

```bash
# Start the web client
cd eliza/client
pnpm dev

# In another terminal, start the agent
cd eliza
pnpm start --characters="characters/demo-agent.character.json"
```

### 2. Create Your First Agent

```typescript
// agents/my-agent.character.json
{
  "name": "MyAgent",
  "description": "Custom agent example",
  "systemPrompt": "You are a specialized DeFi agent...",
  "plugins": ["@elizaos/plugin-hivefi"],
  "config": {
    "maxTransactionAmount": "0.1"
  }
}
```

### 3. Implement a Custom Action

```typescript
// plugin-hivefi/src/actions/custom/my-action.ts
export const myAction = async (params: MyActionParams): Promise<ActionResult> => {
  try {
    // Implementation
    return {
      success: true,
      data: {}
    };
  } catch (error) {
    return {
      success: false,
      error: error.message
    };
  }
};
```

## Basic Examples

### Agent Interaction
```typescript
// Example agent interaction
const agent = await ElizaOS.createAgent('my-agent.character.json');
const response = await agent.execute('Show my portfolio');
console.log(response);
```

### Custom Plugin Action
```typescript
// Example custom action
import { createAction } from '@elizaos/core';

export const myCustomAction = createAction({
  name: 'myCustomAction',
  description: 'Custom action example',
  execute: async (params) => {
    // Implementation
  }
});
```

### Web Component
```tsx
// Example React component
import { useAgent } from '@hivefi/hooks';

export const MyComponent: React.FC = () => {
  const { agent } = useAgent();
  
  const handleAction = async () => {
    const result = await agent.execute('my command');
    // Handle result
  };

  return (
    <div>
      {/* Component JSX */}
    </div>
  );
};
```

## Common Patterns

### Error Handling
```typescript
try {
  // Attempt operation
  const result = await performAction();
  
  if (!result.success) {
    throw new Error(result.error);
  }
  
  return result.data;
} catch (error) {
  console.error('Operation failed:', error);
  // Handle error appropriately
}
```

### State Management
```typescript
import create from 'zustand';

interface State {
  loading: boolean;
  setLoading: (loading: boolean) => void;
}

export const useStore = create<State>((set) => ({
  loading: false,
  setLoading: (loading) => set({ loading })
}));
```

## Next Steps

1. Explore the [Plugin Guide](plugin-guide.md) for detailed plugin development
2. Learn about [n8n Workflows](n8n-workflows.md) for automation
3. Check out [Self-Hosting](self-hosting.md) for deployment options
4. Join our [Discord](https://discord.gg/hivefiai) developer community

## Troubleshooting

### Common Issues

1. **Connection Issues**
   ```bash
   # Check network configuration
   ping api.hivefi.ai
   # Verify environment variables
   echo $MANTLE_RPC_URL
   ```

2. **Build Errors**
   ```bash
   # Clean install
   pnpm clean
   pnpm install
   # Rebuild
   pnpm build
   ```

3. **Agent Errors**
   ```bash
   # Enable debug logging
   DEBUG=true pnpm start
   # Check agent logs
   tail -f logs/agent.log
   ```

### Getting Help

- Check our [GitHub Issues](https://github.com/hivefi/hivefi/issues)
- Join the #dev-support channel on Discord
- Review the [FAQ](../resources/faq.md)
- Contact our developer support team

## Best Practices

1. **Code Quality**
   - Follow TypeScript best practices
   - Write comprehensive tests
   - Document your code
   - Use ESLint and Prettier

2. **Security**
   - Never commit API keys
   - Validate all inputs
   - Handle errors gracefully
   - Follow security guidelines

3. **Performance**
   - Implement caching
   - Optimize API calls
   - Monitor resource usage
   - Profile your code

Ready to dive deeper? Check out our [Plugin Guide](plugin-guide.md) for detailed development documentation!
