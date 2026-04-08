import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(amount: number, decimals: number = 2): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(amount)
}

export function formatPercentage(value: number, basisPoints: boolean = false): string {
  const percentage = basisPoints ? value / 100 : value
  return `${percentage.toFixed(2)}%`
}

export function formatShares(shares: number): string {
  if (shares >= 1000000) {
    return `${(shares / 1000000).toFixed(1)}M`
  }
  if (shares >= 1000) {
    return `${(shares / 1000).toFixed(1)}K`
  }
  return shares.toString()
}

export function calculateFundingPercentage(sharesSold: number, totalShares: number): number {
  return (sharesSold / totalShares) * 100
}

export function truncateAddress(address: string, startChars: number = 6, endChars: number = 4): string {
  if (!address) return ''
  if (address.length <= startChars + endChars) return address
  return `${address.slice(0, startChars)}...${address.slice(-endChars)}`
}

export function formatTimestamp(timestamp: number): string {
  return new Date(timestamp * 1000).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

export function generateAssetId(): string {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)
}
