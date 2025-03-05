import { Wallet, ArrowUpRight, ArrowDownRight, DollarSign, PieChart, Activity } from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, PieChart as RechartsPieChart, Pie } from 'recharts';
import { PageHeader } from "@/components/page-header";
import { useOutletContext } from "react-router-dom";
import { usePrivyWallet } from "@/components/providers/privy-wallet-provider";
import { useEffect, useState } from "react";
import { zerionApi, TokenBalance, PortfolioData, PositionData } from "@/api/zerion";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

interface AssetCardProps {
    name: string;
    symbol: string;
    value: number;
    formattedValue: string;
    amount: string;
    price: number;
    formattedPrice: string;
    change24h: number | null;
    chain: string;
}

interface ChartDataPoint {
    date: string;
    value: number;
}

interface ChartTooltipData {
    name: string;
    value: number;
    dataKey: string;
}

interface ChartTooltipProps {
    active?: boolean;
    payload?: ChartTooltipData[];
    label?: string;
}

const COLORS = [
    '#3b82f6', // bright blue
    '#f97316', // orange
    '#06b6d4', // cyan
    '#8b5cf6',  // purple
    '#10b981', // green
    '#ef4444', // red
    '#f59e0b', // amber
    '#6366f1'  // indigo
];

// Chain display names mapping
const CHAIN_NAMES: Record<string, string> = {
    'ethereum': 'Ethereum',
    'polygon': 'Polygon',
    'arbitrum': 'Arbitrum',
    'optimism': 'Optimism',
    'base': 'Base',
    'bsc': 'BNB Chain',
    'avalanche': 'Avalanche',
    'mantle': 'Mantle',
    'zksync-era': 'zkSync Era',
    'zora': 'Zora',
    'linea': 'Linea',
    'sonic': 'Sonic'
};

function formatCurrency(value: number): string {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    }).format(value);
}

function formatCurrencyCompact(value: number): string {
    if (value >= 1000000) {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            notation: 'compact',
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        }).format(value);
    }
    return formatCurrency(value);
}

function formatTokenAmount(amount: string, symbol: string): string {
    const numAmount = parseFloat(amount);
    if (isNaN(numAmount)) return `0 ${symbol}`;
    
    if (numAmount < 0.001) {
        return `<0.001 ${symbol}`;
    }
    
    return `${numAmount.toLocaleString(undefined, {
        minimumFractionDigits: 0,
        maximumFractionDigits: 3
    })} ${symbol}`;
}

function getChainDisplayName(chainId: string): string {
    return CHAIN_NAMES[chainId.toLowerCase()] || chainId;
}

const ChartTooltip = ({ active, payload, label }: ChartTooltipProps) => {
    if (active && payload && payload.length) {
        return (
            <div className="bg-background/95 border border-white/[0.08] p-3 rounded-lg shadow-lg backdrop-blur-sm">
                <p className="text-sm font-medium">{label}</p>
                {payload.map((entry) => (
                    <p key={entry.dataKey} className="text-sm text-muted-foreground">
                        {entry.name}: {formatCurrency(entry.value)}
                    </p>
                ))}
            </div>
        );
    }
    return null;
};

function AssetCard({ name, symbol, value, formattedValue, amount, price, formattedPrice, change24h, chain }: AssetCardProps) {
    const isPositive = (change24h || 0) >= 0;
    const chainName = getChainDisplayName(chain);

    return (
        <div className="p-3 sm:p-4 rounded-lg bg-white/[0.03] border border-white/[0.08] hover:bg-white/[0.04] transition-colors">
            <div className="flex items-start justify-between mb-2 sm:mb-3">
                <div>
                    <h3 className="text-sm sm:text-base font-medium">{name}</h3>
                    <p className="text-xs sm:text-sm text-muted-foreground">{symbol}</p>
                </div>
                <div className="flex items-center gap-1 text-xs sm:text-sm">
                    <span className="text-muted-foreground">{chainName}</span>
                </div>
            </div>
            <div className="flex items-baseline justify-between">
                <div>
                    <div className="text-lg sm:text-xl md:text-2xl font-semibold mb-0.5 sm:mb-1">{formattedValue}</div>
                    <div className="text-xs sm:text-sm text-muted-foreground">
                        {amount}
                        <span className="ml-1 text-muted-foreground">({formattedPrice})</span>
                    </div>
                </div>
                {change24h !== null && (
                    <div className={`flex items-center gap-0.5 sm:gap-1 ${
                        isPositive ? 'text-green-500' : 'text-red-500'
                    }`}>
                        {isPositive ?
                            <ArrowUpRight className="h-3 w-3 sm:h-4 sm:w-4" /> :
                            <ArrowDownRight className="h-3 w-3 sm:h-4 sm:w-4" />
                        }
                        <span className="text-xs sm:text-sm">{Math.abs(change24h).toFixed(1)}%</span>
                    </div>
                )}
            </div>
        </div>
    );
}

// Add helper function for distribution data
function calculateDistributionData(chainDistribution: { [key: string]: number }) {
    return Object.entries(chainDistribution).map(([chain, value]) => ({
        name: getChainDisplayName(chain),
        value,
        id: chain
    })).sort((a, b) => b.value - a.value);
}

interface OutletContextType {
    headerSlot: boolean;
}

export default function Portfolio() {
    const { headerSlot } = useOutletContext<OutletContextType>();
    const { address, isConnected } = usePrivyWallet();
    
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [portfolioData, setPortfolioData] = useState<PortfolioData | null>(null);
    const [positionData, setPositionData] = useState<PositionData | null>(null);
    const [isMockData, setIsMockData] = useState(false);

    // Fetch portfolio data when wallet is connected
    useEffect(() => {
        async function fetchData() {
            if (!isConnected || !address) return;
            
            setLoading(true);
            setError(null);
            
            try {
                // Check if we're using mock data
                const usingMockData = import.meta.env.DEV && import.meta.env.VITE_USE_MOCK_DATA === 'true';
                setIsMockData(usingMockData);
                
                // Fetch portfolio summary
                const portfolio = await zerionApi.getPortfolio(address);
                setPortfolioData(portfolio);
                
                // Fetch positions
                const positions = await zerionApi.getPositions(address);
                setPositionData(positions);
            } catch (err) {
                console.error('Error fetching portfolio data:', err);
                setError(err instanceof Error ? err.message : 'Failed to fetch portfolio data');
            } finally {
                setLoading(false);
            }
        }
        
        fetchData();
    }, [address, isConnected]);

    if (headerSlot) {
        return <PageHeader title="Portfolio" />;
    }

    // Show connect wallet message if not connected
    if (!isConnected || !address) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[calc(100vh-3.5rem)] p-4">
                <Wallet className="h-16 w-16 text-muted-foreground mb-4" />
                <h2 className="text-xl font-semibold mb-2">Connect Your Wallet</h2>
                <p className="text-muted-foreground text-center max-w-md mb-6">
                    Connect your wallet to view your portfolio across multiple chains.
                </p>
            </div>
        );
    }

    // Show loading state
    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[calc(100vh-3.5rem)] p-4">
                <Loader2 className="h-12 w-12 text-primary animate-spin mb-4" />
                <h2 className="text-xl font-semibold mb-2">Loading Portfolio</h2>
                <p className="text-muted-foreground text-center max-w-md">
                    Fetching your portfolio data from across multiple chains...
                </p>
            </div>
        );
    }

    // Show error state
    if (error) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[calc(100vh-3.5rem)] p-4">
                <div className="p-3 rounded-full bg-red-500/10 mb-4">
                    <ArrowDownRight className="h-8 w-8 text-red-500" />
                </div>
                <h2 className="text-xl font-semibold mb-2">Error Loading Portfolio</h2>
                <p className="text-muted-foreground text-center max-w-md mb-6">
                    {error}
                </p>
                <Button onClick={() => window.location.reload()}>
                    Try Again
                </Button>
            </div>
        );
    }

    // If we have no data yet, show empty state
    if (!portfolioData || !positionData) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[calc(100vh-3.5rem)] p-4">
                <Wallet className="h-16 w-16 text-muted-foreground mb-4" />
                <h2 className="text-xl font-semibold mb-2">No Portfolio Data</h2>
                <p className="text-muted-foreground text-center max-w-md mb-6">
                    We couldn't find any assets in your wallet. If you believe this is an error, try refreshing the page.
                </p>
                <Button onClick={() => window.location.reload()}>
                    Refresh
                </Button>
            </div>
        );
    }

    // Process the data for display
    const { totalValue, chainDistribution, changes } = portfolioData;
    const { positions } = positionData;
    
    // Format the positions data for display
    const assets: AssetCardProps[] = positions.map(token => ({
        name: token.name,
        symbol: token.symbol,
        value: token.usdValue,
        formattedValue: formatCurrency(token.usdValue),
        amount: formatTokenAmount(token.balance, token.symbol),
        price: token.usdPrice,
        formattedPrice: formatCurrency(token.usdPrice),
        change24h: token.change24h ?? null,
        chain: token.chain
    }));

    // Calculate distribution data
    const distributionData = calculateDistributionData(chainDistribution);

    // Create historical data (mock data since Zerion doesn't provide this in the free API)
    const performanceData = Array.from({ length: 30 }, (_, i) => {
        const dayValue = totalValue * (0.9 + (i / 30) * 0.2);
        return {
            date: `Day ${i + 1}`,
            value: dayValue + (Math.random() * totalValue * 0.05)
        };
    });

    return (
        <div className="min-h-0 p-3 sm:p-4 md:p-6">
            {isMockData && (
                <div className="mb-4 p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
                    <p className="text-sm text-yellow-400">
                        <strong>Note:</strong> Using mock data for development. In production, this will display real data from your wallet.
                    </p>
                </div>
            )}
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4 md:gap-6 mb-4 sm:mb-6">
                {/* Total Value Card */}
                <div className="p-4 sm:p-6 rounded-lg bg-white/[0.03] border border-white/[0.08]">
                    <div className="flex items-center gap-3 mb-4 sm:mb-6">
                        <div className="p-2 sm:p-3 rounded-full bg-sky-400/10">
                            <DollarSign className="h-5 w-5 sm:h-6 sm:w-6 text-sky-400" />
                        </div>
                        <div className="text-sm text-muted-foreground">Total Portfolio Value</div>
                    </div>
                    <div className="space-y-2">
                        <div className="text-2xl sm:text-3xl md:text-4xl font-semibold text-center">
                            {formatCurrencyCompact(totalValue)}
                        </div>
                        <div className={`flex items-center justify-center gap-1 ${
                            changes.percent_1d >= 0 ? 'text-green-500' : 'text-red-500'
                        }`}>
                            {changes.percent_1d >= 0 ? (
                                <ArrowUpRight className="h-4 w-4" />
                            ) : (
                                <ArrowDownRight className="h-4 w-4" />
                            )}
                            <span className="text-sm">
                                {Math.abs(changes.percent_1d).toFixed(1)}% (24h)
                            </span>
                        </div>
                    </div>
                </div>

                {/* Distribution Card */}
                <div className="p-4 sm:p-6 rounded-lg bg-white/[0.03] border border-white/[0.08]">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="p-2 sm:p-3 rounded-full bg-sky-400/10">
                            <PieChart className="h-5 w-5 sm:h-6 sm:w-6 text-sky-400" />
                        </div>
                        <div className="text-sm text-muted-foreground">Chain Distribution</div>
                    </div>
                    <div className="flex flex-col gap-4">
                        <div className="h-[120px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <RechartsPieChart>
                                    <Pie
                                        data={distributionData}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={window.innerWidth < 640 ? 25 : 35}
                                        outerRadius={window.innerWidth < 640 ? 40 : 50}
                                        paddingAngle={2}
                                        dataKey="value"
                                        nameKey="name"
                                        startAngle={90}
                                        endAngle={450}
                                    >
                                        {distributionData.map((entry, index) => (
                                            <Cell
                                                key={entry.id}
                                                fill={COLORS[index % COLORS.length]}
                                            />
                                        ))}
                                    </Pie>
                                    <Tooltip />
                                </RechartsPieChart>
                            </ResponsiveContainer>
                        </div>
                        <div className="grid grid-cols-2 gap-2 text-xs sm:text-sm">
                            {distributionData.slice(0, 6).map((entry, index) => (
                                <div key={entry.id} className="flex items-center gap-2">
                                    <div
                                        className="w-2 h-2 sm:w-3 sm:h-3 rounded-sm"
                                        style={{ backgroundColor: COLORS[index % COLORS.length] }}
                                    />
                                    <span className="text-muted-foreground whitespace-nowrap">
                                        {entry.name}: {((entry.value / totalValue) * 100).toFixed(1)}%
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Performance Chart */}
            <div className="rounded-lg bg-white/[0.03] border border-white/[0.08] p-4 mb-4 sm:mb-6">
                <h3 className="text-sm font-medium mb-4">Portfolio Performance</h3>
                <div className="h-[200px] sm:h-[250px]">
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={performanceData}>
                            <defs>
                                <linearGradient id="performanceGradient" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#38bdf8" stopOpacity={0.3}/>
                                    <stop offset="95%" stopColor="#38bdf8" stopOpacity={0}/>
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                            <XAxis
                                dataKey="date"
                                stroke="rgba(255,255,255,0.5)"
                                tick={{ fontSize: window.innerWidth < 640 ? 10 : 12 }}
                                interval={window.innerWidth < 640 ? 2 : 0}
                            />
                            <YAxis
                                stroke="rgba(255,255,255,0.5)"
                                tick={{ fontSize: window.innerWidth < 640 ? 10 : 12 }}
                            />
                            <Tooltip content={<ChartTooltip />} />
                            <Area
                                type="monotone"
                                dataKey="value"
                                stroke="#38bdf8"
                                fill="url(#performanceGradient)"
                                strokeWidth={2}
                            />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            </div>

            <h3 className="text-lg font-medium mb-3">Your Assets</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                {assets.map((asset) => (
                    <AssetCard
                        key={`${asset.chain}-${asset.symbol}`}
                        {...asset}
                    />
                ))}
            </div>
        </div>
    );
}
