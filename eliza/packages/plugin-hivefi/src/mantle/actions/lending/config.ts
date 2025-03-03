import { type Address } from 'viem';

// Lendle Contract Addresses
export const LENDING_ADDRESSES = {
    LENDING_POOL: '0xCFa5aE7c2CE8Fadc6426C1ff872cA45378Fb7cF3' as Address,
    LENDING_POOL_ADDRESS_PROVIDER: '0xAb94Bedd21ae3411eB2698945dfCab1D5C19C3d4' as Address,
    DATA_PROVIDER: '0x552b9e4bae485C4B7F540777d7D25614CdB84773' as Address,
    PRICE_ORACLE: '0x870c9692Ab04944C86ec6FEeF63F261226506EfC' as Address,
} as const;

// Market Token Addresses
export const MARKET_TOKENS = {
    USDC: {
        underlying: '0x09Bc4E0D864854c6aFB6eB9A9cdF58aC190D0dF9' as Address, // USDC on Mantle
        aToken: '0xf36afb467d1f05541d998bbbcd5f7167d67bd8fc' as Address,     // lvUSDC (Lendle USDC)
        stableDebtToken: '0xd8A36c0E6148fFB374C6726d4c60Bbd55B745407' as Address,
        variableDebtToken: '0xB3f838d219A0cFba73193453C2023090277d6Af5' as Address,
    },
    USDT: {
        underlying: '0x201EBa5CC46D216Ce6DC03F6a759e8E766e956aE' as Address,
        aToken: '0x8c56017b172226fe024dea197748fc1eaccc82b1' as Address,     // lvUSDT
        stableDebtToken: '0x6b8ccf1d5d1a0a10a7642f2a902c3e0c35e95d39' as Address,
        variableDebtToken: '0x5e0d74ac812ce56cc261469d3cda2a1f4c7c3d6e' as Address,
    },
    WBTC: {
        underlying: '0xCAbAE6f6Ea1ecaB08Ad02fE02ce9A44F09aebfA2' as Address,
        aToken: '0x35b2ece5b1ed6a7a99b83508f8ceeec7e424e5a2' as Address,     // lvWBTC
        stableDebtToken: '0x4645e0b6b5ee989de76718bf003ecb53c7d419c7' as Address,
        variableDebtToken: '0x7d2d076000731d6527a6661eb1cab3b77a98b1ff' as Address,
    },
    MNT: {
        underlying: '0x78c1b0C915c4FAA5FffA6CAbf0219DA63d7f4cb8' as Address,  // WMNT
        aToken: '0x6e8244a3c89fb60168b3f2b7f8f29c500f3b83c6' as Address,     // lvMNT
        stableDebtToken: '0x6e14f34c12f3e8cbd5a562b0e42fd56b1c3f0d16' as Address,
        variableDebtToken: '0x6b8b52c87ffd40f5d86b590e4cf2199e7a44a1e2' as Address,
    },
    METH: {
        underlying: '0xcDA86A272531e8640cD7F1a92c01839911B90bb0' as Address,
        aToken: '0x0e927Aa52A38783C1Fd5DfA5c8873cbdBd01D2Ca' as Address,     // lvMETH
        stableDebtToken: '0x79f21bc30da8f5b9c0fb5c5d5f33ce4442611f8c' as Address,
        variableDebtToken: '0x5d0ec1f843c1233d304b96dbde0cab9ec04d71ef' as Address,
    },
    CMETH: {
        underlying: '0xE6829d9a7eE3040e1276Fa75293Bde931859e8fA' as Address,
        aToken: '0x7c7218af35c3c23827f3bc69aa3fb0f5b239d96b' as Address,     // lvCMETH
        stableDebtToken: '0x0f323deb2c7e11def8c04a1a7f6a0be3a6f1d41c' as Address,
        variableDebtToken: '0x5c3f3e18a83c1e5f2f6c9103e4d3d46c4b24b99d' as Address,
    },
} as const;

// Lendle LendingPool ABI
export const LENDING_POOL_ABI = [{
    inputs: [
        { name: "asset", type: "address" },
        { name: "amount", type: "uint256" },
        { name: "onBehalfOf", type: "address" },
        { name: "referralCode", type: "uint16" }
    ],
    name: "deposit",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function"
}, {
    inputs: [
        { name: "asset", type: "address" },
        { name: "amount", type: "uint256" },
        { name: "to", type: "address" }
    ],
    name: "withdraw",
    outputs: [{ name: "", type: "uint256" }],
    stateMutability: "nonpayable",
    type: "function"
}, {
    inputs: [
        { name: "asset", type: "address" },
        { name: "amount", type: "uint256" },
        { name: "interestRateMode", type: "uint256" },
        { name: "referralCode", type: "uint16" },
        { name: "onBehalfOf", type: "address" }
    ],
    name: "borrow",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function"
}, {
    inputs: [
        { name: "asset", type: "address" },
        { name: "amount", type: "uint256" },
        { name: "rateMode", type: "uint256" },
        { name: "onBehalfOf", type: "address" }
    ],
    name: "repay",
    outputs: [{ name: "", type: "uint256" }],
    stateMutability: "nonpayable",
    type: "function"
}, {
    inputs: [{ name: "user", type: "address" }],
    name: "getUserAccountData",
    outputs: [
        { name: "totalCollateralETH", type: "uint256" },
        { name: "totalDebtETH", type: "uint256" },
        { name: "availableBorrowsETH", type: "uint256" },
        { name: "currentLiquidationThreshold", type: "uint256" },
        { name: "ltv", type: "uint256" },
        { name: "healthFactor", type: "uint256" }
    ],
    stateMutability: "view",
    type: "function"
}] as const;

// aToken (lvToken) ABI
export const ATOKEN_ABI = [{
    inputs: [{ name: "account", type: "address" }],
    name: "balanceOf",
    outputs: [{ name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function"
}, {
    inputs: [],
    name: "decimals",
    outputs: [{ name: "", type: "uint8" }],
    stateMutability: "view",
    type: "function"
}, {
    anonymous: false,
    inputs: [
        { indexed: true, name: "from", type: "address" },
        { indexed: true, name: "to", type: "address" },
        { indexed: false, name: "value", type: "uint256" }
    ],
    name: "Transfer",
    type: "event"
}, {
    inputs: [],
    name: "UNDERLYING_ASSET_ADDRESS",
    outputs: [{ name: "", type: "address" }],
    stateMutability: "view",
    type: "function"
}] as const;

// ERC20 ABI for token operations
export const ERC20_ABI = [{
    inputs: [
        { name: "spender", type: "address" },
        { name: "amount", type: "uint256" }
    ],
    name: "approve",
    outputs: [{ name: "", type: "bool" }],
    stateMutability: "nonpayable",
    type: "function"
}, {
    inputs: [
        { name: "owner", type: "address" },
        { name: "spender", type: "address" }
    ],
    name: "allowance",
    outputs: [{ name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function"
}, {
    inputs: [{ name: "account", type: "address" }],
    name: "balanceOf",
    outputs: [{ name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function"
}] as const;

// Data Provider ABI
export const DATA_PROVIDER_ABI = [{
    inputs: [{ name: "asset", type: "address" }],
    name: "getReserveData",
    outputs: [
        { name: "availableLiquidity", type: "uint256" },
        { name: "totalStableDebt", type: "uint256" },
        { name: "totalVariableDebt", type: "uint256" },
        { name: "liquidityRate", type: "uint256" },
        { name: "variableBorrowRate", type: "uint256" },
        { name: "stableBorrowRate", type: "uint256" },
        { name: "averageStableBorrowRate", type: "uint256" },
        { name: "liquidityIndex", type: "uint256" },
        { name: "variableBorrowIndex", type: "uint256" },
        { name: "lastUpdateTimestamp", type: "uint40" }
    ],
    stateMutability: "view",
    type: "function"
}] as const;

// Add events to track deposit success
export const LENDING_POOL_EVENTS = [{
    anonymous: false,
    inputs: [
        { indexed: true, name: "reserve", type: "address" },
        { indexed: false, name: "user", type: "address" },
        { indexed: true, name: "onBehalfOf", type: "address" },
        { indexed: false, name: "amount", type: "uint256" },
        { indexed: true, name: "referral", type: "uint16" }
    ],
    name: "Deposit",
    type: "event"
}, {
    anonymous: false,
    inputs: [
        { indexed: true, name: "reserve", type: "address" },
        { indexed: true, name: "user", type: "address" },
        { indexed: true, name: "onBehalfOf", type: "address" },
        { indexed: false, name: "amount", type: "uint256" },
        { indexed: false, name: "interestRateMode", type: "uint256" },
        { indexed: false, name: "borrowRate", type: "uint256" },
        { indexed: false, name: "referral", type: "uint16" }
    ],
    name: "Borrow",
    type: "event"
}, {
    anonymous: false,
    inputs: [
        { indexed: true, name: "reserve", type: "address" },
        { indexed: true, name: "user", type: "address" },
        { indexed: true, name: "repayer", type: "address" },
        { indexed: false, name: "amount", type: "uint256" },
        { indexed: false, name: "useATokens", type: "bool" }
    ],
    name: "Repay",
    type: "event"
}] as const;

// Response formatting helpers
export const MANTLESCAN_TX_URL = 'https://explorer.mantle.xyz/tx/';
export const MANTLESCAN_ADDRESS_URL = 'https://explorer.mantle.xyz/address/';

export type UserAccountData = {
    totalCollateralETH: string;
    totalDebtETH: string;
    availableBorrowsETH: string;
    currentLiquidationThreshold: number;
    ltv: number;
    healthFactor: string;
    walletBalance?: string;
    suppliedBalance?: string;
    borrowedBalance?: string;
};

// DebtToken ABI for debt balance operations
export const DEBT_TOKEN_ABI = [{
    inputs: [{ name: "user", type: "address" }],
    name: "balanceOf",
    outputs: [{ name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function"
}, {
    inputs: [],
    name: "UNDERLYING_ASSET_ADDRESS",
    outputs: [{ name: "", type: "address" }],
    stateMutability: "view",
    type: "function"
}, {
    inputs: [{ name: "user", type: "address" }],
    name: "principalBalanceOf",
    outputs: [{ name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function"
}] as const;
