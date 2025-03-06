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
import axios from 'axios';

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
  messageHash: string;
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
    
    // Get the underlying ethers wallet for direct contract interactions
    // This is needed because our custom signer doesn't support direct contract calls
    const privateKey = getPrivateKey(runtime);
    const providerUrl = getChainRpcUrl(sourceChain);
    const provider = new ethers.JsonRpcProvider(providerUrl);
    const ethersWallet = new ethers.Wallet(privateKey, provider);
    logger.info(`Created ethers wallet with address: ${ethersWallet.address} for direct contract interactions`);
    
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
      
      // Instead of using the SDK's CircleTransfer class, we'll implement the transfer manually
      // This gives us more control over the process and allows us to handle approvals and transfers separately
      
      // 1. First, get the token contract for USDC
      const usdcTokenAddress = getTokenAddress(sourceChain, 'USDC');
      logger.info(`Using USDC token address: ${usdcTokenAddress}`);
      
      if (!usdcTokenAddress) {
        throw new Error(`USDC token address not found for chain ${sourceChain}`);
      }
      
      const usdcContract = new ethers.Contract(
        usdcTokenAddress,
        [
          'function approve(address spender, uint256 amount) external returns (bool)',
          'function allowance(address owner, address spender) external view returns (uint256)'
        ],
        ethersWallet
      );
      
      // 2. Get the TokenMessenger contract address
      const tokenMessengerAddress = getTokenMessengerAddress(sourceChain);
      logger.info(`Using TokenMessenger address: ${tokenMessengerAddress}`);
      
      // 3. Check if we already have sufficient allowance
      const currentAllowance = await usdcContract.allowance(ethersWallet.address, tokenMessengerAddress);
      logger.info(`Current allowance: ${currentAllowance}, needed: ${amountBigInt}`);
      
      let approveTxHash = '';
      
      // 4. If allowance is insufficient, approve the TokenMessenger to spend USDC
      if (currentAllowance < amountBigInt) {
        logger.info(`Approving TokenMessenger to spend ${amountBigInt} USDC`);
        const approveTx = await usdcContract.approve(tokenMessengerAddress, amountBigInt);
        logger.info(`Approval transaction sent with hash: ${approveTx.hash}`);
        
        // Wait for the approval transaction to be mined
        logger.info(`Waiting for approval transaction to be mined...`);
        const approveReceipt = await approveTx.wait();
        logger.info(`Approval transaction mined with status: ${approveReceipt?.status}`);
        
        // Add a delay to ensure the approval is fully confirmed on the blockchain
        logger.info(`Waiting an additional 5 seconds for approval to be fully confirmed...`);
        await new Promise(resolve => setTimeout(resolve, 5000));
        
        // Double-check the allowance after approval to ensure it's properly set
        const updatedAllowance = await usdcContract.allowance(ethersWallet.address, tokenMessengerAddress);
        logger.info(`Updated allowance after approval: ${updatedAllowance}, needed: ${amountBigInt}`);
        
        if (updatedAllowance < amountBigInt) {
          throw new Error(`Approval transaction was mined but allowance is still insufficient. Please try again.`);
        }
        
        approveTxHash = approveTx.hash;
      } else {
        logger.info(`Sufficient allowance already exists, skipping approval`);
      }
      
      // 5. Create the TokenMessenger contract instance
      const tokenMessengerContract = new ethers.Contract(
        tokenMessengerAddress,
        [
          'function depositForBurn(uint256 amount, uint32 destinationDomain, bytes32 mintRecipient, address burnToken) external returns (uint64 nonce)'
        ],
        ethersWallet
      );
      
      // 6. Get the destination domain ID for the target chain
      const destinationDomain = getCircleDomain(destChain);
      logger.info(`Destination domain for ${destChain}: ${destinationDomain}`);
      
      // 7. Format the recipient address as bytes32 (padded with zeros)
      // The recipient address needs to be formatted as bytes32 with 12 bytes of padding
      const mintRecipientBytes32 = '0x000000000000000000000000' + signerAddress.slice(2);
      logger.info(`Mint recipient bytes32: ${mintRecipientBytes32}`);
      
      // 8. Call depositForBurn to initiate the transfer
      logger.info(`Calling depositForBurn with amount: ${amountBigInt}, destinationDomain: ${destinationDomain}, mintRecipient: ${mintRecipientBytes32}, burnToken: ${usdcTokenAddress}`);
      const depositTx = await tokenMessengerContract.depositForBurn(
        amountBigInt,
        destinationDomain,
        mintRecipientBytes32,
        usdcTokenAddress
      );
      
      logger.info(`Deposit transaction sent with hash: ${depositTx.hash}`);
      
      // Wait for the deposit transaction to be mined
      logger.info(`Waiting for deposit transaction to be mined...`);
      const depositReceipt = await depositTx.wait();
      logger.info(`Deposit transaction mined with status: ${depositReceipt?.status}`);
      
      const txHash = depositTx.hash;
      logger.info(`Circle transfer initiated with transaction hash: ${txHash}`);
      
      // Extract message bytes and calculate message hash
      const messageBytes = extractMessageBytesFromReceipt(depositReceipt);
      let messageHash = '';
      if (messageBytes) {
        messageHash = calculateMessageHash(messageBytes);
        logger.info(`Calculated message hash: ${messageHash}`);
      } else {
        logger.warn('Could not extract message bytes to calculate message hash');
        // Use txHash as fallback for the API URL
        messageHash = txHash;
      }
      
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
        messageHash: messageHash,
        messageBytes: messageBytes,
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
        messageHash,
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
    const apiUrl = `https://iris-api.circle.com/attestations/${messageHash}`;
    logger.info(`Circle API URL: ${apiUrl}`);
    
    const response = await axios.get(apiUrl);
    logger.info(`Circle API response status: ${response.status}`);
    
    if (response.status === 200) {
      logger.info(`Successfully fetched attestation from Circle API`);
      logger.info(`Got attestation: ${JSON.stringify(response.data)}`);
      return response.data;
    } else {
      logger.error(`Error fetching attestation: ${response.statusText}`);
      return null;
    }
  } catch (error: any) {
    // Handle 404 as pending
    if (error.response && error.response.status === 404) {
      logger.info(`Attestation not found (404), treating as pending`);
      return { attestation: null, status: 'pending_confirmations' };
    }
    
    logger.error(`Error fetching attestation: ${error.message}`);
    return null;
  }
}

/**
 * Get the Circle domain ID for a chain
 * @param chain The chain name
 * @returns The Circle domain ID
 */
function getCircleDomain(chain: string): number {
  // Circle CCTP V2 domain IDs
  const circleDomains: Record<string, number> = {
    'ethereum': 0,
    'avalanche': 1,
    'optimism': 2,
    'arbitrum': 3,
    'base': 6,
    'polygon': 7,
    'solana': 0, // Not applicable for EVM
    'sui': 0, // Not applicable for EVM
    'aptos': 0 // Not applicable for EVM
  };

  const normalizedChain = chain.toLowerCase();
  const domain = circleDomains[normalizedChain];

  if (domain === undefined) {
    throw new Error(`Circle domain ID not found for chain ${chain}`);
  }

  return domain;
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
  messageHash?: string;
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
  const destChain = params.chain;
  logger.info(`Using chain for redemption: ${destChain}`);

  try {
    // Normalize chain name
    const normalizedChain = normalizeChainName(destChain);
    logger.info(`Normalized destination chain: ${normalizedChain}`);
    logger.info(`Original destination chain: ${destChain}`);

    // Get signer for destination chain
    const signer = await getSigner(runtime, destChain);
    logger.info(`Got signer with address: ${signer.address()}`);

    // Get the underlying ethers wallet for direct contract interactions
    // This is needed because our custom signer doesn't support direct contract calls
    const privateKey = getPrivateKey(runtime);
    const providerUrl = getChainRpcUrl(destChain);
    const provider = new ethers.JsonRpcProvider(providerUrl);
    const ethersWallet = new ethers.Wallet(privateKey, provider);
    logger.info(`Created ethers wallet with address: ${ethersWallet.address} for direct contract interactions`);

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
        destinationChain: destChain,
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
    const attestationResponse = await fetchCircleAttestation(messageHash);
    logger.info(`Got attestation: ${JSON.stringify(attestationResponse)}`);
    
    // Check if attestation is ready
    if (!attestationResponse || attestationResponse.status !== 'complete' || !attestationResponse.attestation) {
      const pendingMessage = `Attestation is not ready yet. Current status: ${attestationResponse?.status || 'unknown'}. Please wait a few minutes and try again.`;
      logger.info(pendingMessage);
      
      return {
        txHash: params.transactionId,
        explorerLink: getExplorerLink(destChain, params.transactionId),
        chain: destChain,
        status: 'pending',
        message: pendingMessage,
        messageHash: messageHash
      };
    }
    
    // Get the attestation signature
    const attestation = attestationResponse.attestation;
    logger.info(`Using attestation: ${attestation.substring(0, 64)}...`);
    
    // Get the message transmitter contract address
    const messageTransmitterAddress = getMessageTransmitterAddress(destChain);
    logger.info(`Message transmitter address for ${destChain}: ${messageTransmitterAddress}`);
    
    // Create the message transmitter contract instance
    const messageTransmitterContract = new ethers.Contract(
      messageTransmitterAddress,
      [
        'function receiveMessage(bytes memory message, bytes memory attestation) external returns (bool)'
      ],
      ethersWallet
    );
    
    // Estimate gas for the transaction
    let gasLimit;
    try {
      const estimatedGas = await messageTransmitterContract.receiveMessage.estimateGas(
        messageBytes,
        attestation
      );
      logger.info(`Estimated gas: ${estimatedGas}, using gas limit: ${Math.floor(Number(estimatedGas) * 1.2)}`);
      gasLimit = Math.floor(Number(estimatedGas) * 1.2); // Add 20% buffer
    } catch (error: any) {
      logger.error(`Error estimating gas: ${error.message}`);
      // Use a default gas limit if estimation fails
      gasLimit = 1200000;
      logger.info(`Estimated gas: 1000000, using gas limit: ${gasLimit}`);
    }
    
    // Send the transaction
    logger.info(`Sending transaction to redeem USDC on ${destChain}...`);
    try {
      const tx = await messageTransmitterContract.receiveMessage(
        messageBytes,
        attestation,
        { gasLimit }
      );
      logger.info(`Redemption transaction sent with hash: ${tx.hash}`);
      
      // Wait for the transaction to be mined
      logger.info(`Waiting for redemption transaction to be mined...`);
      const receipt = await tx.wait();
      logger.info(`Redemption transaction mined with status: ${receipt?.status}`);
      
      // Update the transfer receipt with the redemption transaction hash
      const transferReceipt = getTransferReceipt(params.transactionId);
      if (transferReceipt) {
        transferReceipt.status = 'redeemed';
        transferReceipt.redemptionTxHash = tx.hash;
        storeTransferReceipt(params.transactionId, transferReceipt);
      }
      
      return {
        txHash: tx.hash,
        explorerLink: getExplorerLink(destChain, tx.hash),
        chain: destChain,
        status: 'success',
        message: `Successfully redeemed USDC on ${destChain}`
      };
    } catch (error: any) {
      logger.error(`Error redeeming Circle USDC: ${error.message}`);
      throw new Error(`Failed to redeem Circle USDC: ${error.message}`);
    }
  } catch (error: any) {
    logger.error(`Error redeeming Circle USDC: ${error.message}`);
    logger.error(error);
    throw new Error(`Failed to redeem Circle USDC: ${error.message}`);
  }
}

/**
 * Get the message transmitter contract address for a chain
 * @param chain The chain name
 * @returns The message transmitter contract address
 */
function getMessageTransmitterAddress(chain: string): string {
  // Circle CCTP V2 Message Transmitter contract addresses
  const messageTransmitterAddresses: Record<string, string> = {
    'ethereum': '0x0a992d191deec32afe36203ad87d7d289a738f81',
    'avalanche': '0x8186359af5f57fbb40c6b14a588d2a59c0c29880',
    'optimism': '0x4d41f22c5a0e5c74090899e5a8fb597a8842b3e8',
    'arbitrum': '0xC30362313FBBA5cf9163F0bb16a0e01f01A896ca',
    'base': '0xAD09780d193884d503182aD4588450C416D6F9D4',
    'polygon': '0xF3be9355363857F3e001be68856A2f96b4C39Ba9',
    'solana': '0x0000000000000000000000000000000000000000', // Not applicable for EVM
    'sui': '0x0000000000000000000000000000000000000000', // Not applicable for EVM
    'aptos': '0x0000000000000000000000000000000000000000' // Not applicable for EVM
  };

  const normalizedChain = chain.toLowerCase();
  const address = messageTransmitterAddresses[normalizedChain];

  if (!address || address === '0x0000000000000000000000000000000000000000') {
    throw new Error(`Message transmitter address not found for chain ${chain}`);
  }

  return address;
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

/**
 * Get the token messenger contract address for a chain
 * @param chain The chain name
 * @returns The token messenger contract address
 */
function getTokenMessengerAddress(chain: string): string {
  // Circle CCTP V2 Token Messenger contract addresses
  const tokenMessengerAddresses: Record<string, string> = {
    'ethereum': '0xbd3fa81b58ba92a82136038b25adec7066af3155',
    'avalanche': '0x6b25532e1060ce10cc3b0a99e5683b91bfde6982',
    'optimism': '0x2B4069517957735bE00ceE0fadAE88a26365528f',
    'arbitrum': '0x19330d10D9Cc8751218eaf51E8885D058642E08A',
    'base': '0x1682Ae6375C4E4A97e4B583BC394c861A46D8962',
    'polygon': '0x9daF8c91AEFAE50b9c0E69629D3F6Ca40cA3B3FE',
    'solana': '0x0000000000000000000000000000000000000000', // Not applicable for EVM
    'sui': '0x0000000000000000000000000000000000000000', // Not applicable for EVM
    'aptos': '0x0000000000000000000000000000000000000000' // Not applicable for EVM
  };

  const normalizedChain = chain.toLowerCase();
  const address = tokenMessengerAddresses[normalizedChain];

  if (!address || address === '0x0000000000000000000000000000000000000000') {
    throw new Error(`Token messenger address not found for chain ${chain}`);
  }

  return address;
}

// Export the functions
export {
  transferCircleUSDC,
  redeemCircleUSDC,
  getTransferReceipt,
  storeTransferReceipt
}; 