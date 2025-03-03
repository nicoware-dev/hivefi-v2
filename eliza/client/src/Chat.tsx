import { useState, useRef, useEffect, useCallback } from "react";
import { useParams, useOutletContext } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { API_ENDPOINTS } from "@/config";
import {
    ChatBubble,
    ChatBubbleMessage,
    ChatBubbleTimestamp,
} from "@/components/ui/chat/chat-bubble";
import { ChatMessageList } from "@/components/ui/chat/chat-message-list";
import { useAutoScroll } from "./hooks/use-auto-scroll";
import { moment } from "@/lib/utils";
import "./App.css";
import CopyButton from "@/components/copy-button";
import { ChatInput } from "@/components/ui/chat/chat-input";
import { Send } from "lucide-react";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ChatFileInput } from "@/components/ui/chat/chat-file-input";
import { messageStorage, StoredMessage } from "@/lib/storage";

type TextResponse = {
    text: string;
    user: string;
    isLoading?: boolean;
    attachments?: Array<{
        url: string;
        contentType: string;
        title: string;
    }>;
};

interface Character {
    name: string;
}

interface AgentResponse {
    id: string;
    character: Character;
}

interface Agent {
    id: string;
    name: string;
}

interface OutletContextType {
    headerSlot: boolean;
}

export default function Chat() {
    const { agentId } = useParams<{ agentId: string }>();
    const [input, setInput] = useState("");
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [messageCount, setMessageCount] = useState(0);
    const inputRef = useRef<HTMLTextAreaElement>(null);
    const { headerSlot } = useOutletContext<OutletContextType>();

    const { scrollRef, scrollToBottom } = useAutoScroll({
        smooth: true,
    });

    // Add queryClient to get messages
    const queryClient = useQueryClient();
    
    // Load initial messages from storage when component mounts
    useEffect(() => {
        if (agentId) {
            const storedMessages = messageStorage.getMessages(agentId);
            queryClient.setQueryData(["messages", agentId], storedMessages);
            setMessageCount(storedMessages.length);
        }
    }, [agentId, queryClient]);

    // Query for messages
    const { data: messages = [] } = useQuery<TextResponse[]>({
        queryKey: ["messages", agentId],
        queryFn: () => {
            if (!agentId) return [];
            return queryClient.getQueryData(["messages", agentId]) || [];
        },
        enabled: !!agentId,
    });

    // Update message count whenever messages change
    useEffect(() => {
        const nonLoadingMessages = messages.filter(msg => !msg.isLoading);
        setMessageCount(nonLoadingMessages.length);
    }, [messages]);

    // Function to clear chat history
    const clearChatHistory = useCallback(() => {
        if (agentId) {
            messageStorage.clearHistory(agentId);
            setMessageCount(0);
            queryClient.setQueryData(["messages", agentId], []);
            // Force immediate re-render
            queryClient.invalidateQueries({
                queryKey: ["messages", agentId],
                exact: true,
                refetchType: "all"
            });
        }
    }, [agentId, queryClient]);

    // Save messages to storage whenever they change
    useEffect(() => {
        if (agentId && messages.length > 0) {
            const messagesToStore = messages
                .filter(msg => !msg.isLoading)
                .map(msg => ({
                    text: msg.text,
                    user: msg.user,
                    timestamp: Date.now(),
                    attachments: msg.attachments
                }));
            messageStorage.saveMessages(agentId, messagesToStore);
        }
    }, [agentId, messages]);

    // Fetch agent details
    const { data: agent, isLoading, error } = useQuery<Agent>({
        queryKey: ["agent", agentId],
        queryFn: async () => {
            if (!agentId) throw new Error("No agent ID provided");
            try {
                const res = await fetch(API_ENDPOINTS.agentDetails(agentId));
                if (!res.ok) {
                    throw new Error(`Failed to fetch agent: ${res.status}`);
                }
                const data: AgentResponse = await res.json();
                return {
                    id: data.id,
                    name: data.character.name
                };
            } catch (err) {
                console.error('Error fetching agent:', err);
                throw err;
            }
        },
        enabled: !!agentId,
        retry: 1,
    });

    // Scroll to bottom when messages change
    useEffect(() => {
        const timer = setTimeout(scrollToBottom, 100);
        return () => clearTimeout(timer);
    }, [messages.length, scrollToBottom]);

    const mutation = useMutation({
        mutationFn: async (text: string) => {
            if (!agentId) throw new Error("No agent ID provided");
            try {
                const formData = new FormData();
                formData.append("text", text);
                formData.append("user", "user");

                if (selectedFile) {
                    formData.append("file", selectedFile);
                }

                const res = await fetch(API_ENDPOINTS.messages(agentId), {
                    method: "POST",
                    headers: {
                        Accept: "application/json"
                    },
                    body: formData,
                });

                if (!res.ok) {
                    const errorText = await res.text();
                    console.error("Error response:", errorText);
                    throw new Error(`Failed to send message: ${res.status}`);
                }
                return res.json() as Promise<TextResponse[]>;
            } catch (err) {
                console.error('Error sending message:', err);
                throw err;
            }
        },
        onSuccess: (data) => {
            const newMessages = data.map(msg => ({
                ...msg,
                timestamp: Date.now(),
            }));
            
            queryClient.setQueryData(
                ["messages", agentId],
                (old: TextResponse[] = []) => {
                    const updatedMessages = [
                        ...old.filter((msg) => !msg.isLoading),
                        ...newMessages
                    ];
                    // Update message count immediately after successful message
                    setMessageCount(updatedMessages.length);
                    return updatedMessages;
                }
            );
            
            // Force a re-render
            queryClient.invalidateQueries({
                queryKey: ["messages", agentId],
                exact: true
            });
        },
        onError: (error) => {
            console.error('Mutation error:', error);
            queryClient.setQueryData(
                ["messages", agentId],
                (old: TextResponse[] = []) => {
                    const filteredMessages = old.filter(msg => !msg.isLoading);
                    setMessageCount(filteredMessages.length);
                    return filteredMessages;
                }
            );
        },
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!input.trim() || !agentId) return;

        const attachments = selectedFile ? [{
            url: URL.createObjectURL(selectedFile),
            contentType: selectedFile.type,
            title: selectedFile.name,
        }] : undefined;

        const userMessage: TextResponse = {
            text: input.trim(),
            user: "user",
            attachments,
        };

        const loadingMessage: TextResponse = {
            text: "",  // Empty text for loading message
            user: "assistant",
            isLoading: true,
        };

        // Update messages immediately with user message and loading state
        const currentMessages = queryClient.getQueryData<TextResponse[]>(["messages", agentId]) || [];
        const updatedMessages = [...currentMessages, userMessage, loadingMessage];
        queryClient.setQueryData(["messages", agentId], updatedMessages);

        setInput("");
        setSelectedFile(null);

        try {
            const formData = new FormData();
            formData.append("text", input.trim());
            formData.append("user", "user");

            if (selectedFile) {
                formData.append("file", selectedFile);
            }

            const res = await fetch(API_ENDPOINTS.messages(agentId), {
                method: "POST",
                headers: {
                    Accept: "application/json"
                },
                body: formData,
            });

            if (!res.ok) {
                const errorText = await res.text();
                console.error("Error response:", errorText);
                throw new Error(`Failed to send message: ${res.status}`);
            }

            const data = await res.json() as TextResponse[];
            const newMessages = data.map((msg: TextResponse) => ({
                ...msg,
                timestamp: Date.now(),
            }));

            // Update messages with response
            const finalMessages = [
                ...currentMessages,
                userMessage,
                ...newMessages
            ];

            queryClient.setQueryData(["messages", agentId], finalMessages);
            setMessageCount(finalMessages.length);

            // Save to storage
            const storedMessages: StoredMessage[] = finalMessages.map(msg => ({
                text: msg.text,
                user: msg.user,
                timestamp: Date.now(),
                attachments: msg.attachments
            }));
            messageStorage.saveMessages(agentId, storedMessages);

            // Force a re-render
            queryClient.invalidateQueries({
                queryKey: ["messages", agentId],
                exact: true
            });
        } catch (error) {
            console.error('Error sending message:', error);
            // Remove loading message on error
            const errorMessages = queryClient.getQueryData<TextResponse[]>(["messages", agentId]) || [];
            const cleanMessages = errorMessages.filter(msg => !msg.isLoading);
            queryClient.setQueryData(["messages", agentId], cleanMessages);
            setMessageCount(cleanMessages.length);
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            if (e.nativeEvent.isComposing) return;
            handleSubmit(e as unknown as React.FormEvent<HTMLFormElement>);
        }
    };

    // Return header content if in header slot
    if (headerSlot) {
        return (
            <div className="flex items-center gap-4">
                <span className="font-medium">
                    {isLoading ? 'Loading...' : agent?.name || 'No agent selected'}
                </span>
                {agent && (
                    <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 px-2 text-muted-foreground hover:text-destructive hover:bg-destructive/10 disabled:opacity-50"
                        onClick={clearChatHistory}
                        disabled={messageCount === 0}
                        title={messageCount === 0 ? "No messages to clear" : "Clear chat history"}
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2"><path d="M3 6h18"></path><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path></svg>
                        Clear History
                    </Button>
                )}
            </div>
        );
    }

    return (
        <TooltipProvider>
            <div className="flex flex-col w-full h-[calc(100vh-115px)]">
                {/* Messages container */}
                <div
                    ref={scrollRef}
                    className="flex-1 overflow-y-auto pb-[100px] w-full"
                >
                    <div className="w-full max-w-3xl mx-auto px-3 sm:px-6 py-4 sm:py-6">
                        <div className="flex flex-col space-y-6 w-full">
                            {messages.length > 0 ? (
                                messages.map((message, idx) => (
                                    <ChatBubble
                                        key={`${message.user}-${idx}-${message.text}`}
                                        variant={message.user === "user" ? "sent" : "received"}
                                    >
                                        <ChatBubbleMessage isLoading={message.isLoading}>
                                            {message.user === "user" ? (
                                                <div>
                                                    <div className="whitespace-pre-wrap">{message.text}</div>
                                                    {message.attachments?.map((attachment) => (
                                                        <div
                                                            key={attachment.url}
                                                            className="mt-2 rounded-md overflow-hidden border border-[#27272A]"
                                                        >
                                                            {attachment.contentType.startsWith("image/") && (
                                                                <img
                                                                    src={attachment.url}
                                                                    alt={attachment.title}
                                                                    className="max-w-[200px] h-auto object-contain"
                                                                />
                                                            )}
                                                        </div>
                                                    ))}
                                                </div>
                                            ) : message.isLoading ? null : (
                                                <div className="prose prose-invert prose-sm max-w-none">
                                                    <ReactMarkdown
                                                        remarkPlugins={[remarkGfm]}
                                                        components={{
                                                            p: ({node, ...props}) => <p className="mb-2 last:mb-0 whitespace-pre-line" {...props} />,
                                                            a: ({node, ...props}) => <a className="text-[#7f00ff] hover:underline cursor-pointer" {...props} />,
                                                            ul: ({node, ...props}) => <ul className="list-disc list-inside mb-2" {...props} />,
                                                            ol: ({node, ...props}) => <ol className="list-decimal list-inside mb-2" {...props} />,
                                                            li: ({node, ...props}) => <li className="mb-1" {...props} />,
                                                            code: ({inline, ...props}: {inline?: boolean} & React.HTMLProps<HTMLElement>) =>
                                                                inline ? (
                                                                    <code className="bg-black/30 rounded px-1 py-0.5" {...props} />
                                                                ) : (
                                                                    <code className="block bg-black/30 rounded p-2 my-2 overflow-x-auto" {...props} />
                                                                ),
                                                            pre: ({node, ...props}) => <pre className="bg-black/30 rounded p-2 my-2 overflow-x-auto" {...props} />,
                                                            h1: ({node, ...props}) => <h1 className="text-lg font-bold mb-2" {...props} />,
                                                            h2: ({node, ...props}) => <h2 className="text-base font-bold mb-2" {...props} />,
                                                            h3: ({node, ...props}) => <h3 className="text-sm font-bold mb-2" {...props} />,
                                                            blockquote: ({node, ...props}) => <blockquote className="border-l-2 border-[#7f00ff] pl-4 my-2 italic" {...props} />,
                                                            table: ({node, ...props}) => <div className="overflow-x-auto my-2"><table className="min-w-full divide-y divide-[#27272A]" {...props} /></div>,
                                                            th: ({node, ...props}) => <th className="px-3 py-2 text-left text-sm font-semibold" {...props} />,
                                                            td: ({node, ...props}) => <td className="px-3 py-2 text-sm" {...props} />,
                                                            div: ({className, ...props}: React.HTMLProps<HTMLDivElement>) => {
                                                                if (className?.includes('Position Summary') || className?.includes('Account Status')) {
                                                                    return <div className="bg-black/20 rounded-lg p-3 my-2 space-y-1" {...props} />;
                                                                }
                                                                return <div {...props} />;
                                                            },
                                                            strong: ({children, ...props}: React.HTMLProps<HTMLElement>) => {
                                                                const text = String(children);
                                                                if (text.startsWith('Successfully')) {
                                                                    return <strong className="text-green-400 font-medium" {...props}>{children}</strong>;
                                                                }
                                                                return <strong className="font-medium" {...props}>{children}</strong>;
                                                            }
                                                        }}
                                                    >
                                                        {message.text}
                                                    </ReactMarkdown>
                                                    {message.attachments?.map((attachment) => (
                                                        <div
                                                            key={attachment.url}
                                                            className="mt-2 rounded-md overflow-hidden border border-[#27272A]"
                                                        >
                                                            {attachment.contentType.startsWith("image/") && (
                                                                <img
                                                                    src={attachment.url}
                                                                    alt={attachment.title}
                                                                    className="max-w-[200px] h-auto object-contain"
                                                                />
                                                            )}
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </ChatBubbleMessage>
                                        <div className="flex items-center justify-between gap-2">
                                            <div className="flex items-center gap-1">
                                                {!message.isLoading && (
                                                    <>
                                                        <CopyButton text={message.text} />
                                                        {idx === messages.length - 1 && message.user === "user" && (
                                                            <Button
                                                                variant="ghost"
                                                                size="icon"
                                                                className="h-6 w-6 hover:bg-destructive/10 hover:text-destructive"
                                                                onClick={() => {
                                                                    if (agentId) {
                                                                        messageStorage.clearHistory(agentId);
                                                                        queryClient.setQueryData(["messages", agentId], []);
                                                                    }
                                                                }}
                                                                title="Clear chat history"
                                                            >
                                                                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-muted-foreground hover:text-destructive"><path d="M3 6h18"></path><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path></svg>
                                                            </Button>
                                                        )}
                                                    </>
                                                )}
                                            </div>
                                            <ChatBubbleTimestamp variant={message.user === "user" ? "sent" : "received"}>
                                                {moment().format("LT")}
                                            </ChatBubbleTimestamp>
                                        </div>
                                    </ChatBubble>
                                ))
                            ) : (
                                <div className="h-[calc(100vh-200px)] flex items-center justify-center">
                                    <div className="text-muted-foreground text-center">
                                        {agent ? (
                                            `No messages yet. Start a conversation with ${agent.name}!`
                                        ) : (
                                            "⬅️ Please select an agent from the sidebar to start chatting"
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Input form */}
                <div className="fixed bottom-0 left-0 right-0 border-t border-[#27272A] bg-[#121212]/80 backdrop-blur-sm z-10">
                    <div className="max-w-3xl mx-auto p-4">
                        <form onSubmit={handleSubmit} className="flex flex-col gap-2">
                            <div className="flex items-end gap-2">
                                <div className="flex-1 relative rounded-md border bg-card">
                                    {selectedFile && (
                                        <div className="absolute bottom-full mb-2">
                                            <ChatFileInput
                                                selectedFile={selectedFile}
                                                onFileSelect={setSelectedFile}
                                            />
                                        </div>
                                    )}
                                    <ChatInput
                                        ref={inputRef}
                                        value={input}
                                        onChange={(e) => setInput(e.target.value)}
                                        onKeyDown={handleKeyDown}
                                        placeholder={isLoading ? "Loading..." : agent ? `Message ${agent.name}...` : "Select an agent..."}
                                        className="min-h-12 resize-none rounded-md bg-[#1a1a1a] border-[#27272A] focus:border-[#7f00ff] focus:ring-[#7f00ff] p-3 shadow-none focus-visible:ring-0"
                                        disabled={isLoading || mutation.isPending || !agent}
                                    />
                                </div>
                                <div className="flex gap-2">
                                    {!selectedFile && (
                                        <ChatFileInput
                                            selectedFile={selectedFile}
                                            onFileSelect={setSelectedFile}
                                        />
                                    )}
                                    <Button
                                        type="submit"
                                        disabled={(!input.trim() && !selectedFile) || isLoading || mutation.isPending || !agent}
                                        className="h-12 gap-1.5 bg-[#7f00ff] text-white hover:bg-[#7f00ff]/90"
                                    >
                                        {mutation.isPending ? "..." : "Send"}
                                        <Send className="h-4 w-4" />
                                    </Button>
                                </div>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </TooltipProvider>
    );
}
