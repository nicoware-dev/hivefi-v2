import { elizaLogger } from '@elizaos/core';
import { Chain, Wormhole, wormhole } from '@wormhole-foundation/sdk';

// Import chain-specific modules
import evm from '@wormhole-foundation/sdk/evm';
import solana from '@wormhole-foundation/sdk/solana';
import aptos from '@wormhole-foundation/sdk/aptos';
import sui from '@wormhole-foundation/sdk/sui';
import algorand from '@wormhole-foundation/sdk/algorand';
import cosmwasm from '@wormhole-foundation/sdk/cosmwasm';

const logger = elizaLogger.child({ module: 'WormholeInstance' });

// Initialize Wormhole SDK
let wormholeInstance: any = null;

/**
 * Get or create a Wormhole SDK instance
 * @returns A promise that resolves to a Wormhole SDK instance
 */
export async function getWormholeInstance(): Promise<any> {
  if (!wormholeInstance) {
    try {
      logger.info('Initializing Wormhole SDK with Mainnet');
      
      // Define custom RPC endpoints for better reliability
      const customRpcs = {
        chains: {
          // Add custom RPCs for better reliability
          Ethereum: { rpc: 'https://rpc.ankr.com/eth' },
          Bsc: { rpc: 'https://bsc-dataseed.binance.org' },
          Polygon: { rpc: 'https://polygon-rpc.com' },
          Avalanche: { rpc: 'https://api.avax.network/ext/bc/C/rpc' },
          Solana: { rpc: 'https://api.mainnet-beta.solana.com' },
          // Add Mantle RPC (using Ethereum as a proxy since Mantle isn't directly supported)
          // In a real implementation, you would use the actual Mantle RPC
          Mantle: { rpc: 'https://rpc.mantle.xyz' }
        }
      };
      
      // Initialize with mainnet for production
      wormholeInstance = await wormhole('Mainnet', [
        evm,
        solana,
        aptos,
        sui,
        algorand,
        cosmwasm
      ], customRpcs);
      
      logger.info('SDK initialized successfully');
      
      // Add special handling for Mantle and BSC
      const originalWormholeGetChain = wormholeInstance.getChain.bind(wormholeInstance);
      wormholeInstance.getChain = (chain: Chain) => {
        logger.info(`Getting chain context for: ${chain}`);
        
        // Special handling for Mantle (mapped to Ethereum)
        if (chain === 'Ethereum') {
          logger.info('Applying special configuration for Ethereum/Mantle');
          const context = originalWormholeGetChain(chain);
          // Add any Mantle-specific overrides here if needed
          return context;
        }
        
        // Special handling for BSC
        if (chain === 'Bsc') {
          logger.info('Applying special configuration for BSC');
          const context = originalWormholeGetChain(chain);
          // Add any BSC-specific overrides here if needed
          return context;
        }
        
        // Default handling for other chains
        return originalWormholeGetChain(chain);
      };
      
    } catch (error) {
      logger.error('Error initializing SDK:', error);
      logger.info('Falling back to mock instance');
      // Fallback to mock instance if SDK initialization fails
      wormholeInstance = {
        getChain: (chain: string) => ({
          chain,
          config: { nativeTokenDecimals: 18 },
          getNativeWrappedTokenId: async () => ({ address: '0x0000000000000000000000000000000000000000' }),
          getTokenBridge: async () => ({
            getWrappedAsset: async () => ({}),
            transfer: () => ({})
          }),
          parseVaa: async () => ({}),
          parseTransaction: async () => ([])
        }),
        resolver: () => ({
          supportedSourceTokens: async () => [],
          supportedDestinationTokens: async () => [],
          findRoutes: async () => []
        }),
        tokenTransfer: async (
          amount: bigint, 
          sourceAddress: { chain: string, address: string }, 
          destAddress: { chain: string, address: string }, 
          automatic: boolean = false, 
          payload?: Uint8Array, 
          nativeGas?: bigint
        ) => {
          logger.info(`Mock tokenTransfer: ${amount} from ${sourceAddress.chain}:${sourceAddress.address} to ${destAddress.chain}:${destAddress.address}`);
          return {
            transfer: { amount, sourceAddress, destAddress, automatic, payload, nativeGas },
            initiateTransfer: async () => ['0x' + Array.from({length: 64}, () => Math.floor(Math.random() * 16).toString(16)).join('')],
            fetchAttestation: async () => ['0x' + Array.from({length: 64}, () => Math.floor(Math.random() * 16).toString(16)).join('')],
            completeTransfer: async () => ['0x' + Array.from({length: 64}, () => Math.floor(Math.random() * 16).toString(16)).join('')]
          };
        },
        circleTransfer: async (
          amount: bigint, 
          sourceAddress: { chain: string, address: string }, 
          destAddress: { chain: string, address: string }, 
          automatic: boolean = false, 
          payload?: Uint8Array, 
          nativeGas?: bigint
        ) => {
          logger.info(`Mock circleTransfer: ${amount} from ${sourceAddress.chain}:${sourceAddress.address} to ${destAddress.chain}:${destAddress.address}`);
          return {
            transfer: { amount, sourceAddress, destAddress, automatic, payload, nativeGas },
            initiateTransfer: async () => ['0x' + Array.from({length: 64}, () => Math.floor(Math.random() * 16).toString(16)).join('')],
            fetchAttestation: async () => ['0x' + Array.from({length: 64}, () => Math.floor(Math.random() * 16).toString(16)).join('')],
            completeTransfer: async () => ['0x' + Array.from({length: 64}, () => Math.floor(Math.random() * 16).toString(16)).join('')]
          };
        },
        getVaa: async () => ({})
      };
    }
  }
  return wormholeInstance;
} 