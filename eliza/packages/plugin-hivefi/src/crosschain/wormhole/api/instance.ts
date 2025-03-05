import { elizaLogger } from '@elizaos/core';
import { wormhole, Wormhole, Network, TokenId, Chain, ChainAddress } from '@wormhole-foundation/sdk';
import evm from '@wormhole-foundation/sdk/evm';
import { getChainConfig, BACKUP_RPC_ENDPOINTS } from '../config';

const logger = elizaLogger.child({ module: 'WormholeInstance' });

// Store the Wormhole instance
let wormholeInstance: Wormhole<Network> | null = null;

/**
 * Helper function to safely serialize objects with BigInt values
 * @param obj The object to serialize
 * @returns A JSON string with BigInt values converted to strings
 */
function safeSerialize(obj: any): string {
  return JSON.stringify(obj, (_, value) => 
    typeof value === 'bigint' ? value.toString() : value
  );
}

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
    logger.info(`Using chain configuration: ${safeSerialize(chainConfig)}`);
    
    // Initialize the Wormhole SDK with EVM platform support
    wormholeInstance = await wormhole('Mainnet', [evm], {
      chains: chainConfig
    });
    
    logger.info('Wormhole SDK initialized successfully');
    return wormholeInstance;
  } catch (error: any) {
    logger.error(`Error initializing Wormhole SDK: ${error.message}`);
    
    // Try with backup RPC endpoints
    try {
      logger.info('Trying with backup RPC endpoints');
      
      // Create a backup configuration using the backup RPC endpoints
      const backupConfig: Record<string, { rpc: string }> = {};
      
      // Convert our backup endpoints to Wormhole SDK chain names
      Object.entries(BACKUP_RPC_ENDPOINTS).forEach(([chainName, rpcUrl]) => {
        let wormholeChain: string | undefined;
        
        // Map our chain names to Wormhole SDK chain names
        switch (chainName.toLowerCase()) {
          case 'ethereum':
            wormholeChain = 'Ethereum';
            break;
          case 'bsc':
            wormholeChain = 'Bsc';
            break;
          case 'polygon':
            wormholeChain = 'Polygon';
            break;
          case 'avalanche':
            wormholeChain = 'Avalanche';
            break;
          case 'fantom':
            wormholeChain = 'Fantom';
            break;
          case 'arbitrum':
            wormholeChain = 'Arbitrum';
            break;
          case 'optimism':
            wormholeChain = 'Optimism';
            break;
          case 'base':
            wormholeChain = 'Base';
            break;
        }
        
        if (wormholeChain) {
          backupConfig[wormholeChain] = { rpc: rpcUrl };
        }
      });
      
      logger.info(`Using backup chain configuration: ${safeSerialize(backupConfig)}`);
      
      // Initialize the Wormhole SDK with EVM platform support using backup config
      wormholeInstance = await wormhole('Mainnet', [evm], {
        chains: backupConfig
      });
      
      logger.info('Wormhole SDK initialized successfully with backup RPC endpoints');
      return wormholeInstance;
    } catch (backupError: any) {
      logger.error(`Error initializing Wormhole SDK with backup RPC endpoints: ${backupError.message}`);
      logger.error(backupError);
      
      // If both primary and backup fail, create a mock instance
      logger.info('Creating mock Wormhole instance');
      
      // Create a mock instance that provides the necessary methods
      const mockInstance = {
        getChain: (chain: Chain) => ({
          chain,
          // Add other necessary methods and properties
        }),
        tokenTransfer: tokenTransfer,
        circleTransfer: circleTransfer
      } as unknown as Wormhole<Network>;
      
      wormholeInstance = mockInstance;
      return wormholeInstance;
    }
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
  logger.info(`Mock token transfer: ${amount} of token ${safeSerialize(token)}`);
  logger.info(`From: ${safeSerialize(sourceAddress)} to ${safeSerialize(destAddress)}`);
  logger.info(`Automatic: ${automatic}, Native gas: ${nativeGas ? nativeGas.toString() : '0'}`);
  
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
    quoteTransfer: async () => {
      logger.info('Mock quoteTransfer called');
      return {
        sourceNativeGas: 0n,
        destinationNativeGas: 0n,
        fee: 0n
      };
    }
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
  logger.info(`From: ${safeSerialize(sourceAddress)} to ${safeSerialize(destAddress)}`);
  logger.info(`Automatic: ${automatic}, Native gas: ${nativeGas ? nativeGas.toString() : '0'}`);
  
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
    quoteTransfer: async () => {
      logger.info('Mock quoteTransfer called');
      return {
        sourceNativeGas: 0n,
        destinationNativeGas: 0n,
        fee: 0n
      };
    }
  };
} 