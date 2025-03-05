import { useEffect, useState } from 'react';
import { useAuth, useWallet } from '@crossmint/client-sdk-react-ui';

/**
 * Custom hook to handle Crossmint session persistence
 * This hook will check if the user was previously connected and restore the session
 */
export function useCrossmintSession() {
  const { jwt, login } = useAuth();
  const { wallet } = useWallet();
  const [attemptedRestore, setAttemptedRestore] = useState(false);

  // Handle session restoration on page load
  useEffect(() => {
    // Only attempt to restore the session once
    if (attemptedRestore) return;

    // Check if the user was previously connected
    const wasConnected = localStorage.getItem('crossmint-connected') === 'true';
    
    // If the user was connected but doesn't have a wallet, try to restore the session
    if (wasConnected && !wallet && !jwt) {
      console.log('Attempting to restore session after refresh...');
      
      // We'll try to silently restore the session
      const restoreSession = async () => {
        try {
          // This will attempt to use any existing cookies/local storage to restore the session
          await login();
          console.log('Session restored successfully');
        } catch (error) {
          console.error('Failed to restore session:', error);
          // Remove the connected flag if we couldn't restore the session
          localStorage.removeItem('crossmint-connected');
        } finally {
          // Mark that we've attempted to restore the session
          setAttemptedRestore(true);
        }
      };
      
      // Add a small delay to ensure everything is loaded
      setTimeout(() => {
        restoreSession();
      }, 500);
    } else {
      setAttemptedRestore(true);
    }
  }, [jwt, login, wallet, attemptedRestore]);

  // Reset the attempted restore flag when the user signs out
  useEffect(() => {
    if (!jwt && !wallet && attemptedRestore) {
      // Check if the user was previously connected
      const wasConnected = localStorage.getItem('crossmint-connected') === 'true';
      
      if (!wasConnected) {
        // Reset the flag so we can attempt to restore the session again
        setAttemptedRestore(false);
      }
    }
  }, [jwt, wallet, attemptedRestore]);

  return { 
    wasConnected: localStorage.getItem('crossmint-connected') === 'true',
    attemptedRestore
  };
} 