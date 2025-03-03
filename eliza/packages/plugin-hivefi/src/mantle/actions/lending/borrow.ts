import type { Action, Memory } from "@elizaos/core";
import { createPublicClient, http, type Address } from 'viem';
import { mantleChain } from '../../config/chains';
import { initWalletProvider } from '../../providers/wallet';
import { LENDING_POOL_ABI } from './config';
import {
    parseAmountAndToken,
    getLendingPoolAddress,
    parseTokenAmount,
    getTokenConfig,
    formatUserAccountData,
    formatTokenAmount,
    getDebtTokenBalance,
    canBorrow,
    formatBorrowRepayMessage
} from './utils';

export const borrow: Action = {
    name: "BORROW_LENDING",
    description: "Borrow tokens from Lendle lending pools on Mantle",
    examples: [
        [
            {
                user: "user1",
                content: {
                    text: "Borrow 100 USDC from Lendle",
                },
            },
            {
                user: "assistant",
                content: {
                    text: "Let's proceed with borrowing 100 USDC from Lendle on the Mantle network. Please hold on while I process the transaction.",
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

            // Parse the borrow request
            const content = message.content?.text?.toLowerCase();
            if (!content) {
                callback?.({
                    text: "Could not parse borrow request. Please use format: Borrow <amount> <token> from Lendle",
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
                    text: `Let's proceed with borrowing ${amount} ${tokenSymbol} from Lendle on the Mantle network. Please hold on while I process the transaction.`,
                });
            }

            // Get token configuration and addresses
            const token = getTokenConfig(tokenSymbol);
            const lendingPool = getLendingPoolAddress();
            const userAddress = provider.getAddress() as Address;

            // Convert amount to proper decimals
            const amountInWei = parseTokenAmount(amount, tokenSymbol);

            // Get user account data to check borrowing capacity
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

            const accountData = formatUserAccountData({
                totalCollateralETH,
                totalDebtETH,
                availableBorrowsETH,
                currentLiquidationThreshold,
                ltv,
                healthFactor
            });

            // Check if user can borrow
            const borrowCheck = canBorrow(accountData, amount, tokenSymbol);
            if (!borrowCheck.canBorrow) {
                callback?.({
                    text: borrowCheck.reason || 'Cannot borrow at this time',
                });
                return false;
            }

            // Borrow from Lendle
            try {
                callback?.({
                    text: `Borrowing ${amount} ${tokenSymbol} from Lendle...`,
                });

                // Get the latest nonce for borrow transaction
                const borrowNonce = await publicClient.getTransactionCount({
                    address: userAddress
                });

                const borrowHash = await walletClient.writeContract({
                    address: lendingPool,
                    abi: LENDING_POOL_ABI,
                    functionName: 'borrow',
                    args: [token.address, amountInWei, 2, 0, userAddress], // interestRateMode 2 = variable rate
                    chain: mantleChain,
                    account: provider.getAccount(),
                    nonce: borrowNonce
                });

                await publicClient.waitForTransactionReceipt({
                    hash: borrowHash
                });

                // Get updated user account data
                const [
                    newTotalCollateralETH,
                    newTotalDebtETH,
                    newAvailableBorrowsETH,
                    newCurrentLiquidationThreshold,
                    newLtv,
                    newHealthFactor
                ] = await publicClient.readContract({
                    address: lendingPool,
                    abi: LENDING_POOL_ABI,
                    functionName: 'getUserAccountData',
                    args: [userAddress]
                });

                // Get borrowed balance
                const borrowedBalance = await getDebtTokenBalance(publicClient, tokenSymbol, userAddress, false);

                const formattedData = formatUserAccountData({
                    totalCollateralETH: newTotalCollateralETH,
                    totalDebtETH: newTotalDebtETH,
                    availableBorrowsETH: newAvailableBorrowsETH,
                    currentLiquidationThreshold: newCurrentLiquidationThreshold,
                    ltv: newLtv,
                    healthFactor: newHealthFactor
                });

                callback?.({
                    text: formatBorrowRepayMessage(
                        'borrow',
                        amount,
                        tokenSymbol,
                        borrowHash,
                        formattedData,
                        formatTokenAmount(borrowedBalance, tokenSymbol)
                    ),
                    content: { hash: borrowHash },
                });

                return true;
            } catch (error) {
                console.error('Borrow failed:', error);
                callback?.({
                    text: error instanceof Error ? error.message : 'Failed to borrow',
                });
                return false;
            }
        } catch (error) {
            console.error('Operation failed:', error);
            callback?.({
                text: error instanceof Error ? error.message : 'Unknown error',
                content: { error: error instanceof Error ? error.message : 'Unknown error' },
            });
            return false;
        }
    },
    validate: async () => true,
    similes: [
        "like taking out a loan from a bank",
        "like borrowing money with collateral",
        "like getting a loan from a lending pool",
    ],
};
