import { Pool, PoolInfo, PoolStats, Token } from '../types';

export function formatUSD(value: string | number): string {
    const num = typeof value === 'string' ? parseFloat(value) : value;
    if (isNaN(num)) return '$0.00';
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    }).format(num);
}

export function formatPoolStats(pool: Pool): PoolStats {
    const volume = parseFloat(pool.attributes.volume_usd.h24) || 0;
    const tvl = parseFloat(pool.attributes.reserve_in_usd) || 0;
    const fees = volume * 0.003; // Assuming 0.3% fee
    const baseTokenPrice = parseFloat(pool.attributes.base_token_price_usd || '0');
    const quoteTokenPrice = parseFloat(pool.attributes.quote_token_price_usd || '0');

    return {
        tvl,
        volume24h: volume,
        fees24h: fees,
        priceChange24h: pool.attributes.price_change_percentage?.h24 
            ? `${parseFloat(pool.attributes.price_change_percentage.h24) >= 0 ? '+' : ''}${parseFloat(pool.attributes.price_change_percentage.h24).toFixed(2)}%`
            : 'N/A',
        transactions24h: pool.attributes.transactions_24h || 'N/A',
        baseTokenPrice,
        quoteTokenPrice
    };
}

export function formatPoolInfo(pool: Pool): PoolInfo {
    // Check for undefined or 'undefined' string values
    const baseTokenName = pool.attributes.base_token_name;
    const quoteTokenName = pool.attributes.quote_token_name;
    
    return {
        ...formatPoolStats(pool),
        name: pool.attributes.name || 'Unknown Pool',
        address: pool.attributes.address,
        baseTokenName: (baseTokenName && baseTokenName !== 'undefined') ? baseTokenName : 'Base Token',
        quoteTokenName: (quoteTokenName && quoteTokenName !== 'undefined') ? quoteTokenName : 'Quote Token',
        baseTokenAddress: pool.attributes.base_token_address,
        quoteTokenAddress: pool.attributes.quote_token_address
    };
}

export function formatTokenInfo(token: Token): string {
    const attrs = token.attributes;
    let markdown = `# Token Information\n\n`;
    markdown += `## ${attrs.name || 'Unknown Token'} (${attrs.symbol || 'N/A'})\n`;
    markdown += `- Address: \`${attrs.address}\`\n`;
    markdown += `- Decimals: ${attrs.decimals}\n`;

    if (attrs.price_usd) {
        markdown += `- Price: ${formatUSD(attrs.price_usd)}\n`;
    }

    if (attrs.market_cap_usd) {
        markdown += `- Market Cap: ${formatUSD(attrs.market_cap_usd)}\n`;
    }

    if (attrs.volume_24h) {
        markdown += `- 24h Volume: ${formatUSD(attrs.volume_24h)}\n`;
    }

    if (attrs.price_change_percentage_24h) {
        const change = parseFloat(attrs.price_change_percentage_24h);
        markdown += `- 24h Price Change: ${change >= 0 ? '+' : ''}${change.toFixed(2)}%\n`;
    }

    if (attrs.total_reserve_in_usd) {
        markdown += `- Total Value Locked: ${formatUSD(attrs.total_reserve_in_usd)}\n`;
    }

    if (attrs.total_pools) {
        markdown += `- Total Pools: ${attrs.total_pools}\n`;
    }

    return markdown;
}

export function formatMarkdown(poolInfo: PoolInfo): string {
    // Format the main pool information
    let markdown = `## ${poolInfo.name}
- Address: \`${poolInfo.address}\`
- TVL: ${formatUSD(poolInfo.tvl)}
- 24h Volume: ${formatUSD(poolInfo.volume24h)}
- 24h Fees Generated: ${formatUSD(poolInfo.fees24h)}
- 24h Price Change: ${poolInfo.priceChange24h || 'N/A'}
- 24h Transactions: ${poolInfo.transactions24h || 'N/A'}`;

    // Only add token prices section if we have valid token names
    if (poolInfo.baseTokenName && poolInfo.quoteTokenName && 
        poolInfo.baseTokenName !== 'undefined' && poolInfo.quoteTokenName !== 'undefined') {
        
        const baseTokenName = poolInfo.baseTokenName === 'undefined' ? 'Base Token' : poolInfo.baseTokenName;
        const quoteTokenName = poolInfo.quoteTokenName === 'undefined' ? 'Quote Token' : poolInfo.quoteTokenName;
        
        markdown += `
- Token Prices:
  * ${baseTokenName}: ${formatUSD(poolInfo.baseTokenPrice)}
  * ${quoteTokenName}: ${formatUSD(poolInfo.quoteTokenPrice)}`;
    }
    
    return markdown;
} 