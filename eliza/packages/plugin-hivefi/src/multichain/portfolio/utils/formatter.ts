import { PortfolioData, PositionData, TokenBalance } from "../types";
import { getChainDisplayName } from "../config/chains";

/**
 * Format portfolio summary data into a readable text response
 * @param data Portfolio data from Zerion API
 * @param address The wallet address
 * @returns Formatted text response
 */
export function formatPortfolioSummary(data: PortfolioData, address: string): string {
  // Format the total value with 2 decimal places
  const totalValue = data.totalValue.toLocaleString(undefined, {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });

  // Format the 24h change
  const change24h = data.changes.percent_1d.toFixed(2);
  const changeSymbol = data.changes.percent_1d >= 0 ? '+' : '';
  const changeText = `${changeSymbol}${change24h}%`;

  // Format chain distribution
  const chainDistribution = Object.entries(data.chainDistribution)
    .sort((a, b) => b[1] - a[1]) // Sort by value (descending)
    .map(([chain, value]) => {
      const percentage = ((value / data.totalValue) * 100).toFixed(1);
      const chainName = getChainDisplayName(chain);
      const valueFormatted = value.toLocaleString(undefined, {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      });
      return `• ${chainName}: ${valueFormatted} (${percentage}%)`;
    })
    .join('\n');

  // Format position types
  const positionTypes = Object.entries(data.positionTypes)
    .filter(([_, value]) => value > 0) // Only include non-zero values
    .sort((a, b) => b[1] - a[1]) // Sort by value (descending)
    .map(([type, value]) => {
      const percentage = ((value / data.totalValue) * 100).toFixed(1);
      const valueFormatted = value.toLocaleString(undefined, {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      });
      // Capitalize the first letter of the type
      const formattedType = type.charAt(0).toUpperCase() + type.slice(1);
      return `• ${formattedType}: ${valueFormatted} (${percentage}%)`;
    })
    .join('\n');

  // Build the response
  return [
    `Multichain Portfolio for ${address}`,
    '',
    `Total Value: ${totalValue}`,
    `24h Change: ${changeText}`,
    '',
    'Chain Distribution:',
    chainDistribution,
    '',
    'Position Types:',
    positionTypes,
    '',
    `View on Zerion: https://app.zerion.io/${address}/overview`
  ].join('\n');
}

/**
 * Format detailed position data into a readable text response
 * @param data Position data from Zerion API
 * @param address The wallet address
 * @returns Formatted text response
 */
export function formatPositionDetails(data: PositionData, address: string): string {
  // Format the total value
  const totalValue = data.totalValue.toLocaleString(undefined, {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });

  // Group positions by chain
  const positionsByChain: { [chain: string]: TokenBalance[] } = {};
  
  data.positions.forEach(position => {
    if (!positionsByChain[position.chain]) {
      positionsByChain[position.chain] = [];
    }
    positionsByChain[position.chain].push(position);
  });

  // Format positions by chain
  const formattedPositions = Object.entries(positionsByChain)
    .sort((a, b) => {
      // Calculate total value for each chain
      const totalA = a[1].reduce((sum, pos) => sum + pos.usdValue, 0);
      const totalB = b[1].reduce((sum, pos) => sum + pos.usdValue, 0);
      return totalB - totalA; // Sort by total value (descending)
    })
    .map(([chain, positions]) => {
      const chainName = getChainDisplayName(chain);
      const chainTotal = positions.reduce((sum, pos) => sum + pos.usdValue, 0);
      const chainPercentage = ((chainTotal / data.totalValue) * 100).toFixed(1);
      
      const formattedChainTotal = chainTotal.toLocaleString(undefined, {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      });

      // Sort positions by value (descending)
      const sortedPositions = [...positions].sort((a, b) => b.usdValue - a.usdValue);
      
      const positionsList = sortedPositions.map(position => {
        const balanceStr = Number(position.balance).toLocaleString(undefined, {
          maximumFractionDigits: position.symbol === 'USDT' || position.symbol === 'USDC' ? 2 : 6
        });
        
        const valueStr = position.usdValue.toLocaleString(undefined, {
          style: 'currency',
          currency: 'USD',
          minimumFractionDigits: 2,
          maximumFractionDigits: 2
        });
        
        let changeStr = '';
        if (position.change24h !== null && position.change24h !== undefined) {
          const changeSymbol = position.change24h >= 0 ? '+' : '';
          changeStr = ` (${changeSymbol}${position.change24h.toFixed(2)}% 24h)`;
        }
        
        return `  • ${position.symbol} (${position.name}): ${balanceStr} = ${valueStr}${changeStr}`;
      }).join('\n');

      return [
        `${chainName} (${formattedChainTotal} - ${chainPercentage}%):`,
        positionsList
      ].join('\n');
    })
    .join('\n\n');

  // Build the response
  return [
    `Multichain Portfolio for ${address}`,
    '',
    `Total Value: ${totalValue}`,
    '',
    'Assets by Chain:',
    '',
    formattedPositions,
    '',
    `View on Zerion: https://app.zerion.io/${address}/overview`
  ].join('\n');
} 