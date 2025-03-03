"use client";

import { CreditCard, BarChart3, Wallet, Receipt, AlertCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import type { UsageMetrics } from "./types";

interface BillingInfo {
    plan: string;
    status: 'active' | 'past_due' | 'canceled';
    nextBilling: string;
    amount: string;
    paymentMethod: {
        type: 'card' | 'wallet';
        last4: string;
        expiry?: string;
    };
}

const mockUsageMetrics: UsageMetrics = {
    apiCalls: 15000,
    computeUsage: 75,
    storageUsage: 50,
    costBreakdown: {
        serviceFees: 150,
        apiCosts: 75,
        infrastructure: 50
    }
};

const mockBillingInfo: BillingInfo = {
    plan: 'Professional',
    status: 'active',
    nextBilling: '2024-02-10',
    amount: '$275.00',
    paymentMethod: {
        type: 'card',
        last4: '4242',
        expiry: '12/24'
    }
};

function UsageMetricsSection() {
    return (
        <div className="grid gap-4 md:grid-cols-3">
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">API Calls</CardTitle>
                    <BarChart3 className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent className="space-y-2">
                    <div className="text-2xl font-bold">
                        {mockUsageMetrics.apiCalls.toLocaleString()}
                    </div>
                    <Progress
                        value={75}
                        className="h-2"
                    />
                    <p className="text-xs text-muted-foreground">
                        75% of monthly limit
                    </p>
                </CardContent>
            </Card>

            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Compute Usage</CardTitle>
                    <BarChart3 className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent className="space-y-2">
                    <div className="text-2xl font-bold">
                        {mockUsageMetrics.computeUsage}%
                    </div>
                    <Progress
                        value={mockUsageMetrics.computeUsage}
                        className="h-2"
                    />
                    <p className="text-xs text-muted-foreground">
                        Of allocated resources
                    </p>
                </CardContent>
            </Card>

            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Storage Usage</CardTitle>
                    <BarChart3 className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent className="space-y-2">
                    <div className="text-2xl font-bold">
                        {mockUsageMetrics.storageUsage}%
                    </div>
                    <Progress
                        value={mockUsageMetrics.storageUsage}
                        className="h-2"
                    />
                    <p className="text-xs text-muted-foreground">
                        Of total storage
                    </p>
                </CardContent>
            </Card>
        </div>
    );
}

function CostBreakdown() {
    return (
        <Card>
            <CardHeader>
                <CardTitle className="text-lg">Cost Breakdown</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <div className="space-y-1">
                            <p className="text-sm font-medium">Service Fees</p>
                            <p className="text-xs text-muted-foreground">Base platform charges</p>
                        </div>
                        <p className="text-sm font-medium">${mockUsageMetrics.costBreakdown.serviceFees}</p>
                    </div>
                    <div className="flex items-center justify-between">
                        <div className="space-y-1">
                            <p className="text-sm font-medium">API Costs</p>
                            <p className="text-xs text-muted-foreground">External API usage</p>
                        </div>
                        <p className="text-sm font-medium">${mockUsageMetrics.costBreakdown.apiCosts}</p>
                    </div>
                    <div className="flex items-center justify-between">
                        <div className="space-y-1">
                            <p className="text-sm font-medium">Infrastructure</p>
                            <p className="text-xs text-muted-foreground">Compute and storage</p>
                        </div>
                        <p className="text-sm font-medium">${mockUsageMetrics.costBreakdown.infrastructure}</p>
                    </div>
                    <div className="border-t pt-4">
                        <div className="flex items-center justify-between">
                            <p className="text-sm font-medium">Total Monthly Cost</p>
                            <p className="text-sm font-bold">${mockBillingInfo.amount}</p>
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}

function BillingManagement() {
    return (
        <Card>
            <CardHeader>
                <CardTitle className="text-lg">Billing Management</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                    <div className="space-y-1">
                        <p className="text-sm font-medium">Current Plan</p>
                        <p className="text-xs text-muted-foreground">{mockBillingInfo.plan}</p>
                    </div>
                    <Badge variant={mockBillingInfo.status === 'active' ? 'default' : 'destructive'}>
                        {mockBillingInfo.status}
                    </Badge>
                </div>

                <div className="space-y-1">
                    <p className="text-sm font-medium">Payment Method</p>
                    <div className="flex items-center space-x-4">
                        {mockBillingInfo.paymentMethod.type === 'card' ? (
                            <>
                                <CreditCard className="h-4 w-4 text-muted-foreground" />
                                <p className="text-sm">•••• {mockBillingInfo.paymentMethod.last4}</p>
                                <p className="text-sm text-muted-foreground">
                                    Expires {mockBillingInfo.paymentMethod.expiry}
                                </p>
                            </>
                        ) : (
                            <>
                                <Wallet className="h-4 w-4 text-muted-foreground" />
                                <p className="text-sm">Wallet •••• {mockBillingInfo.paymentMethod.last4}</p>
                            </>
                        )}
                    </div>
                </div>

                <div className="space-y-1">
                    <p className="text-sm font-medium">Next Billing</p>
                    <div className="flex items-center justify-between">
                        <p className="text-sm">{mockBillingInfo.nextBilling}</p>
                        <p className="text-sm font-medium">{mockBillingInfo.amount}</p>
                    </div>
                </div>

                <div className="flex space-x-2">
                    <Button className="flex-1" variant="outline">
                        Update Plan
                    </Button>
                    <Button className="flex-1" variant="outline">
                        Update Payment
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
}

export function UsageAndBilling() {
    return (
        <div className="space-y-6">
            <UsageMetricsSection />
            <div className="grid gap-6 md:grid-cols-2">
                <CostBreakdown />
                <BillingManagement />
            </div>
        </div>
    );
}
