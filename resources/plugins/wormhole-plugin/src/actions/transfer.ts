import {
  type Action,
  composeContext,
  generateObjectDeprecated,
  type HandlerCallback,
  ModelClass,
  type IAgentRuntime,
  type Memory,
  type State,
} from "@elizaos/core";
import {
  amount,
  Chain,
  signSendWait,
  Wormhole,
  wormhole,
} from "@wormhole-foundation/sdk";
import algorand from "@wormhole-foundation/sdk/algorand";
import aptos from "@wormhole-foundation/sdk/aptos";
import cosmwasm from "@wormhole-foundation/sdk/cosmwasm";
import evm from "@wormhole-foundation/sdk/evm";
import solana from "@wormhole-foundation/sdk/solana";
import sui from "@wormhole-foundation/sdk/sui";
import { getSigner } from "../helpers/utils.ts";
import { transferTemplate } from "../template/transferTemplate.ts";

export interface TransferParams {
  sourceChain: Chain;
  destinationChain: Chain;
  amount: string;
}

const buildTransferDetails = async (
  state: State,
  runtime: IAgentRuntime
): Promise<TransferParams> => {
  const context = composeContext({
    state,
    template: transferTemplate,
  });

  const transferDetails = (await generateObjectDeprecated({
    runtime,
    context,
    modelClass: ModelClass.SMALL,
  })) as TransferParams;

  return transferDetails;
};

export const transferAction: Action = {
  name: "TRANSFER_TOKENS",
  description: "Transfer native tokens from source chain to destination chain",
  handler: async (
    runtime: IAgentRuntime,
    message: Memory,
    state: State,
    _options: any,
    callback?: HandlerCallback
  ) => {
    if (!state) {
      state = (await runtime.composeState(message)) as State;
    } else {
      state = await runtime.updateRecentMessageState(state);
    }

    try {
      console.log("Transfer action handler called");

      const wh = await wormhole("Testnet", [
        evm,
        solana,
        aptos,
        algorand,
        cosmwasm,
        sui,
      ]);


      const paramOptions = await buildTransferDetails(state, runtime);

      // Remove any gaps between chain names
      paramOptions.sourceChain = paramOptions.sourceChain.replace(/\s+/g, '') as Chain;
      paramOptions.destinationChain = paramOptions.destinationChain.replace(/\s+/g, '') as Chain;
      const sourceChain = wh.getChain(paramOptions.sourceChain);
      const destinationChain = wh.getChain(paramOptions.destinationChain);

      const sender = await getSigner(sourceChain);
      const receiver = await getSigner(destinationChain);

      const token = await sourceChain.getNativeWrappedTokenId();
      const destTokenBridge = await destinationChain.getTokenBridge();
      try {
        const wrapped = await destTokenBridge.getWrappedAsset(token);
        console.log(
          `Token already wrapped on ${destinationChain.chain}. Skipping attestation.`,
          wrapped
        );
      } catch (error) {
        //TODO: Return the eliza response for no asset wrapped]]
        console.log(
          `No wrapped token found on ${destinationChain.chain}. Please try again with other chain.`
        );
        if (callback) {
          callback({
            text: `No wrapped token found on ${destinationChain.chain}. Please try again with other chain.`,
            content: { error: error.message },
          });
        }
        return;
      }

      const sourceTokenBridge = await sourceChain.getTokenBridge();
      const tokenId = Wormhole.tokenId(sourceChain.chain, "native");

      const amt = amount.units(
        amount.parse(
          paramOptions.amount,
          sourceChain.config.nativeTokenDecimals
        )
      );

      const transfer = sourceTokenBridge.transfer(
        sender.address.address,
        receiver.address,
        tokenId.address,
        amt
      );

      const txids = await signSendWait(sourceChain, transfer, sender.signer);

      const latestTxId = txids[txids.length - 1].txid;
      const explorer = `https://wormholescan.io/#/tx/${latestTxId}`;

      if (callback) {
        callback({
          text: `Transaction was successful. It will take some time to claim your balance. Your transaction Id is ${latestTxId} and you can check here ${explorer} `,
          content: {
            success: true,
            txId: latestTxId,
            explorer: explorer,
          },
        });
      }
      return true;
    } catch (error) {
      console.error("Error during token transfer:", error);
      if (callback) {
        callback({
          text: `Error transferring tokens: ${error.message}`,
          content: { error: error.message },
        });
      }
      return false;
    }
  },
  validate: async (runtime: IAgentRuntime) => {
    const privateKey = runtime.getSetting("WALLET_PRIVATE_KEY");
    return typeof privateKey === "string" && privateKey.startsWith("0x");
  },
  examples: [
    [
      {
        user: "assistant",
        content: {
          text: "I'll help you in transfering native token",
          action: "TRANSFER_TOKENS",
        },
      },
      {
        user: "user",
        content: {
          text: "Can you help me in transferring 0.001 From BaseSepolia to ArbitrumSepolia",
          action: "TRANSFER_TOKENS",
        },
      },
    ],
  ],
  similes: ["TRANSFER_TOKENS", "TOKEN_TRANSFER", "MOVE_TOKENS", "TRANSFER"],
};
