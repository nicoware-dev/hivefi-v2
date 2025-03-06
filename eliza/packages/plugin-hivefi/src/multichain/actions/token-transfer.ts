import { erc20 } from "@goat-sdk/plugin-erc20";
import { getOnChainTools } from "@goat-sdk/adapter-vercel-ai";
import { parseChainFromPrompt } from "../utils/chain-utils";
import { MultichainWalletProvider } from "../providers/wallet-provider";

export async function createTokenTransferAction(walletProvider: MultichainWalletProvider) {
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
      "Send 10 USDC on Optimism to 0x123...",
      "Transfer 5 DAI on Ethereum to 0xabc...",
      "Send 100 USDT from my wallet to 0x456... on Arbitrum",
    ],
    handler: async (runtime, message, state, options, callback) => {
      let currentState = state ?? (await runtime.composeState(message));
      currentState = await runtime.updateRecentMessageState(currentState);

      try {
        // Extract chain from the prompt
        const prompt = message.content;
        const chainId = parseChainFromPrompt(prompt);
        const wallet = walletProvider.getWallet(chainId);
        
        // Get the tools for this chain
        const tools = await getOnChainTools({
          wallet: wallet,
          plugins: [erc20()],
        });
        
        // Generate the response using the tools
        const result = await generateText({
          runtime,
          context: composeActionContext("TRANSFER_ERC20_TOKEN", "Transfer ERC-20 tokens", currentState, chainId),
          tools,
          maxSteps: 10,
          modelClass: ModelClass.LARGE,
        });
        
        // Compose and send the response
        const response = composeResponseContext(result, currentState);
        const responseText = await generateResponse(runtime, response);
        
        callback?.({
          text: responseText,
          content: {},
        });
        return true;
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        
        // Compose and send the error response
        const errorResponse = composeErrorResponseContext(errorMessage, currentState);
        const errorResponseText = await generateResponse(runtime, errorResponse);
        
        callback?.({
          text: errorResponseText,
          content: { error: errorMessage },
        });
        return false;
      }
    },
  };
} 