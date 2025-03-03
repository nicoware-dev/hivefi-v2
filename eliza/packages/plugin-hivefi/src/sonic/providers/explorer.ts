import {
    IAgentRuntime,
    Memory,
    Provider,
    State,
    elizaLogger,
} from "@elizaos/core";
import { createPublicClient, http } from "viem";
import { sonicChain } from "../config/chains";

const SONIC_EXPLORER_API = "https://api.sonicscan.org/api";

// Cache configuration
const CACHE_DURATION = 30 * 1000; // 30 seconds for blockchain data
const RATE_LIMIT_DURATION = 60 * 1000; // 1 minute
const MAX_REQUESTS_PER_MINUTE = 30;

// Interfaces for API responses
interface AccountInfo {
    address: string;
    balance: string;
    token_transfers_count: number;
    transactions_count: number;
    implementation_name?: string;
    implementation_address?: string;
    token?: {
        name: string;
        symbol: string;
        total_supply: string;
        decimals: number;
    };
}

interface BlockInfo {
    height: number;
    hash: string;
    timestamp: string;
    transactions_count: number;
    miner: {
        hash: string;
    };
    size: number;
    gas_used: string;
    gas_limit: string;
}

interface NetworkStats {
    total_blocks: number;
    total_addresses: number;
    total_transactions: number;
    average_block_time: number;
    market_cap: string;
    total_supply: string;
    circulating_supply: string;
}

interface TokenInfo {
    address: string;
    name: string;
    symbol: string;
    total_supply: string;
    decimals: number;
    holders_count: number;
    transfers_count: number;
    type: string;
}

// Cache state
interface CacheData {
    [key: string]: {
        data: any;
        timestamp: number;
    };
}

let cache: CacheData = {};
let requestTimestamps: number[] = [];

function isRateLimited(): boolean {
    const now = Date.now();
    requestTimestamps = requestTimestamps.filter(time => now - time < RATE_LIMIT_DURATION);
    return requestTimestamps.length >= MAX_REQUESTS_PER_MINUTE;
}

function getCachedData(key: string): any {
    const cached = cache[key];
    if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
        return cached.data;
    }
    return null;
}

function setCachedData(key: string, data: any): void {
    cache[key] = {
        data,
        timestamp: Date.now(),
    };
}

// Add Block interface
interface Block {
    number: number;
    hash: string;
    timestamp: number;
    transaction_count: number;
    size: number;
    gas_used: string;
    gas_limit: string;
}

// Update fetchFromAPI to handle query parameters
async function fetchFromAPI(params: Record<string, string>, runtime: IAgentRuntime): Promise<any> {
    console.log('DEBUG: Starting API request with params:', JSON.stringify(params));
    
    if (isRateLimited()) {
        console.log('WARN: Rate limit reached');
        throw new Error("Rate limit reached");
    }

    requestTimestamps.push(Date.now());
    
    const apiKey = runtime.getSetting("SONIC_EXPLORER_API_KEY");
    if (!apiKey) {
        console.log('ERROR: SONIC_EXPLORER_API_KEY not found in runtime settings');
        throw new Error("SONIC_EXPLORER_API_KEY is not set in environment variables");
    }

    try {
        const queryParams = new URLSearchParams({
            ...params,
            apikey: apiKey
        });

        const url = `${SONIC_EXPLORER_API}?${queryParams.toString()}`;
        console.log('DEBUG: Making API request to:', url.replace(apiKey, '[REDACTED]'));
        
        const response = await fetch(url, {
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            }
        });
        
        console.log('DEBUG: API Response received:', {
            status: response.status,
            statusText: response.statusText,
            contentType: response.headers.get('content-type')
        });

        if (!response.ok) {
            throw new Error(`API request failed: ${response.status} ${response.statusText}`);
        }

        const responseText = await response.text();
        console.log('DEBUG: Raw response text:', responseText);

        let data;
        try {
            data = JSON.parse(responseText);
        } catch (e) {
            console.log('ERROR: Failed to parse JSON response:', e);
            throw new Error(`Invalid JSON response from API: ${responseText}`);
        }

        // Handle different response formats
        if (data.jsonrpc === "2.0") {
            // Handle JSON-RPC responses
            if (data.error) {
                throw new Error(`JSON-RPC error: ${data.error.message || JSON.stringify(data.error)}`);
            }
            return data;
        } else {
            // Handle REST API responses
            if (data.status === '0' || data.message === 'NOTOK' || data.error) {
                throw new Error(`API Error: ${data.result || data.message || data.error}`);
            }
            return data;
        }
    } catch (error) {
        console.log('ERROR: API request failed:', {
            params: params,
            error: error instanceof Error ? {
                message: error.message,
                stack: error.stack
            } : error
        });
        throw error;
    }
}

// Helper function to convert hex to decimal
function hexToDecimal(hex: string): number {
    if (!hex) return 0;
    return parseInt(hex.replace('0x', ''), 16);
}

// Helper function to format S token values from wei
function formatSValue(weiValue: string | bigint | number): string {
    if (!weiValue) return '0';
    
    let value: number;
    if (typeof weiValue === 'string') {
        value = Number(BigInt(weiValue)) / 1e18;
    } else if (typeof weiValue === 'bigint') {
        value = Number(weiValue) / 1e18;
    } else {
        value = weiValue;
    }
    
    return value.toLocaleString(undefined, {
        minimumFractionDigits: 2,
        maximumFractionDigits: 6
    });
}

// Helper function to format currency values
function formatCurrency(value: number): string {
    return value.toLocaleString(undefined, {
        minimumFractionDigits: 2,
        maximumFractionDigits: 6
    });
}

async function getAccountInfo(address: string, runtime: IAgentRuntime): Promise<string> {
    const cacheKey = `account_${address}`;
    const cached = getCachedData(cacheKey);
    if (cached) return cached;

    try {
        // Get basic account info
        const balanceData = await fetchFromAPI({
            module: 'account',
            action: 'balance',
            address: address,
            tag: 'latest'
        }, runtime);

        // Get transaction count
        const txCountData = await fetchFromAPI({
            module: 'proxy',
            action: 'eth_getTransactionCount',
            address: address,
            tag: 'latest'
        }, runtime);

        const balance = formatSValue(balanceData.result || '0');
        const txCount = parseInt(txCountData.result || '0', 16);

        const formattedInfo = `# Account Information for \`${address}\`

## Balance
- Current Balance: ${balance} S

## Activity
- Total Transactions: ${txCount.toLocaleString()}

## Links
- View on Explorer: [SonicScan](https://sonicscan.org/address/${address})
- View Transactions: [Transaction History](https://sonicscan.org/address/${address}/transactions)

_Last Updated: ${new Date().toLocaleString()}_`;

        setCachedData(cacheKey, formattedInfo);
        return formattedInfo;
    } catch (error) {
        console.log("Failed to fetch account info:", error);
        if (error instanceof Error) {
            if (error.message.includes('404')) {
                return `Address ${address} not found on the Sonic network. Please verify the address and try again.`;
            }
            return `Error fetching account info: ${error.message}`;
        }
        return "Failed to fetch account information. Please try again later.";
    }
}

async function getLatestBlocks(runtime: IAgentRuntime): Promise<string> {
    const cacheKey = 'latest_blocks';
    const cached = getCachedData(cacheKey);
    if (cached) return cached;

    try {
        // Get latest block number first
        const blockNumberData = await fetchFromAPI({
            module: 'proxy',
            action: 'eth_blockNumber'
        }, runtime);

        const latestBlockNumber = parseInt(blockNumberData.result || '0', 16);
        
        // Get details for the latest block
        const blockData = await fetchFromAPI({
            module: 'proxy',
            action: 'eth_getBlockByNumber',
            tag: `0x${latestBlockNumber.toString(16)}`,
            boolean: 'true'
        }, runtime);

        const block = blockData.result;
        if (!block) {
            throw new Error("No block data returned");
        }

        const timestamp = new Date(parseInt(block.timestamp || '0', 16) * 1000);
        const gasUsed = parseInt(block.gasUsed || '0', 16);
        const gasLimit = parseInt(block.gasLimit || '0', 16);
        const txCount = block.transactions?.length || 0;

        const formattedBlock = `# Latest Block Information

## Block #${latestBlockNumber.toLocaleString()}
- Timestamp: ${timestamp.toLocaleString()}
- Transactions: ${txCount.toLocaleString()}
- Gas Used: ${formatSValue(gasUsed)} (${((gasUsed / gasLimit) * 100).toFixed(2)}%)
- Gas Limit: ${formatSValue(gasLimit)}
- Miner: \`${block.miner}\`

## Links
- View Block: [Block Details](https://sonicscan.org/block/${latestBlockNumber})
- View Transactions: [Block Transactions](https://sonicscan.org/block/${latestBlockNumber}/transactions)

_Last Updated: ${new Date().toLocaleString()}_`;

        setCachedData(cacheKey, formattedBlock);
        return formattedBlock;
    } catch (error) {
        console.log("Failed to fetch latest blocks:", error);
        if (error instanceof Error) {
            return `Error fetching latest blocks: ${error.message}`;
        }
        return "Failed to fetch latest blocks. Please try again later.";
    }
}

async function getNetworkStats(runtime: IAgentRuntime): Promise<string> {
    const cacheKey = 'network_stats';
    const cached = getCachedData(cacheKey);
    if (cached) return cached;

    try {
        // Fetch all required data in parallel
        const [supplyData, priceData, blockData] = await Promise.all([
            fetchFromAPI({
                module: 'stats',
                action: 'ethsupply'
            }, runtime),
            fetchFromAPI({
                module: 'stats',
                action: 'ethprice'
            }, runtime),
            fetchFromAPI({
                module: 'proxy',
                action: 'eth_blockNumber'
            }, runtime)
        ]);

        // Process data
        const totalSupply = formatSValue(supplyData.result || '0');
        const priceUSD = parseFloat(priceData.result?.ethusd || '0');
        const latestBlock = parseInt(blockData.result || '0', 16);
        const marketCap = (Number(supplyData.result || '0') / 1e18) * priceUSD;

        const result = `# Sonic Network Overview

## Market Statistics
- Current Price: $${formatSValue(priceUSD)}
- Market Cap: $${formatSValue(marketCap)}
- Total Supply: ${totalSupply} S

## Network Status
- Latest Block: ${latestBlock.toLocaleString()}
- Chain ID: 146

## Links
- Block Explorer: [SonicScan](https://sonicscan.org)
- Network Status: [Network Stats](https://sonicscan.org/stats)

_Last Updated: ${new Date().toLocaleString()}_
_Data Source: SonicScan Explorer_`;

        setCachedData(cacheKey, result);
        return result;
    } catch (error) {
        console.log("Failed to fetch network stats:", error);
        if (error instanceof Error) {
            return `Error fetching network stats: ${error.message}`;
        }
        return "Failed to fetch network statistics. Please try again later.";
    }
}

async function getTopTokens(runtime: IAgentRuntime): Promise<string> {
    const cacheKey = 'top_tokens';
    const cached = getCachedData(cacheKey);
    if (cached) return cached;

    try {
        const data = await fetchFromAPI({
            module: 'token',
            action: 'getTokenList'
        }, runtime);

        if (!data || !Array.isArray(data)) {
            throw new Error("Invalid token data format received");
        }

        const tokens: TokenInfo[] = data.slice(0, 5);
        const formattedTokens = tokens.map(token => `## ${token.name} (${token.symbol})
- Address: \`${token.address}\`
- Total Supply: ${parseFloat(token.total_supply).toLocaleString()}
- Decimals: ${token.decimals}
- Holders: ${token.holders_count.toLocaleString()}
- Transfers: ${token.transfers_count.toLocaleString()}
- Type: ${token.type}

View on Explorer: https://sonicscan.org/token/${token.address}`).join('\n\n');

        const result = `# Top Tokens on Sonic\n\n${formattedTokens}`;
        setCachedData(cacheKey, result);
        return result;
    } catch (error) {
        elizaLogger.error("Failed to fetch top tokens:", error);
        if (error instanceof Error) {
            return `Error fetching top tokens: ${error.message}`;
        }
        return "Failed to fetch top tokens. Please try again later.";
    }
}

// Create a public client for read-only operations
const publicClient = createPublicClient({
    chain: sonicChain,
    transport: http("https://rpc.soniclabs.com"),
});

export const explorerProvider: Provider = {
    get: async (runtime: IAgentRuntime, message: Memory, _state?: State): Promise<string | null> => {
        elizaLogger.debug("explorerProvider::get");
        
        const messageText = message.content?.text?.toLowerCase() || '';
        
        // Only respond to relevant queries
        if (!messageText.includes('network') && 
            !messageText.includes('stats') && 
            !messageText.includes('wallet') && 
            !messageText.includes('address') && 
            !messageText.includes('blocks')) {
            return null;
        }

        try {
            const apiKey = runtime.getSetting("SONIC_EXPLORER_API_KEY");
            if (!apiKey) {
                return "I need an API key to access the Sonic Explorer. Please set the SONIC_EXPLORER_API_KEY environment variable.";
            }

            // Check for address lookup
            const addressMatch = messageText.match(/(?:address|account|wallet)\s+(0x[a-fA-F0-9]{40})/i);
            if (addressMatch) {
                const address = addressMatch[1];
                try {
                    // Get basic account info
                    const balanceResponse = await fetch(
                        `${SONIC_EXPLORER_API}?module=account&action=balance&address=${address}&tag=latest&apikey=${apiKey}`
                    );
                    const balanceData = await balanceResponse.json();
                    
                    // Get transaction count
                    const txCountResponse = await fetch(
                        `${SONIC_EXPLORER_API}?module=proxy&action=eth_getTransactionCount&address=${address}&tag=latest&apikey=${apiKey}`
                    );
                    const txCountData = await txCountResponse.json();

                    // Check for REST API response format
                    if (balanceData.status !== "1" || !balanceData.result) {
                        throw new Error("Failed to fetch balance data");
                    }

                    // Check for JSON-RPC response format
                    if (!txCountData.result) {
                        throw new Error("Failed to fetch transaction count");
                    }

                    const balance = formatSValue(balanceData.result);
                    const txCount = parseInt(txCountData.result.replace('0x', ''), 16);

                    return `# Account Information for \`${address}\`

## Balance
- Current Balance: ${balance} S

## Activity
- Total Transactions: ${txCount.toLocaleString()}

## Links
- View on Explorer: [SonicScan](https://sonicscan.org/address/${address})
- View Transactions: [Transaction History](https://sonicscan.org/address/${address}/transactions)

_Last Updated: ${new Date().toLocaleString()}_`;
                } catch (error) {
                    elizaLogger.error("Error fetching account info:", error);
                    return `Unable to fetch information for address ${address}. Please try again later.`;
                }
            }

            // Check for network stats
            if (messageText.includes('network stats') || messageText.includes('chain stats')) {
                try {
                    // Fetch all required data in parallel
                    const [supplyResponse, priceResponse, blockResponse] = await Promise.all([
                        fetch(`${SONIC_EXPLORER_API}?module=stats&action=ethsupply&apikey=${apiKey}`),
                        fetch(`${SONIC_EXPLORER_API}?module=stats&action=ethprice&apikey=${apiKey}`),
                        fetch(`${SONIC_EXPLORER_API}?module=proxy&action=eth_blockNumber&apikey=${apiKey}`)
                    ]);

                    const [supplyData, priceData, blockData] = await Promise.all([
                        supplyResponse.json(),
                        priceResponse.json(),
                        blockResponse.json()
                    ]);

                    // Validate REST API responses
                    if (supplyData.status !== "1" || !supplyData.result) {
                        throw new Error("Failed to fetch supply data");
                    }
                    if (priceData.status !== "1" || !priceData.result) {
                        throw new Error("Failed to fetch price data");
                    }
                    // Validate JSON-RPC response
                    if (!blockData.result) {
                        throw new Error("Failed to fetch block number");
                    }

                    const totalSupply = formatSValue(supplyData.result);
                    const priceUSD = parseFloat(priceData.result.ethusd);
                    const latestBlock = parseInt(blockData.result.replace('0x', ''), 16);
                    const marketCap = (Number(supplyData.result) / 1e18) * priceUSD;

                    return `# Sonic Network Overview

## Market Statistics
- Current Price: $${formatCurrency(priceUSD)}
- Market Cap: $${formatCurrency(marketCap)}
- Total Supply: ${totalSupply} S

## Network Status
- Latest Block: ${latestBlock.toLocaleString()}
- Chain ID: 146

## Links
- Block Explorer: [SonicScan](https://sonicscan.org)
- Network Status: [Network Stats](https://sonicscan.org/stats)

_Last Updated: ${new Date().toLocaleString()}_
_Data Source: SonicScan Explorer_`;
                } catch (error) {
                    elizaLogger.error("Error fetching network stats:", error);
                    return "Unable to fetch network statistics. Please try again later.";
                }
            }

            // Check for latest blocks
            if (messageText.includes('latest blocks') || messageText.includes('recent blocks')) {
                try {
                    // Get latest block number
                    const blockNumberResponse = await fetch(
                        `${SONIC_EXPLORER_API}?module=proxy&action=eth_blockNumber&apikey=${apiKey}`
                    );
                    const blockNumberData = await blockNumberResponse.json();
                    
                    // Validate JSON-RPC response
                    if (!blockNumberData.result) {
                        throw new Error("Failed to fetch block number");
                    }

                    const latestBlockNumber = parseInt(blockNumberData.result.replace('0x', ''), 16);
                    
                    // Get block details
                    const blockResponse = await fetch(
                        `${SONIC_EXPLORER_API}?module=proxy&action=eth_getBlockByNumber&tag=0x${latestBlockNumber.toString(16)}&boolean=true&apikey=${apiKey}`
                    );
                    const blockData = await blockResponse.json();

                    // Validate JSON-RPC response
                    if (!blockData.result) {
                        throw new Error("Failed to fetch block details");
                    }

                    const block = blockData.result;
                    const timestamp = new Date(parseInt(block.timestamp.replace('0x', ''), 16) * 1000);
                    const gasUsed = parseInt(block.gasUsed.replace('0x', ''), 16);
                    const gasLimit = parseInt(block.gasLimit.replace('0x', ''), 16);
                    const txCount = block.transactions?.length || 0;

                    return `# Latest Block Information

## Block #${latestBlockNumber.toLocaleString()}
- Timestamp: ${timestamp.toLocaleString()}
- Transactions: ${txCount.toLocaleString()}
- Gas Used: ${formatSValue(gasUsed)} (${((gasUsed / gasLimit) * 100).toFixed(2)}%)
- Gas Limit: ${formatSValue(gasLimit)}
- Miner: \`${block.miner}\`

## Links
- View Block: [Block Details](https://sonicscan.org/block/${latestBlockNumber})
- View Transactions: [Block Transactions](https://sonicscan.org/block/${latestBlockNumber}/transactions)

_Last Updated: ${new Date().toLocaleString()}_`;
                } catch (error) {
                    elizaLogger.error("Error fetching latest blocks:", error);
                    return "Unable to fetch latest blocks. Please try again later.";
                }
            }

            return "I can help you with Sonic network information. Try asking about network stats, wallet information, latest blocks, or top tokens.";
        } catch (error) {
            elizaLogger.error("Explorer provider error:", error);
            
            if (error instanceof Error) {
                if (error.message.includes("Rate limit")) {
                    return "I'm currently receiving too many requests. Please try again in a minute.";
                }
                if (error.message.includes("SONIC_EXPLORER_API_KEY")) {
                    return "I need an API key to access the Sonic Explorer. Please set up the SONIC_EXPLORER_API_KEY in the environment variables.";
                }
                return `I encountered an error while fetching the information: ${error.message}. Please try again or ask for a different type of information.`;
            }
            
            return "I'm having trouble accessing the blockchain data right now. Please try again in a moment.";
        }
    }
};
