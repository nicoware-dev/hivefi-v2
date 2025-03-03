import type { Action, Memory } from "@elizaos/core";
import {
    parseEther,
    encodeFunctionData,
    createPublicClient,
    http,
    erc20Abi,
} from "viem";
import { sonicChain } from "../../config/chains";
import { initWalletProvider } from "../../providers/wallet";

// Contract addresses
const BEETS_VAULT_V2_ADDRESS = "0xBA12222222228d8Ba445958a75a0704d566BF2C8";
const WS_STS_POOL_ID = "0x374641076b68371e69d03c417dac3e5f236c32fa000000000000000000000006";
const WS_TOKEN = "0x039e2fb66102314ce7b64ce5ce3e5183bc94ad38";
const STS_TOKEN = "0xe5da20f15420ad15de0fa650600afc998bbe3955";

// ABI for the joinPool function
const JOIN_POOL_ABI = {
    inputs: [
        { internalType: "bytes32", name: "poolId", type: "bytes32" },
        { internalType: "address", name: "sender", type: "address" },
        { internalType: "address", name: "recipient", type: "address" },
        {
            components: [
                { internalType: "contract IAsset[]", name: "assets", type: "address[]" },
                { internalType: "uint256[]", name: "maxAmountsIn", type: "uint256[]" },
                { internalType: "bytes", name: "userData", type: "bytes" },
                { internalType: "bool", name: "fromInternalBalance", type: "bool" }
            ],
            internalType: "struct IVault.JoinPoolRequest",
            name: "request",
            type: "tuple"
        }
    ],
    name: "joinPool",
    outputs: [],
    stateMutability: "payable",
    type: "function"
} as const;

export const addLiquidity: Action = {
    name: "ADD_LIQUIDITY_BEETS",
    description: "Add liquidity to the wS-stS pool on Beets using S or wS",
    examples: [
        [
            {
                user: "user1",
                content: {
                    text: "Add liquidity to Beets wS-stS pool with 0.1 S",
                    entities: {
                        amount: "0.1",
                        token: "S",
                    },
                },
            },
            {
                user: "assistant",
                content: {
                    text: "I'll help you add liquidity to the wS-stS pool. I'll first wrap your S tokens and then add them to the pool.",
                },
            },
        ],
    ],
    handler: async (runtime, message: Memory, state, options, callback) => {
        // Extract amount and token from message
        const content = message.content?.text?.match(
            /Add liquidity to Beets (?:wS-stS|stS-wS) pool with ([\d.]+) (S|wS)/i
        );
        if (!content) {
            callback?.({
                text: "Could not parse input. Please use format: Add liquidity to Beets wS-stS pool with <amount> <S|wS>",
            });
            return false;
        }

        const [, amount, tokenSymbol] = content;
        const amountIn = parseEther(amount);
        const isNativeToken = tokenSymbol.toUpperCase() === 'S';

        try {
            // Initialize wallet provider
            const provider = initWalletProvider(runtime);
            if (!provider) {
                callback?.({
                    text: "EVM wallet not configured. Please set EVM_PRIVATE_KEY in your environment variables.",
                });
                return false;
            }

            const publicClient = createPublicClient({
                chain: sonicChain,
                transport: http(),
            });

            const walletClient = provider.getWalletClient();
            if (!walletClient) {
                callback?.({
                    text: "Failed to initialize wallet client.",
                });
                return false;
            }

            const account = walletClient.account;
            if (!account) {
                callback?.({
                    text: "No account found in wallet client.",
                });
                return false;
            }

            // If using native S, wrap it first
            if (isNativeToken) {
                callback?.({
                    text: `Wrapping ${amount} S to wS...`,
                });

                const wrapHash = await walletClient.sendTransaction({
                    chain: sonicChain,
                    account,
                    to: WS_TOKEN,
                    value: amountIn,
                });

                await publicClient.waitForTransactionReceipt({
                    hash: wrapHash,
                });

                callback?.({
                    text: `Successfully wrapped ${amount} S to wS. Now proceeding with adding liquidity...`,
                });
            }

            // Check and approve wS token if needed
            const allowance = await publicClient.readContract({
                address: WS_TOKEN,
                abi: erc20Abi,
                functionName: "allowance",
                args: [account.address, BEETS_VAULT_V2_ADDRESS],
            });

            if (allowance < amountIn) {
                callback?.({
                    text: "Approving wS token spend...",
                });

                const approvalHash = await walletClient.writeContract({
                    address: WS_TOKEN,
                    abi: erc20Abi,
                    functionName: "approve",
                    args: [BEETS_VAULT_V2_ADDRESS, amountIn],
                    chain: sonicChain,
                    account,
                });

                await publicClient.waitForTransactionReceipt({
                    hash: approvalHash,
                });

                callback?.({
                    text: "wS token approval confirmed. Proceeding with adding liquidity...",
                });
            }

            // Prepare joinPool parameters based on successful transaction
            const assets = [
                WS_TOKEN,
                "0x374641076b68371e69d03c417dac3e5f236c32fa", // BPT token
                STS_TOKEN
            ] as const;
            
            // Construct userData bytes directly
            // Format: 0x + kind (uint8) + amountsIn.length (uint256) + amountsIn[0] (uint256) + amountsIn[1] (uint256)
            const userData = ("0x" + 
                "0000000000000000000000000000000000000000000000000000000000000001" + // kind = 1 (EXACT_TOKENS_IN_FOR_BPT_OUT)
                "0000000000000000000000000000000000000000000000000000000000000002" + // amountsIn.length = 2
                amountIn.toString(16).padStart(64, "0") +                             // amountsIn[0] = amountIn
                "0000000000000000000000000000000000000000000000000000000000000000"   // amountsIn[1] = 0
            ) as `0x${string}`;

            // Encode joinPool call matching successful transaction
            const data = encodeFunctionData({
                abi: [JOIN_POOL_ABI],
                functionName: "joinPool",
                args: [
                    WS_STS_POOL_ID,
                    account.address,
                    account.address,
                    {
                        assets,
                        maxAmountsIn: [amountIn, 0n, 0n],
                        userData,
                        fromInternalBalance: false,
                    },
                ],
            });

            // Estimate gas
            const gasEstimate = await publicClient.estimateGas({
                account: account.address,
                to: BEETS_VAULT_V2_ADDRESS,
                data,
            });

            // Add 20% buffer to gas estimate
            const gasLimit = (gasEstimate * 120n) / 100n;

            callback?.({
                text: `Adding ${amount} ${isNativeToken ? 'wS (wrapped from S)' : 'wS'} as liquidity to the wS-stS pool...`,
            });

            // Execute transaction
            const hash = await walletClient.sendTransaction({
                chain: sonicChain,
                account,
                to: BEETS_VAULT_V2_ADDRESS,
                data,
                gas: gasLimit,
            });

            callback?.({
                text: `Successfully added liquidity to the wS-stS pool.\nTransaction Hash: ${hash}\nView on Explorer: https://sonicscan.org/tx/${hash}`,
                content: { hash },
            });

            return true;
        } catch (error) {
            console.error("Failed to add liquidity:", error);
            if (error instanceof Error) {
                console.error("Error details:", error.message, error.stack);
            }

            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            let userMessage = `Failed to add liquidity: `;

            if (errorMessage.includes("insufficient funds")) {
                userMessage += "Insufficient funds for gas fees or token amount.";
            } else {
                userMessage += errorMessage;
            }

            callback?.({
                text: userMessage,
                content: { error: errorMessage },
            });
            return false;
        }
    },
    validate: async () => true,
    similes: [
        "like providing tokens to the Beets wS-stS pool",
        "like depositing liquidity in Beets",
        "like contributing to the wS-stS trading pair on Beets",
    ],
};
