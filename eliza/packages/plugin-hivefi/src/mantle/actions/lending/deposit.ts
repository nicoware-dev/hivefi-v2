// WIP

import type { Action, Memory } from "@elizaos/core";
import { createPublicClient, http, type Address } from 'viem';
import { mantleChain } from '../../config/chains';
import { initWalletProvider } from '../../providers/wallet';
import { LENDING_POOL_ABI, ERC20_ABI } from './config';
import {
    parseAmountAndToken,
    getLendingPoolAddress,
    parseTokenAmount,
    getTokenConfig,
    formatUserAccountData,
    formatTokenAmount,
    getATokenBalance,
    formatError,
    formatSuccessMessage
} from './utils';

export const deposit: Action = {
    name: "DEPOSIT_LENDING",
    description: "Deposit tokens into Lendle lending pools on Mantle",
    examples: [
        [
            {
                user: "user1",
                content: {
                    text: "Supply 100 USDC to Lendle",
                },
            },
            {
                user: "assistant",
                content: {
                    text: "Let's proceed with supplying 100 USDC to Lendle on the Mantle network. Please hold on while I process the transaction.",
                },
            },
        ],
    ],
    suppressInitialMessage: true,
    handler: async (runtime, message: Memory, state, options, callback) => {
        try {
            // Initialize wallet provider
            const provider = initWalletProvider(runtime);
            if (!provider) {
                callback?.({
                    text: "Wallet not configured. Please set EVM_PRIVATE_KEY in your environment variables.",
                });
                return false;
            }

            const walletClient = provider.getWalletClient();
            const publicClient = createPublicClient({
                chain: mantleChain,
                transport: http("https://rpc.mantle.xyz")
            });

            // Parse the deposit request
            const content = message.content?.text?.toLowerCase();
            if (!content) {
                callback?.({
                    text: "Could not parse deposit request. Please use format: Supply <amount> <token> to Lendle",
                });
                return false;
            }

            // Extract amount and token
            const { amount, tokenSymbol } = parseAmountAndToken(content);

            if (!tokenSymbol) {
                callback?.({
                    text: "Invalid token. Please specify a supported token (e.g., USDC, USDT, WETH, etc.)",
                });
                return false;
            }

            // For non-telegram/discord clients, send an initial confirmation
            const source = message.content.source;
            if (source !== 'telegram' && source !== 'discord') {
                callback?.({
                    text: `Let's proceed with supplying ${amount} ${tokenSymbol} to Lendle on the Mantle network. Please hold on while I process the transaction.`,
                });
            }

            // Get token configuration
            const token = getTokenConfig(tokenSymbol);
            const lendingPool = getLendingPoolAddress();
            const userAddress = provider.getAddress() as Address;

            // Convert amount to proper decimals
            const amountInWei = parseTokenAmount(amount, tokenSymbol);

            // Check token balance
            const balance = await publicClient.readContract({
                address: token.address,
                abi: ERC20_ABI,
                functionName: 'balanceOf',
                args: [userAddress]
            });

            if (balance < amountInWei) {
                callback?.({
                    text: `Insufficient ${tokenSymbol} balance. You have ${formatTokenAmount(balance, tokenSymbol)} ${tokenSymbol}, but trying to deposit ${amount} ${tokenSymbol}`,
                });
                return false;
            }

            // Check and handle allowance
            const allowance = await publicClient.readContract({
                address: token.address,
                abi: ERC20_ABI,
                functionName: 'allowance',
                args: [userAddress, lendingPool]
            });

            if (allowance < amountInWei) {
                try {
                    callback?.({
                        text: `Approving ${tokenSymbol} for Lendle...`,
                    });

                    // Get the latest nonce for approval transaction
                    const approvalNonce = await publicClient.getTransactionCount({
                        address: userAddress
                    });

                    const approvalHash = await walletClient.writeContract({
                        address: token.address,
                        abi: ERC20_ABI,
                        functionName: 'approve',
                        args: [lendingPool, amountInWei],
                        chain: mantleChain,
                        account: provider.getAccount(),
                        nonce: approvalNonce
                    });

                    await publicClient.waitForTransactionReceipt({
                        hash: approvalHash
                    });

                    callback?.({
                        text: `${tokenSymbol} approved successfully for Lendle.`,
                    });
                } catch (error) {
                    console.error('Approval failed:', error);
                    callback?.({
                        text: formatError(error),
                    });
                    return false;
                }
            }

            // Deposit into Lendle
            try {
                callback?.({
                    text: `Depositing ${amount} ${tokenSymbol} into Lendle...`,
                });

                // Get the latest nonce for deposit transaction
                const depositNonce = await publicClient.getTransactionCount({
                    address: userAddress
                });

                const depositHash = await walletClient.writeContract({
                    address: lendingPool,
                    abi: LENDING_POOL_ABI,
                    functionName: 'deposit',
                    args: [token.address, amountInWei, userAddress, 0], // referralCode = 0
                    chain: mantleChain,
                    account: provider.getAccount(),
                    nonce: depositNonce
                });

                await publicClient.waitForTransactionReceipt({
                    hash: depositHash
                });

                // Get updated user account data
                const [
                    totalCollateralETH,
                    totalDebtETH,
                    availableBorrowsETH,
                    currentLiquidationThreshold,
                    ltv,
                    healthFactor
                ] = await publicClient.readContract({
                    address: lendingPool,
                    abi: LENDING_POOL_ABI,
                    functionName: 'getUserAccountData',
                    args: [userAddress]
                });

                // Get updated wallet and supplied balances
                const newWalletBalance = await publicClient.readContract({
                    address: token.address,
                    abi: ERC20_ABI,
                    functionName: 'balanceOf',
                    args: [userAddress]
                });

                const suppliedBalance = await getATokenBalance(publicClient, tokenSymbol, userAddress);

                const formattedData = formatUserAccountData({
                    totalCollateralETH,
                    totalDebtETH,
                    availableBorrowsETH,
                    currentLiquidationThreshold,
                    ltv,
                    healthFactor,
                    walletBalance: newWalletBalance,
                    suppliedBalance
                });

                callback?.({
                    text: formatSuccessMessage('deposit', amount, tokenSymbol, depositHash, formattedData),
                    content: { hash: depositHash },
                });

                return true;
            } catch (error) {
                console.error('Deposit failed:', error);
                callback?.({
                    text: formatError(error),
                });
                return false;
            }
        } catch (error) {
            console.error('Operation failed:', error);
            callback?.({
                text: formatError(error),
                content: { error: error instanceof Error ? error.message : 'Unknown error' },
            });
            return false;
        }
    },
    validate: async () => true,
    similes: [
        "like depositing assets into a savings account",
        "like providing liquidity to earn interest",
        "like supplying tokens to a lending pool",
    ],
};
