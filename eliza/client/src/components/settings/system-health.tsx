import { Activity, Clock, AlertTriangle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { SystemHealth } from "./types";

interface HealthIndicatorProps {
    status: 'healthy' | 'degraded' | 'down';
}

function HealthIndicator({ status }: HealthIndicatorProps) {
    const getStatusColor = () => {
        switch (status) {
            case 'healthy':
                return 'bg-green-500';
            case 'degraded':
                return 'bg-yellow-500';
            case 'down':
                return 'bg-red-500';
            default:
                return 'bg-gray-500';
        }
    };

    return (
        <div className="flex items-center space-x-2">
            <div className={`h-2 w-2 rounded-full ${getStatusColor()}`} />
            <span className="text-sm capitalize">{status}</span>
        </div>
    );
}

// Mock data for demonstration
const mockSystemHealth: SystemHealth = {
    uptime: 99.99,
    errorRate: 0.01,
    networkStatus: 'healthy'
};

function formatUptime(uptime: number): string {
    return `${uptime.toFixed(2)}%`;
}

function formatErrorRate(rate: number): string {
    return `${(rate * 100).toFixed(2)}%`;
}

export function SystemHealthSection() {
    return (
        <div className="grid gap-4 md:grid-cols-3">
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">System Uptime</CardTitle>
                    <Clock className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{formatUptime(mockSystemHealth.uptime)}</div>
                    <p className="text-xs text-muted-foreground">Last 30 days</p>
                </CardContent>
            </Card>
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Error Rate</CardTitle>
                    <AlertTriangle className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{formatErrorRate(mockSystemHealth.errorRate)}</div>
                    <p className="text-xs text-muted-foreground">Last 24 hours</p>
                </CardContent>
            </Card>
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Network Status</CardTitle>
                    <Activity className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <HealthIndicator status={mockSystemHealth.networkStatus} />
                    <p className="text-xs text-muted-foreground mt-2">All systems operational</p>
                </CardContent>
            </Card>
        </div>
    );
}
