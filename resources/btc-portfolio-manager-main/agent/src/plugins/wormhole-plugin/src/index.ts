import type { Plugin, Evaluator, IAgentRuntime, Memory } from "@elizaos/core";
import { transferAction } from "./actions/transfer.ts";
import { redeemAction } from "./actions/redeem.ts";
import { isTransferRequest, isRedeemRequest } from "./actions/patterns.ts";

const actionRecognizer: Evaluator = {
  name: "action_recognizer",
  description: "Recognizes token transfer and redeem requests",
  similes: [],
  examples: [],
  handler: async (runtime: IAgentRuntime, message: Memory) => {
    const text = message.content.text?.toLowerCase() || "";
    console.log("Evaluating text:", text);
    
    const isTransfer = isTransferRequest(text);
    const isRedeem = isRedeemRequest(text);
    console.log("Is transfer request:", isTransfer);
    console.log("Is redeem request:", isRedeem);
    
    if (isTransfer) {
      console.log("Recognized as transfer request");
      return {
        action: "TRANSFER_TOKENS",
        confidence: 0.9,
        params: {}
      };
    }
    
    if (isRedeem) {
      console.log("Recognized as redeem request");
      return {
        action: "REDEEM_TOKENS_ACTION",
        confidence: 0.9,
        params: {}
      };
    }

    console.log("No action recognized");
    return null;
  },
  validate: async () => true
};

export const wormholePlugin: Plugin = {
  name: "wormhole",
  description: "Wormhole Cross chain token transfer Plugin",
  providers: [],
  evaluators: [actionRecognizer],
  services: [],
  actions: [transferAction],
};

export default wormholePlugin;
