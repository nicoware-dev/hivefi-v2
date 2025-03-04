import { useState } from 'react'
import { Dialog } from '@headlessui/react'
import { Button } from '@/components/ui/button'
import { sbtcService } from '@/lib/sbtc-service'
import { formatBTC, BTCToSatoshis } from '@/lib/utils'
import { useBitcoin } from '@/lib/hooks/use-bitcoin'

interface WithdrawalModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess?: (requestId: string) => void
  maxAmount: number
}

export function WithdrawalModal({ isOpen, onClose, onSuccess, maxAmount }: WithdrawalModalProps) {
  const { addresses } = useBitcoin()
  const [amount, setAmount] = useState('')
  const [btcAddress, setBtcAddress] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  // Get the payment address from the wallet
  const paymentAddress = addresses.find(addr => addr.purpose === 'payment')?.address || ''

  const handleInitiateWithdrawal = async () => {
    try {
      setIsLoading(true)
      setError('')

      if (!btcAddress.match(/^(bc1|[13])[a-zA-HJ-NP-Z0-9]{25,62}$/)) {
        throw new Error('Invalid Bitcoin address')
      }

      const parsedAmount = parseFloat(amount)
      if (isNaN(parsedAmount) || parsedAmount <= 0 || parsedAmount > maxAmount) {
        throw new Error('Invalid amount')
      }

      const response = await sbtcService.initiateWithdrawal({
        amount: parsedAmount,
        btcAddress,
        maxFee: 0.0001, // 10000 sats default max fee
      })

      onSuccess?.(response.requestId)
      onClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to initiate withdrawal. Please try again.')
      console.error('Withdrawal error:', err)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog
      open={isOpen}
      onClose={onClose}
      className="fixed inset-0 z-50 overflow-y-auto"
    >
      <div className="flex min-h-screen items-center justify-center">
        <Dialog.Overlay className="fixed inset-0 bg-black/30" />

        <div className="relative mx-auto max-w-md rounded-lg bg-white p-6 shadow-lg">
          <Dialog.Title className="text-lg font-medium">
            Withdraw sBTC to BTC
          </Dialog.Title>

          <div className="mt-4 space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Amount (sBTC)
              </label>
              <div className="mt-1 flex items-center">
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  placeholder="0.00000000"
                  step="0.00000001"
                  min="0.00000546" // Dust limit
                  max={maxAmount}
                />
                <Button
                  variant="ghost"
                  size="sm"
                  className="ml-2"
                  onClick={() => setAmount(maxAmount.toString())}
                >
                  Max
                </Button>
              </div>
              <p className="mt-1 text-sm text-gray-500">
                Available: {formatBTC(maxAmount)}
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Bitcoin Address
              </label>
              <div className="mt-1 space-y-2">
                <input
                  type="text"
                  value={btcAddress}
                  onChange={(e) => setBtcAddress(e.target.value)}
                  className="block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  placeholder="Enter Bitcoin address"
                />
                {paymentAddress && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full"
                    onClick={() => setBtcAddress(paymentAddress)}
                  >
                    Use Wallet Address
                  </Button>
                )}
              </div>
            </div>

            {error && (
              <p className="text-sm text-red-600">{error}</p>
            )}

            <div className="rounded-md bg-yellow-50 p-4">
              <p className="text-sm text-yellow-700">
                Withdrawals require 6 Bitcoin block confirmations (approximately 1 hour)
                before the BTC is sent to your address.
              </p>
            </div>

            <div className="flex justify-end space-x-3">
              <Button
                variant="outline"
                onClick={onClose}
              >
                Cancel
              </Button>
              <Button
                onClick={handleInitiateWithdrawal}
                disabled={!amount || !btcAddress || isLoading}
              >
                {isLoading ? 'Processing...' : 'Withdraw'}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </Dialog>
  )
} 