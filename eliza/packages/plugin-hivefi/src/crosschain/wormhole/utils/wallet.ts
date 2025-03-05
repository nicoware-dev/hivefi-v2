import { ethers } from 'ethers';
import { elizaLogger, IAgentRuntime } from '@elizaos/core';
import { Chain } from '@wormhole-foundation/sdk';

const logger = elizaLogger.child({ module: 'WormholeWallet' });

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
 * Get a wallet for the specified chain
 * This is a placeholder implementation that would need to be replaced with actual wallet integration
 * @param chainId The chain ID to get a wallet for
 * @returns A wallet for the specified chain
 */
export async function getWallet(chainId: string): Promise<any> {
  // In a real implementation, this would use the user's wallet or a configured wallet
  // For now, we'll just return a mock wallet
  
  // This is just a placeholder - in production, you would:
  // 1. Get the private key from a secure source (e.g., environment variable, keystore)
  // 2. Create a wallet instance for the specified chain
  // 3. Return the wallet
  
  // Example for Ethereum-based chains:
  // In production, you would get this from a secure source
  const mockPrivateKey = '0x0000000000000000000000000000000000000000000000000000000000000000'; // This is not a real private key
  return new ethers.Wallet(mockPrivateKey);
}

/**
 * Get the private key from runtime settings
 * @param runtime The agent runtime
 * @returns The private key
 */
function getPrivateKey(runtime: IAgentRuntime): string {
  // First try EVM_PRIVATE_KEY (our custom setting)
  let privateKey = runtime.getSetting('EVM_PRIVATE_KEY');
  
  // If not found, try WALLET_PRIVATE_KEY (from the original implementation)
  if (!privateKey) {
    privateKey = runtime.getSetting('WALLET_PRIVATE_KEY');
  }
  
  if (!privateKey) {
    logger.error('No private key found in runtime settings');
    throw new Error('No private key found in runtime settings. Please set EVM_PRIVATE_KEY or WALLET_PRIVATE_KEY.');
  }
  
  return privateKey;
}

/**
 * Create a Wormhole SDK compatible signer
 * This implements the SignAndSendSigner interface required by the Wormhole SDK
 * @param runtime The agent runtime
 * @param chain The chain to get a signer for
 * @returns A signer object compatible with the Wormhole SDK
 */
export async function getSigner(runtime: IAgentRuntime, chain: any): Promise<any> {
  logger.info(`Getting signer for chain: ${typeof chain === 'string' ? chain : chain?.chain || 'unknown'}`);
  
  try {
    // Get private key from runtime settings
    const privateKey = getPrivateKey(runtime);
    
    if (!privateKey) {
      throw new Error('Private key not found in runtime settings');
    }
    
    // Create wallet based on chain type
    let wallet;
    let address: string;
    let provider;
    
    // Handle different chain types
    // If chain is a string, use it directly, otherwise extract the chain property
    const chainName = typeof chain === 'string' ? chain : (chain?.chain || 'Ethereum');
    
    logger.info(`Creating wallet for chain: ${chainName}`);
    
    // For EVM-compatible chains, create an ethers wallet
    const evmChains = [
      'Ethereum', 'Polygon', 'Bsc', 'Avalanche', 'Fantom', 
      'Celo', 'Moonbeam', 'Arbitrum', 'Optimism', 'Base', 'Mantle'
    ];
    
    // For EVM chains
    if (evmChains.includes(chainName) || chainName.toLowerCase() === 'bsc' || 
        chainName.toLowerCase() === 'mantle' || chainName.toLowerCase() === 'binance' || 
        chainName.toLowerCase() === 'binancesmartchain') {
      
      wallet = new ethers.Wallet(privateKey);
      address = wallet.address;
      logger.info(`Created EVM wallet with address: ${address} for chain ${chainName}`);
      
      // Map chain names to provider URLs - using production mainnet RPCs
      const providerMap: Record<string, string> = {
        'Ethereum': 'https://rpc.ankr.com/eth',
        'Polygon': 'https://rpc.ankr.com/polygon',
        'Bsc': 'https://bscrpc.com',
        'Avalanche': 'https://rpc.ankr.com/avalanche',
        'Fantom': 'https://rpcapi.fantom.network',
        'Arbitrum': 'https://arb1.arbitrum.io/rpc',
        'Optimism': 'https://mainnet.optimism.io',
        'Base': 'https://mainnet.base.org',
        'Mantle': 'https://rpc.mantle.xyz'
      };
      
      // Get provider URL for the chain
      const providerUrl = providerMap[chainName] || providerMap[chainName.toLowerCase()] || 'https://rpc.ankr.com/eth';
      
      logger.info(`Using provider URL: ${providerUrl} for chain ${chainName}`);
      provider = new ethers.JsonRpcProvider(providerUrl);
      wallet = wallet.connect(provider);
      
      logger.info(`Connected wallet to provider for ${chainName}`);
    }
    // For Solana
    else if (chainName === 'Solana') {
      // For Solana, we'd use a different wallet implementation
      // For now, we'll throw an error since we don't have a real Solana implementation
      logger.error('Real Solana wallet implementation not available');
      throw new Error('Real Solana wallet implementation not available. Please use EVM chains only.');
    }
    // Default to EVM wallet for other chains
    else {
      logger.info(`No specific handler for chain ${chainName}, defaulting to EVM wallet`);
      wallet = new ethers.Wallet(privateKey);
      address = wallet.address;
      logger.info(`Created default wallet with address: ${address} for chain ${chainName}`);
      
      // Connect to a default provider
      provider = new ethers.JsonRpcProvider('https://rpc.ankr.com/eth');
      wallet = wallet.connect(provider);
      
      logger.info(`Connected default wallet to provider for ${chainName}`);
    }
    
    // Create a custom signer that matches what the Wormhole SDK expects
    const wormholeSigner = {
      // Required method that returns the chain identifier
      chain: () => chainName,
      
      // Required method that returns the wallet address
      address: () => address,
      
      // Required method for SignAndSendSigner interface
      // Takes an array of unsigned transactions, signs them, sends them, and returns transaction hashes
      signAndSend: async (txs: any[]) => {
        logger.info(`Signing and sending ${txs.length} transactions for ${chainName}`);
        
        const txHashes: string[] = [];
        
        for (const tx of txs) {
          try {
            // Use safe serialization for logging
            logger.info(`Preparing to sign transaction: ${safeSerialize(tx)}`);
            
            // Extract transaction details from the Wormhole transaction format
            const transaction = tx.transaction || tx;
            
            // Convert the transaction to a format ethers can understand
            // Handle BigInt values properly
            const ethersTransaction = {
              to: transaction.to,
              data: transaction.data,
              value: transaction.value ? (typeof transaction.value === 'bigint' ? transaction.value : BigInt(transaction.value.toString())) : BigInt(0),
              gasLimit: transaction.gasLimit || BigInt(3000000),
              chainId: transaction.chainId || (provider ? (await provider.getNetwork()).chainId : 1)
            };
            
            // Use safe serialization for logging
            logger.info(`Signing EVM transaction: ${safeSerialize(ethersTransaction)}`);
            
            // Sign and send the transaction
            const txResponse = await wallet.sendTransaction(ethersTransaction);
            logger.info(`Transaction sent with hash: ${txResponse.hash}`);
            
            // Add the transaction hash to the result array
            txHashes.push(txResponse.hash);
          } catch (error: any) {
            logger.error(`Error signing/sending transaction: ${error.message}`);
            throw error;
          }
        }
        
        return txHashes;
      },
      
      // Optional method for SignOnlySigner interface
      // Takes an array of unsigned transactions and returns signed transactions
      sign: async (txs: any[]) => {
        logger.info(`Signing ${txs.length} transactions for ${chainName}`);
        
        const signedTxs: any[] = [];
        
        for (const tx of txs) {
          try {
            // Use safe serialization for logging
            logger.info(`Preparing to sign transaction: ${safeSerialize(tx)}`);
            
            // Extract transaction details from the Wormhole transaction format
            const transaction = tx.transaction || tx;
            
            // Convert the transaction to a format ethers can understand
            // Handle BigInt values properly
            const ethersTransaction = {
              to: transaction.to,
              data: transaction.data,
              value: transaction.value ? (typeof transaction.value === 'bigint' ? transaction.value : BigInt(transaction.value.toString())) : BigInt(0),
              gasLimit: transaction.gasLimit || BigInt(3000000),
              chainId: transaction.chainId || (provider ? (await provider.getNetwork()).chainId : 1)
            };
            
            // Use safe serialization for logging
            logger.info(`Signing EVM transaction: ${safeSerialize(ethersTransaction)}`);
            
            // Sign the transaction
            const signedTx = await wallet.signTransaction(ethersTransaction);
            logger.info(`Transaction signed: ${signedTx.substring(0, 66)}...`);
            
            // Add the signed transaction to the result array
            signedTxs.push(signedTx);
          } catch (error: any) {
            logger.error(`Error signing transaction: ${error.message}`);
            throw error;
          }
        }
        
        return signedTxs;
      }
    };
    
    return wormholeSigner;
  } catch (error: any) {
    logger.error(`Error creating signer: ${error.message}`);
    throw error;
  }
}

/**
 * Get the balance of a token for an address on a specific chain
 * @param runtime The agent runtime
 * @param chain The chain to check the balance on
 * @param address The address to check the balance for
 * @param tokenAddress The token address to check the balance of
 * @returns The balance as a string
 */
export async function getBalance(runtime: IAgentRuntime, chain: any, address: string, tokenAddress?: string): Promise<string> {
  logger.info(`Getting balance for address ${address} on chain ${typeof chain === 'string' ? chain : (chain?.chain || 'unknown')}`);
  
  try {
    const chainName = typeof chain === 'string' ? chain : (chain?.chain || 'Ethereum');
    
    // Create a provider directly instead of using signer.unwrap()
    const providerMap: Record<string, string> = {
      'Ethereum': 'https://rpc.ankr.com/eth',
      'Polygon': 'https://rpc.ankr.com/polygon',
      'Bsc': 'https://bscrpc.com',
      'Avalanche': 'https://rpc.ankr.com/avalanche',
      'Fantom': 'https://rpcapi.fantom.network',
      'Arbitrum': 'https://arb1.arbitrum.io/rpc',
      'Optimism': 'https://mainnet.optimism.io',
      'Base': 'https://mainnet.base.org',
      'Mantle': 'https://rpc.mantle.xyz'
    };
    
    // Get provider URL for the chain
    const providerUrl = providerMap[chainName] || providerMap[chainName.toLowerCase()] || 'https://rpc.ankr.com/eth';
    const provider = new ethers.JsonRpcProvider(providerUrl);
    
    if (tokenAddress && tokenAddress !== 'native') {
      // For ERC20 tokens
      const erc20Abi = [
        'function balanceOf(address owner) view returns (uint256)',
        'function decimals() view returns (uint8)'
      ];
      const tokenContract = new ethers.Contract(tokenAddress, erc20Abi, provider);
      const balance = await tokenContract.balanceOf(address);
      const decimals = await tokenContract.decimals();
      
      // Convert to human-readable format
      const formattedBalance = ethers.formatUnits(balance, decimals);
      logger.info(`Token balance: ${formattedBalance}`);
      return formattedBalance;
    } else {
      // For native tokens
      const balance = await provider.getBalance(address);
      const formattedBalance = ethers.formatEther(balance);
      logger.info(`Native balance: ${formattedBalance}`);
      return formattedBalance;
    }
  } catch (error: any) {
    logger.error(`Error getting balance for ${address} on ${typeof chain === 'string' ? chain : (chain?.chain || 'unknown')}:`, error);
    throw new Error(`Failed to get balance: ${error.message}`);
  }
}

/**
 * Get the address for a specific chain
 * @param runtime The agent runtime
 * @param chain The chain to get the address for
 * @returns The address
 */
export async function getAddress(runtime: IAgentRuntime, chain: any): Promise<string> {
  logger.info(`Getting address for chain ${chain.chain}`);
  
  try {
    const signer = await getSigner(runtime, chain);
    const address = signer.address();
    logger.info(`Using address: ${address}`);
    
    return address;
  } catch (error: any) {
    logger.error(`Error getting address for ${chain.chain}:`, error);
    throw new Error(`Failed to get address: ${error.message}`);
  }
}

/**
 * Sign a transaction
 * @param runtime The agent runtime
 * @param chain The chain to sign the transaction for
 * @param transaction The transaction to sign
 * @returns The signed transaction
 */
export async function signTransaction(runtime: IAgentRuntime, chain: string, transaction: any): Promise<any> {
  logger.info(`Signing transaction for chain ${chain}`);
  
  try {
    const signer = await getSigner(runtime, chain);
    const signedTx = await signer.sign([transaction]);
    return signedTx[0];
  } catch (error: any) {
    logger.error(`Error signing transaction for ${chain}:`, error);
    throw new Error(`Failed to sign transaction: ${error.message}`);
  }
}

/**
 * Send a transaction
 * @param runtime The agent runtime
 * @param chain The chain to send the transaction on
 * @param signedTransaction The signed transaction to send
 * @returns The transaction hash
 */
export async function sendTransaction(runtime: IAgentRuntime, chain: string, signedTransaction: any): Promise<string> {
  logger.info(`Sending transaction for chain ${chain}`);
  
  try {
    const signer = await getSigner(runtime, chain);
    const txHashes = await signer.signAndSend([signedTransaction]);
    return txHashes[0];
  } catch (error: any) {
    logger.error(`Error sending transaction for ${chain}:`, error);
    throw new Error(`Failed to send transaction: ${error.message}`);
  }
} 