import type { Action, Memory } from "@elizaos/core";
import {
    parseEther,
    encodeFunctionData,
    createPublicClient,
    http,
} from "viem";
import { sonicChain } from "../../config/chains";
import { initWalletProvider } from "../../providers/wallet";

const BEETS_STAKING_CONTRACT = "0xE5DA20F15420aD15DE0fa650600aFc998bbE3955";
const MIN_DEPOSIT = "0.01"; // 1e16 wei as specified in the contract

// ABI for the deposit function
const DEPOSIT_ABI = {
    inputs: [],
    name: "deposit",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "payable",
    type: "function",
} as const;

// ABI for checking if deposits are paused
const DEPOSIT_PAUSED_ABI = {
    inputs: [],
    name: "depositPaused",
    outputs: [{ internalType: "bool", name: "", type: "bool" }],
    stateMutability: "view",
    type: "function",
} as const;

export const stake: Action = {
    name: "STAKE_S",
    description: "Stake S tokens with Beets liquid staking protocol",
    examples: [
        [
            {
                user: "user1",
                content: {
                    text: "Stake 0.1 S with Beets",
                    entities: {
                        amount: "0.1",
                    },
                },
            },
            {
                user: "assistant",
                content: {
                    text: "The staking transaction has been initiated. You will receive a confirmation once the transaction is complete.",
                },
            },
            {
                user: "assistant",
                content: {
                    text: "Successfully staked 0.1 S with Beets. You received stS tokens in return.\nTransaction Hash: {hash}",
                },
            },
        ],
    ],
    handler: async (runtime, message: Memory, state, options, callback) => {
        // Extract amount from the message
        const content = message.content?.text?.match(
            /Stake ([\d.]+) S(?:\s+with\s+Beets)?/i
        );
        if (!content) {
            callback?.({
                text: "Could not parse staking amount. Please use format: Stake <amount> S with Beets",
            });
            return false;
        }

        const amount = content[1];

        try {
            // Initialize wallet provider
            const provider = initWalletProvider(runtime);
            if (!provider) {
                callback?.({
                    text: "EVM wallet not configured. Please set EVM_PRIVATE_KEY in your environment variables.",
                });
                return false;
            }

            // Create a public client for reading contract state
            const publicClient = createPublicClient({
                chain: sonicChain,
                transport: http(),
            });

            // Check if deposits are paused
            const isPaused = await publicClient.readContract({
                address: BEETS_STAKING_CONTRACT,
                abi: [DEPOSIT_PAUSED_ABI],
                functionName: "depositPaused",
            });

            if (isPaused) {
                callback?.({
                    text: "Staking is currently paused in the Beets contract. Please try again later.",
                });
                return false;
            }

            // Validate minimum deposit
            if (parseFloat(amount) < parseFloat(MIN_DEPOSIT)) {
                callback?.({
                    text: `Amount too small. Minimum deposit is ${MIN_DEPOSIT} S.`,
                });
                return false;
            }

            // Send initial confirmation
            callback?.({
                text: `The staking transaction of ${amount} S has been initiated. You will receive a confirmation once the transaction is complete.`,
            });

            // Get wallet client and balance
            const balance = await provider.getBalance();
            const value = parseEther(amount);

            if (BigInt(parseEther(balance)) < value) {
                callback?.({
                    text: `Insufficient balance. You need at least ${amount} S to complete this staking transaction.`,
                });
                return false;
            }

            // Encode the deposit function call
            const data = encodeFunctionData({
                abi: [DEPOSIT_ABI],
                functionName: "deposit",
            });

            // Estimate gas for the transaction
            const gasEstimate = await publicClient.estimateGas({
                account: provider.getAccount(),
                to: BEETS_STAKING_CONTRACT,
                value,
                data,
            });

            // Add 20% buffer to gas estimate
            const gasLimit = (gasEstimate * 120n) / 100n;

            // Send the staking transaction
            const walletClient = provider.getWalletClient();
            const hash = await walletClient.sendTransaction({
                chain: sonicChain,
                account: provider.getAccount(),
                to: BEETS_STAKING_CONTRACT,
                value,
                data,
                gas: gasLimit,
            });

            callback?.({
                text: `Successfully staked ${amount} S with Beets. You received stS tokens in return.\nTransaction Hash: ${hash}\nView on Explorer: https://sonicscan.org/tx/${hash}`,
                content: { hash },
            });
            return true;
        } catch (error) {
            console.error("Failed to stake S:", error);
            if (error instanceof Error) {
                console.error("Error details:", error.message, error.stack);
            }

            // Check for specific error messages
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            let userMessage = `Failed to stake ${amount} S: `;

            if (errorMessage.includes("insufficient funds")) {
                userMessage += "Insufficient funds for gas fees. Please ensure you have enough S to cover both the stake amount and gas fees.";
            } else if (errorMessage.includes("deposit paused")) {
                userMessage += "Staking is currently paused in the Beets contract. Please try again later.";
            } else {
                userMessage += `${errorMessage}. Please ensure your wallet has sufficient balance and the staking contract is not paused.`;
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
        "like depositing S tokens into Beets liquid staking protocol",
        "like converting S into stS tokens",
        "like participating in Beets liquid staking",
    ],
};
