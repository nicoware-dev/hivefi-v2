import { ReactNode, useEffect, useState } from "react";
import { PrivyProvider as PrivyAuthProvider } from "@privy-io/react-auth";
import { WagmiProvider, createConfig } from "@privy-io/wagmi";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { http } from "viem";
import { mainnet, polygon } from "viem/chains";
import { sonicChain } from "./chains";

// Create a query client for React Query
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      retry: 1,
    },
  },
});

// Create a Wagmi config for Privy
const wagmiConfig = createConfig({
  chains: [mainnet, polygon, sonicChain],
  transports: {
    [mainnet.id]: http(),
    [polygon.id]: http(),
    [sonicChain.id]: http("https://rpc.soniclabs.com"),
  },
});

/**
 * Privy provider for authentication and wallet functionality
 * This component wraps the application with Privy's providers
 */
export function PrivyProvider({ children }: { children: ReactNode }) {
  const privyAppId = import.meta.env.VITE_PRIVY_APP_ID?.trim() || "";
  const [isInitialized, setIsInitialized] = useState(false);

  // Wait for the DOM to be fully loaded before initializing Privy
  useEffect(() => {
    // Add a small delay to ensure everything is loaded
    const timer = setTimeout(() => {
      setIsInitialized(true);
      console.log("Privy providers initialized");
    }, 500);
    
    return () => clearTimeout(timer);
  }, []);

  // Log the app ID (masked) to verify it's loaded correctly
  useEffect(() => {
    if (privyAppId) {
      const maskedId = privyAppId.substring(0, 5) + "..." + privyAppId.substring(privyAppId.length - 3);
      console.log("Privy App ID loaded:", maskedId);
    } else {
      console.error("Privy App ID not found!");
    }
  }, [privyAppId]);

  if (!isInitialized) {
    return null;
  }

  return (
    <QueryClientProvider client={queryClient}>
      <PrivyAuthProvider
        appId={privyAppId}
        config={{
          // Use Sonic as the default chain
          defaultChain: sonicChain,
          // Support multiple chains
          supportedChains: [sonicChain, mainnet, polygon],
          // Create embedded wallets for users without wallets
          embeddedWallets: {
            createOnLogin: "users-without-wallets",
            requireUserPasswordOnCreate: false,
            noPromptOnSignature: false,
          },
          // Support multiple login methods
          loginMethods: ["wallet", "email", "google"],
          appearance: {
            showWalletLoginFirst: true,
            theme: "dark",
            accentColor: "#7f00ff", // Purple accent color to match HiveFi
          },
        }}
      >
        <WagmiProvider config={wagmiConfig} reconnectOnMount={false}>
          {children}
        </WagmiProvider>
      </PrivyAuthProvider>
    </QueryClientProvider>
  );
} 