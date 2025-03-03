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
    getDebtTokenBalance,
    formatBorrowRepayMessage,
    formatError
} from './utils';

export const repay: Action = {
    name: "REPAY_LENDING",
    description: "Repay borrowed tokens to Lendle lending pools on Mantle",
    examples: [
        [
            {
                user: "user1",
                content: {
                    text: "Repay 100 USDC to Lendle",
                },
            },
            {
                user: "assistant",
                content: {
                    text: "Let's proceed with repaying 100 USDC to Lendle on the Mantle network. Please hold on while I process the transaction.",
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

            // Parse the repay request
            const content = message.content?.text?.toLowerCase();
            if (!content) {
                callback?.({
                    text: "Could not parse repay request. Please use format: Repay <amount> <token> to Lendle",
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
                    text: `Let's proceed with repaying ${amount} ${tokenSymbol} to Lendle on the Mantle network. Please hold on while I process the transaction.`,
                });
            }

            // Get token configuration and addresses
            const token = getTokenConfig(tokenSymbol);
            const lendingPool = getLendingPoolAddress();
            const userAddress = provider.getAddress() as Address;

            // Convert amount to proper decimals
            const amountInWei = parseTokenAmount(amount, tokenSymbol);

            // Check wallet balance
            const balance = await publicClient.readContract({
                address: token.address,
                abi: ERC20_ABI,
                functionName: 'balanceOf',
                args: [userAddress]
            });

            if (balance < amountInWei) {
                callback?.({
                    text: `Insufficient ${tokenSymbol} balance. You have ${formatTokenAmount(balance, tokenSymbol)} ${tokenSymbol}, but trying to repay ${amount} ${tokenSymbol}`,
                });
                return false;
            }

            // Check debt balance
            const debtBalance = await getDebtTokenBalance(publicClient, tokenSymbol, userAddress, false);
            if (debtBalance === 0n) {
                callback?.({
                    text: `You don't have any ${tokenSymbol} debt to repay.`,
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

            // Repay to Lendle
            try {
                callback?.({
                    text: `Repaying ${amount} ${tokenSymbol} to Lendle...`,
                });

                // Get the latest nonce for repay transaction
                const repayNonce = await publicClient.getTransactionCount({
                    address: userAddress
                });

                const repayHash = await walletClient.writeContract({
                    address: lendingPool,
                    abi: LENDING_POOL_ABI,
                    functionName: 'repay',
                    args: [token.address, amountInWei, 2, userAddress], // rateMode 2 = variable rate
                    chain: mantleChain,
                    account: provider.getAccount(),
                    nonce: repayNonce
                });

                await publicClient.waitForTransactionReceipt({
                    hash: repayHash
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

                // Get updated borrowed balance
                const newDebtBalance = await getDebtTokenBalance(publicClient, tokenSymbol, userAddress, false);

                const formattedData = formatUserAccountData({
                    totalCollateralETH,
                    totalDebtETH,
                    availableBorrowsETH,
                    currentLiquidationThreshold,
                    ltv,
                    healthFactor
                });

                callback?.({
                    text: formatBorrowRepayMessage(
                        'repay',
                        amount,
                        tokenSymbol,
                        repayHash,
                        formattedData,
                        formatTokenAmount(newDebtBalance, tokenSymbol)
                    ),
                    content: { hash: repayHash },
                });

                return true;
            } catch (error) {
                console.error('Repay failed:', error);
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
        "like paying back a loan to a bank",
        "like returning borrowed money with interest",
        "like settling a debt with a lending pool",
    ],
};
