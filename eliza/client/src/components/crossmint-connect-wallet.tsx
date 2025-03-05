import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { useCrossmintWallet } from "./providers/crossmint-wallet-provider";
import { WalletDetails } from "./wallet-details";
import { useEffect, useState, useCallback } from "react";

export function CrossmintConnectWallet() {
  const { connect, isConnected, isConnecting, address } = useCrossmintWallet();
  const [canConnect, setCanConnect] = useState(true);
  const [connectClicked, setConnectClicked] = useState(false);

  // Reset the connect button state when connection status changes
  useEffect(() => {
    if (isConnected) {
      setConnectClicked(false);
      setCanConnect(true);
    }
  }, [isConnected]);

  // Add a delay after sign-out before allowing sign-in again
  useEffect(() => {
    if (!isConnected && !isConnecting && connectClicked) {
      // If we're not connected and not in the process of connecting,
      // but the connect button was clicked, we need to reset the state
      const timer = setTimeout(() => {
        setConnectClicked(false);
        setCanConnect(true);
      }, 2000);
      
      return () => clearTimeout(timer);
    }
  }, [isConnected, isConnecting, connectClicked]);

  const handleConnect = useCallback(async () => {
    if (!canConnect) return;
    
    try {
      setConnectClicked(true);
      setCanConnect(false);
      await connect();
    } catch (error) {
      console.error("Error connecting:", error);
      // Reset state after error
      setTimeout(() => {
        setConnectClicked(false);
        setCanConnect(true);
      }, 2000);
    }
  }, [canConnect, connect]);

  return (
    <div>
      {isConnected && address ? (
        <WalletDetails />
      ) : (
        <Button
          onClick={handleConnect}
          disabled={isConnecting || !canConnect}
        >
          {isConnecting || connectClicked ? (
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