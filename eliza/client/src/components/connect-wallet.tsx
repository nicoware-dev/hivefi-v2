import { Button } from "@/components/ui/button";
import { useWallet } from "./providers/wallet-provider";
import { Loader2 } from "lucide-react";

export function ConnectWallet() {
  const { connect, disconnect, isConnected, isConnecting, address } = useWallet();

  return (
    <div>
      {isConnected ? (
        <Button variant="outline" onClick={disconnect}>
          {address?.slice(0, 6)}...{address?.slice(-4)}
        </Button>
      ) : (
        <Button
          onClick={connect}
          disabled={isConnecting}
        >
          {isConnecting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Connecting...
            </>
          ) : (
            'Connect Wallet'
          )}
        </Button>
      )}
    </div>
  );
}
