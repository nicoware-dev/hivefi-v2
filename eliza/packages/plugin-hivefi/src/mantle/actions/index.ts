import { transfer } from "./transfer";
import { erc20Transfer } from "./erc20Transfer";
import { portfolio } from "./portfolio";
import { swap } from "./merchant-moe/swap";
import { deposit } from "./lendle/deposit";
import { withdraw } from "./lendle/withdraw";
import { borrow } from "./lendle/borrow";
import { repay } from "./lendle/repay";
import { stake } from "./meth/stake";
import { unstake } from "./meth/unstake";

// Export all Mantle actions as a group
export const MantleActions = [
    transfer,
    erc20Transfer,
    portfolio,
    swap,
    deposit,
    withdraw,
    borrow,
    repay,
    stake,
    unstake
];

// Export individual actions for direct imports if needed
export {
    transfer,
    erc20Transfer,
    portfolio,
    swap,
    deposit,
    withdraw,
    borrow,
    repay,
    stake,
    unstake
};

