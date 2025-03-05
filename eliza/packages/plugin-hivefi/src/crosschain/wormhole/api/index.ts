import { elizaLogger, IAgentRuntime } from '@elizaos/core';
import { TransferParams, RedeemParams } from '../types';
import { isChainSupported } from '../utils/chain';
import { isTokenSupported } from '../utils/token';

// Export utility functions
export { isChainSupported, isTokenSupported };

// Export the instance functions
export * from './instance';

// Export the token transfer functions
export * from './tokenTransfer';

// Export the token redeem functions
export * from './tokenRedeem';

const logger = elizaLogger.child({ module: 'WormholeAPI' });