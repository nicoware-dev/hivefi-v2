import { Settings } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

interface SettingsHeaderProps {
    title: string;
    description?: string;
}

export function SettingsHeader({ title, description }: SettingsHeaderProps) {
    return (
        <Card className="border-none shadow-none">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <div className="space-y-1">
                    <CardTitle className="text-2xl font-bold tracking-tight">{title}</CardTitle>
                    {description && (
                        <CardDescription className="text-sm text-muted-foreground">
                            {description}
                        </CardDescription>
                    )}
                </div>
                <Settings className="h-5 w-5 text-muted-foreground" />
            </CardHeader>
        </Card>
    );
}
