'use client'

import React, { createContext, useContext, useEffect, useReducer, ReactNode } from 'react'
import { Habit, User, Badge, ThemeMode } from '@/types/habit'
import { 
  loadHabits, 
  saveHabits, 
  loadUser, 
  saveUser,
  loadBadges,
  saveBadges,
  loadTheme,
  saveTheme
} from '@/lib/storage'
import { BADGES, checkBadges } from '@/lib/habits'

interface AppState {
  habits: Habit[]
  user: User | null
  badges: Badge[]
  theme: ThemeMode
  isLoading: boolean
  isOnboarding: boolean
}

type AppAction = 
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_HABITS'; payload: Habit[] }
  | { type: 'ADD_HABIT'; payload: Habit }
  | { type: 'UPDATE_HABIT'; payload: Habit }
  | { type: 'DELETE_HABIT'; payload: string }
  | { type: 'REORDER_HABITS'; payload: Habit[] }
  | { type: 'SET_USER'; payload: User }
  | { type: 'SET_BADGES'; payload: Badge[] }
  | { type: 'SET_THEME'; payload: ThemeMode }
  | { type: 'SET_ONBOARDING'; payload: boolean }
  | { type: 'INITIALIZE_DATA'; payload: { habits: Habit[]; user: User | null; badges: Badge[]; theme: ThemeMode } }

const initialState: AppState = {
  habits: [],
  user: null,
  badges: [...BADGES],
  theme: 'system',
  isLoading: true,
  isOnboarding: true
}

function appReducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload }
    
    case 'SET_HABITS':
      return { ...state, habits: action.payload }
    
    case 'ADD_HABIT':
      return { ...state, habits: [...state.habits, action.payload] }
    
    case 'UPDATE_HABIT':
      return {
        ...state,
        habits: state.habits.map(h => h.id === action.payload.id ? action.payload : h)
      }
    
    case 'DELETE_HABIT':
      return {
        ...state,
        habits: state.habits.filter(h => h.id !== action.payload)
      }
    
    case 'REORDER_HABITS':
      return { ...state, habits: action.payload }
    
    case 'SET_USER':
      return { ...state, user: action.payload, isOnboarding: false }
    
    case 'SET_BADGES':
      return { ...state, badges: action.payload }
    
    case 'SET_THEME':
      return { ...state, theme: action.payload }
    
    case 'SET_ONBOARDING':
      return { ...state, isOnboarding: action.payload }
    
    case 'INITIALIZE_DATA':
      return {
        ...state,
        habits: action.payload.habits,
        user: action.payload.user,
        badges: action.payload.badges,
        theme: action.payload.theme,
        isLoading: false,
        isOnboarding: action.payload.user === null
      }
    
    default:
      return state
  }
}

interface AppContextType {
  state: AppState
  dispatch: React.Dispatch<AppAction>
  // Helper functions
  addHabit: (habit: Habit) => void
  updateHabit: (habit: Habit) => void
  deleteHabit: (id: string) => void
  reorderHabits: (habits: Habit[]) => void
  setUser: (user: User) => void
  setTheme: (theme: ThemeMode) => void
  completeOnboarding: (user: User) => void
  checkAndUnlockBadges: () => Badge[]
}

const AppContext = createContext<AppContextType | undefined>(undefined)

export function AppProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(appReducer, initialState)

  // Initialize data from localStorage on mount
  useEffect(() => {
    const habits = loadHabits()
    const user = loadUser()
    const savedBadges = loadBadges()
    const badges = savedBadges.length > 0 ? savedBadges : [...BADGES]
    const theme = (loadTheme() as ThemeMode) || 'system'

    dispatch({ 
      type: 'INITIALIZE_DATA', 
      payload: { habits, user, badges, theme } 
    })
  }, [])

  // Save to localStorage when data changes
  useEffect(() => {
    if (!state.isLoading) {
      saveHabits(state.habits)
    }
  }, [state.habits, state.isLoading])

  useEffect(() => {
    if (state.user) {
      saveUser(state.user)
    }
  }, [state.user])

  useEffect(() => {
    saveBadges(state.badges)
  }, [state.badges])

  useEffect(() => {
    saveTheme(state.theme)
  }, [state.theme])

  // Helper functions
  const addHabit = (habit: Habit) => {
    dispatch({ type: 'ADD_HABIT', payload: habit })
    // Check for new badges
    setTimeout(() => checkAndUnlockBadges(), 100)
  }

  const updateHabit = (habit: Habit) => {
    dispatch({ type: 'UPDATE_HABIT', payload: habit })
    // Check for new badges
    setTimeout(() => checkAndUnlockBadges(), 100)
  }

  const deleteHabit = (id: string) => {
    dispatch({ type: 'DELETE_HABIT', payload: id })
  }

  const reorderHabits = (habits: Habit[]) => {
    dispatch({ type: 'REORDER_HABITS', payload: habits })
  }

  const setUser = (user: User) => {
    dispatch({ type: 'SET_USER', payload: user })
  }

  const setTheme = (theme: ThemeMode) => {
    dispatch({ type: 'SET_THEME', payload: theme })
  }

  const completeOnboarding = (user: User) => {
    setUser(user)
    dispatch({ type: 'SET_ONBOARDING', payload: false })
  }

  const checkAndUnlockBadges = (): Badge[] => {
    const updatedBadges = checkBadges(state.habits, state.badges)
    const newUnlocks = updatedBadges.filter((badge, index) => 
      badge.unlocked && !state.badges[index]?.unlocked
    )
    
    if (newUnlocks.length > 0) {
      dispatch({ type: 'SET_BADGES', payload: updatedBadges })
    }
    
    return newUnlocks
  }

  const contextValue: AppContextType = {
    state,
    dispatch,
    addHabit,
    updateHabit,
    deleteHabit,
    reorderHabits,
    setUser,
    setTheme,
    completeOnboarding,
    checkAndUnlockBadges
  }

  return (
    <AppContext.Provider value={contextValue}>
      {children}
    </AppContext.Provider>
  )
}

export function useApp() {
  const context = useContext(AppContext)
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider')
  }
  return context
}