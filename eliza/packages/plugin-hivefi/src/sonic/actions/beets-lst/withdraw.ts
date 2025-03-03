import type { Action, Memory } from "@elizaos/core";
import {
    encodeFunctionData,
    createPublicClient,
    http,
} from "viem";
import { sonicChain } from "../../config/chains";
import { initWalletProvider } from "../../providers/wallet";

const BEETS_STAKING_CONTRACT = "0xE5DA20F15420aD15DE0fa650600aFc998bbE3955";

// ABI for the withdraw function
const WITHDRAW_ABI = {
    inputs: [
        { internalType: "uint256", name: "withdrawId", type: "uint256" },
        { internalType: "bool", name: "emergency", type: "bool" },
    ],
    name: "withdraw",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "nonpayable",
    type: "function",
} as const;

// ABI for checking if withdrawals are paused
const WITHDRAW_PAUSED_ABI = {
    inputs: [],
    name: "withdrawPaused",
    outputs: [{ internalType: "bool", name: "", type: "bool" }],
    stateMutability: "view",
    type: "function",
} as const;

// ABI for getting withdraw request details
const GET_WITHDRAW_REQUEST_ABI = {
    inputs: [{ internalType: "uint256", name: "withdrawId", type: "uint256" }],
    name: "getWithdrawRequest",
    outputs: [{
        components: [
            { internalType: "enum SonicStaking.WithdrawKind", name: "kind", type: "uint8" },
            { internalType: "uint256", name: "validatorId", type: "uint256" },
            { internalType: "uint256", name: "assetAmount", type: "uint256" },
            { internalType: "bool", name: "isWithdrawn", type: "bool" },
            { internalType: "uint256", name: "requestTimestamp", type: "uint256" },
            { internalType: "address", name: "user", type: "address" }
        ],
        internalType: "struct SonicStaking.WithdrawRequest",
        name: "",
        type: "tuple"
    }],
    stateMutability: "view",
    type: "function",
} as const;

export const withdraw: Action = {
    name: "WITHDRAW_S",
    description: "Withdraw unstaked S tokens from Beets liquid staking protocol after the 14-day waiting period",
    examples: [
        [
            {
                user: "user1",
                content: {
                    text: "Withdraw S from Beets with withdrawId 1379",
                    entities: {
                        withdrawId: "1379",
                    },
                },
            },
            {
                user: "assistant",
                content: {
                    text: "The withdrawal transaction has been initiated. You will receive a confirmation once the transaction is complete.",
                },
            },
            {
                user: "assistant",
                content: {
                    text: "Successfully withdrawn S tokens from Beets.\nTransaction Hash: {hash}",
                },
            },
        ],
    ],
    handler: async (runtime, message: Memory, state, options, callback) => {
        // Extract withdrawId from the message
        const content = message.content?.text?.match(
            /Withdraw S(?:\s+from\s+Beets)?\s+with\s+withdrawId\s+(\d+)/i
        );
        if (!content) {
            callback?.({
                text: "Could not parse withdraw request. Please use format: Withdraw S from Beets with withdrawId <id>",
            });
            return false;
        }

        const withdrawId = BigInt(content[1]);

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

            // Check if withdrawals are paused
            const isPaused = await publicClient.readContract({
                address: BEETS_STAKING_CONTRACT,
                abi: [WITHDRAW_PAUSED_ABI],
                functionName: "withdrawPaused",
            });

            if (isPaused) {
                callback?.({
                    text: "Withdrawals are currently paused in the Beets contract. Please try again later.",
                });
                return false;
            }

            // Get withdraw request details
            const withdrawRequest = await publicClient.readContract({
                address: BEETS_STAKING_CONTRACT,
                abi: [GET_WITHDRAW_REQUEST_ABI],
                functionName: "getWithdrawRequest",
                args: [withdrawId],
            });

            // Check if the request exists and hasn't been withdrawn
            if (!withdrawRequest || withdrawRequest.isWithdrawn) {
                callback?.({
                    text: "Invalid withdraw request. The request either doesn't exist or has already been processed.",
                });
                return false;
            }

            // Check if the 14-day waiting period has passed
            const currentTimestamp = Math.floor(Date.now() / 1000);
            const waitingPeriod = 14 * 24 * 60 * 60; // 14 days in seconds
            if (currentTimestamp < Number(withdrawRequest.requestTimestamp) + waitingPeriod) {
                const remainingTime = Math.ceil((Number(withdrawRequest.requestTimestamp) + waitingPeriod - currentTimestamp) / (24 * 60 * 60));
                callback?.({
                    text: `The 14-day waiting period has not passed yet. Please wait approximately ${remainingTime} more days before withdrawing.`,
                });
                return false;
            }

            // Send initial confirmation
            callback?.({
                text: "The withdrawal transaction has been initiated. You will receive a confirmation once the transaction is complete.",
            });

            // Encode the withdraw function call
            const data = encodeFunctionData({
                abi: [WITHDRAW_ABI],
                functionName: "withdraw",
                args: [withdrawId, false], // emergency flag set to false for normal withdrawals
            });

            // Estimate gas for the transaction
            const gasEstimate = await publicClient.estimateGas({
                account: provider.getAccount(),
                to: BEETS_STAKING_CONTRACT,
                data,
            });

            // Add 20% buffer to gas estimate
            const gasLimit = (gasEstimate * 120n) / 100n;

            // Send the withdrawal transaction
            const walletClient = provider.getWalletClient();
            const hash = await walletClient.sendTransaction({
                chain: sonicChain,
                account: provider.getAccount(),
                to: BEETS_STAKING_CONTRACT,
                data,
                gas: gasLimit,
            });

            callback?.({
                text: `Successfully withdrawn S tokens from Beets.\nTransaction Hash: ${hash}\nView on Explorer: https://sonicscan.org/tx/${hash}`,
                content: { hash },
            });
            return true;
        } catch (error) {
            console.error("Failed to withdraw S:", error);
            if (error instanceof Error) {
                console.error("Error details:", error.message, error.stack);
            }

            // Check for specific error messages
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            let userMessage = `Failed to withdraw S with withdrawId ${withdrawId}: `;

            if (errorMessage.includes("insufficient funds")) {
                userMessage += "Insufficient funds for gas fees. Please ensure you have enough S to cover gas fees.";
            } else if (errorMessage.includes("withdraw paused")) {
                userMessage += "Withdrawals are currently paused in the Beets contract. Please try again later.";
            } else if (errorMessage.includes("delay not elapsed")) {
                userMessage += "The 14-day waiting period has not passed yet. Please try again later.";
            } else {
                userMessage += `${errorMessage}. Please ensure the waiting period has passed and withdrawals are not paused.`;
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
        "like completing the unstaking process from Beets",
        "like claiming your unstaked S tokens",
        "like finalizing your withdrawal from Beets staking",
    ],
};
