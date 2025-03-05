import { useState, useRef, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Copy, ExternalLink, LogOut } from "lucide-react";
import { useCrossmintWallet } from "./providers/crossmint-wallet-provider";

export function WalletDetails() {
  const { address, disconnect } = useCrossmintWallet();
  const [showDropdown, setShowDropdown] = useState(false);
  const [copied, setCopied] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  if (!address) return null;

  const copyAddress = () => {
    navigator.clipboard.writeText(address);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const openExplorer = () => {
    // Open Polygonscan for the wallet address
    window.open(`https://polygonscan.com/address/${address}`, '_blank');
  };

  const handleDisconnect = () => {
    setShowDropdown(false);
    disconnect();
  };

  // Handle click outside to close dropdown
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
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

  return (
    <div className="relative" ref={dropdownRef}>
      <Button 
        variant="outline" 
        onClick={() => setShowDropdown(!showDropdown)}
        className="relative"
      >
        {address.slice(0, 6)}...{address.slice(-4)}
      </Button>

      {showDropdown && (
        <div className="absolute right-0 mt-2 w-64 bg-[#1E1E1E] border border-[#333] rounded-md shadow-lg z-50">
          <div className="p-4">
            <h3 className="text-sm font-medium text-white mb-2">Wallet Address</h3>
            <div className="bg-[#2A2A2A] p-2 rounded flex items-center justify-between mb-4">
              <span className="text-sm text-gray-300 truncate">
                {address}
              </span>
              <button 
                onClick={copyAddress} 
                className="text-gray-400 hover:text-white"
                title="Copy address"
              >
                <Copy size={16} />
              </button>
            </div>
            {copied && (
              <div className="text-xs text-green-500 mb-2">Address copied to clipboard!</div>
            )}
            <div className="flex flex-col gap-2">
              <Button 
                variant="outline" 
                size="sm" 
                className="w-full flex items-center justify-center gap-2"
                onClick={openExplorer}
              >
                <ExternalLink size={16} />
                View on Explorer
              </Button>
              <Button 
                variant="destructive" 
                size="sm" 
                className="w-full flex items-center justify-center gap-2"
                onClick={handleDisconnect}
              >
                <LogOut size={16} />
                Sign Out
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 