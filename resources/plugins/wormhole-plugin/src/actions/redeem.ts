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
import { redeemTemplate } from "../template/redeemTemplate.ts";

export interface TransferParams {
    sourceChain: Chain;
    destinationChain: Chain;
    amount: string;
    transaction_id: string;
}

const buildTransferDetails = async (
    state: State,
    runtime: IAgentRuntime
): Promise<TransferParams> => {
    const context = composeContext({
        state,
        template: redeemTemplate,
    });

    const transferDetails = (await generateObjectDeprecated({
        runtime,
        context,
        modelClass: ModelClass.SMALL,
    })) as TransferParams;

    return transferDetails;
};

export const redeemAction: Action = {
    name: "REDEEM_TOKENS_ACTION",
    description: "Redeem the tokens based on transaction id given by the user. ",
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
            console.log("Redeem action is called");

            const wh = await wormhole("Testnet", [
                evm,
                solana,
                aptos,
                algorand,
                cosmwasm,
                sui,
            ]);

            // Compose transfer context
            const paramOptions = await buildTransferDetails(state, runtime);

            const sourceChain = wh.getChain(paramOptions.sourceChain);
            const destinationChain = wh.getChain(paramOptions.destinationChain);

            const sender = await getSigner(sourceChain);
            const receiver = await getSigner(destinationChain);

            const [whm] = await sourceChain.parseTransaction(paramOptions.transaction_id);
            console.log('Wormhole Messages: ', whm);

            const vaa = await wh.getVaa(
                // Wormhole Message ID
                whm,
                // Protocol:Payload name to use for decoding the VAA payload
                'TokenBridge:Transfer',
                // Timeout in milliseconds, depending on the chain and network, the VAA may take some time to be available
                600_000
            );

            if (vaa == null) {
                console.error("Tranfer is still in progress, please claim later");
                const explorer = `https://wormholescan.io/#/tx/${paramOptions.transaction_id}`;

                if (callback) {
                    callback({
                        text: `Transfer is still pending, You can check the status here:${explorer} `,
                        content: {
                            text: 'Transfer is still pending'
                        },
                    });
                }
                return false;
            }

            const rcvTb = await destinationChain.getTokenBridge();

            const redeem = rcvTb.redeem(receiver.address.address, vaa);
            console.log("redeeem >>>", redeem);

            const rcvTxids = await signSendWait(destinationChain, redeem, receiver.signer);
            console.log('Sent: ', rcvTxids);

            // Now check if the transfer is completed according to
            // the destination token bridge
            const finished = await rcvTb.isTransferCompleted(vaa);
            console.log('Transfer completed: ', finished);

            const latestTxId = rcvTxids[rcvTxids.length - 1].txid;
            const explorer = `https://wormholescan.io/#/tx/${latestTxId}`;

            if (callback) {
                callback({
                    text: `Transaction was successful.Tokens reached on your destination chain. Your transaction Id is ${latestTxId} and you can check here ${explorer} `,
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
        console.log("private key", privateKey);
        return typeof privateKey === "string" && privateKey.startsWith("0x");
    },
    examples: [
        [
            {
                user: "assistant",
                content: {
                    text: "I'll help you in transfering native token",
                    action: "REDEEM_TOKENS_ACTION",
                },
            },
            {
                user: "user",
                content: {
                    text: "Can you check if the amount is redeemable or not in this transaction ID:0x51584b2fe0644dbde690fdb6b54e22d2f3374a56dc5f94fa2b8f05029513efc0",
                    action: "REDEEM_TOKENS_ACTION",
                },
            },
        ],
    ],
    similes: ["REDEEM_TOKENS_ACTION", "REDEEM_TOKENS", "CLAIM_TOKENS", "GET_TRANSFERRED_TOKENS", "DESTINATION_TOKENS", "REDEEM_DESTINATION_TOKENS"],
};