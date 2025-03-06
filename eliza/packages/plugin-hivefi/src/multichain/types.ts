import { Chain } from "@goat-sdk/core";
import { WalletClientBase } from "@goat-sdk/core";

export interface ChainConfig {
  id: string;
  name: string;
  rpcUrl: string;
  explorerUrl: string;
  nativeCurrency: {
    name: string;
    symbol: string;
    decimals: number;
  };
}

export interface MultichainWalletConfig {
  chains: Record<string, ChainConfig>;
  defaultChain: string;
}

export interface ChainContext {
  chain: Chain;
  wallet: WalletClientBase;
} 