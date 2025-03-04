import { Transaction } from '@/types/sbtc'

const API_BASE_URL = process.env.NEXT_PUBLIC_EMILY_API_URL || 'http://localhost:3000'
const HIRO_API_URL = 'https://api.hiro.so'

export interface DepositRequest {
  amount: number
  recipient: string
}

export interface WithdrawalRequest {
  amount: number
  btcAddress: string
  maxFee: number
}

export interface PortfolioStats {
  totalBalance: number
  totalDeposits: number
  totalWithdrawals: number
  priceChange24h: number
  btcPrice: number
  sbtcPrice: number
}

export interface Deposit {
  bitcoinTxid: string
  bitcoinTxOutputIndex: number
  recipient: string
  amount: number
  lastUpdateHeight: number
  lastUpdateBlockHash: string
  status: 'pending' | 'reprocessing' | 'accepted' | 'confirmed' | 'failed'
  statusMessage: string
  parameters: {
    maxFee: number
    lockTime: number
  }
  reclaimScript: string
  depositScript: string
  fulfillment?: {
    BitcoinTxid: string
    BitcoinTxIndex: number
    StacksTxid: string
    BitcoinBlockHash: string
    BitcoinBlockHeight: number
    BtcFee: number
  }
}

export interface Withdrawal {
  requestId: number
  stacksBlockHash: string
  stacksBlockHeight: number
  recipient: string
  amount: number
  lastUpdateHeight: number
  lastUpdateBlockHash: string
  status: 'pending' | 'reprocessing' | 'accepted' | 'confirmed' | 'failed'
  statusMessage: string
  parameters: {
    maxFee: number
  }
  fulfillment?: {
    BitcoinTxid: string
    BitcoinTxIndex: number
    StacksTxid: string
    BitcoinBlockHash: string
    BitcoinBlockHeight: number
    BtcFee: number
  }
}

export interface HiroBalances {
  stx: {
    balance: string
    total_sent: string
    total_received: string
    total_fees_sent: string
    total_miner_rewards_received: string
    lock_tx_id: string
    locked: string
    lock_height: number
    burnchain_lock_height: number
    burnchain_unlock_height: number
  }
  fungible_tokens: {
    [key: string]: {
      balance: string
      total_sent: string
      total_received: string
    }
  }
  non_fungible_tokens: {
    [key: string]: {
      count: string
      total_sent: string
      total_received: string
    }
  }
}

class SBTCService {
  private async fetchWithAuth(endpoint: string, options: RequestInit = {}): Promise<any> {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    })

    if (response.status === 404) {
      return null // Return null for 404s to handle "no data" cases
    }

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    return response.json()
  }

  private async fetchHiroApi(endpoint: string): Promise<any> {
    const response = await fetch(`${HIRO_API_URL}${endpoint}`, {
      headers: {
        'Content-Type': 'application/json',
      },
    })

    if (!response.ok) {
      throw new Error(`Hiro API error! status: ${response.status}`)
    }

    return response.json()
  }

  async getUserBalances(address: string): Promise<HiroBalances> {
    return this.fetchHiroApi(`/extended/v1/address/${address}/balances`)
  }

  async getPortfolioStats(address: string): Promise<PortfolioStats> {
    try {
      // Get all deposits and withdrawals for the address
      const [depositsResponse, withdrawalsResponse] = await Promise.all([
        this.fetchWithAuth(`/deposit/recipient/${address}`),
        this.fetchWithAuth(`/withdrawal/recipient/${address}`)
      ])

      // Handle case where user has no transactions
      const deposits = depositsResponse?.deposits || []
      const withdrawals = withdrawalsResponse?.withdrawals || []

      // Calculate totals from confirmed transactions
      const confirmedDeposits = deposits.filter((d: Deposit) => d.status === 'confirmed')
      const confirmedWithdrawals = withdrawals.filter((w: Withdrawal) => w.status === 'confirmed')

      const totalDeposits = confirmedDeposits.reduce((sum: number, d: Deposit) => sum + d.amount, 0)
      const totalWithdrawals = confirmedWithdrawals.reduce((sum: number, w: Withdrawal) => sum + w.amount, 0)
      const totalBalance = totalDeposits - totalWithdrawals

      // For now using placeholder values for price data
      // TODO: Integrate with price API
      return {
        totalBalance,
        totalDeposits,
        totalWithdrawals,
        priceChange24h: 0,
        btcPrice: 0,
        sbtcPrice: 0
      }
    } catch (error) {
      console.error('Error fetching portfolio stats:', error)
      throw error
    }
  }

  async getTransactions(address: string): Promise<Transaction[]> {
    try {
      // Get both deposits and withdrawals
      const [depositsResponse, withdrawalsResponse] = await Promise.all([
        this.fetchWithAuth(`/deposit/recipient/${address}`),
        this.fetchWithAuth(`/withdrawal/recipient/${address}`)
      ])

      // Handle case where user has no transactions
      const deposits = depositsResponse?.deposits || []
      const withdrawals = withdrawalsResponse?.withdrawals || []

      // Convert deposits to common Transaction format
      const depositTxs = deposits.map((d: Deposit) => ({
        id: d.bitcoinTxid,
        type: 'deposit' as const,
        amount: d.amount,
        status: d.status,
        timestamp: d.lastUpdateBlockHash, // Using block hash as timestamp for now
        txId: d.bitcoinTxid
      }))

      // Convert withdrawals to common Transaction format
      const withdrawalTxs = withdrawals.map((w: Withdrawal) => ({
        id: w.requestId.toString(),
        type: 'withdrawal' as const,
        amount: w.amount,
        status: w.status,
        timestamp: w.lastUpdateBlockHash,
        txId: w.fulfillment?.BitcoinTxid
      }))

      // Combine and sort by timestamp
      return [...depositTxs, ...withdrawalTxs].sort((a, b) => 
        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
      )
    } catch (error) {
      console.error('Error fetching transactions:', error)
      throw error
    }
  }

  async initiateDeposit(request: DepositRequest): Promise<{ depositAddress: string }> {
    // TODO: Implement deposit initiation using Emily API
    // This will need to create a deposit request and return the deposit address
    throw new Error('Not implemented')
  }

  async initiateWithdrawal(request: WithdrawalRequest): Promise<{ requestId: string }> {
    // TODO: Implement withdrawal initiation using Emily API
    // This will need to create a withdrawal request and return the request ID
    throw new Error('Not implemented')
  }

  async getDepositStatus(txId: string): Promise<{
    status: 'pending' | 'completed' | 'failed'
    confirmations: number
  }> {
    const deposit = await this.fetchWithAuth(`/deposit/${txId}`)
    if (!deposit) {
      throw new Error('Deposit not found')
    }
    return {
      status: deposit.status === 'confirmed' ? 'completed' : deposit.status === 'failed' ? 'failed' : 'pending',
      confirmations: deposit.fulfillment?.BitcoinBlockHeight || 0
    }
  }

  async getWithdrawalStatus(requestId: string): Promise<{
    status: 'pending' | 'completed' | 'failed'
    txId?: string
  }> {
    const withdrawal = await this.fetchWithAuth(`/withdrawal/${requestId}`)
    if (!withdrawal) {
      throw new Error('Withdrawal not found')
    }
    return {
      status: withdrawal.status === 'confirmed' ? 'completed' : withdrawal.status === 'failed' ? 'failed' : 'pending',
      txId: withdrawal.fulfillment?.BitcoinTxid
    }
  }
}

export const sbtcService = new SBTCService() 