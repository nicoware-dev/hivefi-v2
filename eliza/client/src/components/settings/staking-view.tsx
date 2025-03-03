"use client";

import { Coins, TrendingUp, Lock, Timer, ArrowUpRight, ArrowDownRight } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { StakingInfo } from "./types";

interface StakingMetrics {
    totalStaked: number;
    totalRewards: number;
    currentAPY: number;
    lockPeriod: number;
    projectedRewards: number;
    riskLevel: 'low' | 'medium' | 'high';
}

const mockStakingMetrics: StakingMetrics = {
    totalStaked: 1000,
    totalRewards: 150,
    currentAPY: 15,
    lockPeriod: 30,
    projectedRewards: 300,
    riskLevel: 'medium'
};

function StakingOverview() {
    return (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Staked</CardTitle>
                    <Coins className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{mockStakingMetrics.totalStaked} ETH</div>
                    <p className="text-xs text-muted-foreground">
                        +2.5% from last month
                    </p>
                </CardContent>
            </Card>

            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Current APY</CardTitle>
                    <TrendingUp className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{mockStakingMetrics.currentAPY}%</div>
                    <p className="text-xs text-muted-foreground">
                        Variable rate
                    </p>
                </CardContent>
            </Card>

            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Lock Period</CardTitle>
                    <Lock className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{mockStakingMetrics.lockPeriod} Days</div>
                    <p className="text-xs text-muted-foreground">
                        Minimum staking period
                    </p>
                </CardContent>
            </Card>

            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Rewards</CardTitle>
                    <Timer className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{mockStakingMetrics.totalRewards} ETH</div>
                    <p className="text-xs text-muted-foreground">
                        Lifetime earnings
                    </p>
                </CardContent>
            </Card>
        </div>
    );
}

function StakeForm() {
    return (
        <Card>
            <CardHeader>
                <CardTitle>Stake Tokens</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="stake-amount">Amount to Stake</Label>
                        <div className="relative">
                            <Input
                                id="stake-amount"
                                placeholder="0.0"
                                type="number"
                                className="pr-20"
                            />
                            <span className="absolute right-3 top-2 text-sm text-muted-foreground">
                                ETH
                            </span>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label>Lock Period</Label>
                        <div className="grid grid-cols-3 gap-2">
                            <Button variant="outline">30 Days</Button>
                            <Button variant="outline">60 Days</Button>
                            <Button variant="outline">90 Days</Button>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">Estimated APY</span>
                            <span className="font-medium">15.0%</span>
                        </div>
                        <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">Projected Rewards</span>
                            <span className="font-medium">+0.5 ETH</span>
                        </div>
                    </div>

                    <Button className="w-full">
                        Stake Tokens
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
}

function UnstakeForm() {
    return (
        <Card>
            <CardHeader>
                <CardTitle>Unstake Tokens</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="unstake-amount">Amount to Unstake</Label>
                        <div className="relative">
                            <Input
                                id="unstake-amount"
                                placeholder="0.0"
                                type="number"
                                className="pr-20"
                            />
                            <span className="absolute right-3 top-2 text-sm text-muted-foreground">
                                ETH
                            </span>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">Available to Unstake</span>
                            <span className="font-medium">5.0 ETH</span>
                        </div>
                        <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">Unstaking Fee</span>
                            <span className="font-medium">0.1%</span>
                        </div>
                    </div>

                    <Button className="w-full" variant="destructive">
                        Unstake Tokens
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
}

export function StakingView() {
    return (
        <div className="space-y-6">
            <StakingOverview />

            <Tabs defaultValue="stake" className="space-y-4">
                <TabsList>
                    <TabsTrigger value="stake">Stake</TabsTrigger>
                    <TabsTrigger value="unstake">Unstake</TabsTrigger>
                </TabsList>

                <TabsContent value="stake">
                    <StakeForm />
                </TabsContent>

                <TabsContent value="unstake">
                    <UnstakeForm />
                </TabsContent>
            </Tabs>
        </div>
    );
}
