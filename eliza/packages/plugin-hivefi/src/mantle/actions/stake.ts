// WIP
import type { Action, Memory } from "@elizaos/core";
import {
    parseEther,
    type Address,
    createPublicClient,
    http,
    formatEther
} from "viem";
import { mantleChain } from "../config/chains";
import { initWalletProvider } from "../providers/wallet";

// Staking contract addresses
const STAKING_ADDRESS = "0xe3cBd06D7dadB3F4e6557bAb7EdD924CD1489E8f" as const;
const UNSTAKE_MANAGER_ADDRESS = "0x38fDF7b489316e03eD8754ad339cb5c4483FDcf9" as const;

// Staking ABI
const STAKING_ABI = [{
    "inputs": [
        { "name": "minMETHAmount", "type": "uint256" }
    ],
    "name": "stake",
    "outputs": [],
    "stateMutability": "payable",
    "type": "function"
}, {
    "inputs": [
        { "name": "methAmount", "type": "uint128" },
        { "name": "minETHAmount", "type": "uint128" }
    ],
    "name": "unstakeRequest",
    "outputs": [
        { "name": "", "type": "uint256" }
    ],
    "stateMutability": "nonpayable",
    "type": "function"
}, {
    "inputs": [
        { "name": "requestId", "type": "uint256" }
    ],
    "name": "claimUnstakeRequest",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
}, {
    "inputs": [
        { "name": "unstakeRequestID", "type": "uint256" }
    ],
    "name": "unstakeRequestInfo",
    "outputs": [
        { "name": "", "type": "bool" },
        { "name": "", "type": "uint256" }
    ],
    "stateMutability": "view",
    "type": "function"
}, {
    "inputs": [
        { "name": "ethAmount", "type": "uint256" }
    ],
    "name": "ethToMETH",
    "outputs": [
        { "name": "", "type": "uint256" }
    ],
    "stateMutability": "view",
    "type": "function"
}] as const;

class StakingAction {
    private publicClient;

    constructor(private walletProvider: ReturnType<typeof initWalletProvider>) {
        this.publicClient = createPublicClient({
            chain: mantleChain,
            transport: http("https://rpc.mantle.xyz")
        });
    }

    async getExpectedMETHAmount(ethAmount: bigint): Promise<bigint> {
        try {
            const mETHAmount = await this.publicClient.readContract({
                address: STAKING_ADDRESS,
                abi: STAKING_ABI,
                functionName: 'ethToMETH',
                args: [ethAmount]
            }) as bigint;
            return mETHAmount;
        } catch (error) {
            console.error("Error getting expected mETH amount:", error);
            throw error;
        }
    }

    async stake(amount: string): Promise<{ hash: string }> {
        if (!this.walletProvider) throw new Error("Wallet not initialized");

        const walletClient = this.walletProvider.getWalletClient();
        const value = parseEther(amount);

        // Calculate minimum mETH amount with 1% slippage
        const expectedMETH = await this.getExpectedMETHAmount(value);
        const minMETHAmount = expectedMETH * 99n / 100n; // 1% slippage

        // Execute stake
        const hash = await walletClient.writeContract({
            address: STAKING_ADDRESS,
            abi: STAKING_ABI,
            functionName: 'stake',
            args: [minMETHAmount],
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

    async unstake(methAmount: string, minETHAmount: string): Promise<{ hash: string; requestId: bigint }> {
        if (!this.walletProvider) throw new Error("Wallet not initialized");

        const walletClient = this.walletProvider.getWalletClient();

        // Parse amounts to correct format
        const methValue = parseEther(methAmount);
        const minEthValue = parseEther(minETHAmount);

        // Execute unstake request
        const hash = await walletClient.writeContract({
            address: STAKING_ADDRESS,
            abi: STAKING_ABI,
            functionName: 'unstakeRequest',
            args: [BigInt(methValue), BigInt(minEthValue)],
            chain: mantleChain,
            account: this.walletProvider.getAccount()
        });

        const receipt = await this.publicClient.waitForTransactionReceipt({
            hash,
            timeout: 60000
        });

        // Get requestId from logs
        const requestId = 0n; // TODO: Parse from logs
        return { hash, requestId };
    }

    async checkUnstakeStatus(requestId: bigint): Promise<{ isFinalized: boolean; filledAmount: bigint }> {
        const [isFinalized, filledAmount] = await this.publicClient.readContract({
            address: STAKING_ADDRESS,
            abi: STAKING_ABI,
            functionName: 'unstakeRequestInfo',
            args: [requestId]
        }) as [boolean, bigint];

        return { isFinalized, filledAmount };
    }

    async claimUnstake(requestId: bigint): Promise<{ hash: string }> {
        if (!this.walletProvider) throw new Error("Wallet not initialized");

        const walletClient = this.walletProvider.getWalletClient();

        // Execute claim
        const hash = await walletClient.writeContract({
            address: STAKING_ADDRESS,
            abi: STAKING_ABI,
            functionName: 'claimUnstakeRequest',
            args: [requestId],
            chain: mantleChain,
            account: this.walletProvider.getAccount()
        });

        await this.publicClient.waitForTransactionReceipt({
            hash,
            timeout: 60000
        });

        return { hash };
    }
}

export const stake: Action = {
    name: "STAKE_ETH",
    description: "Stake ETH to receive mETH on Mantle network",
    examples: [
        [
            {
                user: "user1",
                content: {
                    text: "Stake 1 ETH",
                },
            },
            {
                user: "assistant",
                content: {
                    text: "The staking transaction has been initiated. You will receive mETH once the transaction is complete.",
                },
            },
            {
                user: "assistant",
                content: {
                    text: "Successfully staked 1 ETH for mETH: {hash}",
                },
            },
        ],
    ],
    handler: async (runtime, message: Memory, state, options, callback) => {
        try {
            // Parse the stake request
            const content = message.content?.text?.toLowerCase().match(
                /(?:stake\s+|)([\d.]+)(?:\s+eth)?/i
            );

            if (!content) {
                callback?.({
                    text: "Could not parse stake details. Please use format: Stake <amount> ETH",
                });
                return false;
            }

            const [_, amount] = content;

            // Initialize wallet and staking action
            const provider = initWalletProvider(runtime);
            if (!provider) {
                callback?.({
                    text: "Wallet not configured. Please set EVM_PRIVATE_KEY in your environment variables.",
                });
                return false;
            }

            const stakingAction = new StakingAction(provider);

            // Get expected mETH amount
            const ethAmount = parseEther(amount);
            const expectedMETH = await stakingAction.getExpectedMETHAmount(ethAmount);
            const expectedMETHFormatted = formatEther(expectedMETH);

            // Send initial confirmation with expected mETH amount
            callback?.({
                text: `Staking ${amount} ETH for approximately ${expectedMETHFormatted} mETH (with 1% slippage protection)...`,
            });

            // Execute stake
            const result = await stakingAction.stake(amount);

            callback?.({
                text: `Successfully staked ${amount} ETH for mETH\nTransaction Hash: ${result.hash}\nView on Explorer: https://explorer.mantle.xyz/tx/${result.hash}`,
                content: { hash: result.hash },
            });

            return true;
        } catch (error) {
            console.error("Stake failed:", error);
            callback?.({
                text: `Stake failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
                content: { error: error instanceof Error ? error.message : 'Unknown error' },
            });
            return false;
        }
    },
    validate: async () => true,
    similes: [
        "like depositing ETH to earn staking rewards",
        "like converting ETH to mETH for staking",
        "like participating in Mantle's ETH staking",
    ],
};
