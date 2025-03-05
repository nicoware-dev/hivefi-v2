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

  // Patch window.fetch to handle Privy analytics requests
  useEffect(() => {
    // Only patch in development mode
    if (import.meta.env.DEV) {
      const originalFetch = window.fetch;
      
      window.fetch = async function(input, init) {
        const url = typeof input === 'string' ? input : input instanceof URL ? input.toString() : input.url;
        
        // Check if this is a Privy analytics request
        if (url.includes('auth.privy.io/api/v1/analytics_events')) {
          console.log('Intercepting Privy analytics request');
          
          // Use no-cors mode for Privy analytics requests
          const newInit = {
            ...init,
            mode: 'no-cors' as RequestMode
          };
          
          return originalFetch(input, newInit);
        }
        
        // Otherwise, use the original fetch
        return originalFetch(input, init);
      };
      
      return () => {
        // Restore original fetch when component unmounts
        window.fetch = originalFetch;
      };
    }
  }, []);

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
          loginMethods: ["wallet", "email", "sms", "google", "discord", "twitter", "github"],
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