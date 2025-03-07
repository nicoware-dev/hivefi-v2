# HiveFi Plugin Development Guide

Learn how to extend HiveFi's capabilities by developing custom plugins using our superplugin architecture.

## Table of Contents
- [Plugin Architecture](#plugin-architecture)
- [Creating a Plugin](#creating-a-plugin)
- [Actions and Providers](#actions-and-providers)
- [Testing and Validation](#testing-and-validation)
- [Publishing and Distribution](#publishing-and-distribution)

## Plugin Architecture

### Overview

The HiveFi superplugin architecture is designed for:
- Modularity and extensibility
- Clear separation of concerns
- Type safety and validation
- Easy testing and maintenance
- Performance optimization

### Structure
```
plugin-example/
├── src/
│   ├── index.ts              # Plugin entry point
│   ├── actions/              # Custom actions
│   │   ├── index.ts          # Action exports
│   │   └── my-action.ts      # Action implementation
│   ├── providers/            # Data providers
│   │   ├── index.ts          # Provider exports
│   │   └── my-provider.ts    # Provider implementation
│   ├── types/                # TypeScript definitions
│   └── utils/                # Utility functions
├── tests/                    # Test files
├── package.json
└── tsconfig.json
```

## Creating a Plugin

### 1. Initialize Plugin

```bash
# Create plugin directory
mkdir plugin-example
cd plugin-example

# Initialize package
pnpm init
pnpm add -D typescript @types/node

# Add HiveFi dependencies
pnpm add @elizaos/core @hivefi/types
```

### 2. Configure TypeScript

```json
// tsconfig.json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "CommonJS",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "outDir": "./dist",
    "declaration": true
  },
  "include": ["src"],
  "exclude": ["node_modules", "dist", "tests"]
}
```

### 3. Create Plugin Entry Point

```typescript
// src/index.ts
import { createPlugin } from '@elizaos/core';
import { actions } from './actions';
import { providers } from './providers';

export default createPlugin({
  name: 'plugin-example',
  version: '1.0.0',
  actions,
  providers
});
```

## Actions and Providers

### Creating Actions

```typescript
// src/actions/my-action.ts
import { createAction } from '@elizaos/core';
import type { ActionResult } from '@hivefi/types';

interface MyActionParams {
  param1: string;
  param2: number;
}

export const myAction = createAction({
  name: 'myAction',
  description: 'Example custom action',
  parameters: {
    param1: { type: 'string', description: 'First parameter' },
    param2: { type: 'number', description: 'Second parameter' }
  },
  execute: async (params: MyActionParams): Promise<ActionResult> => {
    try {
      // Implementation
      return {
        success: true,
        data: {
          // Action result
        }
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }
});
```

### Creating Providers

```typescript
// src/providers/my-provider.ts
import { createProvider } from '@elizaos/core';

export class MyProvider {
  private config: any;

  constructor(config: any) {
    this.config = config;
  }

  async getData(): Promise<any> {
    // Implementation
  }

  async initialize(): Promise<void> {
    // Setup code
  }

  async cleanup(): Promise<void> {
    // Cleanup code
  }
}

export const myProvider = createProvider({
  name: 'myProvider',
  provider: MyProvider
});
```

## Testing and Validation

### Unit Tests

```typescript
// tests/my-action.test.ts
import { myAction } from '../src/actions/my-action';

describe('MyAction', () => {
  it('should execute successfully', async () => {
    const result = await myAction.execute({
      param1: 'test',
      param2: 42
    });
    
    expect(result.success).toBe(true);
    // Add more assertions
  });

  it('should handle errors', async () => {
    const result = await myAction.execute({
      param1: 'invalid',
      param2: -1
    });
    
    expect(result.success).toBe(false);
    expect(result.error).toBeDefined();
  });
});
```

### Integration Tests

```typescript
// tests/integration/plugin.test.ts
import { ElizaOS } from '@elizaos/core';
import myPlugin from '../src';

describe('Plugin Integration', () => {
  let eliza: ElizaOS;

  beforeAll(async () => {
    eliza = await ElizaOS.create();
    await eliza.loadPlugin(myPlugin);
  });

  it('should integrate with ElizaOS', async () => {
    const result = await eliza.execute('myAction', {
      param1: 'test',
      param2: 42
    });
    
    expect(result.success).toBe(true);
  });
});
```

## Publishing and Distribution

### 1. Prepare Package

```json
// package.json
{
  "name": "plugin-example",
  "version": "1.0.0",
  "main": "dist/index.js",
  "types": "dist/index.d.ts",
  "files": [
    "dist"
  ],
  "scripts": {
    "build": "tsc",
    "test": "jest",
    "prepublishOnly": "pnpm build"
  }
}
```

### 2. Build and Test

```bash
# Build package
pnpm build

# Run tests
pnpm test

# Pack locally
pnpm pack
```

### 3. Publish

```bash
# Publish to npm
pnpm publish

# Or publish to GitHub Packages
pnpm publish --registry=https://npm.pkg.github.com
```

## Best Practices

### Code Quality
- Use TypeScript strictly
- Write comprehensive tests
- Document all public APIs
- Follow consistent coding style
- Handle errors gracefully

### Performance
- Implement caching where appropriate
- Optimize API calls
- Use connection pooling
- Monitor resource usage
- Profile critical paths

### Security
- Validate all inputs
- Sanitize outputs
- Handle secrets securely
- Implement rate limiting
- Follow security guidelines

## Examples

### DeFi Integration

```typescript
// Example DeFi protocol integration
import { createAction } from '@elizaos/core';
import { ethers } from 'ethers';

export const swapTokens = createAction({
  name: 'swapTokens',
  description: 'Swap tokens on DEX',
  parameters: {
    fromToken: { type: 'string' },
    toToken: { type: 'string' },
    amount: { type: 'string' }
  },
  execute: async ({ fromToken, toToken, amount }) => {
    try {
      // Implementation
      const tx = await dex.swap(fromToken, toToken, amount);
      await tx.wait();
      
      return {
        success: true,
        data: {
          txHash: tx.hash
        }
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }
});
```

### Data Provider

```typescript
// Example data provider
import { createProvider } from '@elizaos/core';

export class PriceProvider {
  private api: any;
  private cache: Map<string, any>;

  constructor(config: any) {
    this.api = new API(config);
    this.cache = new Map();
  }

  async getPrice(token: string): Promise<number> {
    if (this.cache.has(token)) {
      return this.cache.get(token);
    }

    const price = await this.api.getPrice(token);
    this.cache.set(token, price);
    return price;
  }
}

export const priceProvider = createProvider({
  name: 'priceProvider',
  provider: PriceProvider
});
```

## Troubleshooting

### Common Issues

1. **Type Errors**
   ```typescript
   // Fix type issues
   import { ActionResult } from '@hivefi/types';
   
   interface Params {
     // Define parameter types
   }
   ```

2. **Runtime Errors**
   ```typescript
   // Implement error handling
   try {
     // Operation
   } catch (error) {
     console.error('Operation failed:', error);
     throw new Error('Friendly error message');
   }
   ```

3. **Integration Issues**
   ```typescript
   // Debug plugin loading
   const plugin = createPlugin({
     debug: true,
     // Other options
   });
   ```

### Getting Help

- Check our [GitHub Issues](https://github.com/hivefi/hivefi/issues)
- Join our [Discord](https://discord.gg/hivefiai) #plugin-dev channel
- Contact our developer support team

## Next Steps

1. Explore our [example plugins](https://github.com/hivefi/plugin-examples)
2. Join the plugin developer community
3. Share your plugins with others
4. Contribute to the core platform

Need more help? Check out our [n8n Workflows Guide](n8n-workflows.md) for automation examples!
