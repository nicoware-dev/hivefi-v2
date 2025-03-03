import type { Action, Memory } from "@elizaos/core";
import {
    parseUnits,
    createPublicClient,
    createWalletClient,
    http,
    type Address,
    encodeFunctionData,
    parseEther,
    formatEther,
    type Account,
} from "viem";
import { sonicChain } from "../../config/chains";
import { initWalletProvider } from "../../providers/wallet";
import { TOKENS, getTokenBySymbol, isERC20Token, type TokenSymbol, type ERC20TokenConfig } from "../../config/tokens";

// deBridge contract addresses
const DEBRIDGE_CONTRACTS = {
    // Main bridge contracts
    SONIC: {
        DeBridgeGate: "0x43de2d77bf8027e25dbd179b491e8d64f38398aa" as const,
    },
    ARBITRUM: {
        DeBridgeGate: "0x43dE2d77BF8027e25dBD179B491e8d64f38398aA" as const,
    }
} as const;

// Chain IDs for deBridge
const CHAIN_IDS = {
    SONIC: 146n,
    ARBITRUM: 42161n,
} as const;

// Fixed bridge fee in S
const BRIDGE_FEE = parseEther("1.0");

// DeBridgeGate Implementation ABI
const DEBRIDGE_GATE_ABI = [{
    inputs: [
        { name: "_tokenAddress", type: "address" },
        { name: "_amount", type: "uint256" },
        { name: "_chainIdTo", type: "uint256" },
        { name: "_receiver", type: "bytes" },
        { name: "_permit", type: "bytes" },
        { name: "_useAssetFee", type: "bool" },
        { name: "_referralCode", type: "uint32" },
        { name: "_autoParams", type: "bytes" }
    ],
    name: "send",
    outputs: [],
    stateMutability: "payable",
    type: "function"
}] as const;

// ERC20 ABI for approvals and balance checks
const ERC20_ABI = [{
    inputs: [
        { name: "spender", type: "address" },
        { name: "amount", type: "uint256" }
    ],
    name: "approve",
    outputs: [{ name: "", type: "bool" }],
    stateMutability: "nonpayable",
    type: "function"
}, {
    inputs: [
        { name: "owner", type: "address" },
        { name: "spender", type: "address" }
    ],
    name: "allowance",
    outputs: [{ name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function"
}, {
    inputs: [
        { name: "account", type: "address" }
    ],
    name: "balanceOf",
    outputs: [{ name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function"
}] as const;

// Supported destination chains
const SUPPORTED_CHAINS = ["arbitrum"] as const;
type SupportedChain = typeof SUPPORTED_CHAINS[number];

export const bridge: Action = {
    name: "BRIDGE_TOKENS",
    description: "Bridge tokens from Sonic to other chains using deBridge (costs 1 S as fixed fee)",
    examples: [
        [
            {
                user: "user1",
                content: {
                    text: "Bridge 100 MARI to Arbitrum",
                    entities: {
                        amount: "100",
                        token: "MARI",
                        toChain: "arbitrum"
                    }
                }
            },
            {
                user: "assistant",
                content: {
                    text: "Initiating bridge transaction of 100 MARI to Arbitrum (fee: 1 S)...",
                }
            }
        ]
    ],
    handler: async (runtime, message: Memory, _state, _options, callback) => {
        try {
            // Initialize provider
            const provider = initWalletProvider(runtime);
            if (!provider) {
                callback?.({
                    text: "Wallet not configured. Please set EVM_PRIVATE_KEY in your environment variables.",
                });
                return false;
            }

            // Parse message content
            const content = message.content?.text?.match(
                /Bridge ([\d.]+) ([A-Za-z]+) to ([A-Za-z]+)/i
            );

            if (!content) {
                callback?.({
                    text: "Could not parse bridge request. Please use format: Bridge <amount> <token> to <chain>",
                });
                return false;
            }

            const [, amount, tokenSymbol, toChain] = content;
            const token = getTokenBySymbol(tokenSymbol.toUpperCase() as TokenSymbol);
            const destinationChain = toChain.toLowerCase();

            // Validate token and chain
            if (!token || !isERC20Token(token)) {
                callback?.({
                    text: "Invalid or unsupported token. Only ERC20 tokens are supported for bridging.",
                });
                return false;
            }

            if (destinationChain !== 'arbitrum') {
                callback?.({
                    text: "Only bridging to Arbitrum is supported at the moment.",
                });
                return false;
            }

            // Send initial confirmation
            callback?.({
                text: `Initiating bridge transaction of ${amount} ${token.symbol} to Arbitrum (fee: 1 S)...`,
            });

            // Get clients from provider
            const walletClient = provider.getWalletClient();
            const publicClient = createPublicClient({
                chain: sonicChain,
                transport: http()
            });

            // Parse amount
            const amountInWei = parseUnits(amount, token.decimals);

            // Get the receiver address
            const receiver = provider.getAddress();

            // Check token balance
            const balance = await publicClient.readContract({
                address: token.address,
                abi: ERC20_ABI,
                functionName: 'balanceOf',
                args: [receiver as Address]
            });

            if (balance < amountInWei) {
                callback?.({
                    text: `Insufficient ${token.symbol} balance. You need ${amount} ${token.symbol}.`,
                });
                return false;
            }

            // Check S balance for fixed fee
            const nativeBalance = await publicClient.getBalance({
                address: receiver as Address
            });

            if (nativeBalance < BRIDGE_FEE) {
                callback?.({
                    text: `Insufficient S balance for bridge fee. You need 1 S for the bridge fee.`,
                });
                return false;
            }

            // Check and handle token approval
            const allowance = await publicClient.readContract({
                address: token.address,
                abi: ERC20_ABI,
                functionName: 'allowance',
                args: [receiver as Address, DEBRIDGE_CONTRACTS.SONIC.DeBridgeGate as Address]
            });

            if (allowance < amountInWei) {
                console.log(`Approving ${token.symbol} for bridge...`);
                const approveHash = await walletClient.writeContract({
                    address: token.address,
                    abi: ERC20_ABI,
                    functionName: 'approve',
                    args: [DEBRIDGE_CONTRACTS.SONIC.DeBridgeGate as Address, amountInWei],
                    account: walletClient.account as Account,
                    chain: null
                });

                await publicClient.waitForTransactionReceipt({
                    hash: approveHash,
                    timeout: 60000
                });
            }

            // Execute bridge transaction
            const hash = await walletClient.writeContract({
                address: DEBRIDGE_CONTRACTS.SONIC.DeBridgeGate as Address,
                abi: DEBRIDGE_GATE_ABI,
                functionName: 'send',
                args: [
                    token.address,
                    amountInWei,
                    CHAIN_IDS.ARBITRUM,
                    `0x${receiver.slice(2)}` as `0x${string}`,
                    "0x" as `0x${string}`,
                    false,
                    0,
                    "0x" as `0x${string}`,
                ],
                account: walletClient.account as Account,
                chain: null,
                value: BRIDGE_FEE,
            });

            callback?.({
                text: `Successfully initiated bridge transaction!
Amount: ${amount} ${token.symbol}
To: Arbitrum
Fee: 1 S
Transaction Hash: ${hash}

View on Sonic Explorer:
https://sonicscan.org/tx/${hash}

Claim your tokens on Arbitrum:
https://app.debridge.finance/transaction?tx=${hash}&chainId=100000014

Important Notes:
- Wait 10-20 minutes for the transaction to be confirmed
- You'll need some ETH on Arbitrum for the claim transaction
- Connect the same wallet address to claim your tokens`,
                content: { hash },
            });

            return true;
        } catch (error) {
            console.error("Bridge failed:", error);
            callback?.({
                text: `Bridge operation failed: ${error instanceof Error ? error.message : "Unknown error"}`,
            });
            return false;
        }
    },
    validate: async () => true,
    similes: [
        "like sending tokens across different blockchains",
        "like using deBridge to transfer tokens to Arbitrum",
        "like bridging tokens with a fixed 1 S fee"
    ],
};
