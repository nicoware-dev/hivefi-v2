import { sendETH } from "@goat-sdk/wallet-evm";
import { getOnChainTools } from "@goat-sdk/adapter-vercel-ai";
import { parseChainFromPrompt } from "../utils/chain-utils";
import { MultichainWalletProvider } from "../providers/wallet-provider";
import { generateText, ModelClass, IAgentRuntime, Memory, State, ActionExample, Handler } from "@elizaos/core";

type ActionCallback = (response: { text: string; content: Record<string, unknown> }) => void;

export function createTransferAction() {
  return {
    name: "TRANSFER_NATIVE_TOKEN",
    description: "Transfer native tokens (ETH, MATIC, etc.) on any supported chain",
    similes: [
      "send native token",
      "transfer ETH",
      "send MATIC",
      "transfer native cryptocurrency",
    ],
    validate: async () => true,
    examples: [
      [
        {
          user: "user1",
          content: {
            text: "Transfer 0.01 ETH on Arbitrum to 0x123..."
          }
        },
        {
          user: "assistant",
          content: {
            text: "I'll help you transfer 0.01 ETH on Arbitrum to 0x123... Let me process that transaction for you."
          }
        }
      ],
      [
        {
          user: "user1",
          content: {
            text: "Send 0.5 MATIC on Polygon to 0xabc..."
          }
        },
        {
          user: "assistant",
          content: {
            text: "I'll help you send 0.5 MATIC on the Polygon network to 0xabc... I'll process that transaction now."
          }
        }
      ],
      [
        {
          user: "user1",
          content: {
            text: "Transfer 0.1 ETH from my wallet to 0x456... on Optimism"
          }
        },
        {
          user: "assistant",
          content: {
            text: "I'll help you transfer 0.1 ETH on Optimism to 0x456... Processing the transaction now."
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
          plugins: [sendETH()],
        });
        
        // Generate the response using the tools
        const result = await generateText({
          runtime,
          context: composeActionContext("TRANSFER_NATIVE_TOKEN", "Transfer native tokens", currentState, chainId),
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