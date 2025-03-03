"use client";

import { Package, Shield, Link2, BarChart3, CheckCircle2, AlertCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Switch } from "@/components/ui/switch";

interface ServicePackage {
    id: string;
    name: string;
    status: 'active' | 'inactive' | 'upgrading';
    type: string;
    usage: number;
    limit: number;
    version: string;
    nextVersion?: string;
}

const mockServices: ServicePackage[] = [
    {
        id: '1',
        name: 'Basic Agent Package',
        status: 'active',
        type: 'core',
        usage: 2500,
        limit: 5000,
        version: '1.2.0',
        nextVersion: '1.3.0'
    },
    {
        id: '2',
        name: 'Advanced Analytics',
        status: 'upgrading',
        type: 'analytics',
        usage: 1200,
        limit: 2000,
        version: '2.1.0',
        nextVersion: '2.2.0'
    },
    {
        id: '3',
        name: 'Custom Deployment',
        status: 'inactive',
        type: 'deployment',
        usage: 0,
        limit: 1000,
        version: '1.0.0'
    }
];

interface IntegrationItem {
    id: string;
    name: string;
    type: 'protocol' | 'data' | 'social';
    status: 'connected' | 'disconnected';
    lastSync?: string;
}

const mockIntegrations: IntegrationItem[] = [
    {
        id: '1',
        name: 'Ethereum Mainnet',
        type: 'protocol',
        status: 'connected',
        lastSync: '5 mins ago'
    },
    {
        id: '2',
        name: 'Chainlink Oracle',
        type: 'data',
        status: 'connected',
        lastSync: '1 hour ago'
    },
    {
        id: '3',
        name: 'Twitter Integration',
        type: 'social',
        status: 'disconnected'
    }
];

function ServicePackageCard({ service }: { service: ServicePackage }) {
    const usagePercentage = (service.usage / service.limit) * 100;

    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <div className="space-y-1">
                    <CardTitle className="text-sm font-medium flex items-center">
                        {service.name}
                        <Badge
                            variant={service.status === 'active' ? "default" : "secondary"}
                            className="ml-2"
                        >
                            {service.status}
                        </Badge>
                    </CardTitle>
                    <p className="text-xs text-muted-foreground">Version {service.version}</p>
                </div>
                <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Usage</span>
                        <span>{service.usage.toLocaleString()} / {service.limit.toLocaleString()}</span>
                    </div>
                    <Progress value={usagePercentage} />
                </div>
                {service.nextVersion && (
                    <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">Update Available</span>
                        <Badge variant="outline">v{service.nextVersion}</Badge>
                    </div>
                )}
                <Button
                    className="w-full"
                    variant={service.status === 'active' ? "outline" : "default"}
                >
                    {service.status === 'active' ? 'Manage' : 'Activate'}
                </Button>
            </CardContent>
        </Card>
    );
}

function IntegrationCard({ integration }: { integration: IntegrationItem }) {
    const isConnected = integration.status === 'connected';

    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <div className="space-y-1">
                    <CardTitle className="text-sm font-medium">{integration.name}</CardTitle>
                    <p className="text-xs text-muted-foreground capitalize">{integration.type}</p>
                </div>
                {isConnected ? (
                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                ) : (
                    <AlertCircle className="h-4 w-4 text-yellow-500" />
                )}
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Status</span>
                    <Badge
                        variant={isConnected ? "default" : "secondary"}
                    >
                        {integration.status}
                    </Badge>
                </div>
                {integration.lastSync && (
                    <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">Last Sync</span>
                        <span className="text-sm">{integration.lastSync}</span>
                    </div>
                )}
                <Button
                    className="w-full"
                    variant={isConnected ? "outline" : "default"}
                >
                    {isConnected ? 'Disconnect' : 'Connect'}
                </Button>
            </CardContent>
        </Card>
    );
}

export function ServiceManagement() {
    return (
        <div className="space-y-6">
            <div>
                <h3 className="text-lg font-medium mb-4">Service Packages</h3>
                <div className="grid gap-4 md:grid-cols-3">
                    {mockServices.map((service) => (
                        <ServicePackageCard key={service.id} service={service} />
                    ))}
                </div>
            </div>

            <div>
                <h3 className="text-lg font-medium mb-4">Integrations</h3>
                <div className="grid gap-4 md:grid-cols-3">
                    {mockIntegrations.map((integration) => (
                        <IntegrationCard key={integration.id} integration={integration} />
                    ))}
                </div>
            </div>
        </div>
    );
}
