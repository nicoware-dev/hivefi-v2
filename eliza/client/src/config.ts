// API Configuration
const getBaseUrl = () => {
    const port = import.meta.env.VITE_SERVER_PORT || 3000;

    // For local development
    if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
        return `http://localhost:${port}`;
    }

    // For Vercel deployment
    if (import.meta.env.VITE_BACKEND_URL) {
        const url = import.meta.env.VITE_BACKEND_URL;
        // Remove trailing slash if present
        return url.endsWith('/') ? url.slice(0, -1) : url;
    }

    // Fallback to local development
    return `http://localhost:${port}`;
};

export const API_BASE_URL = getBaseUrl();

// API Endpoints
export const API_ENDPOINTS = {
    agents: `${API_BASE_URL}/agents`,
    events: `${API_BASE_URL}/events`,
    messages: (agentId: string) => `${API_BASE_URL}/${agentId}/message`,
    agentDetails: (agentId: string) => `${API_BASE_URL}/agents/${agentId}`,
};
