import { createContext, useContext, useEffect, useState, useCallback } from "react";
import { createPublicClient, http } from 'viem';
import { mainnet } from 'viem/chains';
import type { PublicClient, WalletClient } from 'viem';
import { type Chain } from 'viem';
import { useAuth, useWallet } from "@crossmint/client-sdk-react-ui";

interface CrossmintWalletContextType {
  address: string | undefined;
  isConnected: boolean;
  isConnecting: boolean;
  connect: () => Promise<void>;
  disconnect: () => void;
  publicClient: PublicClient | undefined;
  walletClient: WalletClient | undefined;
}

const CrossmintWalletContext = createContext<CrossmintWalletContextType>({
  address: undefined,
  isConnected: false,
  isConnecting: false,
  connect: async () => {},
  disconnect: () => {},
  publicClient: undefined,
  walletClient: undefined,
});

const sonicChain: Chain = {
  ...mainnet,
  id: 146,
  name: 'Sonic',
  nativeCurrency: {
    decimals: 18,
    name: 'Sonic',
    symbol: 'S',
  },
  rpcUrls: {
    default: { http: ['https://rpc.soniclabs.com'] },
    public: { http: ['https://rpc.soniclabs.com'] },
  },
  blockExplorers: {
    default: { name: 'Explorer', url: 'https://sonicscan.org/' },
  },
}

// Session storage key
const SESSION_KEY = 'crossmint-session';

export function CrossmintWalletProvider({ children }: { children: React.ReactNode }) {
  const [publicClient, setPublicClient] = useState<PublicClient>();
  const { login, logout, jwt } = useAuth();
  const { wallet, status } = useWallet();
  const [isSigningOut, setIsSigningOut] = useState(false);
  const [sessionRestored, setSessionRestored] = useState(false);
  
  const isConnected = !!wallet?.address;
  const isConnecting = status === "in-progress";
  const address = wallet?.address;

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
    console.log("Crossmint Auth Status:", { jwt, status, isSigningOut });
  }, [jwt, status, isSigningOut]);

  useEffect(() => {
    console.log("Crossmint Wallet Status:", { wallet, isConnected, address, sessionRestored });
    
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

  // Attempt to restore session on mount
  useEffect(() => {
    if (!isConnected && !isConnecting && !sessionRestored && !isSigningOut) {
      const storedSession = localStorage.getItem(SESSION_KEY) || sessionStorage.getItem(SESSION_KEY);
      
      if (storedSession) {
        try {
          const session = JSON.parse(storedSession);
          const sessionAge = Date.now() - session.timestamp;
          
          // Only restore sessions less than 24 hours old
          if (sessionAge < 24 * 60 * 60 * 1000) {
            console.log("Attempting to restore session...");
            
            // Add a small delay to ensure everything is loaded
            setTimeout(() => {
              login().then(() => {
                console.log("Session restored successfully");
                setSessionRestored(true);
              }).catch(error => {
                console.error("Failed to restore session:", error);
                clearSession();
              });
            }, 1000);
          } else {
            console.log("Session expired, clearing...");
            clearSession();
          }
        } catch (error) {
          console.error("Error parsing stored session:", error);
          clearSession();
        }
      }
    }
  }, [isConnected, isConnecting, sessionRestored, isSigningOut, login]);

  // Clear session data from storage
  const clearSession = useCallback(() => {
    localStorage.removeItem(SESSION_KEY);
    sessionStorage.removeItem(SESSION_KEY);
    setSessionRestored(false);
  }, []);

  // Connect function
  const connect = useCallback(async () => {
    if (isConnected) return;
    
    try {
      console.log("Attempting to connect with Crossmint...");
      await login();
      console.log("Login completed");
    } catch (error) {
      console.error('Error connecting wallet:', error);
      clearSession();
    }
  }, [isConnected, login, clearSession]);

  // Disconnect function
  const disconnect = useCallback(() => {
    console.log("Disconnecting from Crossmint...");
    setIsSigningOut(true);
    
    // Clear session data
    clearSession();
    
    // Then logout from Crossmint
    logout();
    
    // Reset the signing out state after a short delay
    setTimeout(() => {
      setIsSigningOut(false);
    }, 1000);
  }, [logout, clearSession]);

  return (
    <CrossmintWalletContext.Provider
      value={{
        address,
        isConnected,
        isConnecting,
        connect,
        disconnect,
        publicClient,
        // For now, we don't have a direct walletClient equivalent
        walletClient: undefined,
      }}
    >
      {children}
    </CrossmintWalletContext.Provider>
  );
}

export function useCrossmintWallet() {
  return useContext(CrossmintWalletContext);
} 