"use client"

import { useEffect, useState, memo } from "react"
import {
  ArrowDownLeft,
  ArrowUpRight,
  BarChart,
  LineChart as LineChartIcon,
  Wallet,
} from "lucide-react"
import {
  ResponsiveContainer,
  LineChart as RechartsLineChart,
  XAxis,
  YAxis,
  Tooltip,
  Line
} from "recharts"

import type { PortfolioStats, Transaction } from "@/types/sbtc"
import { sbtcService } from "@/lib/sbtc-service"
import { calculatePercentageChange, formatBTC, formatUSD } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { DepositModal } from "@/components/deposit-modal"
import { PriceChart } from "@/components/price-chart"
import { TransactionList } from "@/components/transaction-list"
import { WithdrawalModal } from "@/components/withdrawal-modal"
import { useAppKitAccount } from "@reown/appkit/react"
import { mockData } from './mock-data'

interface PriceDataPoint {
  timestamp: string;
  price: number;
}


export default function PortfolioPage() {
  const [isDepositModalOpen, setIsDepositModalOpen] = useState(false)
  const [isWithdrawalModalOpen, setIsWithdrawalModalOpen] = useState(false)
  const [stats, setStats] = useState<PortfolioStats | null>(null)
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [priceData, setPriceData] = useState<PriceDataPoint[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")

  const address = 'SP1JNQEQE3NKFD6W0JWWNJD1P1M906P9EYSV671B5';
  
  // Memoize the fetchData function to prevent unnecessary re-renders
  const fetchData = async () => {
    if (!address) return;

    try {
      setIsLoading(true)
      setError("")

      let portfolioStats, txHistory;

      try {
        // Try to fetch real data
        [portfolioStats, txHistory] = await Promise.all([
          sbtcService.getPortfolioStats(address),
          sbtcService.getTransactions(address),
        ])
      } catch (err) {
        // If real data fetch fails, use mock data
        console.log('Using mock data as API is not available')
        portfolioStats = mockData.portfolioStats
        txHistory = mockData.transactions
      }

      // Set price data from mock data for now
      setPriceData(mockData.priceHistory.hourly)

      // Only update state if the values have changed
      setStats(prevStats => {
        if (JSON.stringify(prevStats) !== JSON.stringify(portfolioStats)) {
          return portfolioStats;
        }
        return prevStats;
      });

      setTransactions(prevTx => {
        if (JSON.stringify(prevTx) !== JSON.stringify(txHistory)) {
          return txHistory;
        }
        return prevTx;
      });
    } catch (err) {
      console.error("Failed to fetch portfolio data:", err)
      setError(err instanceof Error ? err.message : "Failed to load portfolio data")
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    // Initial fetch
    fetchData()

    // Set up polling for transaction updates
    const pollInterval = setInterval(fetchData, 30000) // Poll every 30 seconds

    return () => {
      clearInterval(pollInterval)
    }
  }, [address]) // Only re-run if address changes

  const handleDepositSuccess = async (txId: string) => {
    try {
      // Get the deposit details from Emily API
      const deposit = await sbtcService.getDepositStatus(txId)
      
      // Optimistically add the transaction to the list
      const newTx: Transaction = {
        id: txId,
        type: "deposit",
        amount: 0, // Will be updated when confirmed
        status: deposit.status,
        timestamp: new Date().toISOString(),
        txId,
      }
      setTransactions([newTx, ...transactions])
    } catch (err) {
      console.error("Failed to get deposit status:", err)
    }
  }

  const handleWithdrawalSuccess = async (requestId: string) => {
    try {
      // Get the withdrawal details from Emily API
      const withdrawal = await sbtcService.getWithdrawalStatus(requestId)
      
      // Optimistically add the transaction to the list
      const newTx: Transaction = {
        id: requestId,
        type: "withdrawal",
        amount: 0, // Will be updated when confirmed
        status: withdrawal.status,
        timestamp: new Date().toISOString(),
        txId: withdrawal.txId,
      }
      setTransactions([newTx, ...transactions])
    } catch (err) {
      console.error("Failed to get withdrawal status:", err)
    }
  }


  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-lg text-gray-500">Loading portfolio...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-lg text-red-500">{error}</div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="mb-8 text-4xl font-bold">sBTC Portfolio</h1>

      {/* Stats Grid */}
      <div className="mb-8 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Total Balance</p>
              <p className="text-2xl font-bold">
                {formatBTC(stats?.totalBalance || 0)}
              </p>
              {stats?.btcPrice !== undefined && stats.btcPrice > 0 && (
                <p className="text-sm text-gray-500">
                  {formatUSD(stats.totalBalance * (stats.btcPrice || 0))}
                </p>
              )}
            </div>
            <Wallet className="size-8 text-blue-500" />
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Total Deposits</p>
              <p className="text-2xl font-bold">
                {formatBTC(stats?.totalDeposits || 0)}
              </p>
            </div>
            <ArrowUpRight className="size-8 text-green-500" />
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Total Withdrawals</p>
              <p className="text-2xl font-bold">
                {formatBTC(stats?.totalWithdrawals || 0)}
              </p>
            </div>
            <ArrowDownLeft className="size-8 text-red-500" />
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">24h Change</p>
              <p className="text-2xl font-bold">
                {calculatePercentageChange(
                  stats?.sbtcPrice || 0,
                  (stats?.sbtcPrice || 0) * (1 - (stats?.priceChange24h || 0) / 100)
                )}
              </p>
            </div>
            <LineChartIcon className="size-8 text-purple-500" />
          </div>
        </Card>
      </div>

      {/* Actions */}
      <div className="mb-8 flex gap-4">
        <Button onClick={() => setIsDepositModalOpen(true)}>
          <ArrowUpRight className="mr-2 size-4" />
          Deposit BTC
        </Button>
        <Button
          variant="outline"
          onClick={() => setIsWithdrawalModalOpen(true)}
          disabled={stats?.totalBalance === 0}
        >
          <ArrowDownLeft className="mr-2 size-4" />
          Withdraw sBTC
        </Button>
      </div>

      {/* Price Chart */}
      <div className="mb-8">
        <PriceChart data={priceData} />
      </div>


      
      {/* Recent Transactions */}
      <TransactionList
        transactions={transactions}
        isLoading={isLoading}
        error={error}
      />

      {/* Modals */}
      <DepositModal
        isOpen={isDepositModalOpen}
        onClose={() => setIsDepositModalOpen(false)}
        onSuccess={handleDepositSuccess}
      />

      <WithdrawalModal
        isOpen={isWithdrawalModalOpen}
        onClose={() => setIsWithdrawalModalOpen(false)}
        onSuccess={handleWithdrawalSuccess}
        maxAmount={stats?.totalBalance || 0}
      />
    </div>
  )
}
