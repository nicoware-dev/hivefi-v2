import type { Action, Memory } from "@elizaos/core";
import {
    parseUnits,
    type Address,
    createPublicClient,
    http
} from "viem";
import { mantleChain } from "../config/chains";
import { initWalletProvider } from "../providers/wallet";
import {
    TOKENS,
    getTokenBySymbol,
    isERC20Token,
    type TokenConfig
} from "../config/tokens";

// Merchant Moe Router and Factory addresses
const MOE_ROUTER_ADDRESS = "0xeaee7ee68874218c3558b40063c42b82d3e7232a" as const;
const MOE_FACTORY_ADDRESS = "0x5bef015ca9424a7c07b68490616a4c1f094bedec" as const;

// Router ABI for the specific functions we need
const ROUTER_ABI = [{
    "inputs": [
        { "name": "amountIn", "type": "uint256" },
        { "name": "amountOutMin", "type": "uint256" },
        { "name": "path", "type": "address[]" },
        { "name": "to", "type": "address" },
        { "name": "deadline", "type": "uint256" }
    ],
    "name": "swapExactTokensForTokensSupportingFeeOnTransferTokens",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
}, {
    "inputs": [
        { "name": "amountOutMin", "type": "uint256" },
        { "name": "path", "type": "address[]" },
        { "name": "to", "type": "address" },
        { "name": "deadline", "type": "uint256" }
    ],
    "name": "swapExactNativeForTokensSupportingFeeOnTransferTokens",
    "outputs": [],
    "stateMutability": "payable",
    "type": "function"
}, {
    "inputs": [
        { "name": "amountIn", "type": "uint256" },
        { "name": "amountOutMin", "type": "uint256" },
        { "name": "path", "type": "address[]" },
        { "name": "to", "type": "address" },
        { "name": "deadline", "type": "uint256" }
    ],
    "name": "swapExactTokensForNativeSupportingFeeOnTransferTokens",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
}, {
    "inputs": [
        { "name": "amountIn", "type": "uint256" },
        { "name": "path", "type": "address[]" }
    ],
    "name": "getAmountsOut",
    "outputs": [{ "name": "amounts", "type": "uint256[]" }],
    "stateMutability": "view",
    "type": "function"
}] as const;

// ERC20 ABI for approvals
const ERC20_ABI = [{
    "inputs": [
        { "name": "spender", "type": "address" },
        { "name": "amount", "type": "uint256" }
    ],
    "name": "approve",
    "outputs": [{ "name": "", "type": "bool" }],
    "stateMutability": "nonpayable",
    "type": "function"
}] as const;

class SwapAction {
    private publicClient;

    constructor(private walletProvider: ReturnType<typeof initWalletProvider>) {
        this.publicClient = createPublicClient({
            chain: mantleChain,
            transport: http("https://rpc.mantle.xyz")
        });
    }

    private async approveIfNeeded(
        tokenAddress: Address,
        amount: bigint,
        spender: Address
    ): Promise<void> {
        if (!this.walletProvider) throw new Error("Wallet not initialized");

        const walletClient = this.walletProvider.getWalletClient();
        console.log("Approving token spend");

        const approvalHash = await walletClient.writeContract({
            address: tokenAddress,
            abi: ERC20_ABI,
            functionName: 'approve',
            args: [spender, amount],
            chain: mantleChain,
            account: this.walletProvider.getAccount()
        });

        console.log("Waiting for approval:", approvalHash);
        await this.publicClient.waitForTransactionReceipt({
            hash: approvalHash,
            timeout: 30000
        });
    }

    private async getAmountOut(
        amountIn: bigint,
        path: Address[]
    ): Promise<bigint> {
        const amounts = await this.publicClient.readContract({
            address: MOE_ROUTER_ADDRESS,
            abi: ROUTER_ABI,
            functionName: 'getAmountsOut',
            args: [amountIn, path]
        }) as bigint[];

        return amounts[amounts.length - 1];
    }

    async swap(
        fromToken: TokenConfig,
        toToken: TokenConfig,
        amount: string,
        slippage = 0.5 // 0.5% default slippage
    ): Promise<{ hash: string }> {
        if (!this.walletProvider) throw new Error("Wallet not initialized");

        const walletClient = this.walletProvider.getWalletClient();
        const fromAddress = this.walletProvider.getAddress() as `0x${string}`;

        // Parse amount with correct decimals
        const amountIn = parseUnits(amount, fromToken.decimals);

        // Get token addresses
        let fromTokenAddress: `0x${string}`;
        let toTokenAddress: `0x${string}`;

        const wmnt = TOKENS.WMNT;
        if (!isERC20Token(wmnt)) throw new Error("WMNT token not configured correctly");
        const wmntAddress = wmnt.address as `0x${string}`;

        if (isERC20Token(fromToken)) {
            fromTokenAddress = fromToken.address as `0x${string}`;
        } else {
            fromTokenAddress = wmntAddress;
        }

        if (isERC20Token(toToken)) {
            toTokenAddress = toToken.address as `0x${string}`;
        } else {
            toTokenAddress = wmntAddress;
        }

        // Construct path
        const path: `0x${string}`[] = [fromTokenAddress, toTokenAddress];

        // Get expected output amount
        const expectedOut = await this.getAmountOut(amountIn, path);
        const minOut = expectedOut * BigInt(Math.floor((100 - slippage) * 100)) / 10000n;

        // Set deadline to 20 minutes from now
        const deadline = BigInt(Math.floor(Date.now() / 1000) + 1200);

        // If input token is not native MNT, approve first
        if (isERC20Token(fromToken)) {
            await this.approveIfNeeded(fromToken.address, amountIn, MOE_ROUTER_ADDRESS);
        }

        // Determine which swap function to use
        const functionName = fromToken.type === 'native'
            ? 'swapExactNativeForTokensSupportingFeeOnTransferTokens' as const
            : toToken.type === 'native'
                ? 'swapExactTokensForNativeSupportingFeeOnTransferTokens' as const
                : 'swapExactTokensForTokensSupportingFeeOnTransferTokens' as const;

        const value = fromToken.type === 'native' ? amountIn : 0n;

        // Execute swap
        const hash = await walletClient.writeContract({
            address: MOE_ROUTER_ADDRESS,
            abi: ROUTER_ABI,
            functionName,
            args: functionName === 'swapExactNativeForTokensSupportingFeeOnTransferTokens'
                ? [minOut, path, fromAddress, deadline]
                : [amountIn, minOut, path, fromAddress, deadline],
            chain: mantleChain,
            value,
            account: this.walletProvider.getAccount()
        });

        await this.publicClient.waitForTransactionReceipt({
            hash,
            timeout: 60000
        });

        return { hash };
    }
}

export const swap: Action = {
    name: "SWAP_MANTLE",
    description: "Swap tokens using Merchant Moe Router on Mantle network",
    examples: [
        [
            {
                user: "user1",
                content: {
                    text: "Swap 0.1 MNT for USDT",
                },
            },
            {
                user: "assistant",
                content: {
                    text: "The swap has been initiated. You will receive a confirmation once the transaction is complete.",
                },
            },
            {
                user: "assistant",
                content: {
                    text: "0.1 MNT swapped for USDT: {hash}",
                },
            },
        ],
    ],
    handler: async (runtime, message: Memory, state, options, callback) => {
        try {
            // Parse the swap request
            const content = message.content?.text?.toLowerCase().match(
                /(?:swap\s+|)([\d.]+)\s*([a-z]+)\s*(?:for|to|)\s*([a-z]+)/i
            );

            if (!content) {
                callback?.({
                    text: "Could not parse swap details. Please use format: Swap <amount> <fromToken> for <toToken>",
                });
                return false;
            }

            const [_, amount, fromTokenSymbol, toTokenSymbol] = content;

            // Get token configs
            const fromToken = getTokenBySymbol(fromTokenSymbol.toUpperCase());
            const toToken = getTokenBySymbol(toTokenSymbol.toUpperCase());

            if (!fromToken || !toToken) {
                const supportedTokens = Object.keys(TOKENS).join(", ");
                callback?.({
                    text: `Invalid token symbol. Supported tokens: ${supportedTokens}`,
                });
                return false;
            }

            // Initialize wallet and swap action
            const provider = initWalletProvider(runtime);
            if (!provider) {
                callback?.({
                    text: "Wallet not configured. Please set EVM_PRIVATE_KEY in your environment variables.",
                });
                return false;
            }

            const swapAction = new SwapAction(provider);

            // Send initial confirmation
            callback?.({
                text: `Swapping ${amount} ${fromTokenSymbol.toUpperCase()} for ${toTokenSymbol.toUpperCase()}...`,
            });

            // Execute swap
            const result = await swapAction.swap(fromToken, toToken, amount);

            callback?.({
                text: `Successfully swapped ${amount} ${fromTokenSymbol.toUpperCase()} for ${toTokenSymbol.toUpperCase()}\nTransaction Hash: ${result.hash}\nView on Explorer: https://explorer.mantle.xyz/tx/${result.hash}`,
                content: { hash: result.hash },
            });

            return true;
        } catch (error) {
            console.error("Swap failed:", error);
            callback?.({
                text: `Swap failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
                content: { error: error instanceof Error ? error.message : 'Unknown error' },
            });
            return false;
        }
    },
    validate: async () => true,
    similes: [
        "like trading tokens on Merchant Moe",
        "like exchanging assets on Mantle",
        "like swapping tokens through Merchant Moe",
    ],
};
