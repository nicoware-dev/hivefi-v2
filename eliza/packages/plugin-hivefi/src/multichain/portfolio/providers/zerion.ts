import { IAgentRuntime, Memory } from "@elizaos/core";
import { 
  PortfolioData, 
  PositionData, 
  ZerionPortfolioResponse, 
  ZerionPositionResponse, 
  ZerionProviderResponse,
  TokenBalance
} from "../types";

/**
 * Zerion API base URL
 */
const ZERION_V1_BASE_URL = "https://api.zerion.io/v1";

/**
 * Zerion provider for fetching wallet portfolio data
 */
export const zerionProvider = {
  /**
   * Get portfolio summary data for a wallet
   * @param runtime The agent runtime
   * @param address The wallet address to fetch data for
   * @returns Portfolio data response
   */
  getPortfolio: async (runtime: IAgentRuntime, address: string): Promise<ZerionProviderResponse> => {
    try {
      const apiKey = runtime.getSetting("ZERION_API_KEY");
      if (!apiKey) {
        throw new Error("Zerion API key not found. Please set ZERION_API_KEY in your environment variables.");
      }

      if (!address || !address.match(/^0x[a-fA-F0-9]{40}$/)) {
        throw new Error("Invalid Ethereum address format");
      }

      // Encode API key for Basic Auth
      const encodedApiKey = Buffer.from(apiKey + ":").toString('base64');

      const response = await fetch(`${ZERION_V1_BASE_URL}/wallets/${address}/portfolio`, {
        method: "GET",
        headers: {
          "Accept": "application/json",
          "Authorization": `Basic ${encodedApiKey}`
        }
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch portfolio: ${response.statusText}`);
      }

      const apiResponse: ZerionPortfolioResponse = await response.json();
      const { attributes } = apiResponse.data;

      const portfolioData: PortfolioData = {
        totalValue: attributes.total.positions,
        chainDistribution: attributes.positions_distribution_by_chain,
        positionTypes: attributes.positions_distribution_by_type,
        changes: {
          absolute_1d: attributes.changes.absolute_1d,
          percent_1d: attributes.changes.percent_1d
        }
      };

      return { success: true, data: portfolioData };
    } catch (error) {
      console.error("Error fetching portfolio from Zerion:", error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : "Failed to fetch portfolio data from Zerion" 
      };
    }
  },

  /**
   * Get detailed position data for a wallet
   * @param runtime The agent runtime
   * @param address The wallet address to fetch data for
   * @returns Position data response with detailed token balances
   */
  getPositions: async (runtime: IAgentRuntime, address: string): Promise<ZerionProviderResponse> => {
    try {
      const apiKey = runtime.getSetting("ZERION_API_KEY");
      if (!apiKey) {
        throw new Error("Zerion API key not found. Please set ZERION_API_KEY in your environment variables.");
      }

      if (!address || !address.match(/^0x[a-fA-F0-9]{40}$/)) {
        throw new Error("Invalid Ethereum address format");
      }

      // Encode API key for Basic Auth
      const encodedApiKey = Buffer.from(apiKey + ":").toString('base64');

      const response = await fetch(
        `${ZERION_V1_BASE_URL}/wallets/${address}/positions?filter[positions]=only_simple&currency=usd&filter[trash]=only_non_trash&sort=value`, 
        {
          headers: {
            "Accept": "application/json",
            "Authorization": `Basic ${encodedApiKey}`
          }
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to fetch positions: ${response.statusText}`);
      }

      const data = await response.json() as ZerionPositionResponse;

      let totalValue = 0;
      const positions: TokenBalance[] = data.data.map(position => {
        const value = position.attributes.value || 0;
        totalValue += value;

        return {
          name: position.attributes.fungible_info.name,
          symbol: position.attributes.fungible_info.symbol,
          balance: position.attributes.quantity.float.toString(),
          usdPrice: position.attributes.price || 0,
          usdValue: position.attributes.value || 0,
          chain: position.relationships.chain.data.id,
          change24h: position.attributes.changes?.percent_1d || null,
          verified: position.attributes.fungible_info.flags.verified
        };
      });

      return {
        success: true,
        data: {
          positions,
          totalValue
        } as PositionData
      };
    } catch (error) {
      console.error("Error fetching positions from Zerion:", error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : "Failed to fetch position data from Zerion" 
      };
    }
  }
}; 