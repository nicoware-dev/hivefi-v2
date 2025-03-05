import { 
  getMultiversXTVL, 
  getProtocolByName, 
  getTopMultiversXProtocols 
} from './module';
import { elizaLogger } from "@elizaos/core";

// Template for getMultiversXTVL action
export const getMultiversXTVLTemplate = `
This action retrieves the Total Value Locked (TVL) data for the MultiversX (Sonic) blockchain from DefiLlama.

The data includes:
- Current TVL in USD
- 24h change percentage
- 7d change percentage
- 30d change percentage
- Market cap to TVL ratio

No parameters required.

Example response:
{
  "name": "MultiversX (Sonic)",
  "tvl": 123456789,
  "formattedTVL": "$123.45M",
  "change_1d": 2.5,
  "change_7d": -1.2,
  "change_1m": 15.3,
  "mcaptvl": 0.8
}
`;

// Template for getMantleTVL action
export const getMantleTVLTemplate = `
This action retrieves the Total Value Locked (TVL) data for the Mantle blockchain from DefiLlama.

The data includes:
- Current TVL in USD
- 24h change percentage
- 7d change percentage
- 30d change percentage
- Market cap to TVL ratio

No parameters required.

Example response:
{
  "name": "Mantle",
  "tvl": 123456789,
  "formattedTVL": "$123.45M",
  "change_1d": 2.5,
  "change_7d": -1.2,
  "change_1m": 15.3,
  "mcaptvl": 0.8
}
`;

// Template for getChainTVL action
export const getChainTVLTemplate = `
This action retrieves the Total Value Locked (TVL) data for a specific blockchain from DefiLlama.

Supported chains include:
- Ethereum, Polygon, Arbitrum, Optimism, BSC
- Solana, Avalanche, Fantom, Base
- Mantle, MultiversX (Sonic)
- And many more

Required parameters:
- chain: The name of the chain (e.g., "ethereum", "polygon", "mantle", "sonic")

Example response:
{
  "name": "Ethereum",
  "tvl": 123456789012,
  "formattedTVL": "$123.45B",
  "change_1d": 2.5,
  "change_7d": -1.2,
  "change_1m": 15.3,
  "mcaptvl": 0.8
}
`;

// Template for getProtocolByName action
export const getProtocolByNameTemplate = `
This action retrieves detailed information about a specific DeFi protocol from DefiLlama.

Supported protocols include:
- Mantle: Merchant Moe, Agni Finance, Lendle, Init Capital, Pendle
- Sonic/MultiversX: Beets, SwapX, Shadow Exchange, Silo Finance, Aave
- Major protocols: Uniswap, Curve, Compound, Maker, Lido, and many more

Required parameters:
- name: The name of the protocol (e.g., "uniswap", "aave", "merchant moe")

Example response:
{
  "name": "Uniswap",
  "displayName": "Uniswap",
  "slug": "uniswap-v3",
  "description": "Decentralized exchange protocol",
  "tvl": 123456789012,
  "formattedTVL": "$123.45B",
  "change_1d": 2.5,
  "change_7d": -1.2,
  "change_1m": 15.3,
  "category": "Dexes",
  "chains": ["Ethereum", "Polygon", "Arbitrum", "Optimism"],
  "chainTvls": [
    { "chain": "Ethereum", "tvl": 100000000000, "formattedTVL": "$100B" },
    { "chain": "Polygon", "tvl": 10000000000, "formattedTVL": "$10B" }
  ],
  "url": "https://uniswap.org",
  "twitter": "Uniswap"
}
`;

// Template for getTopProtocolsByChain action
export const getTopProtocolsByChainTemplate = `
This action retrieves the top protocols by TVL for a specific blockchain from DefiLlama.

Supported chains include:
- Ethereum, Polygon, Arbitrum, Optimism, BSC
- Solana, Avalanche, Fantom, Base
- Mantle, MultiversX (Sonic)
- And many more

Required parameters:
- chain: The name of the chain (e.g., "ethereum", "polygon", "mantle", "sonic")

Optional parameters:
- limit: Maximum number of protocols to return (default: 10)

Example response:
{
  "chain": "ethereum",
  "protocols": [
    {
      "name": "MakerDAO",
      "slug": "maker",
      "tvl": 12345678901,
      "formattedTVL": "$12.34B",
      "change_1d": 0.5,
      "change_7d": 2.3,
      "category": "CDP"
    },
    {
      "name": "Lido",
      "slug": "lido",
      "tvl": 9876543210,
      "formattedTVL": "$9.87B",
      "change_1d": 1.2,
      "change_7d": -0.8,
      "category": "Liquid Staking"
    }
  ]
}
`;

// Template for getTopMultiversXProtocols action
export const getTopMultiversXProtocolsTemplate = `
This action retrieves the top protocols by TVL on the MultiversX (Sonic) blockchain from DefiLlama.

Optional parameters:
- limit: Maximum number of protocols to return (default: 10)

Example response:
{
  "chain": "multiversx",
  "protocols": [
    {
      "name": "xExchange",
      "slug": "xexchange",
      "tvl": 123456789,
      "formattedTVL": "$123.45M",
      "change_1d": 0.5,
      "change_7d": 2.3,
      "category": "Dexes"
    },
    {
      "name": "Hatom",
      "slug": "hatom",
      "tvl": 98765432,
      "formattedTVL": "$98.76M",
      "change_1d": 1.2,
      "change_7d": -0.8,
      "category": "Lending"
    }
  ]
}
`;

// Template for getTopMantleProtocols action
export const getTopMantleProtocolsTemplate = `
This action retrieves the top protocols by TVL on the Mantle blockchain from DefiLlama.

Optional parameters:
- limit: Maximum number of protocols to return (default: 10)

Example response:
{
  "chain": "mantle",
  "protocols": [
    {
      "name": "Agni Finance",
      "slug": "agni-finance",
      "tvl": 123456789,
      "formattedTVL": "$123.45M",
      "change_1d": 0.5,
      "change_7d": 2.3,
      "category": "Dexes"
    },
    {
      "name": "Merchant Moe",
      "slug": "merchant-moe",
      "tvl": 98765432,
      "formattedTVL": "$98.76M",
      "change_1d": 1.2,
      "change_7d": -0.8,
      "category": "Dexes"
    }
  ]
}
`;

// Template for getGlobalDeFiStats action
export const getGlobalDeFiStatsTemplate = `
This action retrieves global DeFi statistics from DefiLlama, including total TVL across all chains and top chains by TVL.

No parameters required.

Example response:
{
  "totalTVL": 123456789012345,
  "formattedTotalTVL": "$123.45T",
  "topChains": [
    {
      "name": "Ethereum",
      "tvl": 50000000000000,
      "formattedTVL": "$50T",
      "change_1d": 0.5,
      "change_7d": 2.3,
      "percentage": "40.50%"
    },
    {
      "name": "Tron",
      "tvl": 20000000000000,
      "formattedTVL": "$20T",
      "change_1d": 1.2,
      "change_7d": -0.8,
      "percentage": "16.20%"
    }
  ],
  "chainCount": 100
}
`;

// Template for getTopChains action
export const getTopChainsTemplate = `
This action retrieves the top blockchains by TVL from DefiLlama.

Optional parameters:
- limit: Maximum number of chains to return (default: 10)

Example response:
{
  "totalTVL": 123456789012345,
  "formattedTotalTVL": "$123.45T",
  "chains": [
    {
      "name": "Ethereum",
      "tvl": 50000000000000,
      "formattedTVL": "$50T",
      "change_1d": 0.5,
      "change_7d": 2.3,
      "change_1m": 5.6,
      "percentage": "40.50%"
    },
    {
      "name": "Tron",
      "tvl": 20000000000000,
      "formattedTVL": "$20T",
      "change_1d": 1.2,
      "change_7d": -0.8,
      "change_1m": 3.2,
      "percentage": "16.20%"
    }
  ]
}
`;

// Template for compareChainsTVL action
export const compareChainsTVLTemplate = `
This action compares the TVL data for multiple blockchains from DefiLlama.

Required parameters:
- chains: Array of chain names to compare (e.g., ["ethereum", "polygon", "mantle", "sonic"])

Example response:
{
  "chains": [
    {
      "name": "Ethereum",
      "found": true,
      "tvl": 50000000000000,
      "formattedTVL": "$50T",
      "change_1d": 0.5,
      "change_7d": 2.3,
      "change_1m": 5.6
    },
    {
      "name": "Polygon",
      "found": true,
      "tvl": 5000000000000,
      "formattedTVL": "$5T",
      "change_1d": 1.2,
      "change_7d": -0.8,
      "change_1m": 3.2
    }
  ],
  "notFound": ["unknown-chain"]
}
`;

// Template for compareProtocolsTVL action
export const compareProtocolsTVLTemplate = `
This action compares the TVL data for multiple DeFi protocols from DefiLlama.

Required parameters:
- protocols: Array of protocol names to compare (e.g., ["uniswap", "aave", "merchant-moe", "silo-finance"])

Example response:
{
  "protocols": [
    {
      "name": "Uniswap",
      "slug": "uniswap-v3",
      "found": true,
      "tvl": 12345678901,
      "formattedTVL": "$12.34B",
      "change_1d": 0.5,
      "change_7d": 2.3,
      "category": "Dexes",
      "chains": ["Ethereum", "Polygon", "Arbitrum", "Optimism"]
    },
    {
      "name": "Aave",
      "slug": "aave-v3",
      "found": true,
      "tvl": 9876543210,
      "formattedTVL": "$9.87B",
      "change_1d": 1.2,
      "change_7d": -0.8,
      "category": "Lending",
      "chains": ["Ethereum", "Polygon", "Arbitrum", "Optimism", "Avalanche"]
    }
  ],
  "notFound": ["unknown-protocol"]
}
`; 