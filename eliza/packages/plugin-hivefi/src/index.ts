import type { Plugin } from "@elizaos/core";
import { coinGeckoProvider } from "./mantle/providers/coingecko";
import { defiLlamaProvider } from "./mantle/providers/defillama";
import { walletProvider } from "./mantle/providers/wallet";
import { transfer } from "./mantle/actions/transfer";
import { erc20Transfer } from "./mantle/actions/erc20Transfer";
import { portfolio } from "./mantle/actions/portfolio";
import { swap } from "./mantle/actions/swap";
import { deposit } from "./mantle/actions/lending/deposit";
import { withdraw } from "./mantle/actions/lending/withdraw";
import { borrow } from "./mantle/actions/lending/borrow";
import { repay } from "./mantle/actions/lending/repay";

export const hivefiPlugin: Plugin = {
    name: "hivefi",
    description: "HiveFi Plugin for Eliza - Multichain DeFAI Agent Swarm",
    actions: [
        transfer,
        erc20Transfer,
        portfolio,
        swap,
        deposit,
        withdraw,
        borrow,
        repay
    ],
    evaluators: [],
    providers: [
        coinGeckoProvider,
        defiLlamaProvider,
        walletProvider
    ]
};

export default hivefiPlugin;

