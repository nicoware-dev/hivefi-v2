import { createContext, useContext, useEffect, useState } from "react";
import { createPublicClient, createWalletClient, custom, http } from 'viem';
import { mainnet } from 'viem/chains';
import type { PublicClient, WalletClient } from 'viem';
import { type Chain } from 'viem';

interface WalletContextType {
  address: string | undefined;
  isConnected: boolean;
  isConnecting: boolean;
  connect: () => Promise<void>;
  disconnect: () => void;
  publicClient: PublicClient | undefined;
  walletClient: WalletClient | undefined;
}

const WalletContext = createContext<WalletContextType>({
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
  network: 'sonic',
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

declare global {
  interface Window {
    ethereum?: {
      request: (args: { method: string; params?: any[] }) => Promise<any>;
      on: (event: string, handler: (...args: any[]) => void) => void;
      removeListener: (event: string, handler: (...args: any[]) => void) => void;
    };
  }
}

export function WalletProvider({ children }: { children: React.ReactNode }) {
  const [address, setAddress] = useState<string>();
  const [isConnecting, setIsConnecting] = useState(false);
  const [publicClient, setPublicClient] = useState<PublicClient>();
  const [walletClient, setWalletClient] = useState<WalletClient>();

  const isConnected = !!address;

  useEffect(() => {
    const client = createPublicClient({
      chain: sonicChain,
      transport: http()
    });
    setPublicClient(client);
  }, []);

  async function connect() {
    if (!window.ethereum) {
      alert('Please install MetaMask or another EVM-compatible wallet');
      return;
    }

    setIsConnecting(true);
    try {
      const accounts = await window.ethereum.request({
        method: 'eth_requestAccounts'
      }) as string[];

      const client = createWalletClient({
        chain: sonicChain,
        transport: custom(window.ethereum)
      });

      // Switch to Sonic Network
      try {
        await window.ethereum.request({
          method: 'wallet_switchEthereumChain',
          params: [{ chainId: '0x92' }],
        });
      } catch (switchError: any) {
        // If chain hasn't been added, add it
        if (switchError.code === 4902) {
          await window.ethereum.request({
            method: 'wallet_addEthereumChain',
            params: [{
              chainId: '0x92',
              chainName: 'Sonic',
              nativeCurrency: {
                name: 'Sonic',
                symbol: 'S',
                decimals: 18,
              },
              rpcUrls: ['https://rpc.soniclabs.com'],
              blockExplorerUrls: ['https://sonicscan.org/'],
            }],
          });
        }
      }

      setAddress(accounts[0]);
      setWalletClient(client);
    } catch (error) {
      console.error('Error connecting wallet:', error);
    } finally {
      setIsConnecting(false);
    }
  }

  function disconnect() {
    setAddress(undefined);
    setWalletClient(undefined);
  }

  useEffect(() => {
    // Handle account changes
    if (window.ethereum) {
      window.ethereum.on('accountsChanged', (accounts: string[]) => {
        if (accounts.length === 0) {
          disconnect();
        } else {
          setAddress(accounts[0]);
        }
      });

      window.ethereum.on('chainChanged', () => {
        window.location.reload();
      });
    }

    return () => {
      if (window.ethereum) {
        window.ethereum.removeListener('accountsChanged', disconnect);
        window.ethereum.removeListener('chainChanged', () => {});
      }
    };
  }, [disconnect]);

  return (
    <WalletContext.Provider
      value={{
        address,
        isConnected,
        isConnecting,
        connect,
        disconnect,
        publicClient,
        walletClient,
      }}
    >
      {children}
    </WalletContext.Provider>
  );
}

export function useWallet() {
  return useContext(WalletContext);
}
