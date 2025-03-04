import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatBTC(amount: number): string {
  return `${amount.toFixed(8)} BTC`
}

export function formatDate(date: string): string {
  return new Date(date).toLocaleString()
}

export function shortenAddress(address: string): string {
  if (address.length < 10) return address
  return `${address.slice(0, 6)}...${address.slice(-4)}`
}

export function calculatePercentageChange(current: number, previous: number): string {
  const change = ((current - previous) / previous) * 100
  return `${change > 0 ? '+' : ''}${change.toFixed(2)}%`
}

export function satoshisToBTC(satoshis: number): number {
  return satoshis / 100000000
}

export function BTCToSatoshis(btc: number): number {
  return Math.floor(btc * 100000000)
}

export function validateBitcoinAddress(address: string): boolean {
  // Basic validation for Bitcoin addresses
  // Supports legacy, SegWit, and native SegWit addresses
  return /^(bc1|[13])[a-zA-HJ-NP-Z0-9]{25,62}$/.test(address)
}

export function isValidAmount(amount: string, max?: number): boolean {
  const num = parseFloat(amount)
  if (isNaN(num) || num <= 0) return false
  if (max !== undefined && num > max) return false
  return true
}

export function formatUSD(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount)
}

export function formatLargeNumber(num: number): string {
  if (num >= 1e9) return `${(num / 1e9).toFixed(2)}B`
  if (num >= 1e6) return `${(num / 1e6).toFixed(2)}M`
  if (num >= 1e3) return `${(num / 1e3).toFixed(2)}K`
  return num.toString()
}
