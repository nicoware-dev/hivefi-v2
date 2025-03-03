import { useCallback, useEffect, useRef, useState } from "react";

interface UseAutoScrollOptions {
    offset?: number;
    smooth?: boolean;
}

export function useAutoScroll({ offset = 100, smooth = false }: UseAutoScrollOptions = {}) {
    const scrollRef = useRef<HTMLDivElement>(null);
    const [isAtBottom, setIsAtBottom] = useState(true);
    const [autoScroll, setAutoScroll] = useState(true);

    const scrollToBottom = useCallback(() => {
        if (!scrollRef.current) return;

        const scrollOptions: ScrollToOptions = {
            top: scrollRef.current.scrollHeight,
            behavior: smooth ? "smooth" : "auto",
        };

        scrollRef.current.scrollTo(scrollOptions);
        setIsAtBottom(true);
        setAutoScroll(true);
    }, [smooth]);

    const handleScroll = useCallback(() => {
        if (!scrollRef.current) return;

        const { scrollTop, scrollHeight, clientHeight } = scrollRef.current;
        const isBottom = scrollHeight - (scrollTop + clientHeight) <= offset;

        setIsAtBottom(isBottom);
        if (isBottom) setAutoScroll(true);
    }, [offset]);

    const disableAutoScroll = useCallback(() => {
        if (!scrollRef.current) return;

        const { scrollTop, scrollHeight, clientHeight } = scrollRef.current;
        const isBottom = scrollHeight - (scrollTop + clientHeight) <= offset;

        if (!isBottom) {
            setAutoScroll(false);
        }
    }, [offset]);

    useEffect(() => {
        const scrollElement = scrollRef.current;
        if (!scrollElement) return;

        scrollElement.addEventListener("scroll", handleScroll);
        return () => scrollElement.removeEventListener("scroll", handleScroll);
    }, [handleScroll]);

    useEffect(() => {
        if (autoScroll) {
            scrollToBottom();
        }
    }, [autoScroll, scrollToBottom]);

    return {
        scrollRef,
        isAtBottom,
        scrollToBottom,
        disableAutoScroll,
    };
}
