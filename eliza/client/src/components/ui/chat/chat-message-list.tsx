import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ChevronDown } from "lucide-react";

interface ChatMessageListProps extends React.HTMLAttributes<HTMLDivElement> {
    scrollRef?: React.RefObject<HTMLDivElement>;
    isAtBottom?: boolean;
    scrollToBottom?: () => void;
    disableAutoScroll?: () => void;
}

export function ChatMessageList({
    children,
    className,
    scrollRef,
    isAtBottom,
    scrollToBottom,
    disableAutoScroll,
    ...props
}: ChatMessageListProps) {
    return (
        <div className="relative h-full">
            <div
                ref={scrollRef}
                className={cn("h-full space-y-4 overflow-y-auto p-4", className)}
                onWheel={disableAutoScroll}
                onTouchMove={disableAutoScroll}
                {...props}
            >
                {children}
            </div>
            {!isAtBottom && scrollToBottom && (
                <Button
                    variant="outline"
                    size="icon"
                    className="absolute bottom-4 right-4 h-8 w-8 rounded-full bg-background shadow-md"
                    onClick={scrollToBottom}
                >
                    <ChevronDown className="h-4 w-4" />
                </Button>
            )}
        </div>
    );
}
