import { transferAction } from './transfer';
import { redeemAction } from './redeem';
import { circleTransferAction } from './circleTransfer';
import { circleRedeemAction } from './circleRedeem';

/**
 * Export all Wormhole actions
 */
const actions = [
  transferAction,
  redeemAction,
  circleTransferAction,
  circleRedeemAction
];

export default actions; 