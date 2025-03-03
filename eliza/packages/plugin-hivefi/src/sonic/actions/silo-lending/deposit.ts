// WIP

import type { Action, Memory } from "@elizaos/core";
import {
    parseUnits,
    createPublicClient,
    http
} from "viem";
import { sonicChain } from "../../config/chains";
import { initWalletProvider } from "../../providers/wallet";
import { TOKENS, getTokenBySymbol, isERC20Token, type TokenSymbol } from "../../config/tokens";

// Silo market vault addresses
const SILO_MARKETS = {
    S: "0xf55902de87bd80c6a35614b48d7f8b612a083c12" as const, // Silo S/WS vault
    USDC: "0x322e1d5384aa4ed66aeca770b95686271de61dc3" as const,
    WETH: "0x8e9b6c5a51724e899c0977a825c752e14d436690" as const,
} as const;

// ERC4626 Vault ABI
const VAULT_ABI = [{
    inputs: [
        { name: "assets", type: "uint256" },
        { name: "receiver", type: "address" }
    ],
    name: "deposit",
    outputs: [{ name: "shares", type: "uint256" }],
    stateMutability: "nonpayable",
    type: "function"
}, {
    inputs: [{ name: "account", type: "address" }],
    name: "maxDeposit",
    outputs: [{ name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function"
}, {
    inputs: [],
    name: "asset",
    outputs: [{ name: "", type: "address" }],
    stateMutability: "view",
    type: "function"
}, {
    inputs: [{ name: "account", type: "address" }],
    name: "balanceOf",
    outputs: [{ name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function"
}, {
    inputs: [{ name: "owner", type: "address" }],
    name: "maxRedeem",
    outputs: [{ name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function"
}] as const;

// ERC20 ABI for allowance and approve
const ERC20_ABI = [{
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
        { name: "spender", type: "address" },
        { name: "amount", type: "uint256" }
    ],
    name: "approve",
    outputs: [{ name: "", type: "bool" }],
    stateMutability: "nonpayable",
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

// WS token ABI for deposit
const WS_ABI = [{
    inputs: [],
    name: "deposit",
    outputs: [],
    stateMutability: "payable",
    type: "function"
}] as const;

export const deposit: Action = {
    name: "DEPOSIT_SILO",
    description: "Deposit tokens into Silo Finance V2 lending pools",
    examples: [
        [
            {
                user: "user1",
                content: {
                    text: "Deposit 0.1 S to Silo",
                },
            },
            {
                user: "assistant",
                content: {
                    text: "Initiating deposit of 0.1 S to Silo Finance...",
                },
            },
        ],
    ],
    handler: async (runtime, message: Memory, _state, _options, callback) => {
        try {
            // Initialize wallet provider
            const provider = initWalletProvider(runtime);
            if (!provider) {
                callback?.({
                    text: "Wallet not configured. Please set EVM_PRIVATE_KEY in your environment variables.",
                });
                return false;
            }

            // Parse message content
            const content = message.content?.text?.match(
                /Deposit ([\d.]+) ([A-Za-z]+)(?:\s+to\s+Silo)?/i
            );

            if (!content) {
                callback?.({
                    text: "Could not parse deposit request. Please use format: Deposit <amount> <token> to Silo",
                });
                return false;
            }

            const [, amount, tokenSymbol] = content;
            const token = getTokenBySymbol(tokenSymbol.toUpperCase() as TokenSymbol);

            if (!token) {
                const supportedTokens = Object.keys(SILO_MARKETS).join(", ");
                callback?.({
                    text: `Invalid token symbol. Supported tokens: ${supportedTokens}`,
                });
                return false;
            }

            // Get market address for the token
            const marketAddress = SILO_MARKETS[tokenSymbol.toUpperCase() as keyof typeof SILO_MARKETS];
            if (!marketAddress) {
                callback?.({
                    text: `No Silo market found for ${tokenSymbol}`,
                });
                return false;
            }

            // Send initial confirmation
            callback?.({
                text: `Initiating deposit of ${amount} ${token.symbol} to Silo Finance...`,
            });

            const walletClient = provider.getWalletClient();
            const publicClient = createPublicClient({
                chain: sonicChain,
                transport: http("https://rpc.soniclabs.com")
            });

            // Parse amount with correct decimals
            const amountInWei = parseUnits(amount, token.decimals);

            // Handle token approvals and balance checks
            if (token.type === 'native') {
                // Handle native S token wrapping and approval
                const wsToken = TOKENS.WS;
                if (!isERC20Token(wsToken)) {
                    throw new Error("WS token not properly configured");
                }

                // Check native balance first
                const nativeBalance = await publicClient.getBalance({
                    address: provider.getAddress() as `0x${string}`
                });

                if (nativeBalance < amountInWei) {
                    callback?.({
                        text: `Insufficient S balance. You need at least ${amount} S to complete this deposit.`,
                    });
                    return false;
                }

                // First wrap S to WS
                console.log("Wrapping S to WS...");
                const wrapHash = await walletClient.writeContract({
                    address: wsToken.address,
                    abi: WS_ABI,
                    functionName: 'deposit',
                    value: amountInWei,
                    chain: sonicChain,
                    account: provider.getAccount()
                });

                // Wait for wrap transaction and verify success
                const wrapReceipt = await publicClient.waitForTransactionReceipt({
                    hash: wrapHash,
                    timeout: 60000
                });

                if (!wrapReceipt.status) {
                    throw new Error("Failed to wrap S to WS");
                }

                // Wait a bit for the WS balance to be available
                await new Promise(resolve => setTimeout(resolve, 2000));

                // Verify WS balance after wrapping
                const wsBalance = await publicClient.readContract({
                    address: wsToken.address,
                    abi: ERC20_ABI,
                    functionName: 'balanceOf',
                    args: [provider.getAddress() as `0x${string}`]
                });

                if (wsBalance < amountInWei) {
                    throw new Error("WS wrapping failed - balance not available");
                }

                // Check current allowance
                console.log("Checking WS allowance for Silo vault...");
                const currentAllowance = await publicClient.readContract({
                    address: wsToken.address,
                    abi: ERC20_ABI,
                    functionName: 'allowance',
                    args: [provider.getAddress() as `0x${string}`, marketAddress as `0x${string}`]
                });

                console.log("Current WS allowance:", currentAllowance.toString());
                console.log("Required allowance:", amountInWei.toString());

                // Only approve if current allowance is insufficient
                if (currentAllowance < amountInWei) {
                    // Approve WS for the vault
                    console.log("Approving WS for Silo vault...");
                    const approveHash = await walletClient.writeContract({
                        address: wsToken.address,
                        abi: ERC20_ABI,
                        functionName: 'approve',
                        args: [marketAddress as `0x${string}`, amountInWei],
                        chain: sonicChain,
                        account: provider.getAccount()
                    });

                    const approveReceipt = await publicClient.waitForTransactionReceipt({
                        hash: approveHash,
                        timeout: 60000
                    });

                    if (!approveReceipt.status) {
                        throw new Error("WS approval failed");
                    }

                    // Wait a bit for the approval to be confirmed
                    await new Promise(resolve => setTimeout(resolve, 2000));

                    // Verify the new allowance
                    const newAllowance = await publicClient.readContract({
                        address: wsToken.address,
                        abi: ERC20_ABI,
                        functionName: 'allowance',
                        args: [provider.getAddress() as `0x${string}`, marketAddress as `0x${string}`]
                    });

                    console.log("New WS allowance after approval:", newAllowance.toString());

                    if (newAllowance < amountInWei) {
                        throw new Error("WS approval did not result in sufficient allowance");
                    }
                }

                // Execute deposit directly to the vault
                console.log("Depositing WS to Silo vault...");
                const depositHash = await walletClient.writeContract({
                    address: marketAddress as `0x${string}`,
                    abi: VAULT_ABI,
                    functionName: 'deposit',
                    args: [amountInWei, provider.getAddress() as `0x${string}`],
                    chain: sonicChain,
                    account: provider.getAccount(),
                    gas: 300000n // Add explicit gas limit
                });

                await publicClient.waitForTransactionReceipt({
                    hash: depositHash,
                    timeout: 60000
                });

                callback?.({
                    text: `Successfully deposited ${amount} ${token.symbol} to Silo Finance!\nTransaction Hash: ${depositHash}\nView on Explorer: https://sonicscan.org/tx/${depositHash}`,
                    content: { hash: depositHash },
                });

            } else if (isERC20Token(token)) {
                // For ERC20 tokens, check balance first
                const balance = await publicClient.readContract({
                    address: token.address,
                    abi: ERC20_ABI,
                    functionName: 'balanceOf',
                    args: [provider.getAddress() as `0x${string}`]
                });

                if (balance < amountInWei) {
                    callback?.({
                        text: `Insufficient ${token.symbol} balance. You need at least ${amount} ${token.symbol} to complete this deposit.`,
                    });
                    return false;
                }

                // Approve token for the vault
                console.log(`Approving ${token.symbol} for Silo vault...`);
                const approveHash = await walletClient.writeContract({
                    address: token.address,
                    abi: ERC20_ABI,
                    functionName: 'approve',
                    args: [marketAddress, amountInWei],
                    chain: sonicChain,
                    account: provider.getAccount()
                });

                await publicClient.waitForTransactionReceipt({
                    hash: approveHash,
                    timeout: 60000
                });

                // Execute deposit directly to the vault
                console.log(`Depositing ${token.symbol} to Silo vault...`);
                const depositHash = await walletClient.writeContract({
                    address: marketAddress as `0x${string}`,
                    abi: VAULT_ABI,
                    functionName: 'deposit',
                    args: [amountInWei, provider.getAddress() as `0x${string}`],
                    chain: sonicChain,
                    account: provider.getAccount()
                });

                await publicClient.waitForTransactionReceipt({
                    hash: depositHash,
                    timeout: 60000
                });

                callback?.({
                    text: `Successfully deposited ${amount} ${token.symbol} to Silo Finance!\nTransaction Hash: ${depositHash}\nView on Explorer: https://sonicscan.org/tx/${depositHash}`,
                    content: { hash: depositHash },
                });
            }

            return true;
        } catch (error) {
            console.error("Deposit failed:", error);
            callback?.({
                text: `Deposit failed: ${error instanceof Error ? error.message : "Unknown error"}`,
            });
            return false;
        }
    },
    validate: async () => true,
    similes: [
        "like depositing assets into a lending pool",
        "like providing collateral to Silo Finance",
        "like supplying tokens to earn interest"
    ],
};
