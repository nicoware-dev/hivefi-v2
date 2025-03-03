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

export const withdraw: Action = {
    name: "WITHDRAW_LENDING",
    description: "Withdraw tokens from Lendle lending pools on Mantle",
    examples: [
        [
            {
                user: "user1",
                content: {
                    text: "Withdraw 0.01 USDC from Lendle",
                },
            },
            {
                user: "assistant",
                content: {
                    text: "Let's proceed with withdrawing 0.01 USDC from Lendle on the Mantle network. Please hold on while I process the transaction.",
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

            // Parse the withdraw request
            const content = message.content?.text?.toLowerCase();
            if (!content) {
                callback?.({
                    text: "Could not parse withdraw request. Please use format: Withdraw <amount> <token> from Lendle",
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
                    text: `Let's proceed with withdrawing ${amount} ${tokenSymbol} from Lendle on the Mantle network. Please hold on while I process the transaction.`,
                });
            }

            // Get token configuration
            const token = getTokenConfig(tokenSymbol);
            const lendingPool = getLendingPoolAddress();
            const userAddress = provider.getAddress() as Address;

            // Convert amount to proper decimals
            const amountInWei = parseTokenAmount(amount, tokenSymbol);

            // Check supplied balance
            const suppliedBalance = await getATokenBalance(publicClient, tokenSymbol, userAddress);

            if (suppliedBalance < amountInWei) {
                callback?.({
                    text: `Insufficient ${tokenSymbol} supplied. You have ${formatTokenAmount(suppliedBalance, tokenSymbol)} ${tokenSymbol} supplied, but trying to withdraw ${amount} ${tokenSymbol}`,
                });
                return false;
            }

            // Withdraw from Lendle
            try {
                callback?.({
                    text: `Withdrawing ${amount} ${tokenSymbol} from Lendle...`,
                });

                // Get the latest nonce for withdraw transaction
                const withdrawNonce = await publicClient.getTransactionCount({
                    address: userAddress
                });

                const withdrawHash = await walletClient.writeContract({
                    address: lendingPool,
                    abi: LENDING_POOL_ABI,
                    functionName: 'withdraw',
                    args: [token.address, amountInWei, userAddress],
                    chain: mantleChain,
                    account: provider.getAccount(),
                    nonce: withdrawNonce
                });

                await publicClient.waitForTransactionReceipt({
                    hash: withdrawHash
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

                const newSuppliedBalance = await getATokenBalance(publicClient, tokenSymbol, userAddress);

                const formattedData = formatUserAccountData({
                    totalCollateralETH,
                    totalDebtETH,
                    availableBorrowsETH,
                    currentLiquidationThreshold,
                    ltv,
                    healthFactor,
                    walletBalance: newWalletBalance,
                    suppliedBalance: newSuppliedBalance
                });

                callback?.({
                    text: formatSuccessMessage('withdraw', amount, tokenSymbol, withdrawHash, formattedData),
                    content: { hash: withdrawHash },
                });

                return true;
            } catch (error) {
                console.error('Withdraw failed:', error);
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
        "like taking money out of a savings account",
        "like withdrawing assets from a lending pool",
        "like removing liquidity from a protocol",
    ],
};
