import type { Action, Memory } from "@elizaos/core";
import {
    parseEther,
    type Chain,
} from "viem";
import { mantleChain } from "../config/chains";
import { initWalletProvider } from "../providers/wallet";

export const transfer: Action = {
    name: "SEND_MNT",
    description: "Send MNT on Mantle network",
    examples: [
        [
            {
                user: "user1",
                content: {
                    text: "Send 0.1 MNT to 0x1234...",
                    entities: {
                        amount: "0.1",
                        to: "0x1234567890123456789012345678901234567890",
                    },
                },
            },
            {
                user: "assistant",
                content: {
                    text: "The transaction has been initiated. You will receive a confirmation once the transaction is complete.",
                },
            },
            {
                user: "assistant",
                content: {
                    text: "0.1 MNT sent to 0x1234...: {hash}",
                },
            },
        ],
    ],
    handler: async (runtime, message: Memory, state, options, callback) => {
        // Extract entities from the message
        const content = message.content?.text?.match(
            /Send ([\d.]+) MNT to (0x[a-fA-F0-9]{40})/i
        );
        if (!content) {
            callback?.({
                text: "Could not parse transfer details. Please use format: Send <amount> MNT to <address>",
            });
            return false;
        }

        const amount = content[1];
        const to = content[2].toLowerCase() as `0x${string}`;

        // Validate address format
        if (!to.match(/^0x[a-fA-F0-9]{40}$/)) {
            callback?.({
                text: "Invalid Mantle address format. Address must be a valid Ethereum-style address.",
            });
            return false;
        }

        try {
            // Initialize wallet provider
            const provider = initWalletProvider(runtime);
            if (!provider) {
                callback?.({
                    text: "Mantle wallet not configured. Please set EVM_PRIVATE_KEY in your environment variables.",
                });
                return false;
            }

            // Send initial confirmation
            callback?.({
                text: `The transaction of ${amount} MNT to the address ${to} has been initiated. You will receive a confirmation once the transaction is complete.`,
            });

            // Get wallet client and balance
            const balance = await provider.getBalance();
            const value = parseEther(amount);

            if (BigInt(parseEther(balance)) < value) {
                callback?.({
                    text: `Insufficient balance. You need at least ${amount} MNT to complete this transaction.`,
                });
                return false;
            }

            // Send the transaction
            const walletClient = provider.getWalletClient();
            const hash = await walletClient.sendTransaction({
                chain: mantleChain,
                account: provider.getAccount(),
                to,
                value,
            });

            callback?.({
                text: `${amount} MNT sent to ${to}\nTransaction Hash: ${hash}\nView on Explorer: https://explorer.mantle.xyz/tx/${hash}`,
                content: { hash },
            });
            return true;
        } catch (error) {
            console.error("Failed to send MNT:", error);
            if (error instanceof Error) {
                console.error("Error details:", error.message, error.stack);
            }
            callback?.({
                text: `Failed to send ${amount} MNT to ${to}: ${error instanceof Error ? error.message : 'Unknown error'}. Please ensure your wallet has sufficient balance and is properly configured.`,
                content: { error: error instanceof Error ? error.message : 'Unknown error' },
            });
            return false;
        }
    },
    validate: async () => true,
    similes: [
        "like sending digital cash through the Mantle network",
        "like making an instant transfer in the Mantle ecosystem",
        "like beaming MNT through the network",
    ],
};
