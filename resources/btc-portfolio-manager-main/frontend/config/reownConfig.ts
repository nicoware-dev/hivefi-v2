import { BitcoinAdapter } from "@reown/appkit-adapter-bitcoin"
import { bitcoin, bitcoinTestnet , bob , bobSepolia , rootstock , rootstockTestnet} from "@reown/appkit/networks"
import type { AppKitNetwork } from "@reown/appkit/networks"

export const projectId =
  process.env.NEXT_PUBLIC_REOWN_PROJECT_ID || "4efc38e347b1e6ae2d6419d8f96eff88"

if (!projectId) {
  throw new Error("Project ID is not defined")
}

export const networks = [bitcoin, bitcoinTestnet , bob , bobSepolia , rootstock , rootstockTestnet] as [
  AppKitNetwork,
  ...AppKitNetwork[],
]

// Set up Bitcoin Adapter
export const bitcoinAdapter = new BitcoinAdapter({
  projectId,
})
