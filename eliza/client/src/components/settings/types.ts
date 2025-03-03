export interface Agent {
    id: string;
    name: string;
    status: 'active' | 'inactive';
    type: string;
    responseTime: number;
    successRate: number;
    lastActive: string;
}

export interface ResourceUsage {
    apiCalls: {
        used: number;
        total: number;
    };
    compute: {
        used: number;
        total: number;
    };
    storage: {
        used: number;
        total: number;
    };
}

export interface SystemHealth {
    uptime: number;
    errorRate: number;
    networkStatus: 'healthy' | 'degraded' | 'down';
}

export interface NetworkConfig {
    rpcEndpoint: string;
    network: 'testnet' | 'mainnet';
    gasSettings: {
        maxFeePerGas: number;
        maxPriorityFeePerGas: number;
    };
}

export interface StakingInfo {
    stakedAmount: number;
    rewardsEarned: number;
    apy: number;
    lockPeriod: number;
}

export interface UsageMetrics {
    apiCalls: number;
    computeUsage: number;
    storageUsage: number;
    costBreakdown: {
        serviceFees: number;
        apiCosts: number;
        infrastructure: number;
    };
}
