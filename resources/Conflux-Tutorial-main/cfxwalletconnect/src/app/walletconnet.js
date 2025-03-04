import { cookieStorage, createStorage } from "wagmi";
import { confluxESpace, confluxESpaceTestnet } from "wagmi/chains";

import { http, createConfig, WagmiProvider } from "wagmi";
import { walletConnect, injected, coinbaseWallet } from "wagmi/connectors";

// Get projectId at https://cloud.walletconnect.com
export const projectId = "9b8eb03389fef0adec65f98678af8ab2";

if (!projectId) throw new Error("Project ID is not defined");

const metadata = {
  name: "Web3Modal",
  description: "Web3Modal Example",
  url: "https://web3modal.com", // origin must match your domain & subdomain
  icons: ["https://avatars.githubusercontent.com/u/37784886"],
};

// Create wagmiConfig
export const config = createConfig({
  chains: [confluxESpaceTestnet],
  transports: {
    [confluxESpaceTestnet.id]: http(),
  },
  connectors: [
    walletConnect({ projectId, metadata, showQrModal: false }),
    injected({ shimDisconnect: true }),
    coinbaseWallet({
      appName: metadata.name,
      appLogoUrl: metadata.icons[0],
    }),
  ],
  ssr: true,
  storage: createStorage({
    storage: cookieStorage,
  }),
});