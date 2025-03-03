import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AgentStatusDashboard } from "@/components/settings/agent-status-dashboard";
import { ResourceUsageSection } from "@/components/settings/resource-usage";
import { SystemHealthSection } from "@/components/settings/system-health";
import { AgentConfigurationSection } from "@/components/settings/agent-configuration";
import { ApiKeysManagement } from "@/components/settings/api-keys-management";
import { WalletConfiguration } from "@/components/settings/wallet-configuration";
import { ServiceManagement } from "@/components/settings/service-management";
import { HistoryView } from "@/components/settings/history-view";
import { StakingView } from "@/components/settings/staking-view";
import { UsageAndBilling } from "@/components/settings/usage-billing";
import { PageHeader } from "@/components/page-header";
import { useOutletContext } from "react-router-dom";

interface OutletContextType {
    headerSlot: boolean;
}

export default function SettingsPage() {
    const { headerSlot } = useOutletContext<OutletContextType>();

    if (headerSlot) {
        return <PageHeader title="Settings" />;
    }

    return (
        <div className="min-h-0 p-4 md:p-8">
            <Tabs defaultValue="overview" className="space-y-4">
                <TabsList className="w-full">
                    <TabsTrigger value="overview">Overview</TabsTrigger>
                    <TabsTrigger value="swarm">Swarm Settings</TabsTrigger>
                    <TabsTrigger value="services">Services</TabsTrigger>
                    <TabsTrigger value="history">History</TabsTrigger>
                    <TabsTrigger value="staking">Staking</TabsTrigger>
                    <TabsTrigger value="billing">Usage & Billing</TabsTrigger>
                </TabsList>

                <TabsContent value="overview" className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Swarm Overview</CardTitle>
                            <CardDescription>
                                Monitor your swarm's performance and resource usage
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <AgentStatusDashboard />
                            <ResourceUsageSection />
                            <SystemHealthSection />
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="swarm" className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Agent Configuration</CardTitle>
                            <CardDescription>
                                Manage your agents and their settings
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <AgentConfigurationSection />
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader>
                            <CardTitle>API Keys</CardTitle>
                            <CardDescription>
                                Manage your API keys for various services
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <ApiKeysManagement />
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader>
                            <CardTitle>Wallet Settings</CardTitle>
                            <CardDescription>
                                Configure your wallets and network settings
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <WalletConfiguration />
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="services">
                    <Card>
                        <CardHeader>
                            <CardTitle>Services</CardTitle>
                            <CardDescription>
                                Manage service packages and integrations
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <ServiceManagement />
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="history">
                    <Card>
                        <CardHeader>
                            <CardTitle>History</CardTitle>
                            <CardDescription>
                                View transaction history and agent activity logs
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <HistoryView />
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="staking">
                    <Card>
                        <CardHeader>
                            <CardTitle>Staking</CardTitle>
                            <CardDescription>
                                Manage your staking positions and view rewards
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <StakingView />
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="billing">
                    <Card>
                        <CardHeader>
                            <CardTitle>Usage & Billing</CardTitle>
                            <CardDescription>
                                View usage statistics and manage billing settings
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <UsageAndBilling />
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
}
