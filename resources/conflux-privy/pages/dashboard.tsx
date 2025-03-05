'use client'

import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { getAccessToken, usePrivy } from "@privy-io/react-auth"
import Head from "next/head"
import { ethers } from "ethers"

const receiverAddress = "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266";

async function verifyToken() {
  const url = "/api/verify"
  const accessToken = await getAccessToken()
  const result = await fetch(url, {
    headers: {
      ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : undefined),
    },
  })

  return await result.json()
}

export default function DashboardPage() {
  const [verifyResult, setVerifyResult] = useState()
  const [isLoading, setIsLoading] = useState(false)
  const [txHash, setTxHash] = useState("")
  const router = useRouter()
  const { ready, authenticated, user, logout, getEthersProvider } = usePrivy()

  useEffect(() => {
    if (ready && !authenticated) {
      router.push("/")
    }
  }, [ready, authenticated, router])

  const executeTx = async () => {
    setIsLoading(true)
    setTxHash("")
    try {
      const provider = await getEthersProvider()
      const signer = provider.getSigner()

      const tx = {
        to: receiverAddress,
        value: ethers.utils.parseEther("1")
      }

      const transaction = await signer.sendTransaction(tx)
      const receipt = await transaction.wait()
      setTxHash(receipt.transactionHash)
    } catch (error) {
      console.error("Failed to execute transaction:", error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <>
      <Head>
        <title>Privy Auth Demo</title>
      </Head>

      <main className="flex items-center justify-center min-h-screen relative overflow-hidden">
        {/* Dynamic background */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-400 via-purple-500 to-pink-500 animate-gradient-x"></div>
        <div className="absolute inset-0 opacity-30">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(255,255,255,0.2),transparent_50%)] animate-pulse"></div>
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,rgba(255,255,255,0.3),transparent_50%)] animate-pulse delay-75"></div>
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_80%,rgba(255,255,255,0.3),transparent_50%)] animate-pulse delay-150"></div>
        </div>

        {ready && authenticated ? (
          <div className="relative z-10 w-full max-w-4xl mx-4 sm:mx-auto my-8 bg-white bg-opacity-90 backdrop-blur-lg rounded-xl shadow-lg overflow-hidden">
            <div className="p-6 sm:p-8">
              <div className="flex flex-col sm:flex-row items-center justify-between mb-8">
                <h1 className="text-3xl font-bold text-gray-800 mb-4 sm:mb-0">Privy Auth Demo</h1>
                <button
                  onClick={logout}
                  className="px-6 py-3 bg-gradient-to-r from-purple-400 to-pink-500 text-white font-semibold rounded-full hover:from-purple-500 hover:to-pink-600 transition-all duration-300 ease-in-out transform hover:-translate-y-1 hover:shadow-lg"
                >
                  Logout
                </button>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="flex flex-col items-center">
                  <button
                    onClick={executeTx}
                    disabled={isLoading}
                    className={`w-full bg-gradient-to-r from-blue-500 to-violet-500 hover:from-blue-600 hover:to-violet-600 text-white font-semibold py-4 px-6 rounded-full shadow-md hover:shadow-xl transition-all duration-300 ease-in-out transform hover:-translate-y-1 ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    {isLoading ? 'Sending...' : 'Send 1 TEST CFX'}
                  </button>
                  {txHash && (
                    <a
                      href={`https://evmtestnet.confluxscan.io/tx/${txHash}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-4 text-blue-600 hover:text-blue-800 underline text-sm"
                    >
                      View Transaction
                    </a>
                  )}
                </div>
                <div className="flex items-center justify-center bg-white bg-opacity-50 backdrop-blur-sm rounded-full p-4 shadow-inner">
                  <p className="text-sm text-gray-800 font-medium">
                    Connected as: {user?.wallet?.address}
                  </p>
                </div>
              </div>

              {Boolean(verifyResult) && (
                <details className="mt-8">
                  <summary className="font-bold uppercase text-sm text-gray-700 cursor-pointer hover:text-gray-900 transition-colors duration-200">
                    Server verify result
                  </summary>
                  <pre className="mt-4 p-4 bg-gray-800 bg-opacity-75 backdrop-blur-sm text-gray-100 font-mono text-xs sm:text-sm rounded-lg overflow-x-auto">
                    {JSON.stringify(verifyResult, null, 2)}
                  </pre>
                </details>
              )}
            </div>
          </div>
        ) : null}
      </main>
    </>
  )
}