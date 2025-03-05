import React, { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import { RouterProvider } from "react-router-dom";
import { router } from "./router";
import { WalletProvider } from "./components/providers/wallet-provider";
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
// Keep imports but don't use Crossmint for now
import { CrossmintProviders } from "./components/providers/crossmint-provider";
import { CrossmintWalletProvider } from "./components/providers/crossmint-wallet-provider";
import { PrivyProvider } from "./components/providers/privy-provider";
import { PrivyWalletProvider } from "./components/providers/privy-wallet-provider";

// Simple Error Boundary Component
class ErrorBoundary extends React.Component<{ children: React.ReactNode }, { hasError: boolean, error: Error | null }> {
    constructor(props: { children: React.ReactNode }) {
        super(props);
        this.state = { hasError: false, error: null };
    }

    static getDerivedStateFromError(error: Error) {
        console.error('Error caught by boundary:', error);
        return { hasError: true, error };
    }

    componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
        console.error('Error details:', error, errorInfo);
    }

    render() {
        if (this.state.hasError) {
            return (
                <div className="flex flex-col items-center justify-center min-h-screen p-4">
                    <h1 className="text-2xl font-bold mb-4">Something went wrong</h1>
                    <pre className="bg-gray-100 p-4 rounded overflow-auto max-w-full">
                        {this.state.error?.toString()}
                    </pre>
                    <button 
                        className="mt-4 px-4 py-2 bg-blue-500 text-white rounded"
                        onClick={() => window.location.reload()}
                    >
                        Refresh the page
                    </button>
                </div>
            );
        }
        return this.props.children;
    }
}

console.log('Starting application...');

const rootElement = document.getElementById("root");
if (!rootElement) throw new Error("Root element not found");

const root = createRoot(rootElement);

window.addEventListener('unhandledrejection', event => {
    console.error('Unhandled promise rejection:', event.reason);
});

// Create a client
const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            staleTime: 5 * 60 * 1000,
            retry: 1,
        },
    },
});

// Only use Privy for now, keep Crossmint code for future use
const USE_PRIVY = true;
const USE_CROSSMINT = false;

console.log("Using Privy:", USE_PRIVY);
console.log("Privy App ID:", import.meta.env.VITE_PRIVY_APP_ID ? "Present" : "Missing");

root.render(
    <StrictMode>
        <ErrorBoundary>
            <QueryClientProvider client={queryClient}>
                <PrivyProvider>
                    <PrivyWalletProvider>
                        <RouterProvider router={router} />
                    </PrivyWalletProvider>
                </PrivyProvider>
            </QueryClientProvider>
        </ErrorBoundary>
    </StrictMode>
);
