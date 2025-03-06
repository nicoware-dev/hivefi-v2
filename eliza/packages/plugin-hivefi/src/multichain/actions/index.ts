import { Action } from "@elizaos/core";
import { MultichainWalletProvider } from "../providers/wallet-provider";
import { createTransferAction } from "./transfer";
import { createTokenTransferAction } from "./token-transfer";

// Export core actions directly
export const coreActions: Action[] = [
  createTransferAction(),
  createTokenTransferAction(),
]; 