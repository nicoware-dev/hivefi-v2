import { Loader2, X } from "lucide-react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Link, useParams, useNavigate, useLocation } from "react-router-dom";
import { useEffect } from "react";
import { Button } from "./ui/button";
import { API_ENDPOINTS } from "@/config";
import { cn } from "@/lib/utils";

interface Agent {
    id: string;
    name: string;
    description?: string;
}

interface AgentsSidebarProps {
    onClose?: () => void;
}

export function AgentsSidebar({ onClose }: AgentsSidebarProps) {
    const { agentId: currentAgentId } = useParams();
    const navigate = useNavigate();
    const location = useLocation();
    const queryClient = useQueryClient();

    const { data: agents, isLoading, error } = useQuery<Agent[]>({
        queryKey: ["agents"],
        queryFn: async () => {
            try {
                console.log('Fetching agents from:', API_ENDPOINTS.agents);
                const res = await fetch(API_ENDPOINTS.agents, {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                        'Accept': 'application/json',
                    },
                    mode: 'cors',
                });

                if (!res.ok) {
                    const text = await res.text();
                    console.error('Error response:', text);
                    throw new Error(`Failed to fetch agents: ${res.status}`);
                }

                const text = await res.text();
                console.log('Response text:', text);

                try {
                    const data = JSON.parse(text);
                    return data.agents;
                } catch (e) {
                    console.error('JSON parse error:', e);
                    throw new Error('Invalid JSON response from server');
                }
            } catch (err) {
                console.error('Fetch error:', err);
                throw err;
            }
        },
        retry: 1
    });

    // Only navigate to first agent if we're on a chat page and no agent is selected
    useEffect(() => {
        if (location.pathname.includes('/chat') && !currentAgentId && agents && agents.length > 0) {
            navigate(`/app/chat/${agents[0].id}`);
        }
    }, [currentAgentId, agents, navigate, location]);

    const handleAgentClick = (agentId: string) => {
        // Force a refresh of the messages when switching agents
        queryClient.invalidateQueries({
            queryKey: ["messages", agentId],
            exact: true,
            refetchType: "all"
        });
        navigate(`/app/chat/${agentId}`);
        if (onClose) onClose();
    };

    return (
        <div className="h-full flex flex-col bg-gradient-to-b from-background to-[#121212]">
            <div className="h-14 flex items-center justify-between px-6 border-b border-white/[0.08]">
                <span className="text-base font-semibold tracking-tight">HiveFi Agent Swarm</span>
                {onClose && (
                    <Button
                        variant="ghost"
                        size="icon"
                        className="lg:hidden"
                        onClick={onClose}
                    >
                        <X className="h-4 w-4" />
                    </Button>
                )}
            </div>
            <div className="flex-1 p-4 space-y-2 overflow-auto">
                {isLoading ? (
                    <div className="flex items-center justify-center h-32">
                        <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                    </div>
                ) : error ? (
                    <div className="p-4 text-sm font-medium tracking-tight text-red-500 text-center">
                        Failed to load agents
                    </div>
                ) : agents?.length === 0 ? (
                    <div className="p-4 text-sm font-medium tracking-tight text-muted-foreground text-center">
                        No agents available
                    </div>
                ) : (
                    agents?.map((agent) => (
                        <Link
                            key={agent.id}
                            to={`/app/chat/${agent.id}`}
                            onClick={() => handleAgentClick(agent.id)}
                            className={cn(
                                "flex items-center p-3 rounded-lg transition-all duration-200",
                                "hover:bg-gradient-to-r hover:from-[#7f00ff]/5 hover:to-transparent",
                                currentAgentId === agent.id ? 
                                    "bg-gradient-to-r from-[#7f00ff]/10 to-transparent border-l-2 border-[#7f00ff]" : 
                                    "border-l-2 border-transparent"
                            )}
                        >
                            <div className="flex-1 min-w-0">
                                <p className={cn(
                                    "font-medium tracking-tight truncate transition-colors duration-200",
                                    currentAgentId === agent.id ? 
                                        "text-foreground" : 
                                        "text-muted-foreground hover:text-foreground"
                                )}>
                                    {agent.name}
                                </p>
                                {agent.description && (
                                    <p className="text-sm font-light tracking-normal text-muted-foreground truncate mt-1">
                                        {agent.description}
                                    </p>
                                )}
                            </div>
                        </Link>
                    ))
                )}
            </div>
        </div>
    );
}
