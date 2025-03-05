import { chainTVLAction } from './chain-tvl';
import { protocolTVLAction } from './protocol-tvl';
import { multipleChainTVLAction } from './multiple-chain-tvl';
import { multipleProtocolTVLAction } from './multiple-protocol-tvl';
import { protocolTVLByChainAction } from './protocol-tvl-chain';
import { topProtocolsByChainAction } from './top-protocols-chain';
import { globalStatsAction } from './global-stats';

// Export all actions
export const actions = [
  chainTVLAction,
  protocolTVLAction,
  multipleChainTVLAction,
  multipleProtocolTVLAction,
  protocolTVLByChainAction,
  topProtocolsByChainAction,
  globalStatsAction
];

// Export individual actions
export {
  chainTVLAction,
  protocolTVLAction,
  multipleChainTVLAction,
  multipleProtocolTVLAction,
  protocolTVLByChainAction,
  topProtocolsByChainAction,
  globalStatsAction
};

export default actions; 