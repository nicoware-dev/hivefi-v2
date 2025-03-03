import { Activity, CheckCircle, Clock, XCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Agent } from "./types";

interface AgentStatusCardProps {
    agent: Agent;
}

function AgentStatusCard({ agent }: AgentStatusCardProps) {
    const statusIcon = agent.status === 'active' ? (
        <CheckCircle className="h-4 w-4 text-green-500" />
    ) : (
        <XCircle className="h-4 w-4 text-red-500" />
    );

    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{agent.name}</CardTitle>
                {statusIcon}
            </CardHeader>
            <CardContent>
                <div className="grid gap-2">
                    <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Response Time</span>
                        <span className="font-medium">{agent.responseTime}ms</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Success Rate</span>
                        <span className="font-medium">{agent.successRate}%</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Last Active</span>
                        <span className="font-medium">{agent.lastActive}</span>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}

// Mock data for demonstration
const mockAgents: Agent[] = [
    {
        id: '1',
        name: 'Advisor Agent',
        status: 'active',
        type: 'advisor',
        responseTime: 245,
        successRate: 99.2,
        lastActive: '2m ago'
    },
    {
        id: '2',
        name: 'Metrics Agent',
        status: 'active',
        type: 'metrics',
        responseTime: 180,
        successRate: 98.5,
        lastActive: '5m ago'
    },
    {
        id: '3',
        name: 'Sales Agent',
        status: 'inactive',
        type: 'sales',
        responseTime: 0,
        successRate: 0,
        lastActive: '1h ago'
    },
    {
        id: '4',
        name: 'Token Deployer',
        status: 'active',
        type: 'deployer',
        responseTime: 320,
        successRate: 97.8,
        lastActive: '1m ago'
    }
];

export function AgentStatusDashboard() {
    return (
        <div className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                {mockAgents.map((agent) => (
                    <AgentStatusCard key={agent.id} agent={agent} />
                ))}
            </div>
        </div>
    );
}
