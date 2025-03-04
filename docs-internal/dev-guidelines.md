# HiveFi Development Guidelines

## 1. Project Structure

### 1.1 Repository Organization

```
hivefi/
├── docs/                      # Documentation
│   ├── architecture/          # Architecture diagrams and specs
│   ├── agents/                # Agent specifications
│   └── api/                   # API documentation
├── eliza/                     # Eliza framework integration
│   ├── packages/
│   │   ├── plugin-hivefi/     # Main superplugin
│   │   └── ...                # Other Eliza packages
│   └── characters/            # Agent character files
├── n8n/                       # n8n workflows
│   ├── coordinator/           # Coordinator agent workflows
│   └── templates/             # Reusable workflow templates
├── client/                    # Web application
│   ├── public/                # Static assets
│   └── src/                   # Frontend source code
└── README.md                  # Project overview
```

### 1.2 Naming Conventions

- **Files**: Use kebab-case for filenames (e.g., `mantle-wallet.ts`)
- **Components**: Use PascalCase for React components (e.g., `AgentCard.tsx`)
- **Functions**: Use camelCase for functions (e.g., `executeSwap()`)
- **Constants**: Use UPPER_SNAKE_CASE for constants (e.g., `MAX_TRANSACTION_AMOUNT`)
- **Types/Interfaces**: Use PascalCase with descriptive names (e.g., `TransactionResponse`)

### 1.3 Import Order

Organize imports in the following order:
1. External libraries
2. Internal modules
3. Types and interfaces
4. Assets and styles

```typescript
// External libraries
import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';

// Internal modules
import { WalletProvider } from '@/providers';
import { executeTransaction } from '@/actions';

// Types and interfaces
import type { TransactionRequest, WalletConfig } from '@/types';

// Assets and styles
import '@/styles/wallet.css';
```

## 2. Plugin Development

### 2.1 Superplugin Structure

The plugin-hivefi superplugin should follow this structure:

```
plugin-hivefi/
├── src/
│   ├── index.ts                # Main entry point
│   ├── actions/                # Action implementations
│   │   ├── analytics/          # Analytics actions
│   │   ├── crosschain/         # Cross-chain actions
│   │   ├── mantle/             # Mantle-specific actions
│   │   ├── sonic/              # Sonic-specific actions
│   │   └── bitcoin/            # Bitcoin-specific actions
│   ├── providers/              # Data providers
│   │   ├── wallet/             # Wallet providers
│   │   ├── analytics/          # Analytics providers
│   │   └── market/             # Market data providers
│   ├── templates/              # Response templates
│   ├── types/                  # TypeScript type definitions
│   └── utils/                  # Utility functions
├── package.json
└── tsconfig.json
```

### 2.2 Action Implementation Guidelines

Each action should:

1. Be implemented in its own file
2. Have a clear, descriptive name
3. Include comprehensive JSDoc comments
4. Handle errors gracefully
5. Return standardized responses
6. Include logging for debugging

Example action structure:

```typescript
/**
 * Executes a token swap on Merchant Moe DEX
 * @param fromToken - The token to swap from
 * @param toToken - The token to swap to
 * @param amount - The amount to swap
 * @param slippage - Maximum allowed slippage (default: 0.5%)
 * @returns Transaction result with status and details
 */
export const swapTokens = async (
  fromToken: string,
  toToken: string,
  amount: string,
  slippage: number = 0.5
): Promise<SwapResult> => {
  try {
    // Implementation
    return {
      success: true,
      txHash: '0x...',
      // Other details
    };
  } catch (error) {
    console.error('Error in swapTokens:', error);
    return {
      success: false,
      error: error.message || 'Unknown error occurred',
    };
  }
};
```

### 2.3 Provider Implementation Guidelines

Providers should:

1. Be implemented as classes with clear interfaces
2. Handle authentication and connection management
3. Include caching where appropriate
4. Implement retry logic for external API calls
5. Handle rate limiting gracefully

Example provider structure:

```typescript
export class CoinGeckoProvider {
  private apiKey: string;
  private cache: Map<string, CachedData>;
  private baseUrl: string = 'https://api.coingecko.com/api/v3';
  
  constructor(apiKey: string) {
    this.apiKey = apiKey;
    this.cache = new Map();
  }
  
  async getTokenPrice(tokenId: string): Promise<TokenPrice> {
    // Check cache first
    // Make API call if needed
    // Update cache
    // Return result
  }
  
  // Other methods
}
```

## 3. Agent Development

### 3.1 Character File Structure

Each agent's character file should include:

1. Clear role and objectives
2. Detailed system prompt
3. Knowledge base references
4. Plugin configurations
5. Client configurations (if applicable)

Example character file structure:

```json
{
  "name": "Demo Agent",
  "description": "Demonstrates HiveFi capabilities",
  "systemPrompt": "You are the Demo Agent for HiveFi, a multichain DeFi platform...",
  "plugins": ["@elizaos/plugin-hivefi"],
  "clients": ["discord", "telegram"],
  "knowledgeBase": ["kb/defi-basics.md", "kb/hivefi-features.md"],
  "config": {
    "readOnlyMode": true,
    "maxTransactionAmount": "0.1"
  }
}
```

### 3.2 Knowledge Base Guidelines

Knowledge base documents should:

1. Be organized by topic
2. Use Markdown format
3. Include clear headings and structure
4. Be regularly updated
5. Include references where appropriate

### 3.3 Agent Interaction Patterns

When designing agent interactions:

1. Define clear boundaries between agent responsibilities
2. Establish standard message formats for inter-agent communication
3. Implement fallback mechanisms when an agent is unavailable
4. Document expected interaction flows
5. Test agent interactions thoroughly

## 4. Web Application Development

### 4.1 Component Structure

Follow these guidelines for React components:

1. Use functional components with hooks
2. Implement proper TypeScript typing
3. Separate UI from business logic
4. Create reusable components for common UI elements
5. Implement proper error boundaries

Example component structure:

```tsx
import React, { useState, useEffect } from 'react';
import { Button, Card } from '@/components/ui';
import { useWallet } from '@/hooks';
import type { AgentProps } from '@/types';

export const AgentCard: React.FC<AgentProps> = ({ agent, onSelect }) => {
  const [isLoading, setIsLoading] = useState(false);
  const { wallet } = useWallet();
  
  // Component logic
  
  return (
    <Card>
      <h3>{agent.name}</h3>
      {/* Component UI */}
      <Button onClick={() => onSelect(agent.id)} disabled={isLoading}>
        {isLoading ? 'Loading...' : 'Select Agent'}
      </Button>
    </Card>
  );
};
```

### 4.2 State Management

For state management:

1. Use React Context for global state
2. Use useState for component-level state
3. Consider Zustand for more complex state requirements
4. Implement proper loading and error states
5. Use TypeScript for type safety

### 4.3 API Integration

When integrating with APIs:

1. Create dedicated service files for API calls
2. Implement proper error handling
3. Use TypeScript interfaces for request/response types
4. Add retry logic for unreliable APIs
5. Implement caching where appropriate

## 5. Blockchain Integration

### 5.1 Wallet Connection

For wallet connections:

1. Support multiple wallet providers (MetaMask, WalletConnect, etc.)
2. Implement proper error handling for connection failures
3. Store connection state securely
4. Handle network switching gracefully
5. Implement proper disconnection handling

### 5.2 Transaction Handling

When implementing transactions:

1. Always estimate gas before sending transactions
2. Implement proper error handling
3. Show clear transaction status to users
4. Provide transaction history
5. Implement transaction signing confirmation

### 5.3 Cross-Chain Operations

For cross-chain operations:

1. Clearly communicate the steps involved
2. Show estimated completion time
3. Provide status updates throughout the process
4. Implement proper error recovery
5. Store transaction state for recovery

## 6. Testing Guidelines

### 6.1 Unit Testing

For unit tests:

1. Test each action and provider individually
2. Mock external dependencies
3. Test success and failure cases
4. Verify correct error handling
5. Use descriptive test names

### 6.2 Integration Testing

For integration tests:

1. Test interactions between components
2. Test agent communication patterns
3. Test blockchain interactions on testnets
4. Verify end-to-end workflows
5. Test with realistic data

## 7. Documentation Guidelines

### 7.1 Code Documentation

For code documentation:

1. Use JSDoc comments for functions and classes
2. Document parameters and return types
3. Include examples where helpful
4. Document known limitations
5. Keep documentation up-to-date with code changes

### 7.2 User Documentation

For user documentation:

1. Provide clear getting started guides
2. Include screenshots and examples
3. Document all features
4. Provide troubleshooting guides
5. Keep documentation user-friendly

## 8. Deployment Guidelines

### 8.1 Environment Configuration

For environment configuration:

1. Use environment variables for sensitive information
2. Document required environment variables
3. Provide example configuration files
4. Implement validation for required variables
5. Use different configurations for development and production

### 8.2 Build Process

For the build process:

1. Implement proper build scripts
2. Optimize builds for production
3. Include version information in builds
4. Implement proper error handling during builds
5. Document the build process

## 9. Collaboration Guidelines

### 9.1 Git Workflow

Follow these Git practices:

1. Use feature branches for development
2. Write clear, descriptive commit messages
3. Create detailed pull requests
4. Perform code reviews
5. Keep branches up-to-date with main

### 9.2 Communication

For team communication:

1. Document decisions and discussions
2. Keep track of open issues and tasks
3. Provide regular progress updates
4. Discuss blockers and challenges
5. Share knowledge and learnings

## 10. Security Guidelines

### 10.1 Code Security

For code security:

1. Never commit sensitive information (API keys, private keys)
2. Implement proper input validation
3. Use secure dependencies
4. Regularly update dependencies
5. Follow security best practices

### 10.2 Blockchain Security

For blockchain security:

1. Implement transaction confirmation
2. Validate addresses before transactions
3. Implement spending limits
4. Provide clear transaction details
5. Follow blockchain security best practices
