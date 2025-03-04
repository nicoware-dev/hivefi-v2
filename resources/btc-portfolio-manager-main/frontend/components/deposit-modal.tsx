import { useState } from 'react'
import { Dialog } from '@headlessui/react'
import { QRCodeSVG } from 'qrcode.react'
import { Button } from '@/components/ui/button'
import { sbtcService } from '@/lib/sbtc-service'
import { formatBTC, BTCToSatoshis } from '@/lib/utils'
import { useBitcoin } from '@/lib/hooks/use-bitcoin'

interface DepositModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess?: (txId: string) => void
}

export function DepositModal({ isOpen, onClose, onSuccess }: DepositModalProps) {
  const { address, sendBitcoin } = useBitcoin()
  const [amount, setAmount] = useState('')
  const [depositAddress, setDepositAddress] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  const handleInitiateDeposit = async () => {
    try {
      setIsLoading(true)
      setError('')

      const response = await sbtcService.initiateDeposit({
        amount: parseFloat(amount),
        recipient: address || '',
      })

      setDepositAddress(response.depositAddress)
    } catch (err) {
      setError('Failed to initiate deposit. Please try again.')
      console.error('Deposit error:', err)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSendBitcoin = async () => {
    try {
      setIsLoading(true)
      setError('')

      if (!depositAddress || !amount) {
        throw new Error('Invalid deposit parameters')
      }

      const txId = await sendBitcoin(
        BTCToSatoshis(parseFloat(amount)).toString(),
        depositAddress
      )

      onSuccess?.(txId)
      onClose()
    } catch (err) {
      setError('Failed to send Bitcoin. Please try again.')
      console.error('Send error:', err)
    } finally {
      setIsLoading(false)
    }
  }

  const handleCopyAddress = () => {
    navigator.clipboard.writeText(depositAddress)
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
            Deposit BTC to mint sBTC
          </Dialog.Title>

          <div className="mt-4">
            {!depositAddress ? (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Amount (BTC)
                  </label>
                  <input
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    placeholder="0.00000000"
                    step="0.00000001"
                    min="0.00000546" // Dust limit
                  />
                </div>

                {error && (
                  <p className="text-sm text-red-600">{error}</p>
                )}

                <Button
                  onClick={handleInitiateDeposit}
                  disabled={!amount || isLoading}
                  className="w-full"
                >
                  {isLoading ? 'Generating address...' : 'Get deposit address'}
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                <p className="text-sm text-gray-600">
                  Send exactly {formatBTC(parseFloat(amount))} to:
                </p>

                <div className="flex justify-center">
                  <QRCodeSVG
                    value={depositAddress}
                    size={200}
                    includeMargin
                    level="L"
                  />
                </div>

                <div className="flex items-center justify-between rounded-md bg-gray-50 p-3">
                  <code className="text-sm">{depositAddress}</code>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleCopyAddress}
                  >
                    Copy
                  </Button>
                </div>

                <div className="flex space-x-3">
                  <Button
                    variant="outline"
                    className="flex-1"
                    onClick={handleCopyAddress}
                  >
                    Copy Address
                  </Button>
                  <Button
                    className="flex-1"
                    onClick={handleSendBitcoin}
                    disabled={isLoading}
                  >
                    {isLoading ? 'Sending...' : 'Send with Wallet'}
                  </Button>
                </div>

                <p className="text-sm text-gray-500">
                  The deposit will be processed after 1 confirmation on the Bitcoin network.
                  This usually takes about 10 minutes.
                </p>
              </div>
            )}
          </div>

          <div className="mt-6 flex justify-end">
            <Button
              variant="outline"
              onClick={onClose}
            >
              Close
            </Button>
          </div>
        </div>
      </div>
    </Dialog>
  )
} 