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
export type { TokenConfig };

type TokensConfig = {
    [K in string]: TokenConfig;
};

export const TOKENS: TokensConfig = {
    MNT: {
        type: 'native',
        symbol: "MNT",
        name: "Mantle",
        decimals: 18,
        coingeckoId: "mantle",
    },
    USDT: {
        type: 'erc20',
        symbol: "USDT",
        name: "Tether USD",
        address: "0x201EBa5CC46D216Ce6DC03F6a759e8E766e956aE" as Address,
        decimals: 6,
        coingeckoId: "tether",
    },
    USDC: {
        type: 'erc20',
        symbol: "USDC",
        name: "USD Coin",
        address: "0x09Bc4E0D864854c6aFB6eB9A9cdF58aC190D0dF9" as Address,
        decimals: 6,
        coingeckoId: "usd-coin",
    },
    METH: {
        type: 'erc20',
        symbol: "METH",
        name: "Mantle ETH",
        address: "0xcDA86A272531e8640cD7F1a92c01839911B90bb0" as Address,
        decimals: 18,
        coingeckoId: "ethereum", // Using ETH price for METH
    },
    CMETH: {
        type: 'erc20',
        symbol: "CMETH",
        name: "Compound Mantle ETH",
        address: "0xE6829d9a7eE3040e1276Fa75293Bde931859e8fA" as Address,
        decimals: 18,
        coingeckoId: "ethereum", // Using ETH price for CMETH
    },
    WMNT: {
        type: 'erc20',
        symbol: "WMNT",
        name: "Wrapped Mantle",
        address: "0x78c1b0C915c4FAA5FffA6CAbf0219DA63d7f4cb8" as Address,
        decimals: 18,
        coingeckoId: "wrapped-mantle",
    },
    WBTC: {
        type: 'erc20',
        symbol: "WBTC",
        name: "Wrapped Bitcoin",
        address: "0xCAbAE6f6Ea1ecaB08Ad02fE02ce9A44F09aebfA2" as Address,
        decimals: 8,
        coingeckoId: "wrapped-bitcoin",
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
