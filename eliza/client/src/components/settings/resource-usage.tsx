import { Database, HardDrive, Cpu } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ResourceUsage } from "./types";

interface ResourceCardProps {
    title: string;
    used: number;
    total: number;
    icon: React.ReactNode;
}

function ResourceCard({ title, used, total, icon }: ResourceCardProps) {
    const percentage = Math.round((used / total) * 100);
    const getColorClass = (percent: number) => {
        if (percent < 60) return "bg-green-500";
        if (percent < 80) return "bg-yellow-500";
        return "bg-red-500";
    };

    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{title}</CardTitle>
                {icon}
            </CardHeader>
            <CardContent>
                <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Used</span>
                        <span className="font-medium">{used.toLocaleString()}</span>
                    </div>
                    <div className="h-2 w-full rounded-full bg-muted">
                        <div
                            className={`h-2 rounded-full ${getColorClass(percentage)}`}
                            style={{ width: `${percentage}%` }}
                        />
                    </div>
                    <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Total</span>
                        <span className="font-medium">{total.toLocaleString()}</span>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}

// Mock data for demonstration
const mockResourceUsage: ResourceUsage = {
    apiCalls: { used: 2345, total: 5000 },
    compute: { used: 75, total: 100 },
    storage: { used: 15, total: 50 }
};

export function ResourceUsageSection() {
    return (
        <div className="grid gap-4 md:grid-cols-3">
            <ResourceCard
                title="API Calls"
                used={mockResourceUsage.apiCalls.used}
                total={mockResourceUsage.apiCalls.total}
                icon={<Database className="h-4 w-4 text-muted-foreground" />}
            />
            <ResourceCard
                title="Compute Resources"
                used={mockResourceUsage.compute.used}
                total={mockResourceUsage.compute.total}
                icon={<Cpu className="h-4 w-4 text-muted-foreground" />}
            />
            <ResourceCard
                title="Storage Usage"
                used={mockResourceUsage.storage.used}
                total={mockResourceUsage.storage.total}
                icon={<HardDrive className="h-4 w-4 text-muted-foreground" />}
            />
        </div>
    );
}
