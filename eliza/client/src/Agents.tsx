import { Bot, LineChart, Briefcase, Wallet, Shield, Puzzle, Brain, Rocket, BarChart, Image, MessageSquare, Code, GraduationCap, Network, Coins, Building, Lightbulb, Sparkles, Shapes } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "./components/ui/card";
import { HomeHeader } from "./components/home-header";
import type { FC } from 'react';

// Import agent images
import demoAgentImg from "./assets/agents/demo-agent.png";
import memeAgentImg from "./assets/agents/meme-agent.png";
import salesAgentImg from "./assets/agents/sales-agent.png";
import alphaAgentImg from "./assets/agents/alpha-agent.png";
import predictionsAgentImg from "./assets/agents/predictions-agent.png";
import kolAgentImg from "./assets/agents/kol-agent.png";
import advisorAgentImg from "./assets/agents/advisor-agent.png";
import tokenDeployerImg from "./assets/agents/token-deployer-agent.png";
import nftDeployerImg from "./assets/agents/nft-deployer-agent.png";
import coordinatorAgentImg from "./assets/agents/coordinator-agent.png";
import analyticsAgentImg from "./assets/agents/analytics-agent.png";
import crosschainAgentImg from "./assets/agents/crosschain-agent.png";
import mantleAgentImg from "./assets/agents/mantle-agent.png";
import sonicAgentImg from "./assets/agents/sonic-agent.png";
import multichainAgentImg from "./assets/agents/multichain-agent.png";

interface Agent {
    name: string;
    description: string;
    capabilities: string[];
    category: string;
    icon: React.ElementType;
    imagePath?: string;
}

interface AgentCategory {
    title: string;
    description: string;
    agents: Agent[];
}

interface AgentCardProps {
    agent: Agent;
}

interface AgentSectionProps {
    title: string;
    description: string;
    agents: Agent[];
}

const AgentCard: FC<AgentCardProps> = ({ agent }) => {
    const Icon = agent.icon;
    return (
        <Card className="bg-[#121212] border-[#27272A] hover:bg-[#1a1a1a] transition-all duration-300 h-full group">
            <CardHeader className="space-y-6 text-center">
                <div className="flex flex-col items-center gap-6">
                    {agent.imagePath ? (
                        <div className="w-24 h-24 rounded-full overflow-hidden ring-2 ring-[#7f00ff] ring-offset-4 ring-offset-[#121212] group-hover:ring-4 transition-all duration-300">
                            <img
                                src={agent.imagePath}
                                alt={agent.name}
                                className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-300"
                            />
                        </div>
                    ) : (
                        <div className="w-24 h-24 rounded-2xl bg-[#7f00ff]/10 flex items-center justify-center ring-2 ring-[#7f00ff]/20 ring-offset-2 ring-offset-[#121212] group-hover:ring-[#7f00ff]/40 transition-all duration-300">
                            <Icon className="w-12 h-12 text-[#7f00ff]" />
                        </div>
                    )}
                    <div className="space-y-2">
                        <CardTitle className="text-xl font-bold">
                            <span className="bg-clip-text text-transparent bg-gradient-to-r from-[#7f00ff] to-[#ff1492]">
                                {agent.name}
                            </span>
                        </CardTitle>
                        <div className="text-sm font-medium text-[#7f00ff]/80">{agent.category}</div>
                        <CardDescription className="text-base leading-relaxed">
                            {agent.description}
                        </CardDescription>
                    </div>
                </div>
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                    <div className="flex items-center gap-2">
                        <div className="h-px flex-1 bg-gradient-to-r from-[#7f00ff]/20 to-transparent" />
                        <div className="text-sm font-semibold text-[#7f00ff]">Capabilities</div>
                        <div className="h-px flex-1 bg-gradient-to-l from-[#7f00ff]/20 to-transparent" />
                    </div>
                    <ul className="grid gap-2 text-sm text-muted-foreground/90">
                        {agent.capabilities.map((capability: string) => (
                            <li key={capability} className="flex items-center gap-2">
                                <div className="w-1.5 h-1.5 rounded-full bg-[#7f00ff]/40" />
                                {capability}
                            </li>
                        ))}
                    </ul>
                </div>
            </CardContent>
        </Card>
    );
};

const AgentSection: FC<AgentSectionProps> = ({ title, description, agents }) => {
    return (
        <section className="space-y-8">
            <div className="space-y-3 text-center">
                <h2 className="text-3xl font-bold title-gradient">{title}</h2>
                <p className="text-lg text-muted-foreground/90 max-w-3xl mx-auto">{description}</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {agents.map((agent) => (
                    <AgentCard key={agent.name} agent={agent} />
                ))}
            </div>
        </section>
    );
};

const agentCategories: Record<string, AgentCategory> = {
    internal: {
        title: "Internal Agents",
        description: "Core platform operations and management",
        agents: [
            {
                name: "Demo Agent",
                description: "Interactive platform demonstration and onboarding specialist",
                capabilities: ["Feature showcase", "Cross-chain demos", "Protocol tutorials", "User guidance", "Interactive learning"],
                category: "Education",
                icon: GraduationCap,
                imagePath: demoAgentImg
            },
            {
                name: "Meme Agent",
                description: "Creative content and social media engagement specialist",
                capabilities: ["Meme creation", "Social engagement", "Content strategy", "Brand awareness", "Community building"],
                category: "Marketing",
                icon: Image,
                imagePath: memeAgentImg
            },
            {
                name: "Sales Agent",
                description: "Customer relations and business development expert",
                capabilities: ["User onboarding", "Support assistance", "Feature guidance", "Product education", "Feedback collection"],
                category: "Support",
                icon: Bot,
                imagePath: salesAgentImg
            }
        ]
    },
    public: {
        title: "Public Agents",
        description: "Shared services available to all users",
        agents: [
            {
                name: "Alpha Agent",
                description: "Market opportunity discovery and analysis specialist",
                capabilities: ["Opportunity detection", "Market analysis", "Trend identification", "Risk assessment", "Strategy optimization"],
                category: "Research",
                icon: Brain,
                imagePath: alphaAgentImg
            },
            {
                name: "Predictions Agent",
                description: "Market forecasting and trend analysis expert",
                capabilities: ["Market forecasting", "Pattern analysis", "Trend prediction", "Risk evaluation", "Performance tracking"],
                category: "Analysis",
                icon: LineChart,
                imagePath: predictionsAgentImg
            },
            {
                name: "KOL Agent",
                description: "Social media and community engagement specialist",
                capabilities: ["Community management", "Content creation", "Social engagement", "Brand building", "Trend monitoring"],
                category: "Marketing",
                icon: MessageSquare,
                imagePath: kolAgentImg
            },
            {
                name: "Web3 Advisor",
                description: "Technical guidance and strategy optimization expert",
                capabilities: ["Protocol guidance", "Strategy advice", "Risk assessment", "Performance optimization", "Technical support"],
                category: "Advisory",
                icon: Lightbulb,
                imagePath: advisorAgentImg
            },
            {
                name: "Token Deployer",
                description: "Token deployment and management specialist",
                capabilities: ["Contract deployment", "Token creation", "Liquidity setup", "Security validation", "Cross-chain support"],
                category: "Development",
                icon: Code,
                imagePath: tokenDeployerImg
            },
            {
                name: "NFT Deployer",
                description: "NFT collection deployment and management expert",
                capabilities: ["Collection creation", "Metadata management", "Marketplace integration", "Minting setup", "Royalty configuration"],
                category: "Development",
                icon: Shapes,
                imagePath: nftDeployerImg
            }
        ]
    },
    private: {
        title: "Private Agents",
        description: "Dedicated instances for specific users/organizations",
        agents: [
            {
                name: "Coordinator Agent",
                description: "Multi-agent orchestration and task management specialist",
                capabilities: ["Task delegation", "Agent coordination", "Operation monitoring", "Response aggregation", "Performance optimization"],
                category: "System",
                icon: Network,
                imagePath: coordinatorAgentImg
            },
            {
                name: "Analytics Agent",
                description: "Cross-chain data analysis and visualization expert",
                capabilities: ["Portfolio tracking", "Performance analysis", "Risk assessment", "Market insights", "Trend visualization"],
                category: "Analytics",
                icon: BarChart,
                imagePath: analyticsAgentImg
            },
            {
                name: "Cross Chain Agent",
                description: "Bridge operations and cross-chain transaction specialist",
                capabilities: ["Bridge operations", "Transaction monitoring", "Route optimization", "Security validation", "Status tracking"],
                category: "Operations",
                icon: Briefcase,
                imagePath: crosschainAgentImg
            },
            {
                name: "Mantle Agent",
                description: "Mantle network operations and protocol specialist",
                capabilities: ["DEX operations", "Lending management", "Yield farming", "Protocol integration", "Transaction optimization"],
                category: "Chain",
                icon: Rocket,
                imagePath: mantleAgentImg
            },
            {
                name: "Sonic Agent",
                description: "Sonic chain operations and protocol specialist",
                capabilities: ["DEX trading", "Lending operations", "Yield optimization", "Protocol integration", "Performance monitoring"],
                category: "Chain",
                icon: Coins,
                imagePath: sonicAgentImg
            },
            {
                name: "MultiChain Agent",
                description: "Multichain protocols operations and integration specialist",
                capabilities: ["Protocol integration", "Yield optimization", "Multichain protocolslending", "DEX aggregation", "Strategy optimization"],
                category: "Protocol",
                icon: Network,
                imagePath: multichainAgentImg
            }
        ]
    }
};

export default function Agents() {
    return (
        <div className="min-h-screen bg-background">
            <HomeHeader />
            <div className="py-16 container space-y-20">
                <div className="text-center space-y-6">
                    <h1 className="text-5xl font-black title-gradient">HiveFi Agent Directory</h1>
                    <p className="text-xl text-muted-foreground/90 max-w-3xl mx-auto leading-relaxed">
                        Explore our comprehensive suite of AI agents designed to revolutionize multichain DeFi operations across Mantle, Sonic, and MultiChain protocols.
                    </p>
                </div>

                {Object.entries(agentCategories).map(([key, category]) => (
                    <AgentSection
                        key={key}
                        title={category.title}
                        description={category.description}
                        agents={category.agents}
                    />
                ))}
            </div>
        </div>
    );
}
