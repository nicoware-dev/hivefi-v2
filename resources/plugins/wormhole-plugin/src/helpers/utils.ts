import {
  type Chain,
  type ChainAddress,
  type ChainContext,
  type Network,
  type Signer,
  type TxHash,
} from "@wormhole-foundation/sdk";
import {
  DEFAULT_TASK_TIMEOUT,
  TokenTransfer,
  TransferState,
  Wormhole,
  amount,
  api,
  tasks,
} from "@wormhole-foundation/sdk";
import algorand from "@wormhole-foundation/sdk/platforms/algorand";
import cosmwasm from "@wormhole-foundation/sdk/platforms/cosmwasm";
import evm from "@wormhole-foundation/sdk/platforms/evm";
import solana from "@wormhole-foundation/sdk/platforms/solana";
import sui from "@wormhole-foundation/sdk/platforms/sui";

function getEnv(key: string): string {
  // If we're in the browser, return empty string
  if (typeof process === undefined) return "";

  let val;

  switch (key) {
    case "SOL_PRIVATE_KEY":
      val =
        "5ZDaMgGNd4pU1qcTq4sKTR1o1DVYog3W1hmhPVBBtddG8oK3RBfu6YLg526RvdresZc6CFAN6tA2a3WJCS1GkaZq";
      break;
    case "ETH_PRIVATE_KEY":
      val = process.env.WALLET_PRIVATE_KEY;
      break;
    default:
      break;
  }

  return val;
}

export interface SignerStuff<N extends Network, C extends Chain = Chain> {
  chain: ChainContext<N, C>;
  signer: Signer<N, C>;
  address: ChainAddress<C>;
}

export async function getSigner<N extends Network, C extends Chain>(
  chain: ChainContext<N, C>
): Promise<SignerStuff<N, C>> {
  // Read in from `.env`

  let signer: Signer;
  const platform = chain.platform.utils()._platform;
  switch (platform) {
    case "Solana":
      signer = await solana.getSigner(
        await chain.getRpc(),
        getEnv("SOL_PRIVATE_KEY"),
        {
          debug: true,
          priorityFee: {
            // take the middle priority fee
            percentile: 0.5,
            // juice the base fee taken from priority fee percentile
            percentileMultiple: 2,
            // at least 1 lamport/compute unit
            min: 1,
            // at most 1000 lamport/compute unit
            max: 1000,
          },
        }
      );

      break;
    // case "Cosmwasm":
    //   signer = await cosmwasm.getSigner(
    //     await chain.getRpc(),
    //     getEnv("COSMOS_MNEMONIC")
    //   );
    //   break;
    case "Evm":
      signer = await evm.getSigner(
        await chain.getRpc(),
        getEnv("ETH_PRIVATE_KEY"),
        {
          debug: true,
          maxGasLimit: amount.units(amount.parse("0.01", 18)),
          // overrides is a Partial<TransactionRequest>, so any fields can be overriden
          //overrides: {
          //  maxFeePerGas: amount.units(amount.parse("1.5", 9)),
          //  maxPriorityFeePerGas: amount.units(amount.parse("0.1", 9)),
          //},
        }
      );
      break;
    // case "Algorand":
    //   signer = await algorand.getSigner(
    //     await chain.getRpc(),
    //     getEnv("ALGORAND_MNEMONIC")
    //   );
    //   break;
    // case "Sui":
    //   signer = await sui.getSigner(
    //     await chain.getRpc(),
    //     getEnv("SUI_PRIVATE_KEY")
    //   );
    //   break;
    default:
      throw new Error("Unrecognized platform: " + platform);
  }

  return {
    chain,
    signer: signer as Signer<N, C>,
    address: Wormhole.chainAddress(chain.chain, signer.address()),
  };
}
