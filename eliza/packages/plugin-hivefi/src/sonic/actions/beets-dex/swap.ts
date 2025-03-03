import type { Action, Memory } from "@elizaos/core";
import {
    parseUnits,
    type Address,
    createPublicClient,
    http,
} from "viem";
import { sonicChain } from "../../config/chains";
import { initWalletProvider } from "../../providers/wallet";
import {
    TOKENS,
    getTokenBySymbol,
    isERC20Token,
    type TokenConfig,
    type TokenSymbol,
} from "../../config/tokens";

// Define TokenInfo interface based on Balancer SDK requirements
interface TokenInfo {
    address: Address;
    decimals: number;
}

// Beets Vault V2 address
const BEETS_VAULT_V2_ADDRESS = "0xBA12222222228d8Ba445958a75a0704d566BF2C8" as const;

// Pool IDs for common token pairs
const POOL_IDS = {
    S_USDC: "0x7b50775383d3d6f0215a8f290f2c9e048c7142e0000200000000000000000008" as `0x${string}`,
    WETH_USDC: "0x8e9b6c5a51724e899c0977a825c752e14d436690000200000000000000000009" as `0x${string}`,
    WS_USDC: "0x3a1c123f2e21d452c1e2c49eb4f994594ba6872100020000000000000000000a" as `0x${string}`,
    SHADOW_USDC: "0x4f6240a4415f68b0b2ef5e44d9fdc12d12c03b8f000200000000000000000007" as `0x${string}`,
    SWPX_USDC: "0x2d0e0814e62d80056181f5cd932274405966e4f000020000000000000000000b" as `0x${string}`,
    BEETS_USDC: "0x993767e29726ddb7f5e8a751faf54d4b83f3fc6200020000000000000000000c" as `0x${string}`,
} as const;

// Get WS token and verify it's an ERC20
const wsToken = TOKENS.WS;
if (!isERC20Token(wsToken)) {
    throw new Error("WS token is not properly configured as an ERC20 token");
}

// Default slippage tolerance (0.5%)
const DEFAULT_SLIPPAGE = 0.5;

// Swap types
const SwapType = {
    GIVEN_IN: 0,
    GIVEN_OUT: 1
};

// Add Vault ABI for getPoolTokens
const VAULT_ABI = [{
    inputs: [{ name: "poolId", type: "bytes32" }],
    name: "getPoolTokens",
    outputs: [
        { name: "tokens", type: "address[]" },
        { name: "balances", type: "uint256[]" },
        { name: "lastChangeBlock", type: "uint256" }
    ],
    stateMutability: "view",
    type: "function"
}] as const;

class BeetsSwapAction {
    private publicClient;

    constructor(private walletProvider: ReturnType<typeof initWalletProvider>) {
        this.publicClient = createPublicClient({
            chain: sonicChain,
            transport: http("https://rpc.soniclabs.com")
        });
    }

    private getPoolId(fromToken: TokenConfig, toToken: TokenConfig): `0x${string}` {
        const pair = `${fromToken.symbol}_${toToken.symbol}`;
        const reversePair = `${toToken.symbol}_${fromToken.symbol}`;

        // Check direct pair
        if (pair in POOL_IDS) {
            return POOL_IDS[pair as keyof typeof POOL_IDS];
        }

        // Check reverse pair
        if (reversePair in POOL_IDS) {
            return POOL_IDS[reversePair as keyof typeof POOL_IDS];
        }

        // If one token is native S, try with WS
        if (fromToken.symbol === 'S') {
            const wsPath = `WS_${toToken.symbol}`;
            if (wsPath in POOL_IDS) {
                return POOL_IDS[wsPath as keyof typeof POOL_IDS];
            }
        } else if (toToken.symbol === 'S') {
            const wsPath = `WS_${fromToken.symbol}`;
            if (wsPath in POOL_IDS) {
                return POOL_IDS[wsPath as keyof typeof POOL_IDS];
            }
        }

        // If no direct pool found, try routing through USDC
        if (fromToken.symbol !== 'USDC' && toToken.symbol !== 'USDC') {
            const fromUsdcPath = `${fromToken.symbol}_USDC`;
            const toUsdcPath = `${toToken.symbol}_USDC`;

            if (fromUsdcPath in POOL_IDS && toUsdcPath in POOL_IDS) {
                // Return the first pool, we'll add the second one in the path
                return POOL_IDS[fromUsdcPath as keyof typeof POOL_IDS];
            }
        }

        throw new Error(`No pool found for ${fromToken.symbol}/${toToken.symbol} pair`);
    }

    private getTokenInfo(token: TokenConfig): TokenInfo {
        if (token.type === 'native') {
            // For native S token, use WS address since Beets doesn't support native token swaps directly
            if (!isERC20Token(wsToken)) {
                throw new Error("WS token is not properly configured as an ERC20 token");
            }
            return {
                address: wsToken.address,
                decimals: token.decimals,
            };
        }
        return {
            address: token.address,
            decimals: token.decimals,
        };
    }

    private async querySwap(
        poolId: `0x${string}`,
        tokenIn: TokenInfo,
        tokenOut: TokenInfo,
        amountIn: bigint
    ): Promise<bigint> {
        if (!this.walletProvider) throw new Error("Wallet not initialized");

        // For weighted pools, we use [tokenIn, tokenOut] order
        const assets = [tokenIn.address, tokenOut.address];

        const swaps = [{
            poolId,
            assetInIndex: 0n,
            assetOutIndex: 1n,
            amount: amountIn,
            userData: "0x" // Empty userData for weighted pools
        }];

        // For query, we use zero address as sender/recipient
        const funds = {
            sender: "0x0000000000000000000000000000000000000000" as Address,
            fromInternalBalance: false,
            recipient: "0x0000000000000000000000000000000000000000" as Address,
            toInternalBalance: false,
        };

        try {
            console.log("Query params:", {
                kind: SwapType.GIVEN_IN,
                swaps: swaps.map(s => ({...s, amount: s.amount.toString()})),
                assets,
                funds
            });

            const result = await this.publicClient.readContract({
                address: BEETS_VAULT_V2_ADDRESS as Address,
                abi: [{
                    inputs: [
                        { name: "kind", type: "uint8" },
                        {
                            components: [
                                { name: "poolId", type: "bytes32" },
                                { name: "assetInIndex", type: "uint256" },
                                { name: "assetOutIndex", type: "uint256" },
                                { name: "amount", type: "uint256" },
                                { name: "userData", type: "bytes" }
                            ],
                            name: "swaps",
                            type: "tuple[]"
                        },
                        { name: "assets", type: "address[]" },
                        {
                            components: [
                                { name: "sender", type: "address" },
                                { name: "fromInternalBalance", type: "bool" },
                                { name: "recipient", type: "address" },
                                { name: "toInternalBalance", type: "bool" }
                            ],
                            name: "funds",
                            type: "tuple"
                        }
                    ],
                    name: "queryBatchSwap",
                    outputs: [{ name: "", type: "int256[]" }],
                    stateMutability: "view",
                    type: "function"
                }] as const,
                functionName: 'queryBatchSwap',
                args: [SwapType.GIVEN_IN, swaps, assets, funds]
            });

            // Get the output amount from the result array
            const deltas = result.map(n => BigInt(n.toString()));
            return -deltas[1]; // Output amount is negative of second delta
        } catch (error) {
            console.error("Error querying swap:", error);
            throw new Error("Failed to query swap. The pool might not exist or have enough liquidity.");
        }
    }

    async swap(
        fromToken: TokenConfig,
        toToken: TokenConfig,
        amount: string,
        slippage = DEFAULT_SLIPPAGE
    ): Promise<{ hash: string }> {
        if (!this.walletProvider) throw new Error("Wallet not initialized");
        const walletClient = this.walletProvider.getWalletClient();
        const account = walletClient.account;
        if (!account) throw new Error("Account not initialized");

        const userAddress = this.walletProvider.getAddress() as Address;

        console.log("Initiating Beets swap:");
        console.log("From Token:", fromToken.symbol);
        console.log("To Token:", toToken.symbol);
        console.log("Amount:", amount);
        console.log(`Slippage: ${slippage}%`);
        console.log("User Address:", userAddress);

        try {
            // Parse amount with correct decimals
            const amountIn = parseUnits(amount, fromToken.decimals);

            // If input is native S, wrap it to WS first
            if (fromToken.type === 'native' && isERC20Token(wsToken)) {
                console.log("Wrapping native S to WS...");
                const wrapHash = await walletClient.sendTransaction({
                    account,
                    chain: sonicChain,
                    to: wsToken.address,
                    value: amountIn,
                });

                console.log("Waiting for wrap transaction:", wrapHash);
                await this.publicClient.waitForTransactionReceipt({
                    hash: wrapHash,
                    timeout: 60000
                });

                // Approve WS spending
                console.log("Approving WS token spend...");
                const approvalHash = await walletClient.writeContract({
                    address: wsToken.address,
                    abi: [{
                        inputs: [
                            { name: "spender", type: "address" },
                            { name: "amount", type: "uint256" }
                        ],
                        name: "approve",
                        outputs: [{ name: "", type: "bool" }],
                        stateMutability: "nonpayable",
                        type: "function"
                    }] as const,
                    functionName: 'approve',
                    args: [BEETS_VAULT_V2_ADDRESS as Address, amountIn],
                    chain: sonicChain,
                    account,
                });

                console.log("Waiting for approval transaction:", approvalHash);
                await this.publicClient.waitForTransactionReceipt({
                    hash: approvalHash,
                    timeout: 60000
                });
            }

            // Get pool ID and token info
            const poolId = this.getPoolId(fromToken, toToken);
            const tokenInInfo = this.getTokenInfo(fromToken);
            const tokenOutInfo = this.getTokenInfo(toToken);

            console.log("Pool details:");
            console.log("Pool ID:", poolId);
            console.log("Token In:", tokenInInfo);
            console.log("Token Out:", tokenOutInfo);
            console.log("Amount:", amountIn.toString());

            // For weighted pools, we use [tokenIn, tokenOut] order
            const assets = [tokenInInfo.address, tokenOutInfo.address];

            const swaps = [{
                poolId,
                assetInIndex: 0n,
                assetOutIndex: 1n,
                amount: amountIn,
                userData: "0x" // Empty userData for weighted pools
            }];

            // Query expected output amount
            console.log("Querying expected output amount...");
            const expectedOut = await this.querySwap(poolId, tokenInInfo, tokenOutInfo, amountIn);
            console.log("Expected output amount:", expectedOut.toString());

            // Calculate minimum output with slippage
            const minOut = expectedOut * BigInt(Math.floor((100 - slippage) * 100)) / 10000n;
            console.log("Minimum output with slippage:", minOut.toString());

            // Create limits array based on asset order
            const limits = [amountIn, -minOut];

            // Convert values to strings for logging
            const loggableParams = {
                swaps: swaps.map(s => ({...s, amount: s.amount.toString()})),
                assets,
                funds: {
                    sender: account.address,
                    fromInternalBalance: false,
                    recipient: account.address,
                    toInternalBalance: false,
                },
                limits: limits.map(l => l.toString()),
                expectedOut: expectedOut.toString(),
                minOut: minOut.toString()
            };
            console.log("Swap request:", JSON.stringify(loggableParams, null, 2));

            // Execute swap
            const hash = await walletClient.writeContract({
                address: BEETS_VAULT_V2_ADDRESS as Address,
                abi: [{
                    inputs: [
                        { name: "kind", type: "uint8" },
                        {
                            components: [
                                { name: "poolId", type: "bytes32" },
                                { name: "assetInIndex", type: "uint256" },
                                { name: "assetOutIndex", type: "uint256" },
                                { name: "amount", type: "uint256" },
                                { name: "userData", type: "bytes" }
                            ],
                            name: "swaps",
                            type: "tuple[]"
                        },
                        { name: "assets", type: "address[]" },
                        {
                            components: [
                                { name: "sender", type: "address" },
                                { name: "fromInternalBalance", type: "bool" },
                                { name: "recipient", type: "address" },
                                { name: "toInternalBalance", type: "bool" }
                            ],
                            name: "funds",
                            type: "tuple"
                        },
                        { name: "limits", type: "int256[]" },
                        { name: "deadline", type: "uint256" }
                    ],
                    name: "batchSwap",
                    outputs: [{ name: "assetDeltas", type: "int256[]" }],
                    stateMutability: "payable",
                    type: "function"
                }] as const,
                functionName: 'batchSwap',
                args: [
                    SwapType.GIVEN_IN,
                    swaps,
                    assets,
                    {
                        sender: account.address,
                        fromInternalBalance: false,
                        recipient: account.address,
                        toInternalBalance: false,
                    },
                    limits,
                    BigInt(Math.floor(Date.now() / 1000) + 3600) // 1 hour deadline
                ],
                chain: sonicChain,
                account,
                value: fromToken.type === 'native' ? amountIn : 0n
            });

            console.log("Swap transaction submitted:", hash);
            console.log("Waiting for confirmation...");

            await this.publicClient.waitForTransactionReceipt({
                hash,
                timeout: 60000
            });

            return { hash };
        } catch (error) {
            console.error("Beets swap failed:", error);
            if (error instanceof Error) {
                console.error("Error details:", error.message);
                console.error("Stack trace:", error.stack);
            }
            throw error;
        }
    }
}

export const swap: Action = {
    name: "SWAP_TOKENS_BEETS",
    description: "Swap tokens on Beets (Balancer V3 fork)",
    examples: [
        [
            {
                user: "user1",
                content: {
                    text: "Swap 0.1 S for USDC on Beets",
                    entities: {
                        fromAmount: "0.1",
                        fromToken: "S",
                        toToken: "USDC"
                    }
                }
            },
            {
                user: "assistant",
                content: {
                    text: "Initiating swap of 0.1 S for USDC on Beets...",
                }
            }
        ]
    ],
    handler: async (runtime, message: Memory, _state, _options, callback) => {
        try {
            // Initialize wallet provider
            const provider = initWalletProvider(runtime);
            if (!provider) {
                callback?.({
                    text: "EVM wallet not configured. Please set EVM_PRIVATE_KEY in your environment variables.",
                });
                return false;
            }

            // Parse message content
            const content = message.content?.text?.match(
                /Swap ([\d.]+) ([A-Za-z]+) for ([A-Za-z]+)(?:\s+on\s+Beets)?/i
            );

            if (!content) {
                callback?.({
                    text: "Could not parse swap details. Please use format: Swap <amount> <fromToken> for <toToken> [on Beets]",
                });
                return false;
            }

            const [, amount, fromSymbol, toSymbol] = content;

            // Get token configs
            const fromToken = getTokenBySymbol(fromSymbol.toUpperCase() as TokenSymbol);
            const toToken = getTokenBySymbol(toSymbol.toUpperCase() as TokenSymbol);

            if (!fromToken || !toToken) {
                const supportedTokens = Object.keys(TOKENS).join(", ");
                callback?.({
                    text: `Invalid token symbol. Supported tokens: ${supportedTokens}`,
                });
                return false;
            }

            // Send initial confirmation
            callback?.({
                text: `Initiating swap of ${amount} ${fromToken.symbol} for ${toToken.symbol} on Beets...`,
            });

            // Create swap action instance
            const swapAction = new BeetsSwapAction(provider);

            // Execute swap
            const { hash } = await swapAction.swap(fromToken, toToken, amount);

            callback?.({
                text: `Swap completed!\nTransaction Hash: ${hash}\nView on Explorer: https://sonicscan.org/tx/${hash}`,
                content: { hash },
            });

            return true;
        } catch (error) {
            console.error("Swap failed:", error);
            callback?.({
                text: `Swap failed: ${error instanceof Error ? error.message : "Unknown error"}`,
            });
            return false;
        }
    },
    validate: async () => true,
    similes: [
        "like exchanging tokens through Beets on Sonic",
        "like trading with Balancer-style pools on Sonic",
        "like swapping digital assets through Beets"
    ],
};
