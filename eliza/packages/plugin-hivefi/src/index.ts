import type { Plugin } from "@elizaos/core";
import { coinGeckoProvider } from "./mantle/providers/coingecko";
import { defiLlamaProvider } from "./mantle/providers/defillama";
import { walletProvider } from "./mantle/providers/wallet";

// Import all Mantle actions as a group
import { MantleActions } from "./mantle/actions";

// Import all Sonic actions as a group
import { sonicActions } from "./sonic";

// Import all Analytics actions as a group
import { analyticsActions } from "./analytics";

export const hivefiPlugin: Plugin = {
    name: "hivefi",
    description: "HiveFi Plugin for Eliza - Multichain DeFAI Agent Swarm",
    actions: [
        ...MantleActions, // Spread all Mantle actions
        ...sonicActions, // Spread all Sonic actions
        ...analyticsActions, // Spread all Analytics actions
        // TODO: Add MultiChain actions
    ],
    evaluators: [],
    providers: [
        coinGeckoProvider,
        defiLlamaProvider,
        walletProvider
    ]
};

export default hivefiPlugin;

