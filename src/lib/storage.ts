import { Habit, User, Badge } from '@/types/habit'

const STORAGE_KEYS = {
  HABITS: 'habit-tracker-habits',
  USER: 'habit-tracker-user',
  BADGES: 'habit-tracker-badges',
  THEME: 'habit-tracker-theme'
} as const

// Habits Storage
export const saveHabits = (habits: Habit[]): void => {
  try {
    localStorage.setItem(STORAGE_KEYS.HABITS, JSON.stringify(habits))
  } catch (error) {
    console.error('Failed to save habits:', error)
  }
}

export const loadHabits = (): Habit[] => {
  try {
    const stored = localStorage.getItem(STORAGE_KEYS.HABITS)
    if (!stored) return []
    
    return JSON.parse(stored).map((habit: any) => ({
      ...habit,
      createdAt: new Date(habit.createdAt),
      lastCompleted: habit.lastCompleted ? new Date(habit.lastCompleted) : undefined,
      completions: habit.completions.map((date: string) => new Date(date))
    }))
  } catch (error) {
    console.error('Failed to load habits:', error)
    return []
  }
}

// User Storage
export const saveUser = (user: User): void => {
  try {
    localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user))
  } catch (error) {
    console.error('Failed to save user:', error)
  }
}

export const loadUser = (): User | null => {
  try {
    const stored = localStorage.getItem(STORAGE_KEYS.USER)
    if (!stored) return null
    
    const user = JSON.parse(stored)
    return {
      ...user,
      createdAt: new Date(user.createdAt)
    }
  } catch (error) {
    console.error('Failed to load user:', error)
    return null
  }
}

// Badges Storage
export const saveBadges = (badges: Badge[]): void => {
  try {
    localStorage.setItem(STORAGE_KEYS.BADGES, JSON.stringify(badges))
  } catch (error) {
    console.error('Failed to save badges:', error)
  }
}

export const loadBadges = (): Badge[] => {
  try {
    const stored = localStorage.getItem(STORAGE_KEYS.BADGES)
    if (!stored) return []
    
    return JSON.parse(stored).map((badge: any) => ({
      ...badge,
      unlockedAt: badge.unlockedAt ? new Date(badge.unlockedAt) : undefined
    }))
  } catch (error) {
    console.error('Failed to load badges:', error)
    return []
  }
}

// Theme Storage
export const saveTheme = (theme: string): void => {
  try {
    localStorage.setItem(STORAGE_KEYS.THEME, theme)
  } catch (error) {
    console.error('Failed to save theme:', error)
  }
}

export const loadTheme = (): string | null => {
  try {
    return localStorage.getItem(STORAGE_KEYS.THEME)
  } catch (error) {
    console.error('Failed to load theme:', error)
    return null
  }
}

// Utility functions
export const clearAllData = (): void => {
  try {
    Object.values(STORAGE_KEYS).forEach(key => {
      localStorage.removeItem(key)
    })
  } catch (error) {
    console.error('Failed to clear data:', error)
  }
}

export const exportData = (): string => {
  try {
    const data = {
      habits: loadHabits(),
      user: loadUser(),
      badges: loadBadges(),
      theme: loadTheme(),
      exportedAt: new Date().toISOString()
    }
    return JSON.stringify(data, null, 2)
  } catch (error) {
    console.error('Failed to export data:', error)
    return '{}'
  }
}

export const importData = (jsonData: string): boolean => {
  try {
    const data = JSON.parse(jsonData)
    
    if (data.habits) {
      saveHabits(data.habits)
    }
    if (data.user) {
      saveUser(data.user)
    }
    if (data.badges) {
      saveBadges(data.badges)
    }
    if (data.theme) {
      saveTheme(data.theme)
    }
    
    return true
  } catch (error) {
    console.error('Failed to import data:', error)
    return false
  }
}