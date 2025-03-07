import { Link, useNavigate, useLocation } from "react-router-dom";
import { Button } from "./ui/button";
import { Menu, X } from "lucide-react";
import { useState } from "react";
import logo from "../assets/icon.svg";

export function HomeHeader() {
    const navigate = useNavigate();
    const location = useLocation();
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    const handleNavigation = (path: string) => {
        setIsMenuOpen(false);
        if (location.pathname !== '/') {
            navigate(`/${path}`);
        } else {
            document.querySelector(path)?.scrollIntoView({ behavior: 'smooth' });
        }
    };

    const navItems = [
        { name: "Home", path: "#home" },
        { name: "Features", path: "#features" },
        { name: "Agents", path: "/agents" },
        { name: "Pricing", path: "#pricing" },
        { name: "Contact", path: "#contact" },
        { name: "Contribute", path: "#opensource" },
        { name: "Docs", path: "https://hivefi-1.gitbook.io/hivefi/" }
    ];

    return (
        <header className="sticky top-0 z-50 w-full border-b border-white/[0.08] bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/80">
            <div className="flex h-14 items-center justify-between px-4 relative">
                {/* Logo */}
                <Link to="/" className="flex items-center gap-2">
                    <img src={logo} alt="HiveFi Logo" className="h-6 w-6" />
                    <span className="text-white">HiveFi</span>
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
                    {navItems.map((item) =>
                        item.path.startsWith('#') ? (
                            <button
                                key={item.path}
                                type="button"
                                onClick={() => handleNavigation(item.path)}
                                className="text-sm text-muted-foreground hover:text-foreground transition-colors px-6"
                            >
                                {item.name}
                            </button>
                        ) : (
                            <Link
                                key={item.path}
                                to={item.path}
                                className="text-sm text-muted-foreground hover:text-foreground transition-colors px-6"
                            >
                                {item.name}
                            </Link>
                        )
                    )}
                </nav>

                {/* Launch App Button - Always Visible */}
                <div>
                    <Button
                        onClick={() => navigate('/app/chat/default')}
                        style={{ backgroundColor: '#7f00ff', color: 'white' }}
                        className="hover:bg-[#7f00ff]/90"
                    >
                        Launch App
                    </Button>
                </div>

                {/* Mobile Menu Overlay */}
                {isMenuOpen && (
                    <div className="fixed inset-0 top-14 z-40 bg-[#121212] lg:hidden min-h-[calc(100vh-3.5rem)]">
                        <nav className="flex flex-col items-center py-8 gap-8 bg-[#121212] h-full">
                            {navItems.map((item) =>
                                item.path.startsWith('#') ? (
                                    <button
                                        key={item.path}
                                        type="button"
                                        onClick={() => handleNavigation(item.path)}
                                        className="text-lg font-medium text-muted-foreground hover:text-[#7f00ff] transition-colors"
                                    >
                                        {item.name}
                                    </button>
                                ) : (
                                    <Link
                                        key={item.path}
                                        to={item.path}
                                        onClick={() => setIsMenuOpen(false)}
                                        className="text-lg font-medium text-muted-foreground hover:text-[#7f00ff] transition-colors"
                                    >
                                        {item.name}
                                    </Link>
                                )
                            )}
                        </nav>
                    </div>
                )}
            </div>
        </header>
    );
}
