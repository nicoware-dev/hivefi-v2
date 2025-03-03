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
const MIN_UNDELEGATE_AMOUNT = "0.000001"; // 1e12 wei as specified in the contract (MIN_UNDELEGATE_AMOUNT_SHARES)

// ABI for the undelegate function
const UNDELEGATE_ABI = {
    inputs: [
        { internalType: "uint256", name: "validatorId", type: "uint256" },
        { internalType: "uint256", name: "amountShares", type: "uint256" },
    ],
    name: "undelegate",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "nonpayable",
    type: "function",
} as const;

// ABI for checking if undelegations are paused
const UNDELEGATE_PAUSED_ABI = {
    inputs: [],
    name: "undelegatePaused",
    outputs: [{ internalType: "bool", name: "", type: "bool" }],
    stateMutability: "view",
    type: "function",
} as const;

export const unstake: Action = {
    name: "BEETS_UNSTAKE",
    description: "Unstake stS tokens from Beets liquid staking protocol",
    examples: [
        [
            {
                user: "user1",
                content: {
                    text: "Unstake 0.1 stS from Beets",
                    entities: {
                        amount: "0.1",
                        action: "unstake",
                        token: "stS",
                    },
                },
            },
            {
                user: "assistant",
                content: {
                    text: "Let's proceed with unstaking 0.1 stS from Beets. Remember, there will be a 14-day waiting period before you can withdraw your S tokens. I'll confirm once the transaction is complete.",
                },
            },
            {
                user: "assistant",
                content: {
                    text: "Successfully initiated unstaking of 0.1 stS. Your withdrawId is {withdrawId}. You can withdraw your S tokens after the 14-day waiting period.\nTransaction Hash: {hash}",
                },
            },
        ],
    ],
    handler: async (runtime, message: Memory, state, options, callback) => {
        // Make pattern matching more strict and explicit
        const content = message.content?.text?.toLowerCase().match(
            /^(?:please\s+)?(?:unstake|undelegate)\s+([\d.]+)\s*(?:sts|st-s|staked\s+s)\s+(?:from\s+)?beets$/i
        );
        if (!content) {
            callback?.({
                text: "Could not parse unstaking amount. Please use format: Unstake <amount> stS from Beets",
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

            // Check if undelegations are paused
            const isPaused = await publicClient.readContract({
                address: BEETS_STAKING_CONTRACT,
                abi: [UNDELEGATE_PAUSED_ABI],
                functionName: "undelegatePaused",
            });

            if (isPaused) {
                callback?.({
                    text: "Unstaking is currently paused in the Beets contract. Please try again later.",
                });
                return false;
            }

            // Validate minimum unstake amount
            if (parseFloat(amount) < parseFloat(MIN_UNDELEGATE_AMOUNT)) {
                callback?.({
                    text: `Amount too small. Minimum unstake amount is ${MIN_UNDELEGATE_AMOUNT} stS.`,
                });
                return false;
            }

            // Send initial confirmation
            callback?.({
                text: `The unstaking transaction of ${amount} stS has been initiated. You will receive a confirmation once the transaction is complete. Note that you'll need to wait 14 days before you can withdraw your S tokens.`,
            });

            // Encode the undelegate function call
            // We'll use validator ID 15 as seen in your example transaction
            const data = encodeFunctionData({
                abi: [UNDELEGATE_ABI],
                functionName: "undelegate",
                args: [15n, parseEther(amount)],
            });

            // Estimate gas for the transaction
            const gasEstimate = await publicClient.estimateGas({
                account: provider.getAccount(),
                to: BEETS_STAKING_CONTRACT,
                data,
            });

            // Add 20% buffer to gas estimate
            const gasLimit = (gasEstimate * 120n) / 100n;

            // Send the unstaking transaction
            const walletClient = provider.getWalletClient();
            const hash = await walletClient.sendTransaction({
                chain: sonicChain,
                account: provider.getAccount(),
                to: BEETS_STAKING_CONTRACT,
                data,
                gas: gasLimit,
            });

            // Wait for transaction receipt to get the withdrawId
            const receipt = await publicClient.waitForTransactionReceipt({ hash });
            
            // Find the Undelegated event to get the withdrawId
            const undelegatedEvent = receipt.logs.find(log => 
                log.address.toLowerCase() === BEETS_STAKING_CONTRACT.toLowerCase() &&
                log.topics[0] === "0x04fcca04f81983ffc61b309cc6d2935c3e78576bed7045f109b779920d0a1455"
            );

            let withdrawId = "Unknown";
            if (undelegatedEvent && undelegatedEvent.data) {
                // The withdrawId is the first parameter in the data field (32 bytes)
                withdrawId = parseInt(undelegatedEvent.data.slice(0, 66), 16).toString();
            }

            callback?.({
                text: `Successfully initiated unstaking of ${amount} stS. Your withdrawId is ${withdrawId}. You can withdraw your S tokens after the 14-day waiting period.\nTransaction Hash: ${hash}\nView on Explorer: https://sonicscan.org/tx/${hash}`,
                content: { hash, withdrawId },
            });
            return true;
        } catch (error) {
            console.error("Failed to unstake stS:", error);
            if (error instanceof Error) {
                console.error("Error details:", error.message, error.stack);
            }

            // Check for specific error messages
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            let userMessage = `Failed to unstake ${amount} stS: `;

            if (errorMessage.includes("insufficient funds")) {
                userMessage += "Insufficient funds for gas fees. Please ensure you have enough S to cover gas fees.";
            } else if (errorMessage.includes("undelegate paused")) {
                userMessage += "Unstaking is currently paused in the Beets contract. Please try again later.";
            } else {
                userMessage += `${errorMessage}. Please ensure you have sufficient stS balance and unstaking is not paused.`;
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
        "like initiating withdrawal from Beets liquid staking",
        "like converting stS back to S tokens",
        "like starting the unstaking process in Beets",
    ],
};
