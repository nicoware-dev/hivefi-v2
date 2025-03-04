export const env = {
  EMILY_URL: process.env.NEXT_PUBLIC_EMILY_URL || 'https://sbtc-emily.com/',
  SBTC_CONTRACT_DEPLOYER: process.env.NEXT_PUBLIC_SBTC_CONTRACT_DEPLOYER,
  WALLET_NETWORK: process.env.NEXT_PUBLIC_WALLET_NETWORK || 'testnet',
  MEMPOOL_API: process.env.NEXT_PUBLIC_MEMPOOL_API || 'https://mempool.space/api',
  STACKS_API: process.env.NEXT_PUBLIC_STACKS_API || 'https://api.testnet.hiro.so',
} as const

// Validate required environment variables
const requiredEnvVars = ['SBTC_CONTRACT_DEPLOYER'] as const
for (const envVar of requiredEnvVars) {
  if (!env[envVar]) {
    throw new Error(`Missing required environment variable: ${envVar}`)
  }
} 