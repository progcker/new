'use client'

import { useState, useEffect } from 'react'
import { AppProvider, useApp } from '@/contexts/AppContext'
import { ThemeProvider } from '@/components/ThemeProvider'
import { OnboardingFlow } from '@/components/OnboardingFlow'
import { Header } from '@/components/Header'
import { HabitDashboard } from '@/components/HabitDashboard'
import { HabitForm } from '@/components/HabitForm'
import { LoadingScreen } from '@/components/LoadingScreen'
import { Habit } from '@/types/habit'
import { motion, AnimatePresence } from 'framer-motion'

function AppContent() {
  const { state } = useApp()
  const [showHabitForm, setShowHabitForm] = useState(false)
  const [editingHabit, setEditingHabit] = useState<Habit | null>(null)

  const handleAddHabit = () => {
    setEditingHabit(null)
    setShowHabitForm(true)
  }

  const handleEditHabit = (habit: Habit) => {
    setEditingHabit(habit)
    setShowHabitForm(true)
  }

  const handleCloseForm = () => {
    setShowHabitForm(false)
    setEditingHabit(null)
  }

  if (state.isLoading) {
    return <LoadingScreen />
  }

  if (state.isOnboarding) {
    return (
      <AnimatePresence mode="wait">
        <motion.div
          key="onboarding"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
        >
          <OnboardingFlow />
        </motion.div>
      </AnimatePresence>
    )
  }

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key="app"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.3 }}
        className="min-h-screen bg-background"
        data-testid="main-app"
      >
        <Header onAddHabit={handleAddHabit} />
        <main className="pb-20">
          <HabitDashboard 
            onAddHabit={handleAddHabit}
            onEditHabit={handleEditHabit}
          />
        </main>
        
        <HabitForm
          isOpen={showHabitForm}
          onClose={handleCloseForm}
          editingHabit={editingHabit}
        />
      </motion.div>
    </AnimatePresence>
  )
}

export default function App() {
  return (
    <AppProvider>
      <ThemeProvider />
      <AppContent />
    </AppProvider>
  )
}