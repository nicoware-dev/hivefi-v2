"use client"

import React, { type ReactNode } from "react"
import { WagmiAdapter } from "@reown/appkit-adapter-wagmi"
import {
  AppKitNetwork,
  arbitrum,
  bitcoin,
  mainnet,
  sepolia,
} from "@reown/appkit/networks"
import { createAppKit } from "@reown/appkit/react"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { Config, WagmiProvider } from "wagmi"

import { bitcoinAdapter, networks, projectId } from "@/config/reownConfig"

// Set up metadata
const metadata = {
  name: "sBTC Portfolio",
  description: "Track and manage your sBTC positions",
  url: process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
  icons: ["/logo.png"],
}

export const wagmiAdapter = new WagmiAdapter({
  ssr: true,
  projectId,
  networks,
})

// Create the modal
export const modal = createAppKit({
  adapters: [wagmiAdapter, bitcoinAdapter],
  projectId,
  networks,
  metadata,
  features: {
    analytics: true, // Optional - defaults to your Cloud configuration
    socials: [],
    email: false,
  },
  themeVariables: {
    "--w3m-accent": "#000000",
  },
})

function Providers({ children }: { children: ReactNode }) {
  const queryClient = new QueryClient()

  return (
    <WagmiProvider config={wagmiAdapter.wagmiConfig as Config}>
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </WagmiProvider>
  )
}

export default Providers