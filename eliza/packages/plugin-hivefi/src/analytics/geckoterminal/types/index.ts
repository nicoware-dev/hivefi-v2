export interface Pool {
    id: string;
    attributes: {
        name: string;
        address: string;
        base_token_price_usd: string;
        quote_token_price_usd: string;
        base_token_name: string;
        quote_token_name: string;
        volume_usd: {
            h24: string;
        };
        reserve_in_usd: string;
        fee_24h?: string;
        transactions_24h?: string;
        price_change_percentage?: {
            h24?: string;
        };
        fdv_usd?: string;
        market_cap_usd?: string;
        base_token_address?: string;
        quote_token_address?: string;
    };
}

export interface Token {
    id: string;
    attributes: {
        name: string;
        symbol: string;
        address: string;
        decimals: number;
        price_usd?: string;
        total_supply?: string;
        market_cap_usd?: string;
        volume_24h?: string;
        price_change_percentage_24h?: string;
        total_reserve_in_usd?: string;
        total_pools?: number;
    };
}

export interface GeckoTerminalResponse {
    data: Pool[];
}

export interface NetworkConfig {
    id: string;
    name: string;
    enabled: boolean;
}

export interface PoolStats {
    tvl: number;
    volume24h: number;
    fees24h: number;
    priceChange24h?: string;
    transactions24h?: string;
    baseTokenPrice: number;
    quoteTokenPrice: number;
}

export interface PoolInfo extends PoolStats {
    name: string;
    address: string;
    baseTokenName: string;
    quoteTokenName: string;
    baseTokenAddress?: string;
    quoteTokenAddress?: string;
}

export interface NetworkStats {
    networkId: string;
    networkName: string;
    totalTvl: number;
    totalVolume24h: number;
    totalPools: number;
    topPools: PoolInfo[];
} 