import type { Action, Memory } from "@elizaos/core";
import {
    parseUnits,
    createPublicClient,
    http,
    type Address,
} from "viem";
import { sonicChain } from "../../config/chains";
import { initWalletProvider } from "../../providers/wallet";
import { getTokenBySymbol, type TokenSymbol } from "../../config/tokens";

// Silo market vault addresses
const SILO_MARKETS = {
    S: "0xf55902de87bd80c6a35614b48d7f8b612a083c12" as const, // Silo S/WS vault
    USDC: "0x322e1d5384aa4ed66aeca770b95686271de61dc3" as const,
    WETH: "0x8e9b6c5a51724e899c0977a825c752e14d436690" as const,
} as const;

// ERC4626 Vault ABI for redeem and balanceOf
const VAULT_ABI = [{
    inputs: [
        { name: "shares", type: "uint256" },
        { name: "receiver", type: "address" },
        { name: "owner", type: "address" }
    ],
    name: "redeem",
    outputs: [{ name: "assets", type: "uint256" }],
    stateMutability: "nonpayable",
    type: "function"
}, {
    inputs: [{ name: "account", type: "address" }],
    name: "balanceOf",
    outputs: [{ name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function"
}, {
    inputs: [{ name: "assets", type: "uint256" }],
    name: "convertToShares",
    outputs: [{ name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function"
}, {
    inputs: [{ name: "shares", type: "uint256" }],
    name: "convertToAssets",
    outputs: [{ name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function"
}] as const;

export const withdraw: Action = {
    name: "WITHDRAW_SILO",
    description: "Withdraw tokens from Silo Finance V2 lending pools",
    examples: [
        [
            {
                user: "user1",
                content: {
                    text: "Withdraw 0.1 S from Silo",
                },
            },
            {
                user: "assistant",
                content: {
                    text: "Initiating withdrawal of 0.1 S from Silo Finance...",
                },
            },
        ],
    ],
    handler: async (runtime, message: Memory, _state, _options, callback) => {
        try {
            // Initialize wallet provider
            const provider = initWalletProvider(runtime);
            if (!provider) {
                callback?.({
                    text: "Wallet not configured. Please set EVM_PRIVATE_KEY in your environment variables.",
                });
                return false;
            }

            // Parse message content
            const content = message.content?.text?.match(
                /Withdraw ([\d.]+) ([A-Za-z]+)(?:\s+from\s+Silo)?/i
            );

            if (!content) {
                callback?.({
                    text: "Could not parse withdraw request. Please use format: Withdraw <amount> <token> from Silo",
                });
                return false;
            }

            const [, amount, tokenSymbol] = content;
            const token = getTokenBySymbol(tokenSymbol.toUpperCase() as TokenSymbol);

            if (!token) {
                const supportedTokens = Object.keys(SILO_MARKETS).join(", ");
                callback?.({
                    text: `Invalid token symbol. Supported tokens: ${supportedTokens}`,
                });
                return false;
            }

            // Get market address for the token
            const marketAddress = SILO_MARKETS[tokenSymbol.toUpperCase() as keyof typeof SILO_MARKETS];
            if (!marketAddress) {
                callback?.({
                    text: `No Silo market found for ${tokenSymbol}`,
                });
                return false;
            }

            // Send initial confirmation
            callback?.({
                text: `Initiating withdrawal of ${amount} ${token.symbol} from Silo Finance...`,
            });

            const walletClient = provider.getWalletClient();
            const publicClient = createPublicClient({
                chain: sonicChain,
                transport: http("https://rpc.soniclabs.com")
            });

            // Get user's current shares balance
            const userShares = await publicClient.readContract({
                address: marketAddress as Address,
                abi: VAULT_ABI,
                functionName: 'balanceOf',
                args: [provider.getAddress() as `0x${string}`]
            });

            if (userShares === 0n) {
                callback?.({
                    text: `You don't have any ${token.symbol} deposited in Silo Finance.`,
                });
                return false;
            }

            // Parse amount with correct decimals
            const amountInWei = parseUnits(amount, token.decimals);

            // For small amounts (< 1% of total shares), withdraw all
            const userAssetsValue = await publicClient.readContract({
                address: marketAddress as Address,
                abi: VAULT_ABI,
                functionName: 'convertToAssets',
                args: [userShares]
            });

            // Variable to store the amount of shares to withdraw
            let sharesToWithdraw: bigint;

            // If requested amount is small relative to total deposit, withdraw everything
            if (amountInWei < userAssetsValue / 100n) {
                console.log("Small withdrawal amount detected, withdrawing all shares...");
                sharesToWithdraw = userShares;
            } else {
                // Calculate shares needed for the requested amount
                sharesToWithdraw = await publicClient.readContract({
                    address: marketAddress as Address,
                    abi: VAULT_ABI,
                    functionName: 'convertToShares',
                    args: [amountInWei]
                });

                // If calculated shares exceed user's balance, withdraw all
                if (sharesToWithdraw > userShares) {
                    console.log("Requested amount exceeds available balance, withdrawing all shares...");
                    sharesToWithdraw = userShares;
                }
            }

            console.log("Withdrawing from Silo vault...");
            console.log("User shares:", userShares.toString());
            console.log("Shares to withdraw:", sharesToWithdraw.toString());

            // Execute redeem
            const withdrawHash = await walletClient.writeContract({
                address: marketAddress as Address,
                abi: VAULT_ABI,
                functionName: 'redeem',
                args: [
                    sharesToWithdraw,
                    provider.getAddress() as `0x${string}`,
                    provider.getAddress() as `0x${string}`
                ],
                chain: sonicChain,
                account: provider.getAccount(),
                gas: 500000n // Explicit gas limit for safety
            });

            // Wait for transaction confirmation
            const receipt = await publicClient.waitForTransactionReceipt({
                hash: withdrawHash,
                timeout: 60000
            });

            if (!receipt.status) {
                throw new Error("Withdrawal transaction failed");
            }

            const withdrawalText = sharesToWithdraw === userShares
                ? `Successfully withdrew all your ${token.symbol} from Silo Finance!`
                : `Successfully withdrew ${amount} ${token.symbol} from Silo Finance!`;

            callback?.({
                text: `${withdrawalText}\nTransaction Hash: ${withdrawHash}\nView on Explorer: https://sonicscan.org/tx/${withdrawHash}`,
                content: { hash: withdrawHash },
            });

            return true;
        } catch (error) {
            console.error("Withdrawal failed:", error);
            callback?.({
                text: `Withdrawal failed: ${error instanceof Error ? error.message : "Unknown error"}`,
            });
            return false;
        }
    },
    validate: async () => true,
    similes: [
        "like withdrawing assets from Silo Finance",
        "like removing liquidity from a lending pool",
        "like taking out your deposited tokens on Sonic",
    ],
};
