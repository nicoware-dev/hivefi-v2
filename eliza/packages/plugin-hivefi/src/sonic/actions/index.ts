import { transfer } from './transfer';
import { erc20Transfer } from './erc20Transfer';
import { portfolio } from './portfolio';
import { swap as beetsSwap } from './beets-dex/swap';
import { addLiquidity as beetsAddLiquidity } from './beets-dex/add-liquidity';
import { deposit as siloDeposit } from './silo-lending/deposit';
import { borrow as siloBorrow } from './silo-lending/borrow';
import { repay as siloRepay } from './silo-lending/repay';
import { withdraw as siloWithdraw } from './silo-lending/withdraw';

export const actions = [
  // Native token transfers
  transfer,
  
  // ERC20 token transfers
  erc20Transfer,
  
  // Portfolio and balances
  portfolio,
  
  // Beets DEX operations
  beetsSwap,
  beetsAddLiquidity,
  
  // Silo Finance lending operations
  siloDeposit,
  siloBorrow,
  siloRepay,
  siloWithdraw,
];

export default actions; 