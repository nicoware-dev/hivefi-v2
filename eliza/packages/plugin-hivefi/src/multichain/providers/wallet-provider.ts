import { createWalletClient, http } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { viem } from "@goat-sdk/wallet-viem";
import { WalletClientBase } from "@goat-sdk/core";
import { CHAIN_CONFIGS, DEFAULT_CHAIN, SUPPORTED_CHAINS } from "../constants";
import { ChainConfig, MultichainWalletConfig } from "../types";
import { getChainConfig } from "../utils/chain-utils";

export class MultichainWalletProvider {
  private wallets: Record<string, WalletClientBase> = {};
  private config: MultichainWalletConfig;
  private privateKey: string;

  constructor(privateKey: string, config?: Partial<MultichainWalletConfig>) {
    this.privateKey = privateKey;
    this.config = {
      chains: CHAIN_CONFIGS,
      defaultChain: DEFAULT_CHAIN,
      ...config,
    };
    
    // Initialize wallets for all supported chains
    this.initializeWallets();
  }

  private initializeWallets() {
    for (const chainId of SUPPORTED_CHAINS) {
      const chainConfig = this.config.chains[chainId];
      if (chainConfig) {
        this.wallets[chainId] = this.createWalletForChain(chainConfig);
      }
    }
  }

  private createWalletForChain(chainConfig: ChainConfig): WalletClientBase {
    const account = privateKeyToAccount(this.privateKey as `0x${string}`);
    
    const walletClient = createWalletClient({
      account,
      transport: http(chainConfig.rpcUrl),
      chain: {
        id: parseInt(chainConfig.id),
        name: chainConfig.name,
        nativeCurrency: chainConfig.nativeCurrency,
      },
    });
    
    return viem(walletClient);
  }

  public getWallet(chainId?: string): WalletClientBase {
    const chain = chainId || this.config.defaultChain;
    
    if (!this.wallets[chain]) {
      throw new Error(`Wallet for chain ${chain} not initialized`);
    }
    
    return this.wallets[chain];
  }

  public getAddress(): string {
    // Address is the same across all chains for a given private key
    return this.getWallet().getAddress();
  }

  public async getProvider() {
    try {
      const address = this.getAddress();
      
      // Get balances across all chains
      const balances = await Promise.all(
        SUPPORTED_CHAINS.map(async (chainId) => {
          try {
            const wallet = this.getWallet(chainId);
            const balance = await wallet.balanceOf(address);
            const chainConfig = getChainConfig(chainId);
            return `${chainConfig.name}: ${balance} ${chainConfig.nativeCurrency.symbol}`;
          } catch (error) {
            console.error(`Error fetching balance for ${chainId}:`, error);
            return `${chainId}: Error fetching balance`;
          }
        })
      );
      
      return `Multichain Wallet Address: ${address}\nBalances:\n${balances.join('\n')}`;
    } catch (error) {
      console.error("Error in multichain wallet provider:", error);
      return null;
    }
  }
} 