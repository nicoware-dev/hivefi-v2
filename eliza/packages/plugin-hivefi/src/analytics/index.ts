import { actions as defiLlamaActions } from './defillama';
import { actions as coinGeckoActions } from './coingecko';

// Export all analytics actions
export const analyticsActions = [
  ...defiLlamaActions,
  ...coinGeckoActions
];

// Export individual modules with namespaces
export * as defillama from './defillama';
export * as coingecko from './coingecko';

export default analyticsActions;
