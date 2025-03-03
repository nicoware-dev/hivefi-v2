const MESSAGE_HISTORY_PREFIX = 'chat_history_';
const MAX_MESSAGES = 30; // Maximum number of messages to store per agent

export interface StoredMessage {
    text: string;
    user: string;
    timestamp: number;
    attachments?: Array<{
        url: string;
        contentType: string;
        title: string;
    }>;
}

export const messageStorage = {
    getMessages: (agentId: string): StoredMessage[] => {
        try {
            const stored = localStorage.getItem(`${MESSAGE_HISTORY_PREFIX}${agentId}`);
            return stored ? JSON.parse(stored) : [];
        } catch (error) {
            console.error('Error reading messages from storage:', error);
            return [];
        }
    },

    saveMessages: (agentId: string, messages: StoredMessage[]) => {
        try {
            // Keep only the last MAX_MESSAGES messages
            const trimmedMessages = messages.slice(-MAX_MESSAGES);
            localStorage.setItem(
                `${MESSAGE_HISTORY_PREFIX}${agentId}`,
                JSON.stringify(trimmedMessages)
            );
        } catch (error) {
            console.error('Error saving messages to storage:', error);
        }
    },

    clearHistory: (agentId: string) => {
        try {
            localStorage.removeItem(`${MESSAGE_HISTORY_PREFIX}${agentId}`);
        } catch (error) {
            console.error('Error clearing message history:', error);
        }
    },

    clearAllHistory: () => {
        try {
            Object.keys(localStorage)
                .filter(key => key.startsWith(MESSAGE_HISTORY_PREFIX))
                .forEach(key => localStorage.removeItem(key));
        } catch (error) {
            console.error('Error clearing all message history:', error);
        }
    }
}; 