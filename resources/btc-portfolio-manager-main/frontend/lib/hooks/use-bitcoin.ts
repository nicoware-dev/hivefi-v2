import { useEffect, useState } from 'react'
import type { BitcoinConnector } from '@reown/appkit-adapter-bitcoin'

interface BitcoinState {
  address: string | null
  isConnected: boolean
  addresses: BitcoinConnector.AccountAddress[]
}

export function useBitcoin() {
  const [state, setState] = useState<BitcoinState>({
    address: null,
    isConnected: false,
    addresses: [],
  })

  useEffect(() => {
    const checkConnection = async () => {
      try {
        // @ts-expect-error - window.bitcoin is injected by AppKit
        const bitcoin = window.bitcoin as BitcoinConnector
        if (!bitcoin) return

        const addresses = await bitcoin.getAccountAddresses()
        const paymentAddress = addresses.find(addr => addr.purpose === 'payment')

        if (paymentAddress) {
          setState({
            address: paymentAddress.address,
            isConnected: true,
            addresses,
          })
          localStorage.setItem('btcAddress', paymentAddress.address)
        }
      } catch (error) {
        console.error('Failed to check Bitcoin connection:', error)
      }
    }

    checkConnection()
    window.addEventListener('bitcoin#accountsChanged', checkConnection)
    return () => {
      window.removeEventListener('bitcoin#accountsChanged', checkConnection)
    }
  }, [])

  const signMessage = async (message: string, address: string) => {
    try {
      // @ts-expect-error - window.bitcoin is injected by AppKit
      const bitcoin = window.bitcoin as BitcoinConnector
      if (!bitcoin) throw new Error('Bitcoin wallet not connected')

      return await bitcoin.signMessage({ message, address })
    } catch (error) {
      console.error('Failed to sign message:', error)
      throw error
    }
  }

  const sendBitcoin = async (amount: string, recipient: string) => {
    try {
      // @ts-expect-error - window.bitcoin is injected by AppKit
      const bitcoin = window.bitcoin as BitcoinConnector
      if (!bitcoin) throw new Error('Bitcoin wallet not connected')

      return await bitcoin.sendTransfer({ amount, recipient })
    } catch (error) {
      console.error('Failed to send Bitcoin:', error)
      throw error
    }
  }

  const signPSBT = async (params: BitcoinConnector.SignPSBTParams) => {
    try {
      // @ts-expect-error - window.bitcoin is injected by AppKit
      const bitcoin = window.bitcoin as BitcoinConnector
      if (!bitcoin) throw new Error('Bitcoin wallet not connected')

      return await bitcoin.signPSBT(params)
    } catch (error) {
      console.error('Failed to sign PSBT:', error)
      throw error
    }
  }

  return {
    ...state,
    signMessage,
    sendBitcoin,
    signPSBT,
  }
} 