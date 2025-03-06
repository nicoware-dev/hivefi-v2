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
  console.log(`[DEBUG] Looking for chain with normalized name: "${normalizedName}"`);
  
  for (const [chainId, config] of Object.entries(CHAIN_CONFIGS)) {
    console.log(`[DEBUG] Checking chain ${chainId}: "${config.name.toLowerCase()}" against "${normalizedName}"`);
    if (config.name.toLowerCase() === normalizedName) {
      console.log(`[DEBUG] Found matching chain: ${chainId}`);
      return config.id;
    }
  }
  
  console.log(`[DEBUG] No matching chain found for: "${normalizedName}"`);
  throw new Error(`Chain not found with name: ${chainName}`);
}

export function parseChainFromPrompt(prompt: string): string {
  console.log(`[DEBUG] Parsing chain from prompt: "${prompt}"`);
  
  // First check if the prompt contains the chain name directly
  const directChainMatch = prompt.match(/\b(ethereum|arbitrum|polygon|optimism|base)\b/i);
  if (directChainMatch) {
    const chainName = directChainMatch[1];
    console.log(`[DEBUG] Found direct chain name in prompt: "${chainName}"`);
    try {
      const chainId = getChainByName(chainName);
      console.log(`[DEBUG] Resolved chain ID: "${chainId}"`);
      return chainId;
    } catch (error) {
      console.log(`[DEBUG] Error resolving direct chain name: ${error}`);
    }
  }
  
  // Then try the "on X" pattern
  const chainMatches = prompt.match(/on\s+([a-zA-Z]+)/i);
  console.log(`[DEBUG] Chain matches from 'on X' pattern:`, chainMatches);
  
  if (chainMatches && chainMatches[1]) {
    try {
      const chainName = chainMatches[1];
      console.log(`[DEBUG] Found chain name in prompt using 'on X' pattern: "${chainName}"`);
      const chainId = getChainByName(chainName);
      console.log(`[DEBUG] Resolved chain ID: "${chainId}"`);
      return chainId;
    } catch (error) {
      // If chain not found by name, return default
      console.log(`[DEBUG] Chain not found by name, using default: "${DEFAULT_CHAIN}"`);
      return getChainConfig(DEFAULT_CHAIN).id;
    }
  }
  console.log(`[DEBUG] No chain found in prompt, using default: "${DEFAULT_CHAIN}"`);
  return getChainConfig(DEFAULT_CHAIN).id;
} 