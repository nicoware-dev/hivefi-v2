import type { Action, Memory } from "@elizaos/core";
import {
    parseUnits,
    type Address,
    createPublicClient,
    http,
    erc20Abi,
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

// Beets Vault V2 address
const BEETS_VAULT_V2_ADDRESS = "0xBA12222222228d8Ba445958a75a0704d566BF2C8" as const;

// Ensure WS token is properly configured
if (!isERC20Token(TOKENS.WS)) {
    throw new Error("WS token is not properly configured as an ERC20 token");
}

// Ensure USDC token is properly configured
if (!isERC20Token(TOKENS.USDC)) {
    throw new Error("USDC token is not properly configured as an ERC20 token");
}

// Safe token addresses
const WS_ADDRESS = TOKENS.WS.address as Address;

// Pool IDs for common token pairs and routes
const POOL_IDS = {
    // Core pools with high liquidity
    WS_TOKEN1: "0x203180225ebd6dbf1dc0ad41b1fe7deaf51031bf000200000000000000000078" as `0x${string}`,
    TOKEN1_BEETS: "0x9ae8802445112d7eff8ee2519682d8302c78fdcc00010000000000000000004f" as `0x${string}`,
    BEETS_USDC: "0xdf49944d79b4032e244063ebfe413a3179d6b2e7000100000000000000000084" as `0x${string}`,
    // WETH pools
    WETH_WS: "0x3d392de4d5e80cbaaa61477da718ecaeaa59b09b000200000000000000000073" as `0x${string}`,
    WS_USDC: "0xfc127dfc32b7739a7cfff7ed19e4c4ab3221953a0002000000000000000000a4" as `0x${string}`,
} as const;

// Token addresses for routing
const TOKEN_ADDRESSES = {
    TOKEN1: "0xd3DCe716f3eF535C5Ff8d041c1A41C3bd89b97aE" as const,
    BEETS: "0x2D0E0814E62D80056181F5cd932274405966e4f0" as const,
    WETH: "0x50c42dEAcD8Fc9773493ED674b675bE577f2634b" as const,
} as const;

// Default slippage tolerance (0.5%)
const DEFAULT_SLIPPAGE = 0.5;

// Swap types
const SwapKind = {
    GIVEN_IN: 0,
    GIVEN_OUT: 1
} as const;

class BeetsSwapV2 {
    private publicClient;

    constructor(private walletProvider: ReturnType<typeof initWalletProvider>) {
        this.publicClient = createPublicClient({
            chain: sonicChain,
            transport: http("https://rpc.soniclabs.com")
        });
    }

    private getTokenAddress(token: TokenConfig): Address {
        if (token.type === 'native') {
            return WS_ADDRESS;
        }
        if (isERC20Token(token)) {
            return token.address;
        }
        throw new Error("Unsupported token type");
    }

    private getSwapPath(fromToken: TokenConfig, toToken: TokenConfig): { pools: `0x${string}`[], assets: Address[] } {
        const fromAddress = this.getTokenAddress(fromToken);
        const toAddress = this.getTokenAddress(toToken);

        // WETH to USDC path (through WS)
        if (fromToken.symbol === 'WETH' && toToken.symbol === 'USDC') {
            return {
                pools: [
                    POOL_IDS.WETH_WS,
                    POOL_IDS.WS_USDC
                ],
                assets: [
                    fromAddress,
                    WS_ADDRESS,
                    toAddress
                ]
            };
        }

        // USDC to WETH path (through WS)
        if (fromToken.symbol === 'USDC' && toToken.symbol === 'WETH') {
            return {
                pools: [
                    POOL_IDS.WS_USDC,
                    POOL_IDS.WETH_WS
                ],
                assets: [
                    fromAddress,
                    WS_ADDRESS,
                    toAddress
                ]
            };
        }

        // Special case for S/WS to USDC through TOKEN1 and BEETS
        if ((fromToken.symbol === 'S' || fromToken.symbol === 'WS') && toToken.symbol === 'USDC') {
            return {
                pools: [
                    POOL_IDS.WS_TOKEN1,
                    POOL_IDS.TOKEN1_BEETS,
                    POOL_IDS.BEETS_USDC
                ],
                assets: [
                    fromAddress,
                    TOKEN_ADDRESSES.TOKEN1,
                    TOKEN_ADDRESSES.BEETS,
                    toAddress
                ]
            };
        }

        // Special case for USDC to S/WS through BEETS and TOKEN1
        if (fromToken.symbol === 'USDC' && (toToken.symbol === 'S' || toToken.symbol === 'WS')) {
            return {
                pools: [
                    POOL_IDS.BEETS_USDC,
                    POOL_IDS.TOKEN1_BEETS,
                    POOL_IDS.WS_TOKEN1
                ],
                assets: [
                    fromAddress,
                    TOKEN_ADDRESSES.BEETS,
                    TOKEN_ADDRESSES.TOKEN1,
                    toAddress
                ]
            };
        }

        throw new Error(`No viable path found for ${fromToken.symbol} to ${toToken.symbol}. Please try Shadow Exchange for this swap.`);
    }

    private getAssetsForPath(fromToken: TokenConfig, toToken: TokenConfig, pools: readonly `0x${string}`[]): Address[] {
        // Special case for S to USDC through TOKEN1 and BEETS
        if (fromToken.symbol === 'S' && toToken.symbol === 'USDC' && pools.length === 3) {
            return [
                this.getTokenAddress(fromToken),
                TOKEN_ADDRESSES.TOKEN1,
                TOKEN_ADDRESSES.BEETS,
                this.getTokenAddress(toToken)
            ];
        }

        // For direct swaps
        if (pools.length === 1) {
            return [
                this.getTokenAddress(fromToken),
                this.getTokenAddress(toToken)
            ];
        }

        throw new Error(`Unsupported routing path for ${fromToken.symbol}/${toToken.symbol}`);
    }

    private async querySwap(
        fromToken: TokenConfig,
        toToken: TokenConfig,
        amountIn: bigint
    ): Promise<bigint> {
        const { pools, assets } = this.getSwapPath(fromToken, toToken);

        const swaps = pools.map((poolId, i) => ({
            poolId,
            assetInIndex: BigInt(i),
            assetOutIndex: BigInt(i + 1),
            amount: i === 0 ? amountIn : 0n,
            userData: "0x" as `0x${string}`
        }));

        try {
            const result = await this.publicClient.readContract({
                address: BEETS_VAULT_V2_ADDRESS,
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
                args: [
                    SwapKind.GIVEN_IN,
                    swaps,
                    assets,
                    {
                        sender: "0x0000000000000000000000000000000000000000",
                        fromInternalBalance: false,
                        recipient: "0x0000000000000000000000000000000000000000",
                        toInternalBalance: false,
                    }
                ]
            });

            const deltas = result.map(n => BigInt(n.toString()));
            return -deltas[deltas.length - 1]; // Return the final output amount
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

        try {
            const amountIn = parseUnits(amount, fromToken.decimals);

            // If input is native S, wrap it to WS first
            if (fromToken.type === 'native') {
                console.log("Wrapping native S to WS...");
                const wrapHash = await walletClient.sendTransaction({
                    account,
                    chain: sonicChain,
                    to: WS_ADDRESS,
                    value: amountIn,
                });

                await this.publicClient.waitForTransactionReceipt({
                    hash: wrapHash,
                    timeout: 60000
                });

                // Approve WS spending
                console.log("Approving WS token spend...");
                const approvalHash = await walletClient.writeContract({
                    address: WS_ADDRESS,
                    abi: erc20Abi,
                    functionName: 'approve',
                    args: [BEETS_VAULT_V2_ADDRESS, amountIn],
                    chain: sonicChain,
                    account,
                });

                await this.publicClient.waitForTransactionReceipt({
                    hash: approvalHash,
                    timeout: 60000
                });
            } else if (fromToken.type === 'erc20') {
                // Check and approve ERC20 token if needed
                const allowance = await this.publicClient.readContract({
                    address: fromToken.address,
                    abi: erc20Abi,
                    functionName: 'allowance',
                    args: [account.address, BEETS_VAULT_V2_ADDRESS]
                });

                if (allowance < amountIn) {
                    console.log(`Approving ${fromToken.symbol} token spend...`);
                    const approvalHash = await walletClient.writeContract({
                        address: fromToken.address,
                        abi: erc20Abi,
                        functionName: 'approve',
                        args: [BEETS_VAULT_V2_ADDRESS, amountIn],
                        chain: sonicChain,
                        account
                    });

                    await this.publicClient.waitForTransactionReceipt({
                        hash: approvalHash,
                        timeout: 60000
                    });
                }
            }

            // Get swap path
            const { pools, assets } = this.getSwapPath(fromToken, toToken);

            // Query expected output
            const expectedOut = await this.querySwap(fromToken, toToken, amountIn);

            // Calculate minimum output with slippage
            const minOut = expectedOut * BigInt(Math.floor((100 - slippage) * 100)) / 10000n;

            // Create swaps array
            const swaps = pools.map((poolId, i) => ({
                poolId,
                assetInIndex: BigInt(i),
                assetOutIndex: BigInt(i + 1),
                amount: i === 0 ? amountIn : 0n,
                userData: "0x" as `0x${string}`
            }));

            // Create limits array
            const limits = Array(assets.length).fill(0n);
            limits[0] = amountIn;                     // First token (input)
            limits[limits.length - 1] = -minOut;      // Last token (output)

            // Execute swap
            const hash = await walletClient.writeContract({
                address: BEETS_VAULT_V2_ADDRESS,
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
                    SwapKind.GIVEN_IN,
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

            return { hash };
        } catch (error) {
            console.error("Swap error:", error);
            throw error;
        }
    }
}

export const swapv2: Action = {
    name: "SWAP_TOKENS_BEETS_V2",
    description: "Swap tokens on Beets (Balancer V2 fork) - V2 Implementation",
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
            const provider = initWalletProvider(runtime);
            if (!provider) {
                callback?.({
                    text: "EVM wallet not configured. Please set EVM_PRIVATE_KEY in your environment variables.",
                });
                return false;
            }

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
            const fromToken = getTokenBySymbol(fromSymbol.toUpperCase() as TokenSymbol);
            const toToken = getTokenBySymbol(toSymbol.toUpperCase() as TokenSymbol);

            if (!fromToken || !toToken) {
                const supportedTokens = Object.keys(TOKENS).join(", ");
                callback?.({
                    text: `Invalid token symbol. Supported tokens: ${supportedTokens}`,
                });
                return false;
            }

            callback?.({
                text: `Initiating swap of ${amount} ${fromToken.symbol} for ${toToken.symbol} on Beets...`,
            });

            const swapAction = new BeetsSwapV2(provider);
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
