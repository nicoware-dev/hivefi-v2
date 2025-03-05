import { mainnet } from 'viem/chains';
import { type Chain } from 'viem';

/**
 * Sonic chain configuration
 */
export const sonicChain: Chain = {
  ...mainnet,
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
    default: { name: 'Explorer', url: 'https://sonicscan.org/' },
  },
}; 