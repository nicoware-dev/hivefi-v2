import type { Address } from "viem";

interface BaseTokenConfig {
    symbol: string;
    name: string;
    decimals: number;
    coingeckoId: string;
}

interface NativeTokenConfig extends BaseTokenConfig {
    type: 'native';
}

interface ERC20TokenConfig extends BaseTokenConfig {
    type: 'erc20';
    address: Address;
}

type TokenConfig = NativeTokenConfig | ERC20TokenConfig;
export type { TokenConfig, ERC20TokenConfig };

type TokensConfig = {
    [K in string]: TokenConfig;
};

export const TOKENS: TokensConfig = {
    S: {
        type: 'native',
        symbol: "S",
        name: "Sonic",
        decimals: 18,
        coingeckoId: "sonic-3",
    },
    stS: {
        type: 'erc20',
        symbol: "stS",
        name: "Beets Staked Sonic ",
        address: "0xE5DA20F15420aD15DE0fa650600aFc998bbE3955" as Address,
        decimals: 18,
        coingeckoId: "sonic-3",
    },
    SHADOW: {
        type: 'erc20',
        symbol: "SHADOW",
        name: "Shadow",
        address: "0x3333b97138d4b086720b5ae8a7844b1345a33333" as Address,
        decimals: 18,
        coingeckoId: "shadow-2",
    },
    SWPX: {
        type: 'erc20',
        symbol: "SWPX",
        name: "SwapX",
        address: "0xa04bc7140c26fc9bb1f36b1a604c7a5a88fb0e70" as Address,
        decimals: 18,
        coingeckoId: "swapx-2",
    },
    BEETS: {
        type: 'erc20',
        symbol: "BEETS",
        name: "Beets",
        address: "0x2d0e0814e62d80056181f5cd932274405966e4f0" as Address,
        decimals: 18,
        coingeckoId: "beets",
    },
    WETH: {
        type: 'erc20',
        symbol: "WETH",
        name: "Wrapped Ethereum",
        address: "0x50c42dEAcD8Fc9773493ED674b675bE577f2634b" as Address,
        decimals: 18,
        coingeckoId: "ethereum",
    },
    USDC: {
        type: 'erc20',
        symbol: "USDC",
        name: "USD Coin",
        address: "0x29219dd400f2Bf60E5a23d13Be72B486D4038894" as Address,
        decimals: 6,
        coingeckoId: "usd-coin",
    },
    EURC: {
        type: 'erc20',
        symbol: "EURC",
        name: "Euro Coin",
        address: "0xe715cba7b5ccb33790cebff1436809d36cb17e57" as Address,
        decimals: 6,
        coingeckoId: "euro-coin",
    },
    USDT: {
        type: 'erc20',
        symbol: "USDT",
        name: "Tether USD",
        address: "0x6047828dc181963ba44974801ff68e538da5eaf9" as Address,
        decimals: 6,
        coingeckoId: "tether",
    },
    WS: {
        type: 'erc20',
        symbol: "WS",
        name: "Wrapped Sonic",
        address: "0x039e2fB66102314Ce7b64Ce5Ce3E5183bc94aD38" as Address,
        decimals: 18,
        coingeckoId: "sonic-3", // Using Sonic price for Wrapped Sonic
    },
} as const;

export type TokenSymbol = keyof typeof TOKENS;

// Helper functions to get token data
export function getTokenBySymbol(symbol: TokenSymbol): TokenConfig {
    return TOKENS[symbol];
}

export function getTokenByAddress(address: string): ERC20TokenConfig | undefined {
    const normalizedAddress = address.toLowerCase();
    const token = Object.values(TOKENS).find(
        token => token.type === 'erc20' && token.address.toLowerCase() === normalizedAddress
    );
    return token?.type === 'erc20' ? token : undefined;
}

// Helper to check if a token is ERC20
export function isERC20Token(token: TokenConfig): token is ERC20TokenConfig {
    return token.type === 'erc20';
}

// Get all ERC20 tokens
export function getERC20Tokens(): ERC20TokenConfig[] {
    return Object.values(TOKENS).filter(isERC20Token);
}

// Derived maps for specific use cases
export const TOKEN_ADDRESSES: Record<string, Address> = {};
export const TOKEN_DECIMALS: Record<string, number> = {};
export const COINGECKO_IDS: Record<string, string> = {};

// Initialize the derived maps
for (const [symbol, token] of Object.entries(TOKENS)) {
    if (token.type === 'erc20') {
        TOKEN_ADDRESSES[symbol] = token.address;
    }
    TOKEN_DECIMALS[symbol] = token.decimals;
    COINGECKO_IDS[symbol] = token.coingeckoId;
}
