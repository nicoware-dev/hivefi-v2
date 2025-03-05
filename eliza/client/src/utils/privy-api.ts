/**
 * Utility functions for interacting with Privy APIs
 */

// Determine if we're in production (Vercel) or development
const isProduction = import.meta.env.PROD;

// Base URL for Privy API
const PRIVY_BASE_URL = 'https://auth.privy.io/api/v1';

// API endpoints configuration
export const PRIVY_API_CONFIG = {
  // Analytics endpoint
  analytics: isProduction 
    ? `/api/privy/analytics`
    : `${PRIVY_BASE_URL}/analytics_events`,
};

/**
 * Send analytics events to Privy with proper CORS handling
 * @param data The analytics event data to send
 * @param headers Optional additional headers
 * @returns Promise that resolves when the request completes
 */
export async function sendPrivyAnalytics(data: any, headers: Record<string, string> = {}) {
  try {
    // In development, we'll use no-cors mode to avoid CORS errors
    // In production, we'll use our proxy
    const fetchOptions: RequestInit = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...headers
      },
      body: JSON.stringify(data),
    };
    
    // In development, use no-cors mode
    if (!isProduction) {
      fetchOptions.mode = 'no-cors';
    }
    
    const response = await fetch(PRIVY_API_CONFIG.analytics, fetchOptions);
    
    // In development with no-cors, we can't read the response
    if (!isProduction) {
      return { success: true };
    }
    
    // In production, we can read the response
    if (response.ok) {
      return await response.json();
    } else {
      console.warn('Privy analytics request failed:', response.status, response.statusText);
      return { success: false, error: response.statusText };
    }
  } catch (error) {
    console.error('Error sending Privy analytics:', error);
    return { success: false, error: String(error) };
  }
} 