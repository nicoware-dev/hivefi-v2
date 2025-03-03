import type { Action, Memory, State } from "@elizaos/core";
import { formatEther, formatUnits, createPublicClient, http } from "viem";
import { sonicChain } from "../config/chains";
import { initWalletProvider } from "../providers/wallet";
import { TOKENS, getERC20Tokens } from "../config/tokens";
import axios from 'axios';

// ABI for ERC20 balanceOf
const ERC20_BALANCE_ABI = [{
    "constant": true,
    "inputs": [{ "name": "_owner", "type": "address" }],
    "name": "balanceOf",
    "outputs": [{ "name": "balance", "type": "uint256" }],
    "type": "function"
}] as const;

interface TokenBalance {
    symbol: string;
    name: string;
    balance: string;
    usdPrice: number;
    usdValue: number;
}

// Module-level response cache
const responseCache = new Map<string, { timestamp: number; processing: boolean }>();

// Clean up old cache entries every minute
setInterval(() => {
    const now = Date.now();
    for (const [key, value] of responseCache.entries()) {
        if (now - value.timestamp > 60000) { // Remove entries older than 1 minute
            responseCache.delete(key);
        }
    }
}, 60000);

export const portfolio: Action = {
    name: "SHOW_PORTFOLIO",
    description: "Show your Sonic wallet portfolio with token balances and USD values",
    examples: [
        [
            {
                user: "user1",
                content: {
                    text: "Show my portfolio",
                },
            },
            {
                user: "assistant",
                content: {
                    text: "Fetching your current portfolio data from Sonic Network...",
                },
            },
        ],
    ],
    suppressInitialMessage: true, // This prevents double responses in Telegram
    handler: async (runtime, message: Memory, state: State | undefined, options, callback) => {
        if (!callback) return false;
        if (!state) return false;

        // Check if this is a memory-based response
        if (state.isMemoryResponse) {
            return false;
        }

        // Mark this as not a memory response
        state.isMemoryResponse = true;

        // For telegram, we want to skip the initial acknowledgment
        const isTelegram = message.content.source === 'telegram';

        try {
            // Initialize wallet provider
            const provider = initWalletProvider(runtime);
            if (!provider) {
                callback({
                    text: "EVM wallet not configured. Please set EVM_PRIVATE_KEY in your environment variables.",
                });
                return false;
            }

            const address = provider.getAddress() as `0x${string}`;
            const publicClient = createPublicClient({
                chain: sonicChain,
                transport: http("https://rpc.soniclabs.com")
            });

            // For non-telegram clients, send an immediate acknowledgment
            if (!isTelegram) {
                callback({
                    text: "Fetching your current portfolio data from Sonic Network...",
                });
            }

            // Fetch all data in parallel for better performance
            const [nativeBalance, erc20Tokens, pricesResponse] = await Promise.all([
                publicClient.getBalance({ address }),
                getERC20Tokens(),
                axios.get('https://api.coingecko.com/api/v3/simple/price', {
                    params: {
                        ids: Object.values(TOKENS).map(t => t.coingeckoId).filter(Boolean).join(','),
                        vs_currencies: 'usd'
                    },
                    timeout: 10000 // Increased timeout
                }).catch(error => {
                    console.error('Error fetching prices:', error);
                    return { data: {} };
                })
            ]);

            const nativeBalanceFormatted = formatEther(nativeBalance);
            const tokenBalances: TokenBalance[] = [{
                symbol: 'S',
                name: TOKENS.S.name,
                balance: nativeBalanceFormatted,
                usdPrice: pricesResponse.data?.[TOKENS.S.coingeckoId]?.usd || 0,
                usdValue: Number(nativeBalanceFormatted) * (pricesResponse.data?.[TOKENS.S.coingeckoId]?.usd || 0),
            }];

            // Fetch ERC20 balances
            await Promise.all(erc20Tokens.map(async (token) => {
                try {
                    const balance = await publicClient.readContract({
                        address: token.address,
                        abi: ERC20_BALANCE_ABI,
                        functionName: 'balanceOf',
                        args: [address]
                    }) as bigint;

                    const formattedBalance = formatUnits(balance, token.decimals);
                    if (Number(formattedBalance) > 0) {
                        const usdPrice = pricesResponse.data?.[token.coingeckoId]?.usd || 0;
                        tokenBalances.push({
                            symbol: token.symbol,
                            name: token.name,
                            balance: formattedBalance,
                            usdPrice,
                            usdValue: Number(formattedBalance) * usdPrice,
                        });
                    }
                } catch (error) {
                    console.error(`Error fetching ${token.symbol} balance:`, error);
                }
            }));

            const totalValue = tokenBalances.reduce((sum, token) => sum + token.usdValue, 0);

            // Format response
            const response = [
                'Your Sonic Portfolio:',
                '',
                ...tokenBalances
                    .filter(token => Number(token.balance) > 0)
                    .map(token => {
                        const balanceStr = Number(token.balance).toLocaleString(undefined, {
                            maximumFractionDigits: token.symbol === 'USDT' || token.symbol === 'USDC' ? 2 : 6
                        });
                        const valueStr = token.usdValue.toLocaleString(undefined, {
                            style: 'currency',
                            currency: 'USD'
                        });
                        return `• ${token.symbol} (${token.name}): ${balanceStr} (${valueStr})`;
                    }),
                '',
                `Total Portfolio Value: ${totalValue.toLocaleString(undefined, {
                    style: 'currency',
                    currency: 'USD'
                })}`,
                '',
                `View on Explorer: https://sonicscan.org/address/${address}`
            ].join('\n');

            callback({ text: response });
            return true;
        } catch (error) {
            console.error("Error fetching portfolio:", error);
            callback({
                text: `Error fetching portfolio: ${error instanceof Error ? error.message : 'Unknown error'}`,
            });
            return false;
        }
    },
    validate: async () => true,
    similes: [
        "like checking your digital wallet's contents",
        "like getting a snapshot of your crypto holdings",
        "like viewing your investment portfolio on Sonic",
    ],
};
