import type { Action, Memory } from "@elizaos/core";
import {
    parseUnits,
} from "viem";
import { sonicChain } from "../config/chains";
import { initWalletProvider } from "../providers/wallet";
import { TOKENS, getTokenBySymbol, isERC20Token, type TokenSymbol } from "../config/tokens";

export const erc20Transfer: Action = {
    name: "SEND_TOKEN_SONIC",
    description: "Send ERC20 tokens on Sonic network",
    examples: [
        [
            {
                user: "user1",
                content: {
                    text: "Send 0.01 USDC to 0x1234567890123456789012345678901234567890",
                    entities: {
                        amount: "0.01",
                        to: "0x1234567890123456789012345678901234567890",
                        token: "USDC",
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
                    text: "0.01 USDC sent to 0x1234...: {hash}",
                },
            },
        ],
    ],
    handler: async (runtime, message: Memory, state, options, callback) => {
        let amount = "0";
        let tokenSymbol = "";
        let to = "0x0000000000000000000000000000000000000000" as `0x${string}`;

        try {
            // First try the "Send X TOKEN to ADDRESS on Sonic" format
            let content = message.content?.text?.match(
                /Send ([\d.]+) ([A-Za-z]+) to (0x[a-fA-F0-9]{40}) on Sonic/i
            );

            // If that doesn't match, try the simpler "Send X TOKEN to ADDRESS" format
            if (!content) {
                content = message.content?.text?.match(
                    /Send ([\d.]+) ([A-Za-z]+) to (0x[a-fA-F0-9]{40})/i
                );
            }

            // If still no match, try the most basic format
            if (!content) {
                const text = message.content?.text || '';
                const parts = text.split(' ');
                if (parts.length >= 4) {
                    const tempAmount = parts[1];
                    const tempToken = parts[2];
                    const tempTo = parts[3];
                    if (tempAmount && tempToken && tempTo && /^0x[a-fA-F0-9]{40}$/i.test(tempTo)) {
                        content = [text, tempAmount, tempToken, tempTo];
                    }
                }
            }

            if (!content) {
                callback?.({
                    text: "Could not parse transfer details. Please use one of these formats:\n" +
                         "1. Send <amount> <token> to <address> on Sonic\n" +
                         "2. Send <amount> <token> to <address>\n" +
                         "3. Send <amount> <token> <address>",
                });
                return false;
            }

            amount = content[1];
            tokenSymbol = content[2].toUpperCase();
            to = content[3].toLowerCase() as `0x${string}`;

            // Get token config and validate
            const token = getTokenBySymbol(tokenSymbol as TokenSymbol);
            if (!token || !isERC20Token(token)) {
                const supportedTokens = Object.entries(TOKENS)
                    .filter(([_, t]) => t.type === 'erc20')
                    .map(([symbol]) => symbol)
                    .join(", ");
                callback?.({
                    text: `Invalid token symbol. Supported tokens: ${supportedTokens}`,
                });
                return false;
            }

            // Validate address
            if (!to.match(/^0x[a-fA-F0-9]{40}$/)) {
                callback?.({
                    text: "Invalid address format. Address must be a valid Ethereum-style address.",
                });
                return false;
            }

            // Initialize wallet provider
            const provider = initWalletProvider(runtime);
            if (!provider) {
                callback?.({
                    text: "EVM wallet not configured. Please set EVM_PRIVATE_KEY in your environment variables.",
                });
                return false;
            }

            // Send initial confirmation
            callback?.({
                text: `The transaction of ${amount} ${tokenSymbol} to ${to} on Sonic has been initiated. You will receive a confirmation once the transaction is complete.`,
            });

            // Get wallet client
            const walletClient = provider.getWalletClient();

            // ERC20 transfer function signature
            const transferFunctionSignature = "a9059cbb";
            const cleanTo = to.toLowerCase().replace("0x", "");
            const amountHex = parseUnits(
                amount,
                token.decimals
            )
                .toString(16)
                .padStart(64, "0");

            // Construct data parameter
            const data = `0x${transferFunctionSignature}${"000000000000000000000000"}${cleanTo}${amountHex}`;

            // Send transaction
            const hash = await walletClient.sendTransaction({
                chain: sonicChain,
                account: provider.getAccount(),
                to: token.address,
                data: data as `0x${string}`,
                type: "legacy" as const,
            });

            callback?.({
                text: `${amount} ${tokenSymbol} sent to ${to}\nTransaction Hash: ${hash}\nView on Explorer: https://sonicscan.org/tx/${hash}`,
                content: { hash },
            });
            return true;
        } catch (error) {
            console.error("Failed to send tokens on Sonic:", error);
            if (error instanceof Error) {
                console.error("Error details:", error.message, error.stack);
            }
            callback?.({
                text: `Failed to send ${amount} ${tokenSymbol} to ${to}: ${error instanceof Error ? error.message : 'Unknown error'}. Please ensure your wallet has sufficient balance and is properly configured.`,
                content: { error: error instanceof Error ? error.message : 'Unknown error' },
            });
            return false;
        }
    },
    validate: async () => true,
    similes: [
        "like sending tokens through the Sonic network",
        "like making a token transfer in the Sonic ecosystem",
        "like beaming tokens across Sonic",
    ],
};
