import { actions as defiLlamaActions } from './defillama';
import { actions as coinGeckoActions } from './coingecko';
import { actions as geckoTerminalActions } from './geckoterminal';

// Export all analytics actions
export const analyticsActions = [
  ...defiLlamaActions,
  ...coinGeckoActions,
  ...geckoTerminalActions
];

// Export individual modules with namespaces
export * as defillama from './defillama';
export * as coingecko from './coingecko';
export * as geckoterminal from './geckoterminal';

export default analyticsActions;
