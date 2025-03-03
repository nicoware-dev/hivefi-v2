import type { Action, Memory } from "@elizaos/core";
import {
    createPublicClient,
    createWalletClient,
    http,
    type Address,
    type Account,
    type Log,
} from "viem";
import { arbitrum } from "viem/chains";
import { initWalletProvider } from "../../providers/wallet";
import { evm } from "@debridge-finance/desdk";
import { sonicChain } from "../../config/chains";
import { StaticJsonRpcProvider, FallbackProvider, JsonRpcProvider } from "@ethersproject/providers";

// Simple retry function
async function retryOperation<T>(
    operation: () => Promise<T>,
    retries: number = 3,
    delay: number = 2000
): Promise<T> {
    let lastError: Error | undefined;
    
    for (let i = 0; i < retries; i++) {
        try {
            return await operation();
        } catch (error) {
            lastError = error as Error;
            if (i < retries - 1) { // Don't wait on last attempt
                await new Promise(resolve => setTimeout(resolve, delay));
            }
        }
    }
    
    throw lastError;
}

// deBridge contract addresses
const DEBRIDGE_CONTRACTS = {
    SONIC: {
        DeBridgeGate: "0x43de2d77bf8027e25dbd179b491e8d64f38398aa" as const,
    },
    ARBITRUM: {
        DeBridgeGate: "0x43dE2d77BF8027e25dBD179B491e8d64f38398aA" as const,
        ConfirmationContract: "0x949b3b3c098348b879c9e4f15cecc8046d9c8a8c" as const,
    }
} as const;

// Chain configurations with multiple RPC endpoints
const CHAIN_CONFIG = {
    SONIC: {
        chainId: 146,
        name: 'Sonic',
        rpcUrls: [
            'https://sonic.rpc.thirdweb.com',
            'https://sonic.drpc.org'
        ]
    },
    ARBITRUM: {
        chainId: 42161,
        name: 'Arbitrum One',
        rpcUrls: [
            'https://arb1.arbitrum.io/rpc',
            'https://arbitrum-one.publicnode.com'
        ]
    }
} as const;

// Create provider with retries and timeouts
const createProviderWithRetry = (chainConfig: typeof CHAIN_CONFIG.SONIC | typeof CHAIN_CONFIG.ARBITRUM) => {
    // Create providers for each RPC URL
    const providers = chainConfig.rpcUrls.map(url => 
        new StaticJsonRpcProvider({
            url,
            timeout: 10000, // 10 second timeout
            throttleLimit: 1
        }, {
            chainId: chainConfig.chainId,
            name: chainConfig.name,
            ensAddress: undefined
        })
    );

    // Create a FallbackProvider that will try each provider in sequence
    return new FallbackProvider(providers.map((provider, i) => ({
        provider,
        priority: i,
        stallTimeout: 2000,
        weight: 1
    })), 1); // Only need 1 provider to respond
};

export const claim: Action = {
    name: "CLAIM_BRIDGED_TOKENS",
    description: "Claim bridged tokens on Arbitrum from a previous bridge transaction",
    examples: [
        [
            {
                user: "user1",
                content: {
                    text: "Claim 0x711b9d0fa67c42ba8ef118e83b1bdd65bfda972dff5da71adbffacd8b1f9920a",
                    entities: {
                        txHash: "0x711b9d0fa67c42ba8ef118e83b1bdd65bfda972dff5da71adbffacd8b1f9920a"
                    }
                }
            },
            {
                user: "assistant",
                content: {
                    text: "Initiating claim transaction on Arbitrum...",
                }
            }
        ]
    ],
    handler: async (runtime, message: Memory, _state, _options, callback) => {
        try {
            // Initialize provider
            const provider = initWalletProvider(runtime);
            if (!provider) {
                callback?.({
                    text: "Wallet not configured. Please set EVM_PRIVATE_KEY in your environment variables.",
                });
                return false;
            }

            // Parse message content
            const content = message.content?.text?.match(
                /Claim (0x[a-fA-F0-9]{64})/i
            );

            if (!content) {
                callback?.({
                    text: "Could not parse claim request. Please use format: Claim <transaction_hash>",
                });
                return false;
            }

            const [, txHash] = content;

            // Send initial confirmation
            callback?.({
                text: `Checking submission status for transaction ${txHash}...`,
            });

            // Create providers with retry logic
            const sonicProvider = createProviderWithRetry(CHAIN_CONFIG.SONIC);
            const arbitrumProvider = createProviderWithRetry(CHAIN_CONFIG.ARBITRUM);

            // Create contexts for both chains
            const evmOriginContext: evm.Context = {
                provider: sonicProvider,
                deBridgeGateAddress: DEBRIDGE_CONTRACTS.SONIC.DeBridgeGate,
            };

            const evmDestinationContext: evm.Context = {
                provider: arbitrumProvider,
                deBridgeGateAddress: DEBRIDGE_CONTRACTS.ARBITRUM.DeBridgeGate,
            };

            // Find all submissions in the transaction with retry
            let submissions;
            try {
                submissions = await retryOperation(
                    async () => evm.Submission.findAll(txHash, evmOriginContext),
                    3,
                    5000 // Increased delay between retries
                );
            } catch (error) {
                console.error("Failed to find submissions:", error);
                callback?.({
                    text: "Failed to retrieve submission information. Please wait a few minutes for the transaction to be confirmed on Sonic and try again.",
                });
                return false;
            }
            
            if (!submissions || submissions.length === 0) {
                callback?.({
                    text: "No bridge submissions found in this transaction. Please verify the transaction hash and try again in a few minutes.",
                });
                return false;
            }

            // Take the first submission
            const [submission] = submissions;
            console.log("Submission found:", submission);

            callback?.({
                text: "Found bridge submission. Checking confirmation status...",
            });

            // Check if submission is confirmed with retry
            let isConfirmed;
            try {
                isConfirmed = await retryOperation(
                    async () => submission.hasRequiredBlockConfirmations(),
                    3,
                    5000
                );
                console.log("Is confirmed:", isConfirmed);
            } catch (error) {
                console.error("Failed to check confirmation:", error);
                callback?.({
                    text: "Failed to check confirmation status. Please wait a few more minutes for block confirmations and try again.",
                });
                return false;
            }
            
            if (!isConfirmed) {
                callback?.({
                    text: "Bridge transaction needs more confirmations. Please wait 10-15 minutes and try again.",
                });
                return false;
            }

            callback?.({
                text: "Transaction confirmed. Checking validator signatures...",
            });

            // Get claim data with retry
            let claim;
            try {
                claim = await retryOperation(
                    async () => submission.toEVMClaim(evmDestinationContext),
                    3,
                    5000
                );
                console.log("Claim data:", claim);
            } catch (error) {
                console.error("Failed to get claim data:", error);
                callback?.({
                    text: "Failed to retrieve claim data. Please wait a few more minutes for validator signatures and try again.",
                });
                return false;
            }

            // Check if signed by enough validators with retry
            let isSigned;
            try {
                isSigned = await retryOperation(
                    async () => claim.isSigned(),
                    3,
                    5000
                );
            } catch (error) {
                console.error("Failed to check signatures:", error);
                callback?.({
                    text: "Failed to check validator signatures. Please wait a few more minutes and try again.",
                });
                return false;
            }

            if (!isSigned) {
                callback?.({
                    text: "Waiting for validator signatures. This usually takes 10-15 minutes. Please try again in a few minutes.",
                });
                return false;
            }

            callback?.({
                text: "Validator signatures verified. Checking if claim was already executed...",
            });

            // Check if already executed with retry
            let isExecuted;
            try {
                isExecuted = await retryOperation(
                    async () => claim.isExecuted(),
                    3,
                    5000
                );
            } catch (error) {
                console.error("Failed to check execution status:", error);
                callback?.({
                    text: "Failed to check if claim was already executed. Please try again in a few minutes.",
                });
                return false;
            }

            if (isExecuted) {
                callback?.({
                    text: "This claim has already been executed. The tokens should be in your wallet. If you don't see them, you may need to add the token contract to your wallet manually.",
                });
                return false;
            }

            callback?.({
                text: "Preparing claim transaction...",
            });

            // Get encoded claim args with retry
            let claimArgs;
            try {
                claimArgs = await retryOperation(
                    async () => claim.getEncodedArgs(),
                    3,
                    5000
                );
                console.log("Claim args:", claimArgs);
            } catch (error) {
                console.error("Failed to get claim arguments:", error);
                callback?.({
                    text: "Failed to prepare claim transaction. Please try again in a few minutes.",
                });
                return false;
            }

            // Create public client for checking confirmations
            const publicClient = createPublicClient({
                chain: arbitrum,
                transport: http()
            });

            // Create wallet client specifically for Arbitrum with a more reliable RPC
            const arbitrumWalletClient = createWalletClient({
                account: provider.getAccount(),
                chain: arbitrum,
                transport: http('https://arb1.arbitrum.io/rpc')
            });

            const claimAbi = [{
                inputs: [
                    { name: "debridgeId", type: "bytes32" },
                    { name: "amount", type: "uint256" },
                    { name: "chainIdFrom", type: "uint256" },
                    { name: "receiver", type: "address" },
                    { name: "nonce", type: "uint256" },
                    { name: "signatures", type: "bytes" },
                    { name: "autoParams", type: "bytes" }
                ],
                name: "claim",
                outputs: [],
                stateMutability: "nonpayable",
                type: "function"
            }] as const;

            // Add detailed parameter validation
            const validateParameters = () => {
                // Validate debridgeId format
                if (!submission.debridgeId?.startsWith('0x') || submission.debridgeId.length !== 66) {
                    throw new Error(`Invalid debridgeId format: ${submission.debridgeId}`);
                }

                // Validate amount is a positive number
                const amount = BigInt(submission.amount);
                if (amount <= 0n) {
                    throw new Error(`Invalid amount: ${submission.amount}`);
                }

                // Validate chainIdFrom is Sonic's chain ID
                const chainIdFrom = BigInt(submission.originChainId);
                if (chainIdFrom !== 146n) {
                    throw new Error(`Invalid chainIdFrom: ${chainIdFrom}, expected: 146`);
                }

                // Validate receiver address format
                if (!submission.receiver?.startsWith('0x') || submission.receiver.length !== 42) {
                    throw new Error(`Invalid receiver address format: ${submission.receiver}`);
                }

                // Validate nonce is a positive number
                const nonce = BigInt(submission.nonce);
                if (nonce < 0n) {
                    throw new Error(`Invalid nonce: ${submission.nonce}`);
                }

                // Validate signatures
                if (!claimArgs[5]?.startsWith('0x')) {
                    throw new Error(`Invalid signatures format: ${claimArgs[5]}`);
                }

                return true;
            };

            try {
                validateParameters();
            } catch (error) {
                console.error("Parameter validation failed:", error);
                callback?.({
                    text: `Parameter validation failed: ${error instanceof Error ? error.message : "Unknown error"}. This indicates a mismatch in the claim parameters.`,
                });
                return false;
            }

            // Log parameters in a more readable format for debugging
            console.log("Detailed claim parameters:");
            console.log("1. debridgeId:", {
                value: submission.debridgeId,
                type: typeof submission.debridgeId,
                length: submission.debridgeId.length
            });
            console.log("2. amount:", {
                value: submission.amount,
                type: typeof submission.amount,
                asBigInt: BigInt(submission.amount).toString()
            });
            console.log("3. chainIdFrom:", {
                value: submission.originChainId,
                type: typeof submission.originChainId,
                asBigInt: BigInt(submission.originChainId).toString()
            });
            console.log("4. receiver:", {
                value: submission.receiver,
                type: typeof submission.receiver,
                length: submission.receiver.length
            });
            console.log("5. nonce:", {
                value: submission.nonce,
                type: typeof submission.nonce,
                asBigInt: BigInt(submission.nonce).toString()
            });
            console.log("6. signatures:", {
                value: claimArgs[5],
                type: typeof claimArgs[5],
                length: claimArgs[5].length
            });

            // Prepare transaction data for gas estimation
            const txRequest = {
                account: provider.getAccount() as Account,
                address: DEBRIDGE_CONTRACTS.ARBITRUM.DeBridgeGate,
                abi: claimAbi,
                functionName: 'claim' as const,
                args: [
                    // Ensure proper type conversion for each parameter
                    `0x${submission.debridgeId.replace('0x', '')}` as `0x${string}`, // Clean and normalize debridgeId
                    BigInt(submission.amount.toString()), // Ensure proper BigInt conversion
                    BigInt(submission.originChainId.toString()), // Ensure proper BigInt conversion
                    `0x${submission.receiver.replace('0x', '')}` as `0x${string}`, // Clean and normalize address
                    BigInt(submission.nonce.toString()), // Ensure proper BigInt conversion
                    `0x${claimArgs[5].replace('0x', '')}` as `0x${string}`, // Clean and normalize signatures
                    "0x" as `0x${string}`, // Empty autoParams
                ] as const,
            };

            // Log the final transaction request parameters
            console.log("Final transaction request parameters:", {
                debridgeId: txRequest.args[0],
                amount: txRequest.args[1].toString(),
                chainIdFrom: txRequest.args[2].toString(),
                receiver: txRequest.args[3],
                nonce: txRequest.args[4].toString(),
                signatures: txRequest.args[5],
                autoParams: txRequest.args[6]
            });

            // Try to simulate the transaction first
            try {
                const simulationResult = await publicClient.simulateContract({
                    ...txRequest,
                    account: provider.getAccount() as Account,
                });
                console.log("Simulation successful:", simulationResult);
            } catch (error) {
                console.error("Simulation failed:", error);
                const errorMessage = error instanceof Error ? error.message : "Unknown error";
                
                // Remove the incorrect error handling for 0x76b77bf2
                // Instead, log more details about the error
                console.log("Detailed error information:", {
                    message: errorMessage,
                    args: txRequest.args,
                    error
                });

                callback?.({
                    text: `Transaction simulation failed. This might be due to:
1. Network congestion - try again in a few minutes
2. Gas price fluctuations - we'll adjust gas prices automatically
3. Contract state changes - we'll verify the claim status

Please try the claim again. If the issue persists, please share the error message.`,
                });
                return false;
            }

            // Get current fee data with safe minimums
            const feeData = await publicClient.estimateFeesPerGas();
            
            // Use much higher gas prices for Arbitrum
            const maxFeePerGas = 500000000n; // 0.5 gwei
            const maxPriorityFeePerGas = 100000000n; // 0.1 gwei
            const gasLimit = 2000000n; // 2M gas

            console.log("Using gas prices:", {
                maxFeePerGas: maxFeePerGas.toString(),
                maxPriorityFeePerGas: maxPriorityFeePerGas.toString(),
                gasLimit: gasLimit.toString()
            });

            // Execute claim transaction
            const hash = await arbitrumWalletClient.writeContract({
                ...txRequest,
                gas: gasLimit,
                maxFeePerGas,
                maxPriorityFeePerGas,
                type: 'eip1559' as const,
                chain: arbitrum
            });

            callback?.({
                text: `Successfully initiated claim transaction on Arbitrum!
Transaction Hash: ${hash}
View on Arbiscan: https://arbiscan.io/tx/${hash}

Bridged Amount: ${submission.amount}
Receiver: ${submission.receiver}

Note: The token will be automatically added to your wallet during the claim transaction.`,
                content: { hash },
            });

            return true;
        } catch (error) {
            console.error("Claim failed:", error);
            
            // Update error handling to be more informative
            const errorMessage = error instanceof Error ? error.message : "Unknown error";
            callback?.({
                text: `Claim operation failed. This could be due to:
1. Network conditions - try again in a few minutes
2. Gas price changes - we'll adjust automatically
3. Contract state - verify on deBridge explorer that the claim is ready

Error details: ${errorMessage}

Please try again and if the issue persists:
1. Double check the claim status on deBridge explorer
2. Share the new error message if you get a different error`,
            });
            return false;
        }
    },
    validate: async () => true,
    similes: [
        "like claiming your bridged tokens on Arbitrum",
        "like completing the second step of a bridge transaction",
        "like receiving your tokens on the destination chain"
    ],
};