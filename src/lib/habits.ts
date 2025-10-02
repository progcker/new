import { Habit, Badge } from '@/types/habit'
import { format, isToday, isYesterday, differenceInDays, startOfDay, addDays } from 'date-fns'

// Habit utility functions
export const createHabit = (data: Partial<Habit>): Habit => {
  return {
    id: generateId(),
    title: data.title || '',
    emoji: data.emoji || '📝',
    category: data.category || 'Other',
    frequency: data.frequency || 'daily',
    customDays: data.customDays,
    createdAt: new Date(),
    streak: 0,
    completions: [],
    order: data.order || 0,
    ...data
  } as Habit
}

export const generateId = (): string => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2)
}

// Check if habit should be shown today based on frequency
export const isHabitDueToday = (habit: Habit): boolean => {
  const today = new Date().getDay() // 0 = Sunday, 6 = Saturday
  
  switch (habit.frequency) {
    case 'daily':
      return true
    case 'weekly':
      // Default to Sunday if no custom days specified
      return habit.customDays ? habit.customDays.includes(today) : today === 0
    case 'custom':
      return habit.customDays ? habit.customDays.includes(today) : false
    default:
      return true
  }
}

// Check if habit is completed today
export const isHabitCompletedToday = (habit: Habit): boolean => {
  return habit.completions.some(completion => isToday(completion))
}

// Complete or uncomplete habit for today
export const toggleHabitCompletion = (habit: Habit): Habit => {
  const today = startOfDay(new Date())
  const isAlreadyCompleted = habit.completions.some(completion => 
    format(completion, 'yyyy-MM-dd') === format(today, 'yyyy-MM-dd')
  )
  
  if (isAlreadyCompleted) {
    // Remove today's completion
    return {
      ...habit,
      completions: habit.completions.filter(completion => 
        format(completion, 'yyyy-MM-dd') !== format(today, 'yyyy-MM-dd')
      ),
      streak: calculateStreak(habit.completions.filter(completion => 
        format(completion, 'yyyy-MM-dd') !== format(today, 'yyyy-MM-dd')
      )),
      lastCompleted: habit.completions.filter(completion => 
        format(completion, 'yyyy-MM-dd') !== format(today, 'yyyy-MM-dd')
      ).pop()
    }
  } else {
    // Add today's completion
    const newCompletions = [...habit.completions, today].sort((a, b) => a.getTime() - b.getTime())
    return {
      ...habit,
      completions: newCompletions,
      streak: calculateStreak(newCompletions),
      lastCompleted: today
    }
  }
}

// Calculate current streak
export const calculateStreak = (completions: Date[]): number => {
  if (completions.length === 0) return 0
  
  const sortedCompletions = completions
    .map(date => startOfDay(date))
    .sort((a, b) => b.getTime() - a.getTime())
  
  const today = startOfDay(new Date())
  const yesterday = startOfDay(addDays(today, -1))
  
  let streak = 0
  let checkDate = today
  
  // If completed today, start from today, otherwise start from yesterday
  if (format(sortedCompletions[0], 'yyyy-MM-dd') === format(today, 'yyyy-MM-dd')) {
    streak = 1
    checkDate = yesterday
  } else if (format(sortedCompletions[0], 'yyyy-MM-dd') === format(yesterday, 'yyyy-MM-dd')) {
    streak = 1
    checkDate = addDays(yesterday, -1)
  } else {
    return 0 // No recent completions
  }
  
  // Count consecutive days
  for (let i = (streak === 1 ? 1 : 0); i < sortedCompletions.length; i++) {
    if (format(sortedCompletions[i], 'yyyy-MM-dd') === format(checkDate, 'yyyy-MM-dd')) {
      streak++
      checkDate = addDays(checkDate, -1)
    } else {
      break
    }
  }
  
  return streak
}

// Get completion rate for a habit
export const getHabitCompletionRate = (habit: Habit, days: number = 30): number => {
  const now = new Date()
  const startDate = addDays(now, -days)
  
  const completionsInPeriod = habit.completions.filter(
    completion => completion >= startDate && completion <= now
  ).length
  
  return Math.round((completionsInPeriod / days) * 100)
}

// Get habit statistics
export const getHabitStats = (habit: Habit) => {
  const totalCompletions = habit.completions.length
  const currentStreak = habit.streak
  const completionRate30 = getHabitCompletionRate(habit, 30)
  const completionRate7 = getHabitCompletionRate(habit, 7)
  
  const bestStreak = calculateBestStreak(habit.completions)
  
  return {
    totalCompletions,
    currentStreak,
    bestStreak,
    completionRate30,
    completionRate7,
    isCompletedToday: isHabitCompletedToday(habit)
  }
}

// Calculate best streak ever
const calculateBestStreak = (completions: Date[]): number => {
  if (completions.length === 0) return 0
  
  const sortedCompletions = completions
    .map(date => startOfDay(date))
    .sort((a, b) => a.getTime() - b.getTime())
  
  let bestStreak = 1
  let currentStreak = 1
  
  for (let i = 1; i < sortedCompletions.length; i++) {
    const prevDate = sortedCompletions[i - 1]
    const currentDate = sortedCompletions[i]
    
    if (differenceInDays(currentDate, prevDate) === 1) {
      currentStreak++
      bestStreak = Math.max(bestStreak, currentStreak)
    } else if (differenceInDays(currentDate, prevDate) > 1) {
      currentStreak = 1
    }
  }
  
  return bestStreak
}

// Generate sample habits for demo
export const generateSampleHabits = (): Habit[] => {
  const sampleHabits = [
    { title: 'Drink 8 glasses of water', emoji: '💧', category: 'Health & Fitness' },
    { title: 'Read for 30 minutes', emoji: '📚', category: 'Learning' },
    { title: 'Exercise', emoji: '💪', category: 'Health & Fitness' },
    { title: 'Meditate', emoji: '🧘', category: 'Mindfulness' },
    { title: 'Write in journal', emoji: '📝', category: 'Productivity' }
  ]
  
  return sampleHabits.map((habit, index) => createHabit({ 
    ...habit, 
    order: index 
  }))
}

// Badge definitions and checking
export const BADGES: Badge[] = [
  {
    id: 'first-habit',
    name: 'Getting Started',
    description: 'Create your first habit',
    icon: '🌱',
    unlocked: false
  },
  {
    id: 'streak-3',
    name: 'Consistent',
    description: 'Maintain a 3-day streak',
    icon: '🔥',
    unlocked: false
  },
  {
    id: 'streak-7',
    name: 'Week Warrior',
    description: 'Maintain a 7-day streak',
    icon: '⭐',
    unlocked: false
  },
  {
    id: 'streak-30',
    name: 'Month Master',
    description: 'Maintain a 30-day streak',
    icon: '👑',
    unlocked: false
  },
  {
    id: 'habits-5',
    name: 'Multi-tasker',
    description: 'Create 5 different habits',
    icon: '🎯',
    unlocked: false
  },
  {
    id: 'completions-100',
    name: 'Century Club',
    description: 'Complete 100 habits total',
    icon: '💯',
    unlocked: false
  }
]

// Check which badges should be unlocked
export const checkBadges = (habits: Habit[], currentBadges: Badge[]): Badge[] => {
  const updatedBadges = [...currentBadges]
  const now = new Date()
  
  // First habit badge
  const firstHabitBadge = updatedBadges.find(b => b.id === 'first-habit')
  if (firstHabitBadge && !firstHabitBadge.unlocked && habits.length > 0) {
    firstHabitBadge.unlocked = true
    firstHabitBadge.unlockedAt = now
  }
  
  // Multiple habits badge
  const habitsCountBadge = updatedBadges.find(b => b.id === 'habits-5')
  if (habitsCountBadge && !habitsCountBadge.unlocked && habits.length >= 5) {
    habitsCountBadge.unlocked = true
    habitsCountBadge.unlockedAt = now
  }
  
  // Streak badges
  const maxStreak = Math.max(...habits.map(h => h.streak), 0)
  
  const streak3Badge = updatedBadges.find(b => b.id === 'streak-3')
  if (streak3Badge && !streak3Badge.unlocked && maxStreak >= 3) {
    streak3Badge.unlocked = true
    streak3Badge.unlockedAt = now
  }
  
  const streak7Badge = updatedBadges.find(b => b.id === 'streak-7')
  if (streak7Badge && !streak7Badge.unlocked && maxStreak >= 7) {
    streak7Badge.unlocked = true
    streak7Badge.unlockedAt = now
  }
  
  const streak30Badge = updatedBadges.find(b => b.id === 'streak-30')
  if (streak30Badge && !streak30Badge.unlocked && maxStreak >= 30) {
    streak30Badge.unlocked = true
    streak30Badge.unlockedAt = now
  }
  
  // Total completions badge
  const totalCompletions = habits.reduce((sum, habit) => sum + habit.completions.length, 0)
  const completionsBadge = updatedBadges.find(b => b.id === 'completions-100')
  if (completionsBadge && !completionsBadge.unlocked && totalCompletions >= 100) {
    completionsBadge.unlocked = true
    completionsBadge.unlockedAt = now
  }
  
  return updatedBadges
}