"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useWallet } from "../providers/wallet-provider";

export function WalletConfiguration() {
  const { connect, disconnect, isConnected, address } = useWallet();

  return (
    <Card>
      <CardHeader>
        <CardTitle>Wallet Configuration</CardTitle>
        <CardDescription>
          Configure your wallet connection settings
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <Label>Wallet Address</Label>
          <div className="flex space-x-2">
            <Input
              disabled
              placeholder="Connect your wallet to view address"
              value={address || ""}
            />
            {isConnected ? (
              <Button variant="destructive" onClick={disconnect}>
                Disconnect
              </Button>
            ) : (
              <Button onClick={connect}>Connect Wallet</Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
