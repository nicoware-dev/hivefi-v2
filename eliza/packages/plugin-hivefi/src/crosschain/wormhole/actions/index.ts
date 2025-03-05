import { transferAction } from './transfer';
import { redeemAction } from './redeem';
import { statusAction } from './status';

/**
 * Export all Wormhole actions
 */
const actions = [
  transferAction,
  redeemAction,
  statusAction
];

export default actions; 