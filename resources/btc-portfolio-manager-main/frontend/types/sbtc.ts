export interface Transaction {
  id: string
  type: 'deposit' | 'withdrawal'
  amount: number
  status: 'pending' | 'completed' | 'failed'
  timestamp: string
  txId?: string
  confirmations?: number
  recipient?: string
  btcAddress?: string
  fee?: number
}

export interface PortfolioStats {
  totalBalance: number
  totalDeposits: number
  totalWithdrawals: number
  priceChange24h: number
  btcPrice?: number
  sbtcPrice?: number
}

export interface BTCAddress {
  version: number
  hashBytes: string
}

export interface DepositInfo {
  txId: string
  amount: number
  recipient: string
  status: 'pending' | 'completed' | 'failed'
  confirmations: number
  timestamp: string
}

export interface WithdrawalInfo {
  requestId: string
  amount: number
  btcAddress: string
  status: 'pending' | 'completed' | 'failed'
  txId?: string
  fee?: number
  timestamp: string
}

export interface PriceData {
  timestamp: string
  price: number
  volume24h?: number
  marketCap?: number
}

export interface ChartData {
  labels: string[]
  datasets: {
    label: string
    data: number[]
    borderColor: string
    backgroundColor: string
  }[]
} 