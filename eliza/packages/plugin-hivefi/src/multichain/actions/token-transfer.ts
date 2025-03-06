import { erc20 } from "@goat-sdk/plugin-erc20";
import { getOnChainTools } from "@goat-sdk/adapter-vercel-ai";
import { parseChainFromPrompt } from "../utils/chain-utils";
import { MultichainWalletProvider } from "../providers/wallet-provider";
import { generateText, ModelClass, IAgentRuntime, Memory, State, ActionExample, Handler } from "@elizaos/core";

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
        // Get private key from runtime settings
        const privateKey = runtime.getSetting("EVM_PRIVATE_KEY");
        if (!privateKey) {
          throw new Error("EVM_PRIVATE_KEY not configured");
        }

        // Initialize wallet provider
        const walletProvider = new MultichainWalletProvider(privateKey);
        
        // Extract chain from the prompt
        const prompt = message.content?.text ?? "";
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

function composeActionContext(
  actionName: string,
  actionDescription: string,
  state: State,
  chainId: string
): string {
  return `Action: ${actionName}\nDescription: ${actionDescription}\nChain: ${chainId}`;
}

function composeResponseContext(result: string, state: State): string {
  return `Result: ${result}`;
}

function composeErrorResponseContext(errorMessage: string, state: State): string {
  return `Error: ${errorMessage}`;
}

async function generateResponse(runtime: IAgentRuntime, context: string): Promise<string> {
  return context;
} 