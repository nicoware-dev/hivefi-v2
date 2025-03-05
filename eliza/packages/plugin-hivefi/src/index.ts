import type { Plugin } from "@elizaos/core";
import { mantleActions } from "./mantle";
import { sonicActions } from "./sonic";
import { analyticsActions } from "./analytics";
import { multichainActions } from "./multichain";

/**
 * HiveFi plugin for Eliza
 */
const plugin: Plugin = {
  name: "plugin-hivefi",
  description: "HiveFi Plugin for Eliza - Multichain DeFi Agent",
  actions: [
    ...mantleActions,
    ...sonicActions,
    ...analyticsActions,
    ...multichainActions
  ],
};

export default plugin;

