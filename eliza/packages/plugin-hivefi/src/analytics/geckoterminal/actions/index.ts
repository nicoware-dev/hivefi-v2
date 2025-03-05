import { trendingPoolsAction } from './trending-pools';
import { poolInfoAction } from './pool-info';
import { topPoolsAction } from './top-pools';
import { tokenInfoAction } from './token-info';
import { poolTradesAction } from './pool-trades';
import { poolOhlcvAction } from './pool-ohlcv';

// Export all actions as an array
export const actions = [
  trendingPoolsAction,
  poolInfoAction,
  topPoolsAction,
  tokenInfoAction
];

// Export individual actions
export {
  trendingPoolsAction,
  poolInfoAction,
  topPoolsAction,
  tokenInfoAction
};

export default actions; 