"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import type { Agent } from "./types";

interface AgentConfigCardProps {
    agent: Agent;
    onStatusChange: (id: string, status: boolean) => void;
    onPriorityChange: (id: string, priority: number) => void;
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

function AgentConfigCard({ agent, onStatusChange, onPriorityChange }: AgentConfigCardProps) {
    const [priority, setPriority] = useState(50);
    const priorityId = `priority-${agent.id}`;

    const handlePriorityChange = (value: number[]) => {
        setPriority(value[0]);
        onPriorityChange(agent.id, value[0]);
    };

    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <div>
                    <CardTitle className="text-sm font-medium">{agent.name}</CardTitle>
                    <p className="text-xs text-muted-foreground">{agent.type}</p>
                </div>
                <Switch
                    checked={agent.status === 'active'}
                    onCheckedChange={(checked: boolean) => onStatusChange(agent.id, checked)}
                    aria-label={`Toggle ${agent.name}`}
                />
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                    <div>
                        <label htmlFor={priorityId} className="text-sm font-medium">
                            Priority Level
                        </label>
                        <div className="pt-2">
                            <Slider
                                id={priorityId}
                                value={[priority]}
                                onValueChange={handlePriorityChange}
                                min={0}
                                max={100}
                                step={1}
                                aria-label={`Set priority for ${agent.name}`}
                            />
                        </div>
                        <p className="text-xs text-muted-foreground pt-1">
                            Current Priority: {priority}%
                        </p>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}

export function AgentConfigurationSection() {
    const handleStatusChange = (id: string, status: boolean) => {
        console.log(`Agent ${id} status changed to ${status}`);
        // Implement status change logic here
    };

    const handlePriorityChange = (id: string, priority: number) => {
        console.log(`Agent ${id} priority changed to ${priority}`);
        // Implement priority change logic here
    };

    return (
        <div className="grid gap-4 md:grid-cols-2">
            {mockAgents.map((agent) => (
                <AgentConfigCard
                    key={agent.id}
                    agent={agent}
                    onStatusChange={handleStatusChange}
                    onPriorityChange={handlePriorityChange}
                />
            ))}
        </div>
    );
}
