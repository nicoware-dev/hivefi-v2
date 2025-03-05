import React from 'react';
import { CrossmintConnectWallet } from './crossmint-connect-wallet';
import { PrivyConnectWallet } from './privy-connect-wallet';

interface WalletSelectorProps {
    defaultProvider?: 'privy' | 'crossmint';
    onProviderChange?: (provider: 'privy' | 'crossmint') => void;
}

export const WalletSelector: React.FC<WalletSelectorProps> = ({
    defaultProvider = 'privy',
    onProviderChange
}) => {
    const [selectedProvider, setSelectedProvider] = React.useState<'privy' | 'crossmint'>(defaultProvider);

    const handleProviderChange = (provider: 'privy' | 'crossmint') => {
        setSelectedProvider(provider);
        onProviderChange?.(provider);
    };

    return (
        <div className="flex flex-col items-center gap-4 p-4">
            <div className="flex items-center gap-4 mb-4">
                <button
                    onClick={() => handleProviderChange('privy')}
                    className={`px-4 py-2 rounded-lg transition-colors ${
                        selectedProvider === 'privy'
                            ? 'bg-blue-500 text-white'
                            : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    }`}
                >
                    Privy
                </button>
                <button
                    onClick={() => handleProviderChange('crossmint')}
                    className={`px-4 py-2 rounded-lg transition-colors ${
                        selectedProvider === 'crossmint'
                            ? 'bg-blue-500 text-white'
                            : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    }`}
                >
                    Crossmint
                </button>
            </div>
            
            <div className="w-full max-w-md">
                {selectedProvider === 'privy' ? (
                    <PrivyConnectWallet />
                ) : (
                    <CrossmintConnectWallet />
                )}
            </div>
        </div>
    );
}; 