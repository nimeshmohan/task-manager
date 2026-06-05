import type { Priority } from '@/types'

export const PRIORITY_CONFIG: Record<Priority, { label: string; color: string; bg: string }> = {
  low: { label: 'Low', color: 'text-blue-500', bg: 'bg-blue-100 dark:bg-blue-900/30' },
  medium: { label: 'Medium', color: 'text-yellow-500', bg: 'bg-yellow-100 dark:bg-yellow-900/30' },
  high: { label: 'High', color: 'text-orange-500', bg: 'bg-orange-100 dark:bg-orange-900/30' },
  urgent: { label: 'Urgent', color: 'text-red-500', bg: 'bg-red-100 dark:bg-red-900/30' },
}

export const TAG_COLORS: Record<string, string> = {
  red: 'bg-red-500',
  orange: 'bg-orange-500',
  yellow: 'bg-yellow-400',
  green: 'bg-green-500',
  blue: 'bg-blue-500',
  purple: 'bg-purple-500',
  pink: 'bg-pink-500',
}

export const BOARD_COLORS = [
  '#3b82f6', '#8b5cf6', '#ec4899', '#ef4444',
  '#f97316', '#eab308', '#22c55e', '#14b8a6',
]
