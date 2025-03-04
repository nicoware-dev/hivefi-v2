import type { PortfolioStats, Transaction } from "@/types/sbtc"

export const mockData = {
  portfolioStats: {
    totalBalance: 0.15,
    totalDeposits: 0.25,
    totalWithdrawals: 0.1,
    priceChange24h: -2.5,
    btcPrice: 51789.23,
    sbtcPrice: 51589.45
  } as PortfolioStats,

  transactions: [
    {
      id: "tx_1234567890",
      type: "deposit" as const,
      amount: 0.1,
      status: "confirmed",
      timestamp: "2024-02-25T10:30:00Z",
      txId: "btc_tx_1234567890"
    },
    {
      id: "tx_1234567891",
      type: "deposit" as const,
      amount: 0.15,
      status: "confirmed",
      timestamp: "2024-02-24T15:45:00Z",
      txId: "btc_tx_1234567891"
    },
    {
      id: "tx_1234567892",
      type: "withdrawal" as const,
      amount: 0.05,
      status: "confirmed",
      timestamp: "2024-02-23T09:15:00Z",
      txId: "btc_tx_1234567892"
    },
    {
      id: "tx_1234567893",
      type: "withdrawal" as const,
      amount: 0.05,
      status: "confirmed",
      timestamp: "2024-02-22T14:20:00Z",
      txId: "btc_tx_1234567893"
    },
    {
      id: "tx_1234567894",
      type: "deposit" as const,
      amount: 0.08,
      status: "pending",
      timestamp: "2024-02-25T11:00:00Z",
      txId: "btc_tx_1234567894"
    }
  ] as Transaction[],

  priceHistory: {
    hourly: [
      {
        timestamp: "2024-02-25T11:00:00Z",
        price: 51789.23
      },
      {
        timestamp: "2024-02-25T10:00:00Z",
        price: 51654.89
      },
      {
        timestamp: "2024-02-25T09:00:00Z",
        price: 51823.45
      },
      {
        timestamp: "2024-02-25T08:00:00Z",
        price: 51934.67
      },
      {
        timestamp: "2024-02-25T07:00:00Z",
        price: 51845.32
      }
    ],
    daily: [
      {
        timestamp: "2024-02-25",
        price: 51789.23
      },
      {
        timestamp: "2024-02-24",
        price: 51234.56
      },
      {
        timestamp: "2024-02-23",
        price: 50987.65
      },
      {
        timestamp: "2024-02-22",
        price: 51432.10
      },
      {
        timestamp: "2024-02-21",
        price: 51123.45
      }
    ]
  }
} 