import { Card } from '@/components/ui/card'
import { formatBTC, formatDate, shortenAddress } from '@/lib/utils'
import { Transaction } from '@/types/sbtc'
import { ArrowUpRight, ArrowDownLeft, ExternalLink } from 'lucide-react'

interface TransactionListProps {
  transactions: Transaction[]
  isLoading?: boolean
  error?: string
}

export function TransactionList({
  transactions,
  isLoading = false,
  error,
}: TransactionListProps) {
  if (isLoading) {
    return (
      <Card className="p-6">
        <h2 className="mb-4 text-xl font-semibold">Recent Transactions</h2>
        <div className="flex h-40 items-center justify-center">
          <div className="text-gray-500">Loading transactions...</div>
        </div>
      </Card>
    )
  }

  if (error) {
    return (
      <Card className="p-6">
        <h2 className="mb-4 text-xl font-semibold">Recent Transactions</h2>
        <div className="flex h-40 items-center justify-center">
          <div className="text-red-500">{error}</div>
        </div>
      </Card>
    )
  }

  if (transactions.length === 0) {
    return (
      <Card className="p-6">
        <h2 className="mb-4 text-xl font-semibold">Recent Transactions</h2>
        <div className="flex h-40 items-center justify-center">
          <div className="text-gray-500">No transactions found</div>
        </div>
      </Card>
    )
  }

  return (
    <Card className="p-6">
      <h2 className="mb-4 text-xl font-semibold">Recent Transactions</h2>
      <div className="divide-y">
        {transactions.map((tx) => (
          <div key={tx.id} className="py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                {tx.type === 'deposit' ? (
                  <ArrowUpRight className="h-5 w-5 text-green-500" />
                ) : (
                  <ArrowDownLeft className="h-5 w-5 text-red-500" />
                )}
                <div className="ml-3">
                  <div className="flex items-center">
                    <span className="font-medium capitalize">{tx.type}</span>
                    <span
                      className={`ml-2 rounded-full px-2 py-0.5 text-xs ${
                        tx.status === 'completed'
                          ? 'bg-green-100 text-green-800'
                          : tx.status === 'pending'
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-red-100 text-red-800'
                      }`}
                    >
                      {tx.status}
                    </span>
                  </div>
                  <div className="mt-1 text-sm text-gray-500">
                    {formatDate(tx.timestamp)}
                  </div>
                </div>
              </div>
              <div className="text-right">
                <div className="font-medium">{formatBTC(tx.amount)}</div>
                {tx.fee && (
                  <div className="text-sm text-gray-500">
                    Fee: {formatBTC(tx.fee)}
                  </div>
                )}
              </div>
            </div>

            {/* Transaction details */}
            <div className="mt-2 text-sm text-gray-500">
              {tx.type === 'deposit' && tx.recipient && (
                <div className="flex items-center">
                  <span className="mr-1">To:</span>
                  <span className="font-mono">
                    {shortenAddress(tx.recipient)}
                  </span>
                </div>
              )}
              {tx.type === 'withdrawal' && tx.btcAddress && (
                <div className="flex items-center">
                  <span className="mr-1">To:</span>
                  <span className="font-mono">
                    {shortenAddress(tx.btcAddress)}
                  </span>
                </div>
              )}
              {tx.txId && (
                <div className="mt-1 flex items-center">
                  <a
                    href={`https://mempool.space/tx/${tx.txId}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center text-blue-500 hover:text-blue-600"
                  >
                    View on Explorer
                    <ExternalLink className="ml-1 h-3 w-3" />
                  </a>
                  {tx.confirmations !== undefined && (
                    <span className="ml-3">
                      {tx.confirmations} confirmation
                      {tx.confirmations !== 1 && 's'}
                    </span>
                  )}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </Card>
  )
} 