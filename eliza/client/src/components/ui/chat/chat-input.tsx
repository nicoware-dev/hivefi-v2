import { forwardRef } from "react";
import TextareaAutosize, { TextareaAutosizeProps } from "react-textarea-autosize";
import { cn } from "@/lib/utils";

export interface ChatInputProps
    extends Omit<TextareaAutosizeProps, "className" | "children"> {
    className?: string;
}

const ChatInput = forwardRef<HTMLTextAreaElement, ChatInputProps>(
    ({ className, ...props }, ref) => {
        return (
            <TextareaAutosize
                ref={ref}
                className={cn(
                    "flex w-full rounded-md bg-gradient-to-b from-[#1a1a1a] to-[#1c1c1c]",
                    "px-4 py-3 text-sm ring-offset-background",
                    "border border-[#27272A]/50 shadow-inner",
                    "placeholder:text-muted-foreground/50",
                    "hover:bg-[#1d1d1d] hover:border-[#27272A]/80",
                    "focus:border-[#7f00ff]/50 focus:shadow-[0_0_0_1px_rgba(127,0,255,0.1)]",
                    "focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#7f00ff]/20",
                    "disabled:cursor-not-allowed disabled:opacity-50",
                    "transition-all duration-200 ease-out",
                    className
                )}
                minRows={1}
                maxRows={4}
                {...props}
            />
        );
    }
);

ChatInput.displayName = "ChatInput";

export { ChatInput };
