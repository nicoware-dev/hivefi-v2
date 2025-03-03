import React from 'react';

interface ChatMessageListProps {
  children: React.ReactNode;
  isAtBottom?: boolean;
  scrollToBottom?: () => void;
}

export const ChatMessageList = React.forwardRef<HTMLDivElement, ChatMessageListProps>(
  ({ children, scrollToBottom }, ref) => {
    return (
      <div
        ref={ref}
        className="h-[calc(100vh-88px)] overflow-y-auto"
        style={{
          scrollBehavior: 'smooth',
          WebkitOverflowScrolling: 'touch'
        }}
      >
        {children}
      </div>
    );
  }
);

ChatMessageList.displayName = 'ChatMessageList';
