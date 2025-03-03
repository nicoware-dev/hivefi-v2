import { useCallback, useEffect, useRef } from 'react';

interface UseAutoScrollOptions {
  smooth?: boolean;
}

export function useAutoScroll(options: UseAutoScrollOptions = {}) {
  const scrollRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = useCallback(() => {
    if (scrollRef.current) {
      const scrollContainer = scrollRef.current;
      scrollContainer.scrollTo({
        top: scrollContainer.scrollHeight,
        behavior: options.smooth ? 'smooth' : 'auto'
      });
    }
  }, []);

  return {
    scrollRef,
    scrollToBottom,
  };
}
