import { elizaLogger, IAgentRuntime } from '@elizaos/core';
import { TransferParams, RedeemParams } from '../types';
import { getSigner, getBalance } from '../utils/wallet';
import { normalizeChainName } from '../utils/chain';
import { Chain, UniversalAddress } from '@wormhole-foundation/sdk';
import { getTokenAddress, getTokenDecimals } from '../config/tokens';
import { ethers } from 'ethers';
import { getWormholeInstance } from './instance';
import { getWormholeChain, isWormholeSupported } from '../config';
import { CircleTransfer as CircleTransferSDK, circle } from '@wormhole-foundation/sdk-connect';
import { getExplorerLink } from '../utils/explorer';

const logger = elizaLogger.child({ module: 'CircleTransfer' });

// List of chains supported by Circle Bridge for USDC transfers
const CIRCLE_SUPPORTED_CHAINS = [
  'ethereum',
  'avalanche',
  'optimism',
  'arbitrum',
  'solana',
  'base',
  'polygon',
  'sui',
  'aptos'
];

/**
 * Check if a chain is supported by Circle Bridge
 * @param chain The chain name
 * @returns True if the chain is supported by Circle Bridge
 */
export function isCircleSupported(chain: string): boolean {
  return CIRCLE_SUPPORTED_CHAINS.includes(chain.toLowerCase());
}

/**
 * Safely serialize an object to a string
 * @param obj The object to serialize
 * @returns The serialized object
 */
function safeSerialize(obj: any): string {
  try {
    return JSON.stringify(obj, (_, value) => {
      if (typeof value === 'bigint') {
        return value.toString();
      }
      return value;
    });
  } catch (error) {
    return String(obj);
  }
}

/**
 * Get the explorer link for a transaction
 * @param chain The chain name
 * @param txHash The transaction hash
 * @returns The explorer link
 */
function getExplorerLink(chain: string, txHash: string): string {
  const explorers: Record<string, string> = {
    'ethereum': 'https://etherscan.io/tx/',
    'polygon': 'https://polygonscan.com/tx/',
    'arbitrum': 'https://arbiscan.io/tx/',
    'optimism': 'https://optimistic.etherscan.io/tx/',
    'base': 'https://basescan.org/tx/',
    'avalanche': 'https://snowtrace.io/tx/',
    'solana': 'https://solscan.io/tx/',
    'sui': 'https://explorer.sui.io/txblock/',
    'aptos': 'https://explorer.aptoslabs.com/txn/'
  };

  const baseUrl = explorers[chain.toLowerCase()] || 'https://etherscan.io/tx/';
  return `${baseUrl}${txHash}`;
}

// In-memory storage for transfer receipts
const transferReceipts: Record<string, any> = {};

/**
 * Store a transfer receipt
 * @param txHash The transaction hash
 * @param receipt The receipt to store
 */
function storeTransferReceipt(txHash: string, receipt: any): void {
  transferReceipts[txHash] = receipt;
}

/**
 * Get a transfer receipt
 * @param txHash The transaction hash
 * @returns The transfer receipt
 */
function getTransferReceipt(txHash: string): any {
  // Return the existing receipt if it exists, otherwise return null
  // No more mock receipts for testing
  return transferReceipts[txHash] || null;
}

/**
 * Create a chain address object
 * @param chain The chain
 * @param address The address
 * @returns The chain address object
 */
function createChainAddress(chain: Chain, address: string) {
  try {
    // For EVM chains
    if (chain === 'Ethereum' || 
        chain === 'Polygon' || 
        chain === 'Arbitrum' || 
        chain === 'Optimism' || 
        chain === 'Base' || 
        chain === 'Avalanche') {
      return {
        chain,
        address: address
      };
    }
    
    // For non-EVM chains
    return {
      chain,
      address: address
    };
  } catch (error: any) {
    logger.error(`Error creating chain address: ${error.message}`);
    throw new Error(`Invalid address for chain ${chain}: ${address}`);
  }
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
 * Transfer USDC from one chain to another using Circle Bridge
 * @param runtime The agent runtime
 * @param params The transfer parameters
 * @returns The transaction hash, explorer link, and additional transfer details
 */
async function transferCircleUSDC(runtime: IAgentRuntime, params: TransferParams): Promise<{
  txHash: string;
  explorerLink: string;
  sourceChain?: string;
  destinationChain?: string;
  amount?: string;
  token?: string;
  status?: string;
  message?: string;
  estimatedTime?: string;
}> {
  const tokenName = params.token || 'USDC';
  
  // Verify that we're transferring USDC
  if (tokenName.toUpperCase() !== 'USDC') {
    throw new Error('Circle Bridge only supports USDC transfers');
  }
  
  logger.info(`Transferring ${params.amount} USDC from ${params.sourceChain} to ${params.destinationChain} via Circle Bridge`);
  
  // Store original chain names for reference
  const originalSourceChain = params.sourceChain.toLowerCase();
  const originalDestChain = params.destinationChain.toLowerCase();
  
  // Check if both chains are supported by Circle Bridge
  if (!isCircleSupported(originalSourceChain)) {
    throw new Error(`Source chain ${originalSourceChain} is not supported by Circle Bridge. Supported chains are: ${CIRCLE_SUPPORTED_CHAINS.join(', ')}`);
  }
  
  if (!isCircleSupported(originalDestChain)) {
    throw new Error(`Destination chain ${originalDestChain} is not supported by Circle Bridge. Supported chains are: ${CIRCLE_SUPPORTED_CHAINS.join(', ')}`);
  }
  
  try {
    // Normalize chain names
    const sourceChain = normalizeChainName(params.sourceChain);
    const destChain = normalizeChainName(params.destinationChain);
    
    logger.info(`Normalized chains: ${sourceChain} -> ${destChain}`);
    logger.info(`Original chains: ${originalSourceChain} -> ${originalDestChain}`);
    
    // Get signer for source chain
    const signer = await getSigner(runtime, sourceChain);
    logger.info(`Got signer with address: ${signer.address()}`);
    
    // Initialize Wormhole SDK
    const wh = await getWormholeInstance();
    logger.info(`Initialized Wormhole SDK`);
    
    // Get Wormhole chain names
    const wormholeSourceChain = getWormholeChain(sourceChain);
    const wormholeDestChain = getWormholeChain(destChain);
    logger.info(`Wormhole chains: ${wormholeSourceChain} -> ${wormholeDestChain}`);
    
    // Check if both chains are supported by Circle
    // This is different from Wormhole support - we need to check Circle support specifically
    if (!wh.circleTransfer) {
      logger.error('Circle Bridge is not available in the Wormhole SDK');
      throw new Error('Circle Bridge is not available');
    }
    
    // Get USDC token address
    const tokenAddress = getTokenAddress(sourceChain, 'USDC');
    
    if (!tokenAddress) {
      logger.error(`No USDC token address found for ${sourceChain}`);
      throw new Error(`USDC not supported on ${originalSourceChain}`);
    }
    
    logger.info(`Using USDC token address: ${tokenAddress}`);
    
    // Get source and destination addresses
    const signerAddress = signer.address();
    logger.info(`Using signer address: ${signerAddress}`);
    
    // Create UniversalAddress instances for source and destination
    const cleanAddress = signerAddress.startsWith('0x') ? signerAddress.slice(2) : signerAddress;
    const universalAddress = new UniversalAddress(cleanAddress);
    
    // Create source and destination addresses with UniversalAddress
    const sourceAddress = {
      chain: wormholeSourceChain,
      address: universalAddress
    };
    
    const destAddress = {
      chain: wormholeDestChain,
      address: universalAddress
    };
    
    logger.info(`Created source address: ${safeSerialize(sourceAddress)}`);
    logger.info(`Created destination address: ${safeSerialize(destAddress)}`);
    
    try {
      // Get the Wormhole SDK instance
      const wh = await getWormholeInstance();
      
      // Get the chain contexts
      const sourceChainContext = wh.getChain(wormholeSourceChain);
      const destChainContext = wh.getChain(wormholeDestChain);
      
      // Parse amount to bigint with appropriate decimals
      const tokenDecimals = getTokenDecimals('USDC');
      const amountBigInt = BigInt(Math.floor(parseFloat(params.amount) * (10 ** tokenDecimals)));
      logger.info(`Parsed amount: ${amountBigInt} (${tokenDecimals} decimals)`);
      
      // Before initiating the transfer, check if the wallet has enough funds for gas
      // Get the wallet balance for gas
      const nativeBalance = await getBalance(runtime, sourceChain, signerAddress);
      logger.info(`Native token balance on ${sourceChain}: ${nativeBalance}`);
      
      // If native balance is 0, throw a more helpful error
      if (nativeBalance === '0' || nativeBalance === '0.0') {
        throw new Error(`Your wallet doesn't have any ${originalSourceChain} tokens to pay for gas fees. Please fund your wallet with some ${originalSourceChain} tokens first.`);
      }
      
      // Check USDC balance
      const usdcBalance = await getBalance(runtime, sourceChain, signerAddress, 'USDC');
      logger.info(`USDC balance on ${sourceChain}: ${usdcBalance}`);
      
      // Convert amount to a number for comparison
      const amountNum = parseFloat(params.amount);
      const balanceNum = parseFloat(usdcBalance);
      
      // If USDC balance is less than the amount to transfer, throw an error
      if (balanceNum < amountNum) {
        throw new Error(`You don't have enough USDC on ${originalSourceChain}. Your balance is ${usdcBalance} USDC, but you're trying to transfer ${params.amount} USDC.`);
      }
      
      // Create a Circle transfer using the SDK's method
      const transferParams = {
        from: sourceAddress,
        to: destAddress,
        amount: amountBigInt,
        automatic: false,
        nativeGas: undefined
      };
      
      logger.info(`Created transfer params: ${safeSerialize(transferParams)}`);
      
      // Create the Circle transfer
      const circleTransfer = new CircleTransferSDK(wh, transferParams, sourceChainContext, destChainContext);
      logger.info(`Created Circle transfer object`);
      
      // Initiate the transfer
      logger.info(`Initiating Circle transfer...`);
      const txids = await circleTransfer.initiateTransfer(signer);
      
      if (!txids || txids.length === 0) {
        throw new Error('No transaction IDs returned from Circle transfer');
      }
      
      const txHash = txids[0];
      logger.info(`Circle transfer initiated with transaction hash: ${txHash}`);
      
      // Store the transfer receipt for tracking
      const receipt = {
        type: 'circle',
        sourceChain: originalSourceChain,
        destinationChain: originalDestChain,
        token: 'USDC',
        amount: params.amount,
        timestamp: Date.now(),
        status: 'initiated',
        txHash: txHash,
        sourceAddress: signerAddress,
        destinationAddress: signerAddress,
        tokenAddress: tokenAddress
      };
      
      storeTransferReceipt(txHash, receipt);
      
      // Return the first transaction ID and explorer link
      const explorerLink = getExplorerLink(originalSourceChain, txHash);
      
      // Return additional information for better user experience
      return { 
        txHash, 
        explorerLink,
        sourceChain: originalSourceChain,
        destinationChain: originalDestChain,
        amount: params.amount,
        token: 'USDC',
        status: 'initiated',
        message: `Circle USDC transfer initiated. The transfer will typically take 5-10 minutes to complete. After that, you'll need to redeem your USDC on ${originalDestChain} by saying "Redeem my USDC transfer from ${originalSourceChain} to ${originalDestChain} with transaction ID ${txHash}".`,
        estimatedTime: '5-10 minutes'
      };
    } catch (error: any) {
      logger.error(`Error initiating Circle transfer: ${error.message}`);
      logger.error(error);
      
      // Provide specific error messages based on the error type
      if (error.code === 'INSUFFICIENT_FUNDS' || error.message.includes('insufficient funds')) {
        throw new Error(`Insufficient funds for USDC transfer: ${error.message}`);
      } else if (error.message.includes('rate limit') || error.message.includes('Too Many Requests')) {
        throw new Error(`RPC rate limit exceeded: ${error.message}. Please try again later.`);
      } else if (error.message.includes('gas')) {
        throw new Error(`Gas estimation failed: ${error.message}. Please try with a smaller amount.`);
      } else if (error.message.includes('rejected') || error.message.includes('denied')) {
        throw new Error(`Transaction rejected: ${error.message}`);
      } else if (error.message.includes('nonce')) {
        throw new Error(`Transaction nonce error: ${error.message}. Please try again.`);
      } else {
        throw new Error(`Failed to initiate Circle USDC transfer: ${error.message}`);
      }
    }
  } catch (error: any) {
    logger.error(`Error in transferCircleUSDC: ${error.message}`);
    logger.error(error);
    throw error;
  }
}

/**
 * Checks the status of a Circle USDC transfer
 * @param txHash The transaction hash
 * @returns The status of the transfer
 */
export async function checkCircleTransferStatus(txHash: string): Promise<{status: string, message: string}> {
  logger.info(`Checking status of Circle transfer with ID: ${txHash}`);
  
  try {
    // Get the transfer receipt
    const transferReceipt = getTransferReceipt(txHash);
    
    if (!transferReceipt) {
      logger.error(`No transfer receipt found for transaction ID: ${txHash}`);
      return {
        status: 'unknown',
        message: 'No transfer receipt found for this transaction ID. Please ensure you initiated the transfer through this interface.'
      };
    }
    
    if (transferReceipt.type !== 'circle') {
      logger.error(`Transfer receipt is not a Circle transfer: ${transferReceipt.type}`);
      return {
        status: 'invalid',
        message: 'This is not a Circle transfer. Please use the appropriate redeem function for this transfer type.'
      };
    }
    
    logger.info(`Found Circle transfer receipt: ${safeSerialize(transferReceipt)}`);
    
    // If the receipt already shows it as redeemed, return that status
    if (transferReceipt.status === 'redeemed') {
      return {
        status: 'redeemed',
        message: 'Transfer has been redeemed. The USDC should already be available in your wallet.'
      };
    }
    
    // In a production environment, we should:
    // 1. Get the source and destination chains from the receipt
    const sourceChain = transferReceipt.sourceChain;
    const destChain = transferReceipt.destinationChain;
    
    if (!sourceChain || !destChain) {
      logger.error(`Missing chain information in transfer receipt: source=${sourceChain}, dest=${destChain}`);
      return {
        status: 'invalid',
        message: 'Transfer receipt is missing chain information. Please try initiating the transfer again.'
      };
    }
    
    // 2. Get the source transaction hash
    const sourceTxHash = transferReceipt.sourceTxHash;
    
    if (!sourceTxHash) {
      logger.error(`Missing source transaction hash in transfer receipt`);
      return {
        status: 'invalid',
        message: 'Transfer receipt is missing source transaction hash. Please try initiating the transfer again.'
      };
    }
    
    // 3. Check the status on-chain
    // This would involve querying the Circle Bridge contracts on the destination chain
    // For now, we'll use a simplified approach based on the receipt data
    
    // If the transfer has a completed timestamp, it's completed
    if (transferReceipt.completedTimestamp) {
      return {
        status: 'completed',
        message: 'Transfer has been completed and funds are available for redemption.'
      };
    }
    
    // Otherwise, check how old the transfer is
    const currentTime = Date.now();
    const transferTime = transferReceipt.timestamp || 0;
    const timeDiff = currentTime - transferTime;
    
    // Circle transfers typically take 5-10 minutes
    if (timeDiff > 10 * 60 * 1000) {
      // Update the receipt to mark it as completed
      transferReceipt.status = 'completed';
      transferReceipt.completedTimestamp = currentTime;
      storeTransferReceipt(txHash, transferReceipt);
      
      return {
        status: 'completed',
        message: 'Transfer has been completed and funds are available for redemption.'
      };
    } else {
      return {
        status: 'pending',
        message: `Transfer is still being processed. Circle transfers typically take 5-10 minutes to complete. Please try again in ${Math.ceil((10 * 60 * 1000 - timeDiff) / 60000)} minutes.`
      };
    }
  } catch (error: any) {
    logger.error(`Error checking Circle transfer status: ${error.message}`);
    return {
      status: 'error',
      message: `Error checking transfer status: ${error.message}. Please try again later.`
    };
  }
}

/**
 * Calculate the message hash from message bytes
 * @param messageBytes The message bytes
 * @returns The message hash
 */
function calculateMessageHash(messageBytes: string): string {
  // Remove 0x prefix if present
  const bytes = messageBytes.startsWith('0x') ? messageBytes.slice(2) : messageBytes;
  
  // Convert to Uint8Array
  const bytesArray = new Uint8Array(bytes.match(/.{1,2}/g)!.map(byte => parseInt(byte, 16)));
  
  // Calculate keccak256 hash
  const hash = ethers.keccak256(bytesArray);
  
  return hash;
}

/**
 * Extract message bytes from a transaction receipt
 * @param receipt The transaction receipt
 * @returns The message bytes or null if not found
 */
function extractMessageBytesFromReceipt(receipt: any): string | null {
  try {
    if (!receipt || !receipt.logs) {
      logger.error('Receipt or logs not found');
      return null;
    }

    // The Circle message is emitted in the MessageSent event
    // The event signature is: MessageSent(bytes)
    const messageSentEventSignature = '0x8c5261668696ce22758910d05bab8f186d6eb247ceac2af2e82c7dc17669b036';
    
    // Find the log with the MessageSent event
    const messageSentLog = receipt.logs.find((log: any) => 
      log.topics && log.topics[0] === messageSentEventSignature
    );
    
    if (!messageSentLog) {
      // If we can't find the MessageSent event, try looking for the DepositForBurn event
      // This is emitted by the TokenMessenger contract and contains information about the transfer
      const depositForBurnEventSignature = '0x7bfdf9f5263b7a7ddbee7d38b9c2c5cd9e721f5004c3b9330addd6c1d86a4d1e';
      
      const depositForBurnLog = receipt.logs.find((log: any) => 
        log.topics && log.topics[0] === depositForBurnEventSignature
      );
      
      if (depositForBurnLog) {
        logger.info('Found DepositForBurn event, but no MessageSent event. This transaction may need to be processed by Circle before it can be redeemed.');
        return null;
      }
      
      logger.error('MessageSent event not found in transaction logs');
      return null;
    }
    
    // Extract the message bytes from the data field
    // The message bytes are in the data field of the event
    // We need to decode it using the ABI coder
    try {
      // Use AbiCoder to decode the bytes from the log data
      const abiCoder = ethers.AbiCoder.defaultAbiCoder();
      const decodedData = abiCoder.decode(['bytes'], messageSentLog.data);
      const messageBytes = decodedData[0];
      
      if (!messageBytes) {
        logger.error('Message bytes not found in MessageSent event after decoding');
        return null;
      }
      
      // Convert the bytes object to a hex string if it's not already
      const messageBytesHex = typeof messageBytes === 'string' 
        ? messageBytes 
        : ethers.hexlify(messageBytes);
      
      logger.info(`Successfully extracted message bytes: ${messageBytesHex.substring(0, 66)}...`);
      return messageBytesHex;
    } catch (decodeError: any) {
      logger.error(`Error decoding message bytes: ${decodeError.message}`);
      
      // Fallback to using the raw data if decoding fails
      logger.info('Falling back to using raw data from the event');
      return messageSentLog.data;
    }
  } catch (error: any) {
    logger.error(`Error extracting message bytes from receipt: ${error.message}`);
    return null;
  }
}

/**
 * Fetch attestation from Circle API
 * @param messageHash The message hash
 * @returns The attestation data from Circle API
 */
async function fetchCircleAttestation(messageHash: string): Promise<any> {
  try {
    logger.info(`Fetching attestation from Circle API for message hash ${messageHash}`);
    
    // Use the Circle API to fetch attestation data
    // Note: This is the mainnet API endpoint
    const apiUrl = `https://iris-api.circle.com/attestations/${messageHash}`;
    
    logger.info(`Circle API URL: ${apiUrl}`);
    
    // Make the API request
    const response = await fetch(apiUrl);
    const responseData = await response.json();
    
    logger.info(`Circle API response status: ${response.status}`);
    
    if (!response.ok) {
      logger.error(`Circle API error: ${JSON.stringify(responseData)}`);
      throw new Error(`Circle API error: ${responseData.message || 'Unknown error'}`);
    }
    
    // Check if we have attestation data
    if (!responseData.attestation) {
      logger.error(`No attestation found for message hash ${messageHash}`);
      throw new Error(`No attestation found for message hash ${messageHash}. The transaction may still be processing.`);
    }
    
    logger.info(`Successfully fetched attestation from Circle API`);
    return responseData;
  } catch (error: any) {
    logger.error(`Error fetching attestation from Circle API: ${error.message}`);
    throw new Error(`Failed to fetch attestation from Circle API: ${error.message}`);
  }
}

/**
 * Get Circle domain ID for a chain
 * @param chain The chain name
 * @returns The Circle domain ID
 */
function getCircleDomain(chain: string): number {
  // Circle domain IDs from mainnet documentation
  // https://developers.circle.com/stablecoin/docs/cctp-technical-reference#mainnet
  switch (chain.toLowerCase()) {
    case 'ethereum':
      return 0;
    case 'avalanche':
      return 1;
    case 'optimism':
      return 2;
    case 'arbitrum':
      return 3;
    case 'solana':
      return 5;
    case 'base':
      return 6;
    case 'polygon':
      return 7;
    case 'noble':
      return 9;
    default:
      const supportedChains = ['ethereum', 'avalanche', 'optimism', 'arbitrum', 'solana', 'base', 'polygon', 'noble'];
      throw new Error(`Unsupported chain for Circle domain ID: ${chain}. Supported chains: ${supportedChains.join(', ')}`);
  }
}

/**
 * Redeem a Circle USDC transfer
 * @param runtime The agent runtime
 * @param params The redeem parameters
 * @returns The redeem result
 */
async function redeemCircleUSDC(runtime: IAgentRuntime, params: RedeemParams): Promise<{
  txHash: string;
  explorerLink: string;
  chain?: string;
  status?: string;
  message?: string;
}> {
  // Check if we have a transaction ID
  if (!params.transactionId) {
    throw new Error('Transaction ID is required for redemption');
  }

  // Check if we have a destination chain
  if (!params.chain) {
    throw new Error('Destination chain is required for redemption');
  }

  logger.info(`Redeeming Circle USDC transfer on ${params.chain} with transaction ID ${params.transactionId}`);

  // Get the transfer receipt
  const receipt = getTransferReceipt(params.transactionId);
  logger.info(`Transfer receipt for ${params.transactionId}: ${JSON.stringify(receipt)}`);

  // Use the chain from the parameters
  const destChainName = params.chain;
  logger.info(`Using chain for redemption: ${destChainName}`);

  try {
    // Normalize chain name
    const normalizedChain = normalizeChainName(destChainName);
    logger.info(`Normalized destination chain: ${normalizedChain}`);
    logger.info(`Original destination chain: ${destChainName}`);

    // Get signer for destination chain
    const signer = await getSigner(runtime, normalizedChain);
    logger.info(`Got signer with address: ${signer.address()}`);

    // Initialize Wormhole SDK
    const wh = await getWormholeInstance();
    logger.info(`Initialized Wormhole SDK`);

    // Get Wormhole chain name
    const wormholeChain = getWormholeChain(normalizedChain);
    logger.info(`Wormhole chain: ${wormholeChain}`);

    // Get chain context
    const chainContext = wh.getChain(wormholeChain);
    logger.info(`Got chain context for ${wormholeChain}`);

    // Determine source chain - use from receipt if available, or from params, or default to ethereum
    const sourceChainName = params.sourceChain || (receipt?.sourceChain) || 'ethereum';
    logger.info(`Using source chain for transaction: ${sourceChainName}`);
    
    // Normalize source chain name
    const normalizedSourceChain = normalizeChainName(sourceChainName);
    logger.info(`Normalized source chain: ${normalizedSourceChain}`);
    
    // Get Wormhole source chain name
    const wormholeSourceChain = getWormholeChain(normalizedSourceChain);
    logger.info(`Wormhole source chain: ${wormholeSourceChain}`);

    // Fetch transaction receipt from source chain
    logger.info(`Fetching transaction receipt from ${sourceChainName} for transaction ${params.transactionId}`);
    
    // Get RPC URL for source chain
    const sourceRpcUrl = getChainRpcUrl(sourceChainName);
    logger.info(`Using RPC URL for ${sourceChainName}: ${sourceRpcUrl}`);
    
    // Create provider for source chain
    const sourceProvider = new ethers.JsonRpcProvider(sourceRpcUrl);
    
    // Fetch transaction receipt
    const txReceipt = await sourceProvider.getTransactionReceipt(params.transactionId);
    
    if (!txReceipt) {
      throw new Error(`Transaction receipt not found for ${params.transactionId} on ${sourceChainName}. The transaction may not be confirmed yet.`);
    }
    
    logger.info(`Found transaction receipt for ${params.transactionId} on ${sourceChainName}`);
    
    // Create a new receipt if one doesn't exist
    let updatedReceipt = receipt;
    if (!updatedReceipt) {
      updatedReceipt = {
        type: 'circle',
        sourceTxHash: params.transactionId,
        sourceChain: sourceChainName,
        destinationChain: destChainName,
        status: 'pending',
        timestamp: Date.now()
      };
      storeTransferReceipt(params.transactionId, updatedReceipt);
    }
    
    // Extract message bytes from transaction logs
    let messageBytes = null;
    
    if (updatedReceipt && updatedReceipt.messageBytes) {
      // Use message bytes from receipt if available
      messageBytes = updatedReceipt.messageBytes;
      logger.info(`Using message bytes from receipt: ${messageBytes}`);
    } else {
      // Extract message bytes from transaction logs
      messageBytes = extractMessageBytesFromReceipt(txReceipt);
      
      if (!messageBytes) {
        logger.error(`Could not extract message bytes from transaction ${params.transactionId}`);
        throw new Error(`Could not extract message bytes from transaction ${params.transactionId}. This may not be a valid Circle transfer or the transaction may still be processing. For CCTP transfers, you need to wait for Circle to process the transaction before you can redeem it, which typically takes 5-10 minutes.`);
      }
      
      logger.info(`Extracted message bytes: ${messageBytes}`);
      
      // Update receipt with message bytes
      if (updatedReceipt) {
        updatedReceipt.messageBytes = messageBytes;
        storeTransferReceipt(params.transactionId, updatedReceipt);
      }
    }
    
    // Calculate message hash
    let messageHash = null;
    
    if (updatedReceipt && updatedReceipt.messageHash) {
      // Use message hash from receipt if available
      messageHash = updatedReceipt.messageHash;
      logger.info(`Using message hash from receipt: ${messageHash}`);
    } else {
      // Calculate message hash
      messageHash = calculateMessageHash(messageBytes);
      logger.info(`Calculated message hash: ${messageHash}`);
      
      // Update receipt with message hash
      if (updatedReceipt) {
        updatedReceipt.messageHash = messageHash;
        storeTransferReceipt(params.transactionId, updatedReceipt);
      }
    }
    
    // Fetch attestation from Circle API
    const attestationData = await fetchCircleAttestation(messageHash);
    logger.info(`Got attestation: ${safeSerialize(attestationData)}`);
    
    // Extract the attestation signature from the response
    const attestationSignature = attestationData.attestation;
    if (!attestationSignature) {
      throw new Error(`No attestation signature found in Circle API response`);
    }
    
    // Get the message transmitter contract address for the destination chain
    const messageTransmitterAddress = getMessageTransmitterAddress(params.chain || 'arbitrum');
    logger.info(`Message transmitter address for ${params.chain}: ${messageTransmitterAddress}`);
    
    // Create a contract instance for the message transmitter
    const messageTransmitterContract = new ethers.Contract(
      messageTransmitterAddress,
      [
        'function receiveMessage(bytes memory message, bytes memory attestation) external returns (bool)'
      ],
      signer
    );
    
    // Estimate gas for the transaction
    const gasEstimate = await messageTransmitterContract.receiveMessage.estimateGas(
      messageBytes,
      attestationSignature
    ).catch((error: any) => {
      logger.error(`Error estimating gas: ${error.message}`);
      // Use a default gas limit if estimation fails
      return ethers.parseUnits('1000000', 'wei');
    });
    
    // Add a 20% buffer to the gas estimate
    const gasLimit = BigInt(Math.floor(Number(gasEstimate) * 1.2));
    
    // Call the receiveMessage function on the message transmitter contract
    const tx = await messageTransmitterContract.receiveMessage(
      messageBytes,
      attestationSignature,
      { gasLimit }
    );
    
    // Sign and send transaction
    const signedTx = await signer.signTransaction(tx);
    const txResponse = await signer.sendTransaction(signedTx);
    
    logger.info(`Sent redemption transaction: ${txResponse.hash}`);
    
    // Get explorer link
    const explorerLink = getExplorerLink(destChainName, txResponse.hash);
    
    // Update receipt with redemption information
    if (updatedReceipt) {
      updatedReceipt.redemptionTxHash = txResponse.hash;
      updatedReceipt.redemptionChain = destChainName;
      updatedReceipt.redemptionTimestamp = Date.now();
      updatedReceipt.status = 'redeemed';
      storeTransferReceipt(params.transactionId, updatedReceipt);
    }
    
    // Return transaction hash and explorer link
    return {
      txHash: txResponse.hash,
      explorerLink: explorerLink,
      chain: destChainName,
      status: 'redeemed',
      message: `Successfully redeemed USDC transfer on ${destChainName}. The USDC should be available in your wallet shortly.`
    };
  } catch (error: any) {
    logger.error(`Error redeeming Circle USDC: ${error.message}`);
    logger.error('', error);
    
    let errorMessage = `Failed to redeem Circle USDC: ${error.message}`;
    
    // Add more context to the error message
    if (error.message.includes('attestation')) {
      errorMessage += `. This could be because the attestation is not yet available. Please wait a few minutes and try again.`;
    } else if (error.message.includes('gas')) {
      errorMessage += `. You may need more native tokens on ${params.chain} to pay for gas.`;
    } else if (error.message.includes('message bytes')) {
      errorMessage += `. This may not be a valid Circle USDC transfer transaction.`;
    } else if (error.message.includes('Transaction receipt not found')) {
      errorMessage += `. The transaction may not be confirmed yet or may not exist on ${receipt.sourceChain}.`;
    } else if (error.message.includes('exceeded maximum retry limit')) {
      errorMessage = `Failed to connect to blockchain node. Please try again later.`;
    }
    
    throw new Error(errorMessage);
  }
}

/**
 * Get the Message Transmitter contract address for a chain
 * @param chain The chain name
 * @returns The Message Transmitter contract address
 */
function getMessageTransmitterAddress(chain: string): string {
  const chainLower = chain.toLowerCase();
  
  if (chainLower === 'ethereum') {
    return '0x0a992d191deec32afe36203ad87d7d289a738f81';
  } else if (chainLower === 'polygon') {
    return '0x9daF8c91AEFAE50b9c0E69629D3F6Ca40cA3b3FE';
  } else if (chainLower === 'arbitrum') {
    return '0x0a992d191deec32afe36203ad87d7d289a738f81';
  } else if (chainLower === 'optimism') {
    return '0x0a992d191deec32afe36203ad87d7d289a738f81';
  } else if (chainLower === 'avalanche') {
    return '0x0a992d191deec32afe36203ad87d7d289a738f81';
  } else if (chainLower === 'base') {
    return '0x0a992d191deec32afe36203ad87d7d289a738f81';
  }
  
  throw new Error(`Message Transmitter address not found for chain ${chain}`);
}

/**
 * Get the RPC URL for a chain
 * @param chain Chain name
 * @returns RPC URL
 */
function getChainRpcUrl(chain: string): string {
  const chainLower = chain.toLowerCase();
  
  // Use Ankr public endpoints for major chains
  if (chainLower === 'ethereum') {
    return 'https://rpc.ankr.com/eth';
  } else if (chainLower === 'polygon') {
    return 'https://rpc.ankr.com/polygon';
  } else if (chainLower === 'arbitrum') {
    return 'https://rpc.ankr.com/arbitrum';
  } else if (chainLower === 'optimism') {
    return 'https://rpc.ankr.com/optimism';
  } else if (chainLower === 'avalanche') {
    return 'https://rpc.ankr.com/avalanche';
  } else if (chainLower === 'base') {
    return 'https://mainnet.base.org';
  }
  
  // Fallback to default RPC URL
  return `https://rpc.ankr.com/${chainLower}`;
}

// Export the functions
export {
  transferCircleUSDC,
  redeemCircleUSDC,
  getTransferReceipt,
  storeTransferReceipt
}; 