export function ChatInput({ onSubmit }: ChatInputProps) {
    return (
        <form onSubmit={handleSubmit} className="border-t border-white/[0.08] bg-background p-4">
            <div className="relative flex items-center">
                <textarea
                    ref={textareaRef}
                    placeholder="Message Swarm Coordinator..."
                    className="flex-1 resize-none bg-background-secondary rounded-lg px-4 py-3 focus:outline-none focus:ring-1 focus:ring-sky-400/50"
                    rows={1}
                    value={message}
                    onChange={handleChange}
                    onKeyDown={handleKeyDown}
                />
                <Button 
                    type="submit" 
                    size="icon"
                    className="absolute right-2 bg-sky-400 text-black hover:bg-sky-400/90"
                    disabled={!message.trim()}
                >
                    <Send className="h-4 w-4" />
                </Button>
            </div>
        </form>
    );
} 