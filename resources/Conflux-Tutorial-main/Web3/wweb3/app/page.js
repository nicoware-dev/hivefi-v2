'use client'

import React, { useState, useEffect } from 'react'


import { Web3 } from 'web3'

const web3 = new Web3(new Web3.providers.HttpProvider("https://evmtestnet.confluxrpc.com"));

const smartcontractAddress ="0xED4D74C163103dEC227b704059B68ca48A6f0c53";

const provider = new Web3(new Web3.providers.HttpProvider("https://evmtestnet.confluxrpc.com"));

const ABI = { 
  "abi": [
    {
      "inputs": [],
      "name": "getGreeting",
      "outputs": [
        {
          "internalType": "string",
          "name": "",
          "type": "string"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "string",
          "name": "_newGreeting",
          "type": "string"
        }
      ],
      "name": "setGreeting",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    }
  ]
}

const networks = {
  espace: {
    chainId: `0x${Number(71).toString(16)}`,
    chainName: 'espace',
    nativeCurrency: {
      name: 'espace',
      symbol: 'CFX',
      decimals: 18,
    },
    rpcUrls: ['https://evmtestnet.confluxrpc.com'],
  },
}

export default function Home() {
  const [loading, setLoading] = useState(false)
  const [address, setAddress] = useState('')
  const [balance, setBalance] = useState('')
  const [balanceLoading, setBalanceLoading] = useState(false)
  const [newGreeting, setNewGreeting] = useState('')
  const [writeLoading, setWriteLoading] = useState(false)
  const [readResult, setReadResult] = useState('')
  const [transactionHash, setTransactionHash] = useState('')

  useEffect(() => {
    const storedAddress = localStorage.getItem('filWalletAddress')
    if (storedAddress) {
      setAddress(storedAddress)
    }
  }, [])

  const fetchBalance = async () => {
    if (!address) {
      alert('Please login first')
      return
    }
    setBalanceLoading(true)
    try {
      let web3 = new Web3(window.ethereum)
      const balanceWei = await web3.eth.getBalance(address)
      const finalBalance = web3.utils.fromWei(balanceWei, "ether")
      setBalance(finalBalance)
    } catch (error) {
      console.error('Error fetching balance:', error)
      alert('Failed to fetch balance. Please try again.')
    } finally {
      setBalanceLoading(false)
    }
  }

  const readSM = async () => {
    try {
      const contractPublic = new web3.eth.Contract(ABI.abi, smartcontractAddress);
      const result = await contractPublic.methods.getGreeting().call();
      setReadResult(result);
    } catch (error) {
      console.error('Error reading from smart contract:', error);
      alert('Failed to read from smart contract. Please try again.');
    }
  }

  const writeSM = async () => {
    if (!address) {
      alert('Please connect your wallet first')
      return
    }
    
    if (!newGreeting) {
      alert('Please enter a new greeting')
      return
    }

    setWriteLoading(true)
    
    try {
      const web3Instance = new Web3(window.ethereum)

      const contract = new web3Instance.eth.Contract(ABI.abi, smartcontractAddress)
      const data = contract.methods.setGreeting(newGreeting).encodeABI()
      const gasEstimate = await contract.methods.setGreeting(newGreeting)
      
        .estimateGas({ from: address })
      const gasPrice = await web3Instance.eth.getGasPrice()
      const gasLimit = `0x${Math.ceil(Number(gasEstimate) * 1.2).toString(16)}`
      const gasPriceHex = `0x${BigInt(gasPrice).toString(16)}`
      
      const transactionParameters = {
        to: smartcontractAddress,
        from: address,
        data: data,
        gas: gasLimit,
        gasPrice: gasPriceHex
      }
      
      const txHash = await window.ethereum.request({
        method: 'eth_sendTransaction',
        params: [transactionParameters],
      })
      
      alert(`Transaction submitted! Hash: ${txHash}`)
      setNewGreeting('')
    } catch (error) {
      console.error('Error writing to smart contract:', error)
      alert(`Failed to update greeting: ${error.message}`)
    } finally {
      setWriteLoading(false)
    }
  }

  const transact = async () => {
    if (!address) {
      alert('Please connect your wallet first')
      return
    }

    const receiverAddress = '0x80F9839DDfa157498eB112c2081E339FB75bCD35'
    const amountInCFX = '1'

    try {
      const web3Instance = new Web3(window.ethereum)
      const amountInWei = web3Instance.utils.toWei(amountInCFX, 'ether')
      const gasPrice = await web3Instance.eth.getGasPrice()
      const gasEstimate = await web3Instance.eth.estimateGas({
        from: address,
        to: receiverAddress,
        value: amountInWei
      })

      const transactionParameters = {
        from: address,
        to: receiverAddress,
        value: `0x${BigInt(amountInWei).toString(16)}`,
        gas: `0x${Math.ceil(Number(gasEstimate) * 1.2).toString(16)}`,
        gasPrice: `0x${BigInt(gasPrice).toString(16)}`
      }

      const txHash = await window.ethereum.request({
        method: 'eth_sendTransaction',
        params: [transactionParameters],
      })

      setTransactionHash(txHash)
    } catch (error) {
      console.error('Transaction error:', error)
      alert(`Failed to send CFX: ${error.message}`)
    }
  }

  const handleLogin = async () => {
    setLoading(true)
    try {
      if (typeof window.ethereum === 'undefined') {
        throw new Error('Please install MetaMask')
      }
      
      const web3 = new Web3(window.ethereum)
      
      if (web3.network !== 'espace') {
        await window.ethereum.request({
          method: 'wallet_addEthereumChain',
          params: [{
            ...networks["espace"]
          }]
        })
      }
      
      const accounts = await web3.eth.requestAccounts()
      const newAddress = accounts[0]
      localStorage.setItem('filWalletAddress', newAddress)
      setAddress(newAddress)
      setBalance('')
    } catch (error) {
      console.error('Login error:', error)
      alert(error.message)
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = () => {
    localStorage.removeItem('filWalletAddress')
    setAddress('')
    setBalance('')
  }

  const truncateAddress = (addr) => {
    if (!addr) return ''
    return addr.substring(0, 6) + '...' + addr.substring(addr.length - 4)
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <nav className="bg-white shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex-shrink-0 flex items-center">
              <span className="text-xl font-bold text-gray-800">CFX Dashboard</span>
            </div>
            <div className="flex items-center">
              {address ? (
                <div className="flex items-center space-x-4">
                  <span className="text-sm text-gray-600">
                    {truncateAddress(address)}
                  </span>
                  <button
                    onClick={handleLogout}
                    className="px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                  >
                    Logout
                  </button>
                </div>
              ) : (
                <button
                  onClick={handleLogin}
                  disabled={loading}
                  className="px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                >
                  {loading ? 'Connecting...' : 'Login'}
                </button>
              )}
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="border-4 border-dashed border-gray-200 rounded-lg p-6 flex flex-col items-center justify-center space-y-4">
            <div className="flex flex-col items-center space-y-2">
              <button 
                onClick={fetchBalance} 
                disabled={balanceLoading || !address}
                className="px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
              >
                {balanceLoading ? 'Checking...' : 'Check Balance'}
              </button>
              {balance && (
                <div className="text-lg font-semibold text-gray-700">
                  Balance: {balance} CFX
                </div>
              )}
            </div>
            <div className="flex flex-col items-center space-y-2">
              <button onClick={readSM} className="px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500">
                Read
              </button>
              {readResult && (
                <div className="text-sm text-gray-600">
                  Current greeting: {readResult}
                </div>
              )}
            </div>
            <div className="flex flex-col items-center space-y-2">
              <input
                type="text"
                value={newGreeting}
                onChange={(e) => setNewGreeting(e.target.value)}
                placeholder="Enter new greeting"
                className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
              />
              <button 
                onClick={writeSM} 
                disabled={writeLoading || !address}
                className="px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-yellow-600 hover:bg-yellow-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500 disabled:opacity-50"
              >
                {writeLoading ? 'Writing...' : 'Write'}
              </button>
            </div>
            <div className="flex flex-col items-center space-y-2">
              <button onClick={transact} className="px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500">
                Send 1 Test CFX
              </button>
              {transactionHash && (
                <a 
                  href={`https://evmtestnet.confluxscan.io/tx/${transactionHash}`} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-sm text-blue-600 hover:underline"
                >
                  View Transaction
                </a>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}