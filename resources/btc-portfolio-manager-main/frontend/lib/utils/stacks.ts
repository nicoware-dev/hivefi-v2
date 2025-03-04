import { StacksMainnet, StacksTestnet } from '@stacks/network'

export function getStacksNetwork(network: string) {
  switch (network) {
    case 'mainnet':
      return new StacksMainnet()
    case 'testnet':
      return new StacksTestnet()
    default:
      throw new Error(`Unsupported network: ${network}`)
  }
} 