import { AppHeader } from "@/components/app-header";
import { AgentsSidebar } from "@/components/agents-sidebar";
import { Outlet, useLocation } from "react-router-dom";
import { useState, useCallback, useEffect } from "react";
import { Menu } from "lucide-react";
import { Button } from "./components/ui/button";
import { useQueryClient } from "@tanstack/react-query";

export default function Layout() {
    const location = useLocation();
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const queryClient = useQueryClient();

    const handleClose = useCallback(() => {
        setIsSidebarOpen(false);
    }, []);

    const handleKeyDown = useCallback((event: React.KeyboardEvent) => {
        if (event.key === 'Escape') {
            handleClose();
        }
    }, [handleClose]);

    // Force a re-render of the content when location changes
    useEffect(() => {
        queryClient.invalidateQueries({
            predicate: (query) => query.queryKey[0] === "messages",
        });
    }, [location, queryClient]);

    return (
        <div className="w-full h-screen flex flex-col">
            <AppHeader />
            <div className="flex-1 flex">
                {/* Sidebar */}
                <div
                    className={`
                        fixed top-[56px] left-0 h-[calc(100vh-56px)] w-[240px]
                        bg-background border-r border-white/[0.08]
                        transition-transform duration-300
                        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-[240px]'}
                        z-40
                    `}
                >
                    <AgentsSidebar onClose={handleClose} />
                </div>

                {/* Main Content */}
                <div className={`
                    flex-1 flex flex-col
                    transition-all duration-300
                    ${isSidebarOpen ? 'ml-[240px]' : 'ml-0'}
                `}>
                    {/* Header */}
                    <div className="h-14 flex items-center justify-between px-6 border-b border-white/[0.08]">
                        <div className="flex items-center gap-6">
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => {
                                    setIsSidebarOpen(!isSidebarOpen);
                                    // Force a re-render of the messages when toggling sidebar
                                    queryClient.invalidateQueries({
                                        predicate: (query) => query.queryKey[0] === "messages",
                                    });
                                }}
                            >
                                <Menu className="h-5 w-5" />
                            </Button>
                            <Outlet context={{ headerSlot: true }} />
                        </div>
                    </div>

                    {/* Page Content */}
                    <div className="flex-1 overflow-y-auto">
                        <Outlet context={{ headerSlot: false }} />
                    </div>
                </div>

                {/* Mobile Overlay */}
                {isSidebarOpen && (
                    <div
                        className="fixed inset-0 bg-black/50 z-30 lg:hidden"
                        onClick={handleClose}
                        onKeyDown={handleKeyDown}
                        role="button"
                        tabIndex={0}
                    />
                )}
            </div>
        </div>
    );
}
