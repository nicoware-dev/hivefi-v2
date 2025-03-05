import { Button } from "@/components/ui/button";
import { Loader2, Copy, ExternalLink, LogOut } from "lucide-react";
import { usePrivyWallet } from "./providers/privy-wallet-provider";
import { useState, useEffect, useRef } from "react";
import { usePrivy } from "@privy-io/react-auth";

export function PrivyConnectWallet() {
  const { connect, isConnected, isConnecting, address, disconnect } = usePrivyWallet();
  const { ready, authenticated, user } = usePrivy();
  const [canConnect, setCanConnect] = useState(true);
  const [copySuccess, setCopySuccess] = useState(false);
  
  // Handle wallet details dropdown
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  // Reset the connect button state when connection status changes
  useEffect(() => {
    if (isConnected) {
      setCanConnect(true);
    }
  }, [isConnected]);

  // Handle click outside to close dropdown
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current && 
        !dropdownRef.current.contains(event.target as Node) &&
        buttonRef.current && 
        !buttonRef.current.contains(event.target as Node)
      ) {
        setShowDropdown(false);
      }
    }

    // Add event listener when dropdown is open
    if (showDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    
    // Clean up event listener
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showDropdown]);

  const handleConnect = () => {
    if (!canConnect) return;
    
    try {
      setCanConnect(false);
      connect();
    } catch (error) {
      console.error("Error connecting:", error);
      // Reset state after error
      setTimeout(() => {
        setCanConnect(true);
      }, 2000);
    }
  };

  const handleDisconnect = (e: React.MouseEvent) => {
    e.stopPropagation();
    console.log("Disconnecting wallet...");
    setShowDropdown(false);
    disconnect();
  };

  const copyAddress = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (address) {
      navigator.clipboard.writeText(address)
        .then(() => {
          setCopySuccess(true);
          setTimeout(() => setCopySuccess(false), 2000);
          console.log("Address copied to clipboard");
        })
        .catch(err => {
          console.error("Failed to copy address: ", err);
        });
    }
  };

  const openExplorer = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (address) {
      // Open Sonic explorer for the wallet address
      const explorerUrl = `https://sonicscan.org/address/${address}`;
      console.log("Opening explorer URL:", explorerUrl);
      window.open(explorerUrl, '_blank');
    }
  };

  return (
    <div className="relative">
      {isConnected && address ? (
        <div>
          <Button 
            ref={buttonRef}
            variant="outline" 
            onClick={() => setShowDropdown(!showDropdown)}
            className="flex items-center gap-2"
          >
            {address.slice(0, 6)}...{address.slice(-4)}
          </Button>

          {showDropdown && (
            <div 
              ref={dropdownRef}
              className="absolute right-0 mt-2 w-64 bg-[#1E1E1E] border border-[#333] rounded-md shadow-lg z-50"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-4">
                <h3 className="text-sm font-medium text-white mb-2">Wallet Address</h3>
                <div className="bg-[#2A2A2A] p-2 rounded flex items-center justify-between mb-4">
                  <span className="text-sm text-gray-300 truncate">
                    {address}
                  </span>
                </div>
                <div className="flex flex-col gap-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="w-full flex items-center justify-center gap-2"
                    onClick={copyAddress}
                  >
                    <Copy className="h-4 w-4" />
                    {copySuccess ? "Copied!" : "Copy Address"}
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="w-full flex items-center justify-center gap-2"
                    onClick={openExplorer}
                  >
                    <ExternalLink className="h-4 w-4" />
                    View on Explorer
                  </Button>
                  <Button 
                    variant="destructive" 
                    size="sm" 
                    className="w-full flex items-center justify-center gap-2"
                    onClick={handleDisconnect}
                  >
                    <LogOut className="h-4 w-4" />
                    Sign Out
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      ) : (
        <Button
          onClick={handleConnect}
          disabled={isConnecting || !canConnect || !ready}
        >
          {isConnecting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Connecting...
            </>
          ) : (
            'Sign In'
          )}
        </Button>
      )}
    </div>
  );
} 