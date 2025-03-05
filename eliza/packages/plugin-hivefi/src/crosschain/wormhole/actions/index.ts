import { transferAction } from './transfer';
import { redeemAction } from './redeem';
import { circleTransferAction } from './circleTransfer';

/**
 * Export all Wormhole actions
 */
const actions = [
  transferAction,
  redeemAction,
  circleTransferAction
];

export default actions; 