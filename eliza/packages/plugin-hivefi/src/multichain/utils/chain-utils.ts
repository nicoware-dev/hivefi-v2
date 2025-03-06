import { CHAIN_CONFIGS, DEFAULT_CHAIN } from "../constants";
import { ChainConfig } from "../types";

export function getChainConfig(chainId: string): ChainConfig {
  const config = CHAIN_CONFIGS[chainId];
  if (!config) {
    throw new Error(`Chain configuration not found for chain ID: ${chainId}`);
  }
  return config;
}

export function getChainByName(chainName: string): string {
  const normalizedName = chainName.toLowerCase();
  
  for (const [chainId, config] of Object.entries(CHAIN_CONFIGS)) {
    if (config.name.toLowerCase() === normalizedName) {
      return chainId;
    }
  }
  
  throw new Error(`Chain not found with name: ${chainName}`);
}

export function parseChainFromPrompt(prompt: string): string {
  const chainMatches = prompt.match(/on\s+([a-zA-Z]+)/i);
  if (chainMatches && chainMatches[1]) {
    try {
      return getChainByName(chainMatches[1]);
    } catch (error) {
      // If chain not found by name, return default
      return DEFAULT_CHAIN;
    }
  }
  return DEFAULT_CHAIN;
} 