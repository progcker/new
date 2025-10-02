export interface Habit {
  id: string
  title: string
  emoji: string
  category: string
  frequency: 'daily' | 'weekly' | 'custom'
  customDays?: number[] // for custom frequency (0-6, Sunday to Saturday)
  createdAt: Date
  streak: number
  lastCompleted?: Date
  completions: Date[]
  isCompleted?: boolean
  order: number
}

export interface User {
  name: string
  createdAt: Date
  totalHabits: number
  totalCompletions: number
}

export interface HabitCompletionData {
  date: string
  count: number
}

export type ThemeMode = 'light' | 'dark' | 'system'

export interface Badge {
  id: string
  name: string
  description: string
  icon: string
  unlocked: boolean
  unlockedAt?: Date
}

export const HABIT_CATEGORIES = [
  'Health & Fitness',
  'Learning',
  'Productivity',
  'Relationships',
  'Hobbies',
  'Mindfulness',
  'Finance',
  'Other'
] as const

export type HabitCategory = typeof HABIT_CATEGORIES[number]

export const HABIT_EMOJIS = [
  '💪', '🏃‍♂️', '📚', '💻', '🧘', '💧', '🥗', '🏋️',
  '📖', '✍️', '🎯', '🌱', '💰', '🎨', '🎵', '📝',
  '🧠', '❤️', '🏠', '🚶', '🎸', '📊', '🔬', '🍎'
] as const