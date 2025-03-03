import { MessageSquare } from "lucide-react";
import { useParams, Link } from "react-router-dom";

export function AppSidebar() {
    const { agentId } = useParams();

    return (
        <div className="h-full flex flex-col bg-background">
            <div className="h-12 flex items-center px-3 border-b border-white/[0.08]">
                <Link to="/" className="text-sm font-semibold gradient-text">
                    SuperSonic
                </Link>
            </div>
            <nav className="flex-1 p-1.5">
                <Link
                    to={`/${agentId}/chat`}
                    className="flex items-center gap-2 px-2 py-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors rounded-md hover:bg-white/[0.04]"
                >
                    <MessageSquare className="h-4 w-4" />
                    <span>Chat</span>
                </Link>
            </nav>
        </div>
    );
}
