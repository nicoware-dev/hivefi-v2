import { ReactNode, useEffect, useState } from "react";
import { CrossmintProvider, CrossmintAuthProvider } from "@crossmint/client-sdk-react-ui";

/**
 * Crossmint providers for authentication and wallet functionality
 * This component wraps the application with Crossmint's providers
 */
export function CrossmintProviders({ children }: { children: ReactNode }) {
  const clientApiKey = import.meta.env.VITE_CROSSMINT_CLIENT_KEY?.trim() || "";
  const [isInitialized, setIsInitialized] = useState(false);

  // Wait for the DOM to be fully loaded before initializing Crossmint
  // This helps prevent issues with the popup
  useEffect(() => {
    // Add a small delay to ensure everything is loaded
    const timer = setTimeout(() => {
      setIsInitialized(true);
      console.log("Crossmint providers initialized");
    }, 500);
    
    return () => clearTimeout(timer);
  }, []);

  // Log the API key (masked) to verify it's loaded correctly
  useEffect(() => {
    if (clientApiKey) {
      const maskedKey = clientApiKey.substring(0, 10) + "..." + clientApiKey.substring(clientApiKey.length - 5);
      console.log("Crossmint API key loaded:", maskedKey);
    } else {
      console.error("Crossmint API key not found!");
    }
  }, [clientApiKey]);

  if (!isInitialized) {
    return null;
  }

  return (
    <CrossmintProvider apiKey={clientApiKey}>
      <CrossmintAuthProvider
        embeddedWallets={{
          type: "evm-smart-wallet",
          defaultChain: "polygon", // Use polygon for production
          createOnLogin: "all-users", // Automatically create a wallet for all users upon login
        }}
        loginMethods={["email", "google"]} // Support email and Google login
      >
        {children}
      </CrossmintAuthProvider>
    </CrossmintProvider>
  );
} 