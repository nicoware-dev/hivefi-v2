"use client";

import { ArrowUpRight, ArrowDownRight, Clock, AlertTriangle, CheckCircle2, XCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface Transaction {
    id: string;
    type: 'send' | 'receive' | 'contract';
    status: 'confirmed' | 'pending' | 'failed';
    amount: string;
    address: string;
    timestamp: string;
    gas: string;
}

interface ActivityLog {
    id: string;
    agentId: string;
    agentName: string;
    action: string;
    status: 'success' | 'error' | 'warning';
    timestamp: string;
    details?: string;
}

const mockTransactions: Transaction[] = [
    {
        id: '0x1234...5678',
        type: 'send',
        status: 'confirmed',
        amount: '0.5 ETH',
        address: '0xabcd...efgh',
        timestamp: '2024-01-10 14:30:00',
        gas: '0.002 ETH'
    },
    {
        id: '0x8765...4321',
        type: 'contract',
        status: 'pending',
        amount: '0.1 ETH',
        address: '0xijkl...mnop',
        timestamp: '2024-01-10 14:25:00',
        gas: '0.003 ETH'
    },
    {
        id: '0x9876...5432',
        type: 'receive',
        status: 'confirmed',
        amount: '1.0 ETH',
        address: '0xqrst...uvwx',
        timestamp: '2024-01-10 14:20:00',
        gas: '0.001 ETH'
    }
];

const mockActivityLogs: ActivityLog[] = [
    {
        id: '1',
        agentId: 'agent-1',
        agentName: 'Advisor Agent',
        action: 'Portfolio Analysis',
        status: 'success',
        timestamp: '5 minutes ago',
        details: 'Successfully analyzed portfolio performance'
    },
    {
        id: '2',
        agentId: 'agent-2',
        agentName: 'Token Deployer',
        action: 'Contract Deployment',
        status: 'error',
        timestamp: '1 hour ago',
        details: 'Failed to deploy contract: Insufficient gas'
    },
    {
        id: '3',
        agentId: 'agent-3',
        agentName: 'Metrics Agent',
        action: 'Data Collection',
        status: 'warning',
        timestamp: '2 hours ago',
        details: 'Partial data collection due to API rate limit'
    }
];

function TransactionRow({ transaction }: { transaction: Transaction }) {
    const statusColor = {
        confirmed: 'text-green-500',
        pending: 'text-yellow-500',
        failed: 'text-red-500'
    };

    const TypeIcon = transaction.type === 'send' ? ArrowUpRight : ArrowDownRight;

    return (
        <div className="flex items-center justify-between py-4 border-b last:border-0">
            <div className="flex items-center space-x-4">
                <div className={transaction.type === 'send' ? 'text-red-500' : 'text-green-500'}>
                    <TypeIcon className="h-4 w-4" />
                </div>
                <div>
                    <p className="text-sm font-medium">{transaction.id}</p>
                    <p className="text-xs text-muted-foreground">{transaction.timestamp}</p>
                </div>
            </div>
            <div className="text-right">
                <p className="text-sm font-medium">{transaction.amount}</p>
                <p className="text-xs text-muted-foreground">Gas: {transaction.gas}</p>
            </div>
            <Badge variant={transaction.status === 'confirmed' ? 'default' : 'secondary'}>
                {transaction.status}
            </Badge>
        </div>
    );
}

function ActivityLogRow({ log }: { log: ActivityLog }) {
    const StatusIcon = {
        success: CheckCircle2,
        error: XCircle,
        warning: AlertTriangle
    }[log.status];

    const statusColor = {
        success: 'text-green-500',
        error: 'text-red-500',
        warning: 'text-yellow-500'
    }[log.status];

    return (
        <div className="flex items-start justify-between py-4 border-b last:border-0">
            <div className="flex items-start space-x-4">
                <div className={statusColor}>
                    <StatusIcon className="h-4 w-4" />
                </div>
                <div>
                    <p className="text-sm font-medium">{log.agentName}</p>
                    <p className="text-xs text-muted-foreground">{log.action}</p>
                    {log.details && (
                        <p className="text-xs text-muted-foreground mt-1">{log.details}</p>
                    )}
                </div>
            </div>
            <div className="text-right">
                <p className="text-xs text-muted-foreground">{log.timestamp}</p>
            </div>
        </div>
    );
}

export function HistoryView() {
    return (
        <Tabs defaultValue="transactions" className="space-y-4">
            <TabsList>
                <TabsTrigger value="transactions">Transactions</TabsTrigger>
                <TabsTrigger value="activity">Activity Logs</TabsTrigger>
            </TabsList>

            <TabsContent value="transactions">
                <Card>
                    <CardHeader>
                        <CardTitle className="text-lg">Transaction History</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-0">
                            {mockTransactions.map((transaction) => (
                                <TransactionRow key={transaction.id} transaction={transaction} />
                            ))}
                        </div>
                        <Button className="w-full mt-4" variant="outline">
                            View All Transactions
                        </Button>
                    </CardContent>
                </Card>
            </TabsContent>

            <TabsContent value="activity">
                <Card>
                    <CardHeader>
                        <CardTitle className="text-lg">Activity Logs</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-0">
                            {mockActivityLogs.map((log) => (
                                <ActivityLogRow key={log.id} log={log} />
                            ))}
                        </div>
                        <Button className="w-full mt-4" variant="outline">
                            View All Activities
                        </Button>
                    </CardContent>
                </Card>
            </TabsContent>
        </Tabs>
    );
}
