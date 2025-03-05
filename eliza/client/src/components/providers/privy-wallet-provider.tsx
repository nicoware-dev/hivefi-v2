import { createContext, useContext, useEffect, useState, useCallback } from "react";
import { createPublicClient, http } from 'viem';
import type { PublicClient, WalletClient } from 'viem';
import { usePrivy, useWallets } from "@privy-io/react-auth";
import { useWalletClient } from "wagmi";
import { sonicChain } from "./chains";

interface PrivyWalletContextType {
  address: string | undefined;
  isConnected: boolean;
  isConnecting: boolean;
  connect: () => Promise<void>;
  disconnect: () => void;
  publicClient: PublicClient | undefined;
  walletClient: WalletClient | undefined;
}

const PrivyWalletContext = createContext<PrivyWalletContextType>({
  address: undefined,
  isConnected: false,
  isConnecting: false,
  connect: async () => {},
  disconnect: () => {},
  publicClient: undefined,
  walletClient: undefined,
});

// Session storage key
const SESSION_KEY = 'privy-session';

export function PrivyWalletProvider({ children }: { children: React.ReactNode }) {
  const [publicClient, setPublicClient] = useState<PublicClient>();
  const { login, logout, authenticated, ready, user } = usePrivy();
  const { wallets } = useWallets();
  const { data: walletClient } = useWalletClient();
  
  const [isConnecting, setIsConnecting] = useState(false);
  const [sessionRestored, setSessionRestored] = useState(false);
  const [restorationAttempted, setRestorationAttempted] = useState(false);
  
  // Get the first wallet's address
  const wallet = wallets?.[0];
  const address = wallet?.address;
  const isConnected = authenticated && !!address;

  // Initialize the public client
  useEffect(() => {
    const client = createPublicClient({
      chain: sonicChain,
      transport: http()
    });
    setPublicClient(client);
  }, []);

  // Debug logging
  useEffect(() => {
    console.log("Privy Auth Status:", { authenticated, ready, user });
  }, [authenticated, ready, user]);

  useEffect(() => {
    console.log("Privy Wallet Status:", { wallet, isConnected, address, sessionRestored });
    
    // When wallet is connected, store the session
    if (isConnected && address) {
      const session = {
        address,
        timestamp: Date.now()
      };
      
      // Store in both localStorage and sessionStorage for redundancy
      localStorage.setItem(SESSION_KEY, JSON.stringify(session));
      sessionStorage.setItem(SESSION_KEY, JSON.stringify(session));
      
      setSessionRestored(true);
    }
  }, [wallet, isConnected, address, sessionRestored]);

  // Attempt to restore session on mount - only once
  useEffect(() => {
    if (!isConnected && !isConnecting && !sessionRestored && ready && !restorationAttempted) {
      const storedSession = localStorage.getItem(SESSION_KEY) || sessionStorage.getItem(SESSION_KEY);
      
      if (storedSession) {
        try {
          const session = JSON.parse(storedSession);
          const sessionAge = Date.now() - session.timestamp;
          
          // Only restore sessions less than 24 hours old
          if (sessionAge < 24 * 60 * 60 * 1000) {
            console.log("Attempting to restore Privy session...");
            setRestorationAttempted(true);
            
            // Add a small delay to ensure everything is loaded
            setTimeout(() => {
              try {
                login();
                console.log("Privy session restoration initiated");
                // We'll rely on the authenticated state change to update sessionRestored
              } catch (error) {
                console.error("Failed to restore Privy session:", error);
                clearSession();
              }
            }, 1000);
          } else {
            console.log("Privy session expired, clearing...");
            clearSession();
            setRestorationAttempted(true);
          }
        } catch (error) {
          console.error("Error parsing stored Privy session:", error);
          clearSession();
          setRestorationAttempted(true);
        }
      } else {
        setRestorationAttempted(true);
      }
    }
  }, [isConnected, isConnecting, sessionRestored, ready, login, restorationAttempted]);

  // Clear session data from storage
  const clearSession = useCallback(() => {
    console.log("Clearing Privy session data from storage");
    localStorage.removeItem(SESSION_KEY);
    sessionStorage.removeItem(SESSION_KEY);
    setSessionRestored(false);
  }, []);

  // Connect function
  const connect = useCallback(async () => {
    if (isConnected) return;
    
    try {
      setIsConnecting(true);
      console.log("Attempting to connect with Privy...");
      login();
      console.log("Privy login initiated");
    } catch (error) {
      console.error('Error connecting with Privy:', error);
      clearSession();
    } finally {
      setIsConnecting(false);
    }
  }, [isConnected, login, clearSession]);

  // Disconnect function
  const disconnect = useCallback(() => {
    console.log("Disconnecting from Privy...");
    
    // Clear session data first
    clearSession();
    
    // Then logout from Privy
    try {
      logout();
      console.log("Privy logout completed");
    } catch (error) {
      console.error("Error during Privy logout:", error);
    }
  }, [logout, clearSession]);

  return (
    <PrivyWalletContext.Provider
      value={{
        address,
        isConnected,
        isConnecting,
        connect,
        disconnect,
        publicClient,
        walletClient: walletClient as WalletClient | undefined,
      }}
    >
      {children}
    </PrivyWalletContext.Provider>
  );
}

export function usePrivyWallet() {
  return useContext(PrivyWalletContext);
} 