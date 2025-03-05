/**
 * Format currency with appropriate precision
 */
export function formatCurrency(value: number): string {
  if (value >= 1_000_000_000_000) { // >= 1T
    return `$${(value / 1_000_000_000_000).toLocaleString('en-US', { maximumFractionDigits: 2 })}T`;
  } else if (value >= 1_000_000_000) { // >= 1B
    return `$${(value / 1_000_000_000).toLocaleString('en-US', { maximumFractionDigits: 2 })}B`;
  } else if (value >= 1_000_000) { // >= 1M
    return `$${(value / 1_000_000).toLocaleString('en-US', { maximumFractionDigits: 2 })}M`;
  } else if (value >= 1_000) { // >= 1K
    return `$${(value / 1_000).toLocaleString('en-US', { maximumFractionDigits: 2 })}K`;
  } else if (value >= 1) {
    return `$${value.toLocaleString('en-US', { maximumFractionDigits: 2 })}`;
  } else {
    return `$${value.toLocaleString('en-US', { maximumFractionDigits: 6 })}`;
  }
}

/**
 * Format percentage with appropriate sign and precision
 */
export function formatPercentage(value: number | undefined): string {
  if (value === undefined) return '';
  const sign = value > 0 ? '+' : '';
  return `${sign}${value.toFixed(2)}%`;
}

/**
 * Format date to locale string
 */
export function formatDate(timestamp: number): string {
  return new Date(timestamp * 1000).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
}

/**
 * Format chain data for display
 */
export function formatChainData(name: string, formattedTVL: string, changes?: {
  change_1d?: number;
  change_7d?: number;
  change_1m?: number;
}): string {
  let response = `${name} Chain TVL: ${formattedTVL}`;
  
  if (changes?.change_1d !== undefined) {
    response += `\n24h Change: ${formatPercentage(changes.change_1d)}`;
  }
  if (changes?.change_7d !== undefined) {
    response += `\n7d Change: ${formatPercentage(changes.change_7d)}`;
  }
  if (changes?.change_1m !== undefined) {
    response += `\n30d Change: ${formatPercentage(changes.change_1m)}`;
  }
  
  return response;
}

/**
 * Format protocol data for display
 */
export function formatProtocolData(name: string, formattedTVL: string, data: {
  change_1d?: number;
  change_7d?: number;
  category?: string;
  chains?: string[];
  chainTvls?: { chain: string; formattedTVL: string }[];
}): string {
  let response = `${name} Protocol TVL: ${formattedTVL}`;
  
  if (data.change_1d !== undefined) {
    response += `\n24h Change: ${formatPercentage(data.change_1d)}`;
  }
  if (data.change_7d !== undefined) {
    response += `\n7d Change: ${formatPercentage(data.change_7d)}`;
  }
  if (data.category) {
    response += `\nCategory: ${data.category}`;
  }
  if (data.chains?.length) {
    response += `\nDeployed on: ${data.chains.join(', ')}`;
  }
  if (data.chainTvls?.length) {
    response += '\n\nTVL by Chain:';
    data.chainTvls.forEach(({ chain, formattedTVL }) => {
      response += `\n${chain}: ${formattedTVL}`;
    });
  }
  
  return response;
}

/**
 * Format historical data for display
 */
export function formatHistoricalData(data: {
  timestamp: number;
  formattedTVL: string;
}[]): string {
  return data.map(point => 
    `${formatDate(point.timestamp)}: ${point.formattedTVL}`
  ).join('\n');
}

/**
 * Format global stats for display
 */
export function formatGlobalStats(data: {
  totalTVL: number;
  chainCount: number;
  topChains: {
    name: string;
    formattedTVL: string;
    tvl: number;
    change_1d?: number;
    change_7d?: number;
  }[];
}): string {
  let response = 'Global DeFi Statistics:\n\n';
  response += `Total Value Locked: ${formatCurrency(data.totalTVL)}\n`;
  response += `Active Chains: ${data.chainCount}\n\n`;
  response += `Top ${data.topChains.length} Chains by TVL:\n\n`;

  data.topChains.forEach((chain, index) => {
    const percentage = (chain.tvl / data.totalTVL * 100).toFixed(2);
    response += `${index + 1}. ${chain.name}: ${chain.formattedTVL} (${percentage}% of total)`;
    if (chain.change_1d !== undefined) {
      response += `\n   24h Change: ${formatPercentage(chain.change_1d)}`;
    }
    if (chain.change_7d !== undefined) {
      response += `\n   7d Change: ${formatPercentage(chain.change_7d)}`;
    }
    response += '\n\n';
  });

  return response;
} 