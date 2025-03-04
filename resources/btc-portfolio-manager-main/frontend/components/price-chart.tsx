import { useState, useEffect } from 'react'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'
import { Card } from '@/components/ui/card'
import { formatUSD, formatDate } from '@/lib/utils'

interface PriceData {
  timestamp: string
  price: number
}

interface PriceChartProps {
  data?: PriceData[]
  isLoading?: boolean
  error?: string
  timeframe?: '1D' | '1W' | '1M' | '3M' | '1Y' | 'ALL'
}

const timeframeOptions = ['1D', '1W', '1M', '3M', '1Y', 'ALL'] as const

export function PriceChart({
  data = [],
  isLoading = false,
  error,
  timeframe = '1M',
}: PriceChartProps) {
  const [selectedTimeframe, setSelectedTimeframe] = useState(timeframe)

  // Mock data for demonstration
  const [chartData, setChartData] = useState<PriceData[]>([])

  useEffect(() => {
    if (data.length > 0) {
      setChartData(data)
    } else {
      // Generate mock data if no data is provided
      const mockData: PriceData[] = []
      const now = new Date()
      const points = 30

      for (let i = points - 1; i >= 0; i--) {
        const date = new Date(now)
        date.setDate(date.getDate() - i)
        mockData.push({
          timestamp: date.toISOString(),
          price: 40000 + Math.random() * 5000,
        })
      }

      setChartData(mockData)
    }
  }, [data])

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="rounded-lg bg-white p-3 shadow-lg">
          <p className="text-sm text-gray-500">{formatDate(label)}</p>
          <p className="text-lg font-semibold text-gray-900">
            {formatUSD(payload[0].value)}
          </p>
        </div>
      )
    }
    return null
  }

  return (
    <Card className="p-6">
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-xl font-semibold">Historical Wallet Balance</h2>
        <div className="flex space-x-2">
          {timeframeOptions.map((option) => (
            <button
              key={option}
              onClick={() => setSelectedTimeframe(option)}
              className={`rounded-md px-3 py-1 text-sm ${
                selectedTimeframe === option
                  ? 'bg-blue-100 text-blue-600'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              {option}
            </button>
          ))}
        </div>
      </div>

      {isLoading ? (
        <div className="flex h-[400px] items-center justify-center">
          <div className="text-gray-500">Loading...</div>
        </div>
      ) : error ? (
        <div className="flex h-[400px] items-center justify-center">
          <div className="text-red-500">{error}</div>
        </div>
      ) : (
        <div className="h-[400px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={chartData}
              margin={{
                top: 5,
                right: 30,
                left: 20,
                bottom: 5,
              }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                dataKey="timestamp"
                tickFormatter={(value) => {
                  const date = new Date(value)
                  return `${date.getMonth() + 1}/${date.getDate()}`
                }}
              />
              <YAxis
                domain={['auto', 'auto']}
                tickFormatter={(value) => `$${value.toLocaleString()}`}
              />
              <Tooltip content={<CustomTooltip />} />
              <Line
                type="monotone"
                dataKey="price"
                stroke="#2563eb"
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 8 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}
    </Card>
  )
} 