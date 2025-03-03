import type { Action, Memory } from "@elizaos/core";
import {
    createPublicClient,
    http,
    type Address,
} from "viem";
import { sonicChain } from "../../config/chains";
import { initWalletProvider } from "../../providers/wallet";
import { getTokenBySymbol, isERC20Token, type TokenSymbol } from "../../config/tokens";

// Silo market vault addresses
const SILO_MARKETS = {
    S: "0xf55902de87bd80c6a35614b48d7f8b612a083c12" as const, // Silo S/WS vault
    USDC: "0x322e1d5384aa4ed66aeca770b95686271de61dc3" as const,
    WETH: "0x8e9b6c5a51724e899c0977a825c752e14d436690" as const,
} as const;

// ERC4626 Vault ABI for repay operations
const VAULT_ABI = [{
    inputs: [
        { name: "shares", type: "uint256" },
        { name: "owner", type: "address" }
    ],
    name: "repayShares",
    outputs: [{ name: "assets", type: "uint256" }],
    stateMutability: "nonpayable",
    type: "function"
}, {
    inputs: [{ name: "account", type: "address" }],
    name: "maxRepayShares",
    outputs: [{ name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function"
}, {
    inputs: [{ name: "shares", type: "uint256" }],
    name: "previewRepayShares",
    outputs: [{ name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function"
}, {
    inputs: [{ name: "owner", type: "address" }],
    name: "borrowBalanceOf",
    outputs: [{ name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function"
}] as const;

// ERC20 ABI for token approvals
const ERC20_ABI = [{
    inputs: [
        { name: "spender", type: "address" },
        { name: "amount", type: "uint256" }
    ],
    name: "approve",
    outputs: [{ name: "", type: "bool" }],
    stateMutability: "nonpayable",
    type: "function"
}, {
    inputs: [
        { name: "owner", type: "address" },
        { name: "spender", type: "address" }
    ],
    name: "allowance",
    outputs: [{ name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function"
}] as const;

export const repay: Action = {
    name: "REPAY_SILO",
    description: "Repay borrowed tokens to Silo Finance V2 lending pools",
    examples: [
        [
            {
                user: "user1",
                content: {
                    text: "Repay 0.001 USDC to Silo Finance",
                },
            },
            {
                user: "assistant",
                content: {
                    text: "Initiating repayment of 0.001 USDC to Silo Finance...",
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
                /Repay ([\d.]+) ([A-Za-z]+)(?:\s+to\s+Silo\s+Finance)?/i
            );

            if (!content) {
                callback?.({
                    text: "Could not parse repay request. Please use format: Repay <amount> <token> to Silo Finance",
                });
                return false;
            }

            const [, amount, tokenSymbol] = content;
            const token = getTokenBySymbol(tokenSymbol.toUpperCase() as TokenSymbol);

            if (!token || !isERC20Token(token)) {
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
                text: `Initiating repayment of ${amount} ${token.symbol} to Silo Finance...`,
            });

            const walletClient = provider.getWalletClient();
            const publicClient = createPublicClient({
                chain: sonicChain,
                transport: http("https://rpc.soniclabs.com")
            });

            // Check if user has any borrow balance
            const borrowBalance = await publicClient.readContract({
                address: marketAddress as Address,
                abi: VAULT_ABI,
                functionName: 'borrowBalanceOf',
                args: [provider.getAddress() as `0x${string}`]
            });

            if (borrowBalance === 0n) {
                callback?.({
                    text: `You don't have any ${token.symbol} borrowed from Silo Finance.`,
                });
                return false;
            }

            // Get max repayable shares
            const maxRepayShares = await publicClient.readContract({
                address: marketAddress as Address,
                abi: VAULT_ABI,
                functionName: 'maxRepayShares',
                args: [provider.getAddress() as `0x${string}`]
            });

            // Get assets needed for full repayment
            const assetsNeeded = await publicClient.readContract({
                address: marketAddress as Address,
                abi: VAULT_ABI,
                functionName: 'previewRepayShares',
                args: [maxRepayShares]
            });

            // Check and handle token approval
            const currentAllowance = await publicClient.readContract({
                address: token.address,
                abi: ERC20_ABI,
                functionName: 'allowance',
                args: [provider.getAddress() as `0x${string}`, marketAddress as `0x${string}`]
            });

            if (currentAllowance < assetsNeeded) {
                console.log(`Approving ${token.symbol} for Silo vault...`);
                const approveHash = await walletClient.writeContract({
                    address: token.address,
                    abi: ERC20_ABI,
                    functionName: 'approve',
                    args: [marketAddress as `0x${string}`, assetsNeeded],
                    chain: sonicChain,
                    account: provider.getAccount()
                });

                await publicClient.waitForTransactionReceipt({
                    hash: approveHash,
                    timeout: 60000
                });
            }

            console.log("Repaying to Silo vault...");
            console.log("Max repay shares:", maxRepayShares.toString());
            console.log("Assets needed:", assetsNeeded.toString());

            // Execute repayShares to repay the full amount
            const repayHash = await walletClient.writeContract({
                address: marketAddress as Address,
                abi: VAULT_ABI,
                functionName: 'repayShares',
                args: [
                    maxRepayShares,
                    provider.getAddress() as `0x${string}`
                ],
                chain: sonicChain,
                account: provider.getAccount(),
                gas: 500000n // Explicit gas limit for safety
            });

            // Wait for transaction confirmation
            const receipt = await publicClient.waitForTransactionReceipt({
                hash: repayHash,
                timeout: 60000
            });

            if (!receipt.status) {
                throw new Error("Repay transaction failed");
            }

            callback?.({
                text: `Successfully repaid your ${token.symbol} debt to Silo Finance!\nTransaction Hash: ${repayHash}\nView on Explorer: https://sonicscan.org/tx/${repayHash}`,
                content: { hash: repayHash },
            });

            return true;
        } catch (error) {
            console.error("Repay failed:", error);
            callback?.({
                text: `Repay failed: ${error instanceof Error ? error.message : "Unknown error"}`,
            });
            return false;
        }
    },
    validate: async () => true,
    similes: [
        "like paying back your loan to Silo Finance",
        "like settling your borrowed assets",
        "like closing your debt position",
    ],
};
