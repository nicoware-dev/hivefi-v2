import { Tool } from "@goat-sdk/core";
import { EVMWalletClient } from "@goat-sdk/wallet-evm";

import { MERKL_CAMPAIGN_ABI, MERKL_CAMPAIGN_ADDRESS } from "./abi/merkl.abi";
import { fetchJson } from "./helpers/http.helper";
import { ClaimProtocolIncentivesParams } from "./parameters";
import { ClaimResultProps, MerklRewardResponse } from "./types/types";

const MERKL_REVIEW_URL = "https://api.merkl.xyz/v4/users";

export class MerklService {
    @Tool({
        name: "claim_merkl_incentives",
        description: "Claim protocol incentives and Merkl rewards for a given address and chain",
    })
    async claimMerklRewards(
        walletClient: EVMWalletClient,
        parameters: ClaimProtocolIncentivesParams,
    ): Promise<ClaimResultProps[]> {
        try {
            const userAddress = walletClient.getAddress();
            const network = walletClient.getChain();
            if (!network?.id) {
                throw new Error("Unable to determine chain ID from wallet client");
            }
            const chainId = network.id;
            const rewardsUrl = `${MERKL_REVIEW_URL}/${userAddress}/rewards?chainId=${chainId}`;

            const rewardsData: MerklRewardResponse[] = await fetchJson(rewardsUrl);

            const users: string[] = [];
            const tokens: string[] = [];
            const amounts: string[] = [];
            const proofs: string[][] = [];

            for (const rewardsObj of rewardsData) {
                if (rewardsObj.chain.id !== chainId) continue;
                for (const reward of rewardsObj.rewards) {
                    users.push(userAddress);
                    tokens.push(reward.token.address);
                    amounts.push(reward.amount);
                    proofs.push(reward.proofs);
                }
            }

            if (tokens.length === 0) {
                return [
                    {
                        campaignId: "",
                        detail: "No claimable tokens available",
                    },
                ];
            }

            const txResponse = await walletClient.sendTransaction({
                to: MERKL_CAMPAIGN_ADDRESS as `0x${string}`,
                abi: MERKL_CAMPAIGN_ABI,
                functionName: "claim",
                args: [users, tokens, amounts, proofs],
            });

            const results: ClaimResultProps[] = tokens.map((token, i) => ({
                campaignId: token,
                detail: "Claimed",
                amount: amounts[i],
                transactionHash: txResponse.hash,
            }));

            return results;
        } catch (error) {
            throw new Error(`Failed to claim Merkl tokens: ${error instanceof Error ? error.message : error}`);
        }
    }
}
