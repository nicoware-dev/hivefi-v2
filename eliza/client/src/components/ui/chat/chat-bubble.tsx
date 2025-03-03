import { cn } from "@/lib/utils";
import { cva, type VariantProps } from "class-variance-authority";
import { Loader2 } from "lucide-react";

const chatBubbleVariants = cva(
    "relative flex flex-col gap-2 text-lg sm:text-sm leading-[1.6] sm:leading-relaxed tracking-normal transition-all duration-200 w-fit",
    {
        variants: {
            variant: {
                sent: "ml-auto bg-gradient-to-br from-[#7000ff] via-[#6000c7] to-[#4a0099] shadow-lg text-white rounded-2xl rounded-tr-sm hover:shadow-purple-900/20",
                received: "bg-gradient-to-br from-[#27272A] via-[#1f1f1f] to-[#171717] shadow-md border border-white/[0.08] rounded-2xl rounded-tl-sm hover:shadow-white/[0.02]",
            },
        },
        defaultVariants: {
            variant: "received",
        },
    }
);

interface ChatBubbleProps
    extends React.HTMLAttributes<HTMLDivElement>,
        VariantProps<typeof chatBubbleVariants> {
    children: React.ReactNode;
}

export function ChatBubble({
    className,
    variant,
    children,
    ...props
}: ChatBubbleProps) {
    return (
        <div className="flex w-full">
            <div
                className={cn(
                    chatBubbleVariants({ variant }),
                    "hover:translate-y-[-1px] active:translate-y-[1px] transition-all duration-200 ease-out px-4 sm:px-5 py-3 max-w-[90%] sm:max-w-[75%]",
                    className
                )}
                {...props}
            >
                {children}
            </div>
        </div>
    );
}

interface ChatBubbleMessageProps extends React.HTMLAttributes<HTMLDivElement> {
    isLoading?: boolean;
}

export function ChatBubbleMessage({
    className,
    children,
    isLoading,
    ...props
}: ChatBubbleMessageProps) {
    if (isLoading) {
        return (
            <div
                className={cn(
                    "flex items-center gap-3 text-muted-foreground animate-pulse font-medium tracking-tight",
                    className
                )}
                {...props}
            >
                <Loader2 className="h-6 w-6 sm:h-4 sm:w-4" />
                <span className="text-lg sm:text-sm">Thinking...</span>
            </div>
        );
    }

    return (
        <div
            className={cn(
                "break-words break-all whitespace-pre-wrap",
                "animate-in fade-in-0 slide-in-from-bottom-1 duration-200",
                "leading-[1.6] sm:leading-relaxed tracking-normal text-lg sm:text-sm font-[450]",
                className
            )}
            {...props}
        >
            {children}
        </div>
    );
}

export function ChatBubbleTimestamp({
    className,
    ...props
}: React.HTMLAttributes<HTMLDivElement> & { variant?: "sent" | "received" }) {
    return (
        <div
            className={cn(
                "select-none text-xs sm:text-[10px] font-light tracking-wide mt-1",
                props.variant === "sent" ? "text-white/70" : "text-muted-foreground",
                className
            )}
            {...props}
        />
    );
}
