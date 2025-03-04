'use client'

import Image from "next/image"
import { useWeb3Modal } from "@web3modal/wagmi/react"
import { useAccount, useDisconnect } from "wagmi"
import { useState } from "react"
import { ethers } from "ethers"

import Conflux_Black from "./Images/Conflux_Black.png"

export default function Home() {
  const { open } = useWeb3Modal()

  const { address, isConnected } = useAccount()
  const { disconnect } = useDisconnect()
  const [txHash, setTxHash] = useState(null)
  const [isLoading, setIsLoading] = useState(false)

  const receiverAddress = "0xCD5c6677bf6deb6C6935F6ec90BB992FFE8fa045"

  const executeTx = async () => {
    setIsLoading(true)
    try {
      // Request access to the user's accounts
      await window.ethereum.request({ method: 'eth_requestAccounts' })

      // Create a Web3Provider instance
      const provider = new ethers.providers.Web3Provider(window.ethereum)

      // Get the signer
      const signer = provider.getSigner()

      // Create the transaction object
      const tx = {
        to: receiverAddress,
        value: ethers.utils.parseEther("0.001")
      }

      // Send the transaction
      const transaction = await signer.sendTransaction(tx)

      // Wait for the transaction to be mined
      const receipt = await transaction.wait()

      // Set the transaction hash
      setTxHash(receipt.transactionHash)
    } catch (error) {
      console.error("Failed to execute transaction:", error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-4 bg-gradient-to-br from-blue-600 to-purple-700">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden transform transition-all duration-300 hover:shadow-3xl">
        <div className="bg-gradient-to-r from-blue-500 to-purple-600 p-6">
          <div className="flex items-center justify-center space-x-6 mb-4">
            <Image 
              src="https://avatars.githubusercontent.com/u/37784886" 
              alt="WalletConnect Logo" 
              width={60} 
              height={60}
              className="rounded-full shadow-md transition-transform duration-300 hover:scale-110"
            />
            <span className="text-3xl font-bold text-white">+</span>
            <Image 
              src={Conflux_Black} 
              alt="Conflux Logo" 
              width={60} 
              height={60}
              className="transition-transform duration-300 hover:scale-110"
            />
          </div>
          <h1 className="text-white font-extrabold text-3xl text-center leading-tight">
            Next.js Demo: WalletConnect on Conflux eSpace
          </h1>
        </div>
        <div className="p-8">
          <p className="text-gray-600 font-medium mb-8 text-center">
            Connect to Conflux eSpace Testnet
          </p>
          {isConnected ? (
            <div className="space-y-6">
              <div className="space-y-2">
                <p className="text-sm font-medium text-gray-600">Connected Address:</p>
                <div className="w-full px-4 py-3 bg-gray-100 rounded-lg border border-gray-300 shadow-inner">
                  <p className="text-sm text-gray-800 font-mono break-all text-center">{address}</p>
                </div>
              </div>
              <div className="space-y-2">
                <p className="text-sm font-medium text-gray-600">Receiver Address:</p>
                <div className="w-full px-4 py-3 bg-gray-100 rounded-lg border border-gray-300 shadow-inner">
                  <p className="text-sm text-gray-800 font-mono break-all text-center">{receiverAddress}</p>
                </div>
              </div>
              <button 
                onClick={executeTx}
                disabled={isLoading}
                className="w-full px-6 py-3 bg-green-500 text-white font-semibold rounded-lg shadow-md hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-opacity-50 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <span className="flex items-center justify-center">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Executing Transaction...
                  </span>
                ) : 'Execute Transaction'}
              </button>
              {txHash && (
                <div className="w-full text-center space-y-2">
                  <p className="text-sm font-medium text-gray-600">Transaction Hash:</p>
                  <a 
                    href={`https://evmtestnet.confluxscan.io/tx/${txHash}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-500 hover:text-blue-600 underline break-all text-sm block p-2 bg-blue-50 rounded-lg transition-colors duration-300"
                  >
                    {txHash}
                  </a>
                </div>
              )}
              <button 
                onClick={() => disconnect()}
                className="w-full px-6 py-3 bg-red-500 text-white font-semibold rounded-lg shadow-md hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-opacity-50 transition-all duration-300"
              >
                Disconnect
              </button>
            </div>
          ) : (
            <button 
              onClick={() => open()}
              className="w-full px-6 py-3 bg-blue-500 text-white font-semibold rounded-lg shadow-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 transition-all duration-300"
            >
              Connect Wallet
            </button>
          )}
        </div>
      </div>
    </main>
  )
}