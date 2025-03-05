import { Link, useLocation } from "react-router-dom";
import { ConnectWallet } from "./connect-wallet";
import { CrossmintConnectWallet } from "./crossmint-connect-wallet";
import { Menu, X } from "lucide-react";
import { Button } from "./ui/button";
import { useState } from "react";
import logo from "../assets/icon.svg";

// Determine whether to use Crossmint or the original wallet component
// This should match the setting in main.tsx
const USE_CROSSMINT = true;

export function AppHeader() {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const location = useLocation();

    const DEFAULT_AGENT_ID = 'acc5e818-17b3-0509-8411-89882fdb9ce3';

    const navItems = [
        { name: "Chat", path: `/app/chat/${DEFAULT_AGENT_ID}` },
        { name: "Analytics", path: "/app/analytics" },
        { name: "Portfolio", path: "/app/portfolio" },
        { name: "Settings", path: "/app/settings" },
    ];

    return (
        <header className="sticky top-0 z-50 w-full border-b border-white/[0.08] bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="flex h-14 items-center justify-between px-4 relative">
                {/* Logo */}
                <Link to="/" className="flex items-center gap-2">
                    <img src={logo} alt="HiveFi Logo" className="h-6 w-6" />
                    <span className="text-white font-semibold">HiveFi</span>
                </Link>

                {/* Mobile Menu Button - Centered */}
                <div className="lg:hidden absolute left-1/2 -translate-x-1/2">
                    <Button
                        variant="ghost"
                        size="icon"
                        className="text-[#7f00ff] hover:bg-[#7f00ff]/10 hover:text-[#7f00ff]"
                        onClick={() => setIsMenuOpen(!isMenuOpen)}
                    >
                        {isMenuOpen ? (
                            <X className="h-5 w-5" />
                        ) : (
                            <Menu className="h-5 w-5" />
                        )}
                    </Button>
                </div>

                {/* Desktop Navigation - Centered */}
                <nav className="hidden lg:flex items-center absolute left-1/2 -translate-x-1/2">
                    {navItems.map((item) => (
                        <Link
                            key={item.path}
                            to={item.path}
                            className={`text-sm transition-colors px-6 ${
                                location.pathname.includes(item.path.split('/')[2])
                                    ? 'text-foreground'
                                    : 'text-muted-foreground hover:text-foreground'
                            }`}
                        >
                            {item.name}
                        </Link>
                    ))}
                </nav>

                {/* Connect Wallet / Sign In Button - Always Visible */}
                <div>
                    {USE_CROSSMINT ? <CrossmintConnectWallet /> : <ConnectWallet />}
                </div>

                {/* Mobile Menu Overlay */}
                {isMenuOpen && (
                    <div className="fixed inset-0 top-14 z-40 bg-[#121212] lg:hidden min-h-[calc(100vh-3.5rem)]">
                        <nav className="flex flex-col items-center py-8 gap-8 bg-[#121212] h-full">
                            {navItems.map((item) => (
                                <Link
                                    key={item.path}
                                    to={item.path}
                                    onClick={() => setIsMenuOpen(false)}
                                    className={`text-lg font-medium transition-colors ${
                                        location.pathname.includes(item.path.split('/')[2])
                                            ? 'text-[#7f00ff]'
                                            : 'text-muted-foreground hover:text-[#7f00ff]'
                                    }`}
                                >
                                    {item.name}
                                </Link>
                            ))}
                        </nav>
                    </div>
                )}
            </div>
        </header>
    );
}
