import { parseUnits } from "viem";
import { parseChainFromPrompt } from "../utils/chain-utils";
import { MultichainWalletProvider } from "../providers/wallet-provider";
import { IAgentRuntime, Memory, State, ActionExample } from "@elizaos/core";

// Define token interface
interface Token {
  symbol: string;
  name: string;
  decimals: number;
  chains: Record<number, { contractAddress: `0x${string}` }>;
}

// Define supported tokens
const USDC: Token = {
  symbol: "USDC",
  name: "USD Coin",
  decimals: 6,
  chains: {
    1: { contractAddress: "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48" }, // Ethereum
    10: { contractAddress: "0x7F5c764cBc14f9669B88837ca1490cCa17c31607" }, // Optimism
    42161: { contractAddress: "0xaf88d065e77c8cC2239327C5EDb3A432268e5831" }, // Arbitrum
    137: { contractAddress: "0x3c499c542cEF5E3811e1192ce70d8cC03d5c3359" }, // Polygon
  }
};

const USDT: Token = {
  symbol: "USDT",
  name: "Tether USD",
  decimals: 6,
  chains: {
    1: { contractAddress: "0xdAC17F958D2ee523a2206206994597C13D831ec7" }, // Ethereum
    10: { contractAddress: "0x94b008aA00579c1307B0EF2c499aD98a8ce58e58" }, // Optimism
    42161: { contractAddress: "0xFd086bC7CD5C481DCC9C85ebE478A1C0b69FCbb9" }, // Arbitrum
    137: { contractAddress: "0xc2132D05D31c914a87C6611C10748AEb04B58e8F" }, // Polygon
  }
};

const DAI: Token = {
  symbol: "DAI",
  name: "Dai Stablecoin",
  decimals: 18,
  chains: {
    1: { contractAddress: "0x6B175474E89094C44Da98b954EedeAC495271d0F" }, // Ethereum
    10: { contractAddress: "0xDA10009cBd5D07dd0CeCc66161FC93D7c9000da1" }, // Optimism
    42161: { contractAddress: "0xDA10009cBd5D07dd0CeCc66161FC93D7c9000da1" }, // Arbitrum
    137: { contractAddress: "0x8f3Cf7ad23Cd3CaDbD9735AFf958023239c6A063" }, // Polygon
  }
};

// Map of supported tokens by symbol
const TOKENS: Record<string, Token> = {
  USDC,
  USDT,
  DAI
};

// Chain ID to name mapping for better error messages
const CHAIN_NAMES: Record<number, string> = {
  1: "Ethereum",
  10: "Optimism",
  42161: "Arbitrum",
  137: "Polygon",
};

// Helper function to get token by symbol
function getTokenBySymbol(symbol: string): Token | undefined {
  return TOKENS[symbol.toUpperCase()];
}

type ActionCallback = (response: { text: string; content: Record<string, unknown> }) => void;

export function createTokenTransferAction() {
  return {
    name: "TRANSFER_ERC20_TOKEN",
    description: "Transfer ERC-20 tokens on any supported chain",
    similes: [
      "send token",
      "transfer USDC",
      "send DAI",
      "transfer ERC20",
    ],
    validate: async () => true,
    examples: [
      [
        {
          user: "user1",
          content: {
            text: "Send 10 USDC on Optimism to 0x123..."
          }
        },
        {
          user: "assistant",
          content: {
            text: "I'll help you send 10 USDC on Optimism to 0x123... Let me process that transaction for you."
          }
        }
      ],
      [
        {
          user: "user1",
          content: {
            text: "Transfer 5 DAI on Ethereum to 0xabc..."
          }
        },
        {
          user: "assistant",
          content: {
            text: "I'll help you transfer 5 DAI on Ethereum to 0xabc... I'll process that transaction now."
          }
        }
      ],
      [
        {
          user: "user1",
          content: {
            text: "Send 100 USDT from my wallet to 0x456... on Arbitrum"
          }
        },
        {
          user: "assistant",
          content: {
            text: "I'll help you send 100 USDT on Arbitrum to 0x456... Processing the transaction now."
          }
        }
      ]
    ] as ActionExample[][],
    handler: async (
      runtime: IAgentRuntime, 
      message: Memory, 
      state?: State, 
      options: Record<string, unknown> = {}, 
      callback?: ActionCallback
    ) => {
      let currentState = state ?? (await runtime.composeState(message));
      currentState = await runtime.updateRecentMessageState(currentState);

      try {
        // Check if we should use simulation mode
        const useSimulation = runtime.getSetting("MULTICHAIN_SIMULATION_MODE") === "true";
        console.log(`[DEBUG] Using simulation mode: ${useSimulation}`);
        
        // Get private key from runtime settings
        const privateKey = (runtime.getSetting("MULTICHAIN_PRIVATE_KEY") || runtime.getSetting("EVM_PRIVATE_KEY")) as string;
        if (!privateKey && !useSimulation) {
          throw new Error("MULTICHAIN_PRIVATE_KEY or EVM_PRIVATE_KEY not configured");
        }

        // Parse transfer details from message
        const text = message.content?.text || '';
        
        // Try different regex patterns to extract transfer details
        let transferMatch = text.match(/(?:send|transfer) ([\d.]+) ([A-Za-z]+) (?:on|to|from) ([A-Za-z]+) (?:to|on) (0x[a-fA-F0-9]{40})/i);
        
        if (!transferMatch) {
          transferMatch = text.match(/(?:send|transfer) ([\d.]+) ([A-Za-z]+) (?:to|on) (0x[a-fA-F0-9]{40})/i);
        }
        
        if (!transferMatch) {
          callback?.({
            text: "Could not parse transfer details. Please use one of these formats:\n" +
                 "1. Send <amount> <token> on <chain> to <address>\n" +
                 "2. Transfer <amount> <token> to <address> on <chain>\n" +
                 "3. Send <amount> <token> to <address>",
            content: { error: "parsing_error" }
          });
          return false;
        }
        
        // Extract transfer details
        let amount: string;
        let tokenSymbol: string;
        let to: `0x${string}`;
        let chainIdStr: string;
        
        if (transferMatch.length === 5) {
          // Format: Send <amount> <token> on <chain> to <address>
          amount = transferMatch[1];
          tokenSymbol = transferMatch[2].toUpperCase();
          const chainName = transferMatch[3];
          to = transferMatch[4].toLowerCase() as `0x${string}`;
          chainIdStr = parseChainFromPrompt(chainName);
          console.log(`[DEBUG] Parsed from format 1: amount=${amount}, token=${tokenSymbol}, chainName=${chainName}, chainId=${chainIdStr}, to=${to}`);
        } else {
          // Format: Send <amount> <token> to <address>
          amount = transferMatch[1];
          tokenSymbol = transferMatch[2].toUpperCase();
          to = transferMatch[3].toLowerCase() as `0x${string}`;
          chainIdStr = parseChainFromPrompt(text);
          console.log(`[DEBUG] Parsed from format 2: amount=${amount}, token=${tokenSymbol}, chainId=${chainIdStr}, to=${to}`);
        }
        
        // Convert chainId to number
        const chainId = parseInt(chainIdStr);
        console.log(`[DEBUG] Converted chainId string "${chainIdStr}" to number: ${chainId}`);
        
        // Validate token
        const token = getTokenBySymbol(tokenSymbol);
        console.log(`[DEBUG] Token lookup: ${tokenSymbol} => ${token ? 'found' : 'not found'}`);
        if (token) {
          console.log(`[DEBUG] Token chains:`, Object.keys(token.chains));
          console.log(`[DEBUG] Looking for chainId: ${chainId}`);
          console.log(`[DEBUG] Chain supported: ${token.chains[chainId] ? 'yes' : 'no'}`);
        }
        
        if (!token) {
          const supportedTokens = Object.keys(TOKENS).join(", ");
          callback?.({
            text: `Invalid token symbol. Supported tokens: ${supportedTokens}`,
            content: { error: "invalid_token", supportedTokens }
          });
          return false;
        }
        
        // Validate chain and token support for chain
        if (!token.chains[chainId]) {
          const supportedChains = Object.keys(token.chains)
            .map(id => CHAIN_NAMES[parseInt(id)] || id)
            .join(", ");
          console.log(`[DEBUG] Token ${tokenSymbol} not supported on chain ${chainId}. Supported chains:`, Object.keys(token.chains));
          callback?.({
            text: `${tokenSymbol} is not supported on this chain. Supported chains for ${tokenSymbol}: ${supportedChains}`,
            content: { error: "unsupported_chain", supportedChains }
          });
          return false;
        }
        
        // Validate address
        if (!to.match(/^0x[a-fA-F0-9]{40}$/)) {
          callback?.({
            text: "Invalid address format. Address must be a valid Ethereum-style address.",
            content: { error: "invalid_address" }
          });
          return false;
        }
        
        // Get chain name for display
        const chainName = CHAIN_NAMES[chainId] || chainId.toString();
        
        // If using simulation mode, return a simulated success response
        if (useSimulation) {
          const simulatedHash = `0x${Math.random().toString(16).substring(2, 42)}`;
          callback?.({
            text: `[SIMULATION MODE] ${amount} ${tokenSymbol} sent to ${to} on ${chainName}\nSimulated Transaction Hash: ${simulatedHash}\n\nNote: This is a simulation. No actual tokens were transferred.`,
            content: { 
              hash: simulatedHash, 
              chainId, 
              tokenSymbol, 
              amount, 
              to, 
              status: "simulated",
              simulation: true
            }
          });
          return true;
        }
        
        // Initialize wallet provider
        const walletProvider = new MultichainWalletProvider(privateKey);
        
        // Get the wallet address
        const fromAddress = walletProvider.getAddress();
        
        // Check if the wallet has enough native tokens for gas
        try {
          const wallet = walletProvider.getWallet(chainIdStr);
          const balance = await wallet.balanceOf(fromAddress);
          console.log(`[DEBUG] Wallet balance: ${balance.value} ${balance.symbol}`);
          
          if (parseFloat(balance.value) <= 0) {
            callback?.({
              text: `Error: Your wallet does not have any ${balance.symbol} on ${chainName} to pay for gas fees. Please fund your wallet with some ${balance.symbol} before attempting this transaction.`,
              content: { error: "insufficient_funds", balance: balance.value, symbol: balance.symbol }
            });
            return false;
          }
          
          // TODO: Add check for token balance
          // This would require implementing a method to check ERC-20 token balances
          // For now, we'll just warn the user that they need to have sufficient token balance
          callback?.({
            text: `Note: Please ensure your wallet has sufficient ${tokenSymbol} balance on ${chainName} for this transaction. The transaction will fail if you don't have enough tokens.`,
            content: { status: "warning", tokenSymbol, chainName }
          });
        } catch (error) {
          console.error("Error checking wallet balance:", error);
        }
        
        // Send initial confirmation
        callback?.({
          text: `Initiating transfer of ${amount} ${tokenSymbol} on ${chainName} network to ${to}. Please wait while the transaction is being processed...`,
          content: { status: "initiating", amount, tokenSymbol, chainName, to }
        });
        
        // ERC20 transfer function signature
        const transferFunctionSignature = "a9059cbb";
        const cleanTo = to.toLowerCase().replace("0x", "");
        const amountHex = parseUnits(
          amount,
          token.decimals
        )
          .toString(16)
          .padStart(64, "0");
        
        // Construct data parameter
        const data = `0x${transferFunctionSignature}${"000000000000000000000000"}${cleanTo}${amountHex}`;
        
        // Log the transaction details for debugging
        console.log("Sending ERC-20 transaction:", {
          from: fromAddress,
          to: token.chains[chainId].contractAddress,
          data,
          chainId
        });
        
        // Access the raw Viem wallet client through the MultichainWalletProvider
        const viemWalletClient = walletProvider.getViemWalletClient(chainIdStr);
        
        // Send transaction using the Viem wallet client
        console.log(`[DEBUG] Sending transaction to token contract ${token.chains[chainId].contractAddress} on chain ${chainId}`);
        const hash = await viemWalletClient.sendTransaction({
          to: token.chains[chainId].contractAddress,
          data: data as `0x${string}`,
          chain: {
            id: chainId,
          },
        });
        
        if (!hash) {
          throw new Error("Transaction failed: No transaction hash returned");
        }
        
        // Return success message with transaction hash
        const explorerUrl = getExplorerUrl(chainId, hash);
        callback?.({
          text: `${amount} ${tokenSymbol} sent to ${to} on ${chainName}\nTransaction Hash: ${hash}\nView on Explorer: ${explorerUrl}`,
          content: { hash, chainId, tokenSymbol, amount, to, status: "success" }
        });
        return true;
      } catch (error) {
        console.error("Failed to send tokens:", error);
        const errorMessage = error instanceof Error ? error.message : String(error);
        
        // Compose and send the error response
        callback?.({
          text: `Error in token transfer: ${errorMessage}. Please ensure your wallet has sufficient balance and is properly configured.`,
          content: { error: errorMessage, status: "failed" }
        });
        return false;
      }
    },
  };
}

// Helper function to get explorer URL for transaction
function getExplorerUrl(chainId: number, txHash: string): string {
  const explorers: Record<number, string> = {
    1: "https://etherscan.io/tx/",
    10: "https://optimistic.etherscan.io/tx/",
    42161: "https://arbiscan.io/tx/",
    137: "https://polygonscan.com/tx/",
  };
  
  return (explorers[chainId] || "https://etherscan.io/tx/") + txHash;
} 