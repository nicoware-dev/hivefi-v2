import { IAgentRuntime } from '@elizaos/core';
import { MultichainWalletProvider } from './wallet-provider';

/**
 * Multichain wallet provider
 * Gets the private key from runtime settings (EVM_PRIVATE_KEY)
 */
export const multichainWalletProvider = {
  get: async (runtime: IAgentRuntime, message: { content: { text?: string } }) => {
    try {
      // Get private key from runtime settings
      const privateKey = runtime.getSetting("EVM_PRIVATE_KEY");
      
      if (!privateKey) {
        console.warn("EVM_PRIVATE_KEY not configured, multichain features will be limited");
        return null;
      }
      
      // Initialize wallet provider
      const walletProvider = new MultichainWalletProvider(privateKey);
      
      // Get wallet information
      const walletInfo = await walletProvider.getProvider();
      
      return {
        action: 'MULTICHAIN_WALLET_INFO',
        confidence: 0.9,
        params: {
          text: message.content.text,
          walletInfo
        }
      };
    } catch (error) {
      console.error("Error in multichain wallet provider:", error);
      return null;
    }
  }
};

/**
 * Export all multichain providers
 */
const providers = [
  multichainWalletProvider
];

export default providers; 