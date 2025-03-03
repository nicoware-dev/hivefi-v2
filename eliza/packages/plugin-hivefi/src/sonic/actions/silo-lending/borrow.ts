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

// ERC4626 Vault ABI for borrow operations
const VAULT_ABI = [{
    inputs: [
        { name: "assets", type: "uint256" },
        { name: "receiver", type: "address" },
        { name: "owner", type: "address" }
    ],
    name: "borrow",
    outputs: [{ name: "shares", type: "uint256" }],
    stateMutability: "nonpayable",
    type: "function"
}, {
    inputs: [{ name: "account", type: "address" }],
    name: "maxBorrow",
    outputs: [{ name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function"
}, {
    inputs: [{ name: "assets", type: "uint256" }],
    name: "previewBorrow",
    outputs: [{ name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function"
}] as const;

export const borrow: Action = {
    name: "BORROW_SILO",
    description: "Borrow tokens from Silo Finance V2 lending pools using deposited collateral",
    examples: [
        [
            {
                user: "user1",
                content: {
                    text: "Borrow 0.001 USDC from Silo Finance",
                },
            },
            {
                user: "assistant",
                content: {
                    text: "Initiating borrow of 0.001 USDC from Silo Finance using your deposited collateral...",
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
                /Borrow ([\d.]+) ([A-Za-z]+)(?:\s+from\s+Silo\s+Finance)?/i
            );

            if (!content) {
                callback?.({
                    text: "Could not parse borrow request. Please use format: Borrow <amount> <token> from Silo Finance",
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
                text: `Initiating borrow of ${amount} ${token.symbol} from Silo Finance...`,
            });

            const walletClient = provider.getWalletClient();
            const publicClient = createPublicClient({
                chain: sonicChain,
                transport: http("https://rpc.soniclabs.com")
            });

            // Parse amount with correct decimals
            const amountInWei = parseUnits(amount, token.decimals);

            // Check maximum borrowable amount
            const maxBorrow = await publicClient.readContract({
                address: marketAddress as Address,
                abi: VAULT_ABI,
                functionName: 'maxBorrow',
                args: [provider.getAddress() as `0x${string}`]
            });

            if (maxBorrow < amountInWei) {
                callback?.({
                    text: `Cannot borrow ${amount} ${token.symbol}. Maximum borrowable amount exceeded. Please ensure you have sufficient collateral.`,
                });
                return false;
            }

            // Preview borrow to get shares
            const borrowShares = await publicClient.readContract({
                address: marketAddress as Address,
                abi: VAULT_ABI,
                functionName: 'previewBorrow',
                args: [amountInWei]
            });

            console.log("Borrowing from Silo vault...");
            console.log("Amount to borrow:", amountInWei.toString());
            console.log("Borrow shares:", borrowShares.toString());

            // Execute borrow
            const borrowHash = await walletClient.writeContract({
                address: marketAddress as Address,
                abi: VAULT_ABI,
                functionName: 'borrow',
                args: [
                    amountInWei,
                    provider.getAddress() as `0x${string}`,
                    provider.getAddress() as `0x${string}`
                ],
                chain: sonicChain,
                account: provider.getAccount(),
                gas: 500000n // Explicit gas limit for safety
            });

            // Wait for transaction confirmation
            const receipt = await publicClient.waitForTransactionReceipt({
                hash: borrowHash,
                timeout: 60000
            });

            if (!receipt.status) {
                throw new Error("Borrow transaction failed");
            }

            callback?.({
                text: `Successfully borrowed ${amount} ${token.symbol} from Silo Finance!\nTransaction Hash: ${borrowHash}\nView on Explorer: https://sonicscan.org/tx/${borrowHash}`,
                content: { hash: borrowHash },
            });

            return true;
        } catch (error) {
            console.error("Borrow failed:", error);
            callback?.({
                text: `Borrow failed: ${error instanceof Error ? error.message : "Unknown error"}. Note: Minimum borrow amount is $50 worth of tokens.`,
            });
            return false;
        }
    },
    validate: async () => true,
    similes: [
        "like taking a loan using your deposited collateral",
        "like borrowing assets from Silo Finance",
        "like accessing liquidity against your deposits",
    ],
};
