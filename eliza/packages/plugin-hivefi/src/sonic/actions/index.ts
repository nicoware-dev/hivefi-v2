import type { Plugin } from "@elizaos/core";
import { transfer } from "./transfer";
import { erc20Transfer } from "./erc20Transfer";
import { portfolio } from "./portfolio";
/* import { swap } from "./actions/beets-dex/swap";
 */import { swapv2 } from "./beets-dex/swapv2";
import { deposit } from "./silo-lending/deposit";
import { withdraw } from "./silo-lending/withdraw";
import { borrow } from "./silo-lending/borrow";
import { repay } from "./silo-lending/repay";
import { stake } from "./beets-lst/stake";
import { unstake } from "./beets-lst/unstake";
import { withdraw as withdrawBeetsLst } from "./beets-lst/withdraw";
import { bridge } from "./debridge/bridge";
import { claim } from "./debridge/claim";

export const actions = [
  // Native token transfers
  transfer,
  
  // ERC20 token transfers
  erc20Transfer,
  
  // Portfolio and balances
  portfolio,
  
  // Beets DEX operations
  swapv2,
  
  // Silo Finance lending operations
  deposit,
  borrow,
  repay,
  withdraw,
  
  // Beets LST operations
  stake,
  unstake,
  withdrawBeetsLst,
  
/*   // Debridge operations
  bridge,
  claim, */
];

export default actions; 