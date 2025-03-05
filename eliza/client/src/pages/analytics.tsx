import { LineChart as LucideLineChart, BarChart as LucideBarChart, PieChart as LucidePieChart, ArrowUp, ArrowDown, Activity, RefreshCw } from "lucide-react";
import { AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { PageHeader } from "@/components/page-header";
import { useOutletContext } from "react-router-dom";
import { useState, useEffect } from "react";
import { defiLlamaApi, GlobalTVLData, HistoricalDataPoint, ProtocolTVLData } from "@/api/defillama";

interface StatCardProps {
    title: string;
    value: string;
    change: number;
    icon: React.ReactNode;
    isLoading?: boolean;
}

interface TooltipProps {
    active?: boolean;
    payload?: Array<{
        name: string;
        value: number;
        dataKey?: string;
    }>;
    label?: string;
}

interface PieChartLabelProps {
    name: string;
    percent: number;
}

function StatCard({ title, value, change, icon, isLoading = false }: StatCardProps) {
    const isPositive = change >= 0;

    return (
        <div className="p-4 rounded-lg bg-white/[0.03] border border-white/[0.08]">
            <div className="flex justify-between items-start mb-2">
                <span className="text-sm text-muted-foreground">{title}</span>
                <div className="p-2 rounded-md bg-white/[0.03]">
                    {icon}
                </div>
            </div>
            <div className="flex items-baseline gap-2">
                {isLoading ? (
                    <div className="animate-pulse h-8 w-24 bg-white/[0.05] rounded"></div>
                ) : (
                    <>
                        <span className="text-2xl font-semibold">{value}</span>
                        <span className={`text-sm flex items-center gap-0.5 ${
                            isPositive ? 'text-green-500' : 'text-red-500'
                        }`}>
                            {isPositive ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />}
                            {Math.abs(change).toFixed(2)}%
                        </span>
                    </>
                )}
            </div>
        </div>
    );
}

const COLORS = ['#3b82f6', '#60a5fa', '#93c5fd', '#bfdbfe', '#dbeafe', '#8884d8'];

const CustomTooltip = ({ active, payload, label }: TooltipProps) => {
    if (active && payload && payload.length) {
        return (
            <div className="bg-background/95 border border-white/[0.08] p-3 rounded-lg shadow-lg backdrop-blur-sm">
                <p className="text-sm font-medium">{label}</p>
                {payload.map((entry) => (
                    <p key={entry.name} className="text-sm text-muted-foreground">
                        {entry.name}: ${(entry.value / 1e6).toFixed(2)}M
                    </p>
                ))}
            </div>
        );
    }
    return null;
};

interface OutletContextType {
    headerSlot: boolean;
}

export default function Analytics() {
    const { headerSlot } = useOutletContext<OutletContextType>();
    const [isLoading, setIsLoading] = useState(true);
    const [globalData, setGlobalData] = useState<GlobalTVLData | null>(null);
    const [historicalData, setHistoricalData] = useState<HistoricalDataPoint[]>([]);
    const [topProtocols, setTopProtocols] = useState<ProtocolTVLData[]>([]);
    const [chainDistribution, setChainDistribution] = useState<{ name: string; value: number }[]>([]);
    const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

    // Format historical data for charts
    const formattedHistoricalData = historicalData.map(item => ({
        id: item.date,
        date: new Date(item.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        tvl: item.tvl,
        // Simulate volume as a percentage of TVL for demonstration
        volume: item.tvl * (0.05 + Math.random() * 0.1)
    }));

    // Load data from DefiLlama API
    const loadData = async () => {
        setIsLoading(true);
        try {
            // Fetch global TVL data
            const global = await defiLlamaApi.getGlobalTVL();
            setGlobalData(global);
            
            // Fetch historical TVL data
            const historical = await defiLlamaApi.getHistoricalTVL();
            setHistoricalData(historical);
            
            // Fetch top protocols
            const protocols = await defiLlamaApi.getTopProtocols(6);
            setTopProtocols(protocols);
            
            // Fetch chain distribution
            const distribution = await defiLlamaApi.getChainDistribution(5);
            setChainDistribution(distribution);
            
            // Update last updated timestamp
            setLastUpdated(new Date());
        } catch (error) {
            console.error("Error loading analytics data:", error);
        } finally {
            setIsLoading(false);
        }
    };

    // Load data on component mount
    useEffect(() => {
        loadData();
    }, []);

    if (headerSlot) {
        return <PageHeader title="Analytics" />;
    }

    // Format protocol data for pie chart
    const protocolChartData = topProtocols.map(protocol => ({
        id: protocol.slug || protocol.name.toLowerCase().replace(/\s+/g, '-'),
        name: protocol.name,
        value: protocol.tvl
    }));

    // Prepare stats cards data
    const stats = [
        { 
            id: 'tvl', 
            title: "Total Value Locked", 
            value: globalData?.formattedTVL || "$0", 
            change: globalData?.change_1d || 0, 
            icon: <LucideLineChart className="h-4 w-4 text-blue-500" />,
            isLoading
        },
        { 
            id: 'volume', 
            title: "24h Volume (est.)", 
            value: globalData ? `$${((globalData.totalLiquidityUSD * 0.08) / 1e9).toFixed(2)}B` : "$0", 
            change: globalData?.change_1d ? globalData.change_1d * 1.2 : 0, 
            icon: <LucideBarChart className="h-4 w-4 text-purple-500" />,
            isLoading
        },
        { 
            id: 'protocols', 
            title: "Active Protocols", 
            value: globalData?.protocols?.toString() || "0", 
            change: 1.5, // Static value for demonstration
            icon: <Activity className="h-4 w-4 text-orange-500" />,
            isLoading
        },
        { 
            id: 'chains', 
            title: "Chain Distribution", 
            value: chainDistribution.length > 0 ? `${chainDistribution.length} Chains` : "0 Chains", 
            change: 2.3, // Static value for demonstration
            icon: <LucidePieChart className="h-4 w-4 text-green-500" />,
            isLoading
        }
    ];

    return (
        <div className="min-h-0 p-4 sm:p-6">
            <div className="flex justify-between items-center mb-6">
                <div className="text-sm text-muted-foreground">
                    {lastUpdated ? `Last updated: ${lastUpdated.toLocaleTimeString()}` : 'Loading data...'}
                </div>
                <button 
                    onClick={loadData}
                    disabled={isLoading}
                    className="flex items-center gap-2 px-3 py-1.5 text-sm rounded-md bg-white/[0.05] hover:bg-white/[0.1] transition-colors"
                >
                    <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
                    Refresh
                </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                {stats.map((stat) => (
                    <StatCard key={stat.id} {...stat} />
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                <div className="rounded-lg bg-white/[0.03] border border-white/[0.08] p-4">
                    <h3 className="text-sm font-medium mb-4">TVL & Volume Over Time</h3>
                    {isLoading ? (
                        <div className="h-[300px] flex items-center justify-center">
                            <div className="animate-spin h-8 w-8 border-2 border-blue-500 rounded-full border-t-transparent"></div>
                        </div>
                    ) : (
                        <div className="h-[300px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={formattedHistoricalData.slice(-30)}>
                                    <defs>
                                        <linearGradient id="tvlGradient" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                                            <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                                        </linearGradient>
                                        <linearGradient id="volumeGradient" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#60a5fa" stopOpacity={0.3}/>
                                            <stop offset="95%" stopColor="#60a5fa" stopOpacity={0}/>
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                                    <XAxis 
                                        dataKey="date" 
                                        stroke="rgba(255,255,255,0.5)" 
                                        tick={{ fontSize: 12 }}
                                        tickFormatter={(value) => value}
                                        interval={Math.floor(formattedHistoricalData.length / 10)}
                                    />
                                    <YAxis
                                        stroke="rgba(255,255,255,0.5)"
                                        tickFormatter={(value: number) => `$${(value / 1e9).toFixed(0)}B`}
                                    />
                                    <Tooltip content={<CustomTooltip />} />
                                    <Area
                                        type="monotone"
                                        dataKey="tvl"
                                        stroke="#3b82f6"
                                        fillOpacity={1}
                                        fill="url(#tvlGradient)"
                                        strokeWidth={2}
                                        name="TVL"
                                    />
                                    <Area
                                        type="monotone"
                                        dataKey="volume"
                                        stroke="#60a5fa"
                                        fillOpacity={1}
                                        fill="url(#volumeGradient)"
                                        strokeWidth={2}
                                        name="Volume"
                                    />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    )}
                </div>

                <div className="rounded-lg bg-white/[0.03] border border-white/[0.08] p-4">
                    <h3 className="text-sm font-medium mb-4">Protocol Distribution</h3>
                    {isLoading ? (
                        <div className="h-[300px] flex items-center justify-center">
                            <div className="animate-spin h-8 w-8 border-2 border-blue-500 rounded-full border-t-transparent"></div>
                        </div>
                    ) : (
                        <div className="h-[300px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={protocolChartData}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={60}
                                        outerRadius={100}
                                        fill="#8884d8"
                                        paddingAngle={2}
                                        dataKey="value"
                                        label={({ name, percent }: PieChartLabelProps) => {
                                            if (window.innerWidth < 640) return null;
                                            return `${name} ${(percent * 100).toFixed(0)}%`;
                                        }}
                                        labelLine={false}
                                    >
                                        {protocolChartData.map((entry, index) => (
                                            <Cell key={entry.id} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip formatter={(value) => [`$${(Number(value) / 1e9).toFixed(2)}B`, 'TVL']} />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                    )}
                </div>
            </div>

            <div className="rounded-lg bg-white/[0.03] border border-white/[0.08] p-4">
                <h3 className="text-sm font-medium mb-4">Chain Distribution</h3>
                {isLoading ? (
                    <div className="h-[200px] sm:h-[300px] flex items-center justify-center">
                        <div className="animate-spin h-8 w-8 border-2 border-blue-500 rounded-full border-t-transparent"></div>
                    </div>
                ) : (
                    <div className="h-[200px] sm:h-[300px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={chainDistribution}>
                                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                                <XAxis
                                    dataKey="name"
                                    stroke="rgba(255,255,255,0.5)"
                                    tick={{ fontSize: window.innerWidth < 640 ? 10 : 12 }}
                                />
                                <YAxis
                                    stroke="rgba(255,255,255,0.5)"
                                    tickFormatter={(value: number) => `$${(value / 1e9).toFixed(0)}B`}
                                    tick={{ fontSize: window.innerWidth < 640 ? 10 : 12 }}
                                />
                                <Tooltip formatter={(value) => [`$${(Number(value) / 1e9).toFixed(2)}B`, 'TVL']} />
                                <Bar dataKey="value" name="TVL" fill="#3b82f6" radius={[4, 4, 0, 0]}>
                                    {chainDistribution.map((entry, index) => (
                                        <Cell key={entry.name} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                )}
            </div>
        </div>
    );
}
