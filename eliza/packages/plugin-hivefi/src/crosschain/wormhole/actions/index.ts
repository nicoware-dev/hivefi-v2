import { transferAction } from './transfer';
import { redeemAction } from './redeem';

/**
 * Export all Wormhole actions
 */
const actions = [
  transferAction,
  redeemAction
];

export default actions; 