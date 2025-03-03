import type { Plugin } from "@elizaos/core";
import { coinGeckoProvider } from "./mantle/providers/coingecko";
import { defiLlamaProvider } from "./mantle/providers/defillama";
import { walletProvider } from "./mantle/providers/wallet";

// Import all Mantle actions as a group
import { MantleActions } from "./mantle/actions";

export const hivefiPlugin: Plugin = {
    name: "hivefi",
    description: "HiveFi Plugin for Eliza - Multichain DeFAI Agent Swarm",
    actions: [
        ...MantleActions, // Spread all Mantle actions
        // TODO: Add Sonic actions
        // TODO: Add Bitcoin actions
    ],
    evaluators: [],
    providers: [
        coinGeckoProvider,
        defiLlamaProvider,
        walletProvider
    ]
};

export default hivefiPlugin;

