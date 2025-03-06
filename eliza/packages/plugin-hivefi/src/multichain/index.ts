import { portfolioActions } from './portfolio';
import { MultichainWalletProvider } from './providers/wallet-provider';
import { createCoreActions } from './actions';
// Import providers
import multichainProviders from './providers';
// We'll import these once they're implemented
// import { uniswapActions } from './uniswap';
// import { aaveActions } from './aave';
// import { beefyActions } from './beefy';

/**
 * Export all multichain actions
 */
export const multichainActions = [...portfolioActions];

/**
 * Export multichain providers
 */
export { multichainProviders };

export { MultichainWalletProvider };
