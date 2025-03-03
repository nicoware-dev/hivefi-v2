// WIP
import type { Action, Memory } from "@elizaos/core";
import {
    parseEther,
    type Address,
    createPublicClient,
    http,
    formatEther,
    parseUnits
} from "viem";
import { mantleChain } from "../config/chains";
import { initWalletProvider } from "../providers/wallet";
import { TOKENS, getTokenBySymbol } from "../config/tokens";

// Contract addresses
const STAKING_ADDRESS = "0xe3cBd06D7dadB3F4e6557bAb7EdD924CD1489E8f" as const;
const UNSTAKE_MANAGER_ADDRESS = "0x38fDF7b489316e03eD8754ad339cb5c4483FDcf9" as const;

// ABI for the unstake manager
const UNSTAKE_MANAGER_ABI = [{
    "inputs": [
        { "name": "requestID", "type": "uint256" }
    ],
    "name": "requestInfo",
    "outputs": [
        { "name": "", "type": "bool" },
        { "name": "", "type": "uint256" }
    ],
    "stateMutability": "view",
    "type": "function"
}, {
    "inputs": [
        { "name": "requestID", "type": "uint256" }
    ],
    "name": "requestByID",
    "outputs": [{
        "components": [
            { "name": "blockNumber", "type": "uint64" },
            { "name": "requester", "type": "address" },
            { "name": "id", "type": "uint128" },
            { "name": "mETHLocked", "type": "uint128" },
            { "name": "ethRequested", "type": "uint128" },
            { "name": "cumulativeETHRequested", "type": "uint128" }
        ],
        "name": "",
        "type": "tuple"
    }],
    "stateMutability": "view",
    "type": "function"
}] as const;

// ABI for the staking contract's unstake functions
const STAKING_UNSTAKE_ABI = [{
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
        { "name": "mETHAmount", "type": "uint256" }
    ],
    "name": "mETHToETH",
    "outputs": [
        { "name": "", "type": "uint256" }
    ],
    "stateMutability": "view",
    "type": "function"
}] as const;

class UnstakeAction {
    private publicClient;

    constructor(private walletProvider: ReturnType<typeof initWalletProvider>) {
        this.publicClient = createPublicClient({
            chain: mantleChain,
            transport: http("https://rpc.mantle.xyz")
        });
    }

    async getExpectedETHAmount(mETHAmount: bigint): Promise<bigint> {
        try {
            const ethAmount = await this.publicClient.readContract({
                address: STAKING_ADDRESS,
                abi: STAKING_UNSTAKE_ABI,
                functionName: 'mETHToETH',
                args: [mETHAmount]
            }) as bigint;
            return ethAmount;
        } catch (error) {
            console.error("Error getting expected ETH amount:", error);
            throw error;
        }
    }

    async unstake(methAmount: string): Promise<{ hash: string; requestId: bigint }> {
        if (!this.walletProvider) throw new Error("Wallet not initialized");

        const walletClient = this.walletProvider.getWalletClient();
        const methValue = parseEther(methAmount);

        // Calculate expected ETH amount with 1% slippage
        const expectedETH = await this.getExpectedETHAmount(methValue);
        const minETHAmount = expectedETH * 99n / 100n; // 1% slippage

        // Execute unstake request
        const hash = await walletClient.writeContract({
            address: STAKING_ADDRESS,
            abi: STAKING_UNSTAKE_ABI,
            functionName: 'unstakeRequest',
            args: [BigInt(methValue), BigInt(minETHAmount)],
            chain: mantleChain,
            account: this.walletProvider.getAccount()
        });

        const receipt = await this.publicClient.waitForTransactionReceipt({
            hash,
            timeout: 60000
        });

        // Get requestId from UnstakeRequestCreated event
        const requestId = this.parseRequestIdFromLogs(receipt.logs);
        return { hash, requestId };
    }

    async checkUnstakeStatus(requestId: bigint): Promise<{ isFinalized: boolean; filledAmount: bigint }> {
        const [isFinalized, filledAmount] = await this.publicClient.readContract({
            address: UNSTAKE_MANAGER_ADDRESS,
            abi: UNSTAKE_MANAGER_ABI,
            functionName: 'requestInfo',
            args: [requestId]
        }) as [boolean, bigint];

        return { isFinalized, filledAmount };
    }

    async getUnstakeRequest(requestId: bigint): Promise<{
        blockNumber: bigint;
        requester: string;
        id: bigint;
        mETHLocked: bigint;
        ethRequested: bigint;
        cumulativeETHRequested: bigint;
    }> {
        const request = await this.publicClient.readContract({
            address: UNSTAKE_MANAGER_ADDRESS,
            abi: UNSTAKE_MANAGER_ABI,
            functionName: 'requestByID',
            args: [requestId]
        });

        // Cast the response to the correct type
        const [blockNumber, requester, id, mETHLocked, ethRequested, cumulativeETHRequested] = request as unknown as [bigint, string, bigint, bigint, bigint, bigint];

        return {
            blockNumber,
            requester,
            id,
            mETHLocked,
            ethRequested,
            cumulativeETHRequested
        };
    }

    async claimUnstake(requestId: bigint): Promise<{ hash: string }> {
        if (!this.walletProvider) throw new Error("Wallet not initialized");

        const walletClient = this.walletProvider.getWalletClient();

        // Execute claim
        const hash = await walletClient.writeContract({
            address: STAKING_ADDRESS,
            abi: STAKING_UNSTAKE_ABI,
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

    private parseRequestIdFromLogs(logs: readonly { topics: readonly string[]; data: string }[]): bigint {
        // Find UnstakeRequestCreated event and parse requestId
        // TODO: Implement proper log parsing
        return 0n;
    }
}

export const unstake: Action = {
    name: "UNSTAKE_METH",
    description: "Unstake mETH to receive ETH on Mantle network",
    examples: [
        [
            {
                user: "user1",
                content: {
                    text: "Unstake 1 mETH",
                },
            },
            {
                user: "assistant",
                content: {
                    text: "The unstaking request has been initiated. You will receive ETH once the request is finalized and claimed.",
                },
            },
            {
                user: "assistant",
                content: {
                    text: "Successfully created unstake request: {hash}\nRequest ID: {requestId}",
                },
            },
        ],
    ],
    handler: async (runtime, message: Memory, state, options, callback) => {
        try {
            // Parse the unstake request
            const content = message.content?.text?.toLowerCase().match(
                /(?:unstake\s+|)([\d.]+)(?:\s+meth)?/i
            );

            if (!content) {
                callback?.({
                    text: "Could not parse unstake details. Please use format: Unstake <amount> mETH",
                });
                return false;
            }

            const [_, amount] = content;

            // Initialize wallet and unstaking action
            const provider = initWalletProvider(runtime);
            if (!provider) {
                callback?.({
                    text: "Wallet not configured. Please set EVM_PRIVATE_KEY in your environment variables.",
                });
                return false;
            }

            const unstakeAction = new UnstakeAction(provider);

            // Get expected ETH amount
            const methAmount = parseEther(amount);
            const expectedETH = await unstakeAction.getExpectedETHAmount(methAmount);
            const expectedETHFormatted = formatEther(expectedETH);

            // Send initial confirmation with expected ETH amount
            callback?.({
                text: `Unstaking ${amount} mETH for approximately ${expectedETHFormatted} ETH (with 1% slippage protection)...`,
            });

            // Execute unstake
            const result = await unstakeAction.unstake(amount);

            callback?.({
                text: [
                    `Successfully created unstake request for ${amount} mETH`,
                    `Transaction Hash: ${result.hash}`,
                    `Request ID: ${result.requestId}`,
                    `View on Explorer: https://explorer.mantle.xyz/tx/${result.hash}`,
                    "",
                    "Note: Your request will be finalized after a certain number of blocks. Once finalized, you can claim your ETH."
                ].join('\n'),
                content: { hash: result.hash, requestId: result.requestId },
            });

            return true;
        } catch (error) {
            console.error("Unstake failed:", error);
            callback?.({
                text: `Unstake failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
                content: { error: error instanceof Error ? error.message : 'Unknown error' },
            });
            return false;
        }
    },
    validate: async () => true,
    similes: [
        "like withdrawing ETH from staking",
        "like converting mETH back to ETH",
        "like exiting from Mantle's ETH staking",
    ],
};
