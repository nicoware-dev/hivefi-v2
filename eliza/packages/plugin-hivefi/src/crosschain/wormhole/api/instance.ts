import { elizaLogger } from '@elizaos/core';
import { wormhole, Wormhole, Network, TokenId, Chain, ChainAddress } from '@wormhole-foundation/sdk';
import evm from '@wormhole-foundation/sdk/evm';
import { getChainConfig } from '../config';

const logger = elizaLogger.child({ module: 'WormholeInstance' });

// Store the Wormhole instance
let wormholeInstance: Wormhole<Network> | null = null;

/**
 * Get the Wormhole SDK instance
 * @returns The Wormhole SDK instance
 */
export async function getWormholeInstance(): Promise<Wormhole<Network>> {
  if (wormholeInstance) {
    return wormholeInstance;
  }
  
  try {
    logger.info('Initializing Wormhole SDK');
    
    // Get chain configuration
    const chainConfig = getChainConfig();
    logger.info(`Using chain configuration: ${JSON.stringify(chainConfig)}`);
    
    // Initialize the Wormhole SDK with EVM platform support
    wormholeInstance = await wormhole('Mainnet', [evm], {
      chains: chainConfig
    });
    
    logger.info('Wormhole SDK initialized successfully');
    return wormholeInstance;
  } catch (error: any) {
    logger.error(`Error initializing Wormhole SDK: ${error.message}`);
    logger.error(error);
    throw new Error(`Failed to initialize Wormhole SDK: ${error.message}`);
  }
}

/**
 * Mock implementation of token transfer
 * This is used as a fallback when the real implementation fails
 * 
 * @param token The token to transfer
 * @param amount The amount to transfer
 * @param sourceAddress The source address
 * @param destAddress The destination address
 * @param automatic Whether to automatically complete the transfer
 * @param payload Optional payload
 * @param nativeGas Optional native gas dropoff
 * @returns A mock transfer object
 */
export function tokenTransfer(
  token: TokenId,
  amount: bigint,
  sourceAddress: ChainAddress<Chain>,
  destAddress: ChainAddress<Chain>,
  automatic: boolean = false,
  payload?: Uint8Array,
  nativeGas?: bigint
): any {
  logger.info(`Mock token transfer: ${amount} of token ${JSON.stringify(token)}`);
  logger.info(`From: ${JSON.stringify(sourceAddress)} to ${JSON.stringify(destAddress)}`);
  logger.info(`Automatic: ${automatic}, Native gas: ${nativeGas || 0n}`);
  
  if (payload) {
    logger.info(`With payload of length ${payload.length}`);
  }
  
  // Return a mock transfer object
  return {
    transfer: {
      token,
      amount,
      from: sourceAddress,
      to: destAddress,
      automatic,
      payload,
      nativeGas: nativeGas || 0n,
    },
    initiateTransfer: async () => {
      logger.info('Mock initiateTransfer called');
      // Generate a mock transaction hash
      const txHash = `0x${Array.from({length: 64}, () => Math.floor(Math.random() * 16).toString(16)).join('')}`;
      logger.info(`Generated mock transaction hash: ${txHash}`);
      return [txHash];
    },
    completeTransfer: async () => {
      logger.info('Mock completeTransfer called');
      // Generate a mock transaction hash
      const txHash = `0x${Array.from({length: 64}, () => Math.floor(Math.random() * 16).toString(16)).join('')}`;
      logger.info(`Generated mock transaction hash: ${txHash}`);
      return [txHash];
    },
  };
}

/**
 * Mock implementation of Circle USDC transfer
 * This is used as a fallback when the real implementation fails
 * 
 * @param amount The amount to transfer
 * @param sourceAddress The source address
 * @param destAddress The destination address
 * @param automatic Whether to automatically complete the transfer
 * @param payload Optional payload
 * @param nativeGas Optional native gas dropoff
 * @returns A mock transfer object
 */
export function circleTransfer(
  amount: bigint,
  sourceAddress: ChainAddress<Chain>,
  destAddress: ChainAddress<Chain>,
  automatic: boolean = false,
  payload?: Uint8Array,
  nativeGas?: bigint
): any {
  logger.info(`Mock Circle transfer: ${amount} USDC`);
  logger.info(`From: ${JSON.stringify(sourceAddress)} to ${JSON.stringify(destAddress)}`);
  logger.info(`Automatic: ${automatic}, Native gas: ${nativeGas || 0n}`);
  
  if (payload) {
    logger.info(`With payload of length ${payload.length}`);
  }
  
  // Return a mock transfer object
  return {
    transfer: {
      amount,
      from: sourceAddress,
      to: destAddress,
      automatic,
      payload,
      nativeGas: nativeGas || 0n,
    },
    initiateTransfer: async () => {
      logger.info('Mock initiateTransfer called');
      // Generate a mock transaction hash
      const txHash = `0x${Array.from({length: 64}, () => Math.floor(Math.random() * 16).toString(16)).join('')}`;
      logger.info(`Generated mock transaction hash: ${txHash}`);
      return [txHash];
    },
    completeTransfer: async () => {
      logger.info('Mock completeTransfer called');
      // Generate a mock transaction hash
      const txHash = `0x${Array.from({length: 64}, () => Math.floor(Math.random() * 16).toString(16)).join('')}`;
      logger.info(`Generated mock transaction hash: ${txHash}`);
      return [txHash];
    },
  };
} 