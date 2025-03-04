import { env } from '@/lib/env'
import { getStacksNetwork } from '@/lib/utils/stacks'
import {
  fetchCallReadOnlyFunction,
  ResponseOkCV,
  UIntCV,
} from '@stacks/transactions'

export interface EmilyLimits {
  pegCap: number
  perDepositCap: number
  perWithdrawalCap: number
  perDepositMinimum: number
}

export interface SBTCSupply {
  totalSupply: number
}

class SBTCService {
  async getCurrentSupply(): Promise<SBTCSupply> {
    try {
      const response = (await fetchCallReadOnlyFunction({
        contractAddress: env.SBTC_CONTRACT_DEPLOYER!,
        contractName: 'sbtc-token',
        functionName: 'get-total-supply',
        functionArgs: [],
        network: getStacksNetwork(env.WALLET_NETWORK),
        senderAddress: env.SBTC_CONTRACT_DEPLOYER!,
      })) as ResponseOkCV<UIntCV>

      return {
        totalSupply: Number(response.value.value),
      }
    } catch (error) {
      console.error('Failed to get sBTC supply:', error)
      throw error
    }
  }

  async getEmilyLimits(): Promise<EmilyLimits> {
    try {
      const res = await fetch(`${env.EMILY_URL}/limits`)
      if (!res.ok) {
        return {
          pegCap: 0,
          perDepositCap: 0,
          perWithdrawalCap: 0,
          perDepositMinimum: Infinity,
        }
      }

      const json = await res.json()
      return {
        pegCap: json.pegCap || Infinity,
        perDepositCap: json.perDepositCap || Infinity,
        perWithdrawalCap: json.perWithdrawalCap || Infinity,
        perDepositMinimum: json.perDepositMinimum || 0,
      }
    } catch (error) {
      console.error('Failed to get Emily limits:', error)
      throw error
    }
  }

  async getBTCBalance(address: string): Promise<number> {
    try {
      const res = await fetch(`${env.MEMPOOL_API}/address/${address}`)
      if (!res.ok) {
        throw new Error('Failed to fetch BTC balance')
      }

      const data = await res.json()
      return data.chain_stats.funded_txo_sum - data.chain_stats.spent_txo_sum
    } catch (error) {
      console.error('Failed to get BTC balance:', error)
      throw error
    }
  }

  async getTestnetBTC(address: string): Promise<string> {
    if (env.WALLET_NETWORK !== 'testnet') {
      throw new Error('Testnet BTC faucet only available on testnet')
    }

    try {
      const res = await fetch(`${env.EMILY_URL}/faucet/btc`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ address }),
      })

      if (!res.ok) {
        throw new Error('Failed to get testnet BTC')
      }

      const data = await res.json()
      return data.txid
    } catch (error) {
      console.error('Failed to get testnet BTC:', error)
      throw error
    }
  }
}

export const sbtcService = new SBTCService() 