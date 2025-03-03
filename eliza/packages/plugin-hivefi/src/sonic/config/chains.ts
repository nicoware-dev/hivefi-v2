import type { Chain } from "viem";

// Define Sonic chain configuration
export const sonicChain = {
    id: 146,
    name: 'Sonic',
    nativeCurrency: {
        decimals: 18,
        name: 'Sonic',
        symbol: 'S',
    },
    rpcUrls: {
        default: { http: ['https://rpc.soniclabs.com'] },
        public: { http: ['https://rpc.soniclabs.com'] },
    },
    blockExplorers: {
        default: { name: 'Explorer', url: 'https://explorer.soniclabs.com' },
    },
} as const satisfies Chain;
