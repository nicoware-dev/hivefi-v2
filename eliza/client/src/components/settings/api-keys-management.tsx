"use client";

import { useState } from "react";
import { Eye, EyeOff, Copy, Key } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface ApiKeyCardProps {
    id: string;
    name: string;
    apiKey: string;
    lastUsed?: string;
}

const mockApiKeys = [
    {
        id: '1',
        name: 'OpenAI API Key',
        apiKey: 'sk-...XXXX',
        lastUsed: '2 hours ago'
    },
    {
        id: '2',
        name: 'Anthropic API Key',
        apiKey: 'sk-...YYYY',
        lastUsed: '1 day ago'
    }
];

function ApiKeyCard({ name, apiKey, lastUsed }: ApiKeyCardProps) {
    const [showKey, setShowKey] = useState(false);
    const [isCopied, setIsCopied] = useState(false);

    const toggleVisibility = () => setShowKey(!showKey);

    const copyToClipboard = async () => {
        try {
            await navigator.clipboard.writeText(apiKey);
            setIsCopied(true);
            setTimeout(() => setIsCopied(false), 2000);
        } catch (err) {
            console.error('Failed to copy:', err);
        }
    };

    const displayKey = showKey ? apiKey : '••••••••••••••••';

    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <div className="space-y-1">
                    <CardTitle className="text-sm font-medium">{name}</CardTitle>
                    {lastUsed && (
                        <p className="text-xs text-muted-foreground">Last used: {lastUsed}</p>
                    )}
                </div>
                <Key className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
                <div className="flex space-x-2">
                    <div className="relative flex-1">
                        <Input
                            type={showKey ? "text" : "password"}
                            value={displayKey}
                            readOnly
                            className="pr-20"
                        />
                        <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                            <button
                                type="button"
                                onClick={toggleVisibility}
                                className="text-muted-foreground hover:text-foreground"
                                aria-label={showKey ? "Hide API key" : "Show API key"}
                            >
                                {showKey ? (
                                    <EyeOff className="h-4 w-4" />
                                ) : (
                                    <Eye className="h-4 w-4" />
                                )}
                            </button>
                        </div>
                    </div>
                    <Button
                        variant="outline"
                        size="icon"
                        onClick={copyToClipboard}
                        className="h-10 w-10"
                        aria-label="Copy API key"
                    >
                        <Copy className="h-4 w-4" />
                    </Button>
                </div>
                {isCopied && (
                    <p className="mt-2 text-xs text-muted-foreground">Copied to clipboard!</p>
                )}
            </CardContent>
        </Card>
    );
}

export function ApiKeysManagement() {
    return (
        <div className="space-y-4">
            {mockApiKeys.map((entry) => (
                <ApiKeyCard key={entry.id} {...entry} />
            ))}
            <Button className="w-full">
                <Key className="mr-2 h-4 w-4" />
                Add New API Key
            </Button>
        </div>
    );
}
