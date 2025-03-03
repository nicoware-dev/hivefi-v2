import { useQuery } from "@tanstack/react-query";
import { useNavigate, Link } from "react-router-dom";
import { Bot, ArrowRight } from "lucide-react";
import { Button } from "./components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "./components/ui/card";
import { LogoCarousel } from "./components/carrousel";
import { HomeHeader } from "./components/home-header";
import discordIcon from "./assets/discord.svg";
import githubIcon from "./assets/github-dark.svg";
import telegramIcon from "./assets/telegram.svg";
import linktreeIcon from "./assets/linktree.svg";
import x_dark from "./assets/x_dark.svg";
import logo from "./assets/icon.svg";
import hero from "./assets/hero.svg";
import bg1 from "./assets/bg1.png";
import bg2 from "./assets/bg2.png";
import bg3 from "./assets/bg3.png";
import scalabilityIcon from "./assets/features/scalability.svg";
import efficiencyIcon from "./assets/features/efficiency.svg";
import specializationIcon from "./assets/features/specialization.svg";
import robustnessIcon from "./assets/features/robustness.svg";
import adaptabilityIcon from "./assets/features/adaptability.svg";
import modularityIcon from "./assets/features/modularity.svg";
import "./App.css";

type Agent = {
    id: string;
    name: string;
};

function Home() {
    const navigate = useNavigate();

    const handleExternalLink = (url: string) => {
        window.open(url, '_blank', 'noopener,noreferrer');
    };

    return (
        <div className="min-h-screen flex flex-col bg-background">
            <HomeHeader />
            <main className="flex-1">
                {/* Hero Section */}
                <section id="home" className="relative">
                    {/* Background Image */}
                    <div className="absolute inset-0 overflow-hidden">
                        <img
                            src={bg1}
                            alt=""
                            className="w-full h-full object-cover opacity-70"
                            style={{
                                filter: 'brightness(0.8) contrast(1.2)',
                            }}
                        />
                        <div className="absolute inset-0 bg-gradient-to-b from-background/30 via-background/40 to-background/50" />
                    </div>

                    {/* Content */}
                    <div className="container relative py-8">
                        <div className="flex flex-col items-center text-center">
                            <div className="flex items-center justify-center mb-8">
                                <img
                                    src="/hero.svg"
                                    alt="HiveFi Hero"
                                    className="w-[1024px] h-auto max-w-full"
                                    style={{
                                        filter: 'drop-shadow(0 0 20px rgba(56, 189, 248, 0.2))',
                                        animation: 'float 6s ease-in-out infinite'
                                    }}
                                />
                            </div>
                            <style>
                                {`
                                    @keyframes float {
                                        0%, 100% { transform: translateY(0px); }
                                        50% { transform: translateY(-10px); }
                                    }
                                `}
                            </style>
                            <div className="space-y-8">
                                <h1 className="text-4xl sm:text-5xl md:text-6xl font-black title-gradient" style={{ lineHeight: '1.2' }}>
                                    Revolutionizing Multichain DeFi with AI-Powered Agent Swarms
                                </h1>
                                <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto">
                                    Simplify your DeFi experience across multiple blockchains with the power of Multi-Agent Systems (MAS)
                                </p>
                                <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                                    <Button
                                        size="lg"
                                        onClick={() => handleExternalLink('https://t.me/hivefidemo_bot')}
                                        style={{ backgroundColor: '#7f00ff', color: 'white' }}
                                        className="hover:bg-[#7f00ff]/90 flex items-center gap-2 w-full sm:w-auto"
                                    >
                                        <span>Try for Free</span>
                                        <ArrowRight className="h-4 w-4" />
                                    </Button>
                                    <Button
                                        size="lg"
                                        variant="outline"
                                        onClick={() => handleExternalLink('https://docs.hivefi.ai')}
                                        className="border-[#27272A] hover:bg-[#7f00ff]/10 hover:border-[#7f00ff]/50 text-white w-full sm:w-auto"
                                    >
                                        Learn More
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Benefits Section */}
                <section id="features" className="py-24 bg-background">
                    <div className="container space-y-12">
                        <div className="text-center space-y-4">
                            <h2 className="text-3xl font-bold title-gradient">Why Multi-Agent Systems?</h2>
                            <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
                                Our platform leverages a Multi-Agent System architecture where each agent specializes in specific tasks—from fetching metrics to executing trades—enabling modular, scalable, and efficient operations.
                            </p>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
                            {[
                                {
                                    title: "Specialization",
                                    description: "Optimized performance through task-specific agents",
                                    icon: specializationIcon,
                                    href: "#specialization"
                                },
                                {
                                    title: "Scalability",
                                    description: "Easy addition of new agents and features",
                                    icon: scalabilityIcon,
                                    href: "#scalability"
                                },
                                {
                                    title: "Robustness",
                                    description: "Continued operation even if individual agents fail",
                                    icon: robustnessIcon,
                                    href: "#robustness"
                                },
                                {
                                    title: "Efficiency",
                                    description: "Parallel task execution for improved performance",
                                    icon: efficiencyIcon,
                                    href: "#efficiency"
                                },
                                {
                                    title: "Adaptability",
                                    description: "Seamless integration with new protocols and chains",
                                    icon: adaptabilityIcon,
                                    href: "#adaptability"
                                },
                                {
                                    title: "Modularity",
                                    description: "Plug-and-play architecture for easy customization",
                                    icon: modularityIcon,
                                    href: "#modularity"
                                }
                            ].map((feature) => {
                                return (
                                    <a
                                        key={feature.title}
                                        href={feature.href}
                                        className="block group"
                                    >
                                        <Card className="bg-[#121212] border-[#27272A] hover:bg-[#1a1a1a] transition-colors h-full">
                                            <div className="p-6 flex flex-col items-center text-center space-y-6">
                                                <div className="h-20 w-20 rounded-2xl bg-[#1a1a1a] flex items-center justify-center group-hover:scale-110 transition-transform ring-1 ring-[#27272A]">
                                                    <img
                                                        src={feature.icon}
                                                        alt={feature.title}
                                                        className="h-20 w-20"
                                                    />
                                                </div>
                                                <div className="space-y-3">
                                                    <h3 className="text-xl font-semibold text-[#7f00ff]">{feature.title}</h3>
                                                    <p className="text-sm text-muted-foreground">{feature.description}</p>
                                                </div>
                                            </div>
                                        </Card>
                                    </a>
                                );
                            })}
                        </div>
                    </div>
                </section>

                {/* Architecture Section */}
                <section className="relative py-24">
                    {/* Background Image */}
                    <div className="absolute inset-0 overflow-hidden">
                        <img
                            src={bg2}
                            alt=""
                            className="w-full h-full object-cover opacity-70"
                            style={{
                                filter: 'brightness(0.8) contrast(1.2)',
                            }}
                        />
                        <div className="absolute inset-0 bg-gradient-to-b from-background/30 via-background/40 to-background/50" />
                    </div>

                    <div className="container relative space-y-12">
                        <div className="text-center space-y-4">
                            <h2 className="text-3xl font-bold title-gradient">Our Architecture</h2>
                            <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
                                A sophisticated multi-agent system designed to revolutionize DeFi operations through specialized agents and intelligent coordination across multiple blockchains.
                            </p>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
                            <Card className="bg-[#121212] border-[#27272A] hover:bg-[#1a1a1a] transition-all duration-300 h-full group">
                                <CardHeader>
                                    <CardTitle className="text-xl font-bold">
                                        <span className="bg-clip-text text-transparent bg-gradient-to-r from-[#7f00ff] to-[#ff1492]">
                                            Multichain Support
                                        </span>
                                    </CardTitle>
                                    <CardDescription className="text-base leading-relaxed">
                                        Native integration with Mantle, Sonic, and Bitcoin networks, providing seamless cross-chain operations.
                                    </CardDescription>
                                </CardHeader>
                            </Card>
                            <Card className="bg-[#121212] border-[#27272A] hover:bg-[#1a1a1a] transition-all duration-300 h-full group">
                                <CardHeader>
                                    <CardTitle className="text-xl font-bold">
                                        <span className="bg-clip-text text-transparent bg-gradient-to-r from-[#7f00ff] to-[#ff1492]">
                                            Agent Swarm
                                        </span>
                                    </CardTitle>
                                    <CardDescription className="text-base leading-relaxed">
                                        15 specialized AI agents working together to handle complex DeFi operations across chains.
                                    </CardDescription>
                                </CardHeader>
                            </Card>
                            <Card className="bg-[#121212] border-[#27272A] hover:bg-[#1a1a1a] transition-all duration-300 h-full group">
                                <CardHeader>
                                    <CardTitle className="text-xl font-bold">
                                        <span className="bg-clip-text text-transparent bg-gradient-to-r from-[#7f00ff] to-[#ff1492]">
                                            Bridge Operations
                                        </span>
                                    </CardTitle>
                                    <CardDescription className="text-base leading-relaxed">
                                        Integrated bridge support via Wormhole, DeBridge, and Multichain for seamless asset transfers.
                                    </CardDescription>
                                </CardHeader>
                            </Card>
                        </div>
                        <div className="flex flex-col items-center space-y-8">
                            <div className="w-full max-w-5xl bg-background rounded-lg p-8 border border-white/[0.08]">
                                <img
                                    src="/architecture.png"
                                    alt="HiveFi Architecture Diagram"
                                    className="w-full h-auto"
                                />
                            </div>
                        </div>
                    </div>
                </section>

                {/* Integrations Section with Logo Carousel */}
                <section className="py-24 space-y-12">
                    <div className="container text-center space-y-4">
                        <h2 className="text-3xl font-bold title-gradient">Integrated Platforms & Protocols</h2>
                        <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
                            Seamlessly connected with leading protocols across Mantle, Sonic, and Bitcoin networks
                        </p>
                    </div>
                    <LogoCarousel />
                </section>

                {/* Pricing Section */}
                <section id="pricing" className="container py-24 space-y-12">
                    <div className="text-center space-y-4">
                        <h2 className="text-3xl font-bold title-gradient">Flexible Plans for Every User</h2>
                        <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
                            HiveFi is and will always be open source! We strongly encourage users to self-host their own instance.
                        </p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-8 max-w-6xl mx-auto">
                        {[
                            {
                                title: "Self-Hosted",
                                price: "Free",
                                description: "Unlimited. Full control over your data and agents",
                                buttonText: "View Documentation",
                                href: "https://github.com/hivefi/hivefi",
                                featured: true
                            },
                            {
                                title: "Free Tier",
                                price: "$0",
                                description: "Public agents access, Basic features, limited API calls",
                                buttonText: "Coming Soon",
                                comingSoon: true,
                                href: "#"
                            },
                            {
                                title: "SaaS Packs",
                                price: "+$19.99",
                                description: "Full access. Customizable private swarms",
                                buttonText: "Coming Soon",
                                comingSoon: true,
                                href: "#"
                            },
                            {
                                title: "Enterprise",
                                price: "Custom",
                                description: "Custom workflows, dedicated support",
                                buttonText: "Coming Soon",
                                comingSoon: true,
                                href: "#"
                            }
                        ].map((plan) => (
                            <Card
                                key={plan.title}
                                className={`bg-[#121212] border-[#27272A] hover:bg-[#1a1a1a] transition-colors ${plan.featured ? 'ring-2 ring-[#7f00ff]' : ''}`}
                            >
                                <CardHeader>
                                    <CardTitle className="text-center">{plan.title}</CardTitle>
                                    <div className="text-4xl font-bold my-4 text-center">{plan.price}</div>
                                    <CardDescription className="text-center">{plan.description}</CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-6">
                                    <Button
                                        className={`w-full ${plan.featured ? 'bg-[#7f00ff] text-white hover:bg-[#7f00ff]/90' : plan.comingSoon ? 'bg-gray-700 text-gray-300 cursor-not-allowed' : 'border-[#27272A] hover:bg-[#1a1a1a] text-[#7f00ff]'}`}
                                        variant={plan.featured ? 'default' : 'outline'}
                                        onClick={() => plan.comingSoon ? null : handleExternalLink(plan.href)}
                                        disabled={plan.comingSoon}
                                    >
                                        {plan.buttonText}
                                    </Button>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                    {/* Coming Soon Notice */}
                    <div className="text-center text-muted-foreground/90 mt-8">
                        <p>Hosted plans are coming soon! For now, we recommend self-hosting your own instance.</p>
                    </div>
                </section>

                {/* Open Source Section */}
                <section id="opensource" className="relative py-24">
                    {/* Background Image */}
                    <div className="absolute inset-0 overflow-hidden">
                        <img
                            src={bg3}
                            alt=""
                            className="w-full h-full object-cover opacity-70"
                            style={{
                                filter: 'brightness(0.8) contrast(1.2)',
                            }}
                        />
                        <div className="absolute inset-0 bg-gradient-to-b from-background/30 via-background/40 to-background/50" />
                    </div>

                    <div className="container relative space-y-12">
                        <div className="text-center space-y-4">
                            <h2 className="text-3xl font-bold title-gradient">Open Source and Built for Collaboration</h2>
                            <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
                                HiveFi is an open-source initiative. We invite developers and contributors to help us expand the MAS ecosystem and redefine DeFi automation together.
                            </p>
                        </div>
                        <div className="flex flex-col sm:flex-row justify-center gap-4">
                            <Button
                                variant="outline"
                                size="lg"
                                className="border-[#27272A] hover:bg-[#7f00ff]/10 hover:border-[#7f00ff]/50 hover:text-[#7f00ff] transition-all duration-300 w-full sm:w-auto"
                                onClick={() => handleExternalLink('https://github.com/hivefi/hivefi')}
                            >
                                <img src={githubIcon} alt="GitHub" className="mr-2 h-4 w-4 opacity-60 group-hover:opacity-100 transition-opacity" />
                                Contribute on GitHub
                            </Button>
                            <Button
                                variant="outline"
                                size="lg"
                                className="border-[#27272A] hover:bg-[#7f00ff]/10 hover:border-[#7f00ff]/50 hover:text-[#7f00ff] transition-all duration-300 w-full sm:w-auto"
                                onClick={() => handleExternalLink('https://discord.gg/hivefiai')}
                            >
                                <img src={discordIcon} alt="Discord" className="mr-2 h-4 w-4 opacity-60 group-hover:opacity-100 transition-opacity" />
                                Join Our Discord
                            </Button>
                        </div>
                    </div>
                </section>

                {/* Social Media Section */}
                <section className="container py-24 space-y-12">
                    <div className="text-center space-y-4">
                        <h2 className="text-3xl font-bold title-gradient">Stay Updated with Our Meme Agent</h2>
                        <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
                            Follow our AI Meme Agent for the latest DeFi trends, market insights, and community updates across multiple chains.
                        </p>
                    </div>
                    <div className="flex justify-center gap-8">
                        <a href="https://x.com/hivefi_ai" target="_blank" rel="noopener noreferrer" className="group">
                            <Card className="bg-[#121212] border-[#27272A] hover:bg-[#1a1a1a] transition-colors p-6">
                                <div className="flex flex-col items-center space-y-4">
                                    <div className="w-24 h-24 rounded-full overflow-hidden ring-2 ring-[#7f00ff] ring-offset-2 ring-offset-[#121212] group-hover:ring-4 transition-all duration-300">
                                        <img
                                            src="/agents/meme-agent.png"
                                            alt="HiveFi Meme Agent"
                                            className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-300"
                                        />
                                    </div>
                                    <div className="text-center">
                                        <h3 className="font-semibold">Follow on X</h3>
                                        <p className="text-sm text-muted-foreground">Daily market insights & memes</p>
                                    </div>
                                </div>
                            </Card>
                        </a>
                    </div>
                </section>

                {/* Contact Section */}
                <section id="contact" className="relative py-24">
                    {/* Background Image */}
                    <div className="absolute inset-0 overflow-hidden">
                        <img
                            src={bg1}
                            alt=""
                            className="w-full h-full object-cover opacity-70"
                            style={{
                                filter: 'brightness(0.8) contrast(1.2)',
                            }}
                        />
                        <div className="absolute inset-0 bg-gradient-to-b from-background/30 via-background/40 to-background/50" />
                    </div>

                    <div className="container relative space-y-12">
                        <div className="text-center space-y-4">
                            <h2 className="text-3xl font-bold title-gradient">Talk to Our AI Sales Agent</h2>
                            <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
                                Have questions? Our dedicated Sales AI Agent is available 24/7 on Telegram to assist you with any inquiries about our platform and services.
                            </p>
                        </div>
                        <div className="flex flex-col items-center gap-8">
                            <div className="w-24 h-24 rounded-full overflow-hidden ring-2 ring-[#7f00ff] ring-offset-2 ring-offset-[#121212] hover:ring-4 transition-all duration-300">
                                <img
                                    src="/agents/sales-agent.png"
                                    alt="AI Sales Agent"
                                    className="w-full h-full object-cover transform hover:scale-105 transition-transform duration-300"
                                />
                            </div>
                            <Button
                                size="lg"
                                className="bg-[#7f00ff] text-white hover:bg-[#7f00ff]/90"
                                onClick={() => handleExternalLink('https://t.me/hivefisales_bot')}
                            >
                                <img src={telegramIcon} alt="Telegram" className="mr-2 h-5 w-5" />
                                Chat with Sales Agent
                            </Button>
                        </div>
                    </div>
                </section>
            </main>

            {/* Footer */}
            <footer className="border-t border-white/[0.08] bg-background">
                <div className="container py-12">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-6xl mx-auto">
                        <div className="space-y-4">
                            <div className="flex flex-col items-center text-center">
                                <div className="flex items-center gap-2">
                                    <img src={logo} alt="HiveFi Logo" className="h-6 w-6" />
                                    <h3 className="text-lg font-semibold text-white">HiveFi</h3>
                                </div>
                            </div>
                        </div>
                        <div className="space-y-4">
                            <h4 className="text-sm font-semibold text-foreground">Links</h4>
                            <nav className="flex flex-col gap-2">
                                <a href="#home" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Home</a>
                                <a href="#features" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Features</a>
                                <a href="#pricing" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Pricing</a>
                                <a href="#opensource" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Open Source</a>
                            </nav>
                        </div>
                        <div>
                            <h4 className="text-sm font-semibold text-foreground text-center">Social</h4>
                            <div className="flex flex-col items-center gap-4 mt-4">
                                <a
                                    href="https://t.me/hivefiai"
                                    className="w-6 h-6 flex items-center justify-center"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                >
                                    <img src={telegramIcon} alt="Telegram" className="w-full h-full opacity-60 hover:opacity-100 transition-opacity" />
                                </a>
                                <a
                                    href="https://discord.gg/hivefiai"
                                    className="w-6 h-6 flex items-center justify-center"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                >
                                    <img src={discordIcon} alt="Discord" className="w-full h-full opacity-60 hover:opacity-100 transition-opacity" />
                                </a>
                                <a
                                    href="https://github.com/hivefi/hivefi"
                                    className="w-6 h-6 flex items-center justify-center"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                >
                                    <img src={githubIcon} alt="GitHub" className="w-full h-full opacity-60 hover:opacity-100 transition-opacity" />
                                </a>
                                <a
                                    href="https://linktr.ee/hivefi"
                                    className="w-6 h-6 flex items-center justify-center"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                >
                                    <img src={linktreeIcon} alt="Linktree" className="w-full h-full opacity-60 hover:opacity-100 transition-opacity" />
                                </a>
                            </div>
                        </div>
                        <div className="space-y-4">
                            <h4 className="text-sm font-semibold text-foreground">Legal</h4>
                            <nav className="flex flex-col gap-2">
                                <a href="/privacy" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Privacy Policy</a>
                                <a href="/terms" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Terms of Service</a>
                            </nav>
                        </div>
                    </div>
                    <div className="mt-12 pt-8 border-t border-white/[0.08] text-center text-sm text-muted-foreground">
                        © 2025 HiveFi. All rights reserved.
                    </div>
                </div>
            </footer>
        </div>
    );
}

export default Home;
