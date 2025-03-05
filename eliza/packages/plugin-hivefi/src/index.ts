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

// Import all DefiLlama actions as a group
import { actions as defiLlamaActions } from "./analytics/defillama";

export const hivefiPlugin: Plugin = {
    name: "hivefi",
    description: "HiveFi Plugin for Eliza - Multichain DeFAI Agent Swarm",
    actions: [
        ...MantleActions,
        ...sonicActions,
        ...analyticsActions,
        ...defiLlamaActions
    ],
    evaluators: [],
    providers: [
        walletProvider
    ]
};

export default hivefiPlugin;

