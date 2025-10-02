'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
  DragOverlay,
  DragStartEvent
} from '@dnd-kit/core'
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import { restrictToVerticalAxis } from '@dnd-kit/modifiers'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { HabitCard } from '@/components/HabitCard'
import { useApp } from '@/contexts/AppContext'
import { isHabitDueToday } from '@/lib/habits'
import { Habit } from '@/types/habit'
import { Plus, Target, Flame, Trophy, CalendarDays } from 'lucide-react'
import Lottie from 'lottie-react'

// Simple confetti animation data
const confettiAnimation = {
  "v": "5.7.4",
  "fr": 30,
  "ip": 0,
  "op": 60,
  "w": 100,
  "h": 100,
  "nm": "Confetti",
  "ddd": 0,
  "assets": [],
  "layers": [
    {
      "ddd": 0,
      "ind": 1,
      "ty": 4,
      "nm": "Particle",
      "sr": 1,
      "ks": {
        "o": {
          "a": 1,
          "k": [
            { "i": { "x": [0.833], "y": [0.833] }, "o": { "x": [0.167], "y": [0.167] }, "t": 0, "s": [100] },
            { "t": 59, "s": [0] }
          ]
        },
        "r": {
          "a": 1,
          "k": [
            { "i": { "x": [0.833], "y": [0.833] }, "o": { "x": [0.167], "y": [0.167] }, "t": 0, "s": [0] },
            { "t": 59, "s": [360] }
          ]
        },
        "p": {
          "a": 1,
          "k": [
            { "i": { "x": 0.833, "y": 0.833 }, "o": { "x": 0.167, "y": 0.167 }, "t": 0, "s": [50, 20, 0] },
            { "t": 59, "s": [50, 80, 0] }
          ]
        },
        "s": { "a": 0, "k": [50, 50, 100] }
      },
      "ao": 0,
      "shapes": [
        {
          "ty": "gr",
          "it": [
            {
              "ty": "rc",
              "d": 1,
              "s": { "a": 0, "k": [10, 10] },
              "p": { "a": 0, "k": [0, 0] },
              "r": { "a": 0, "k": 2 }
            },
            {
              "ty": "fl",
              "c": { "a": 0, "k": [0.2, 0.6, 1, 1] },
              "o": { "a": 0, "k": 100 }
            },
            {
              "ty": "tr",
              "p": { "a": 0, "k": [0, 0] },
              "s": { "a": 0, "k": [100, 100] }
            }
          ]
        }
      ],
      "ip": 0,
      "op": 60,
      "st": 0
    }
  ]
}

interface HabitDashboardProps {
  onAddHabit: () => void
  onEditHabit: (habit: Habit) => void
}

export function HabitDashboard({ onAddHabit, onEditHabit }: HabitDashboardProps) {
  const { state, updateHabit, deleteHabit, reorderHabits } = useApp()
  const { habits } = state
  const [activeId, setActiveId] = useState<string | null>(null)
  const [showConfetti, setShowConfetti] = useState(false)
  
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  // Filter habits due today and sort by order
  const todayHabits = habits
    .filter(habit => isHabitDueToday(habit))
    .sort((a, b) => a.order - b.order)

  const completedToday = todayHabits.filter(habit =>
    habit.completions.some(completion => {
      const today = new Date()
      const completionDate = new Date(completion)
      return completionDate.toDateString() === today.toDateString()
    })
  )

  const totalStreak = habits.reduce((sum, habit) => sum + habit.streak, 0)
  const totalCompletions = habits.reduce((sum, habit) => sum + habit.completions.length, 0)
  const completionRate = todayHabits.length > 0 ? Math.round((completedToday.length / todayHabits.length) * 100) : 0

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string)
  }

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event

    if (active.id !== over?.id) {
      const oldIndex = todayHabits.findIndex(habit => habit.id === active.id)
      const newIndex = todayHabits.findIndex(habit => habit.id === over?.id)
      
      const reorderedHabits = arrayMove(todayHabits, oldIndex, newIndex)
      const updatedHabits = reorderedHabits.map((habit, index) => ({
        ...habit,
        order: index
      }))
      
      reorderHabits(updatedHabits)
    }
    
    setActiveId(null)
  }

  const triggerConfetti = (callback: () => void) => {
    setShowConfetti(true)
    // Call the callback after a short delay
    setTimeout(() => {
      callback()
      setTimeout(() => setShowConfetti(false), 2000)
    }, 100)
  }

  const handleDeleteHabit = (id: string) => {
    if (confirm('Are you sure you want to delete this habit?')) {
      deleteHabit(id)
    }
  }

  return (
    <div className="container max-w-4xl mx-auto px-4 py-6 space-y-6">
      {/* Confetti overlay */}
      {showConfetti && (
        <div className="fixed inset-0 pointer-events-none z-50 flex items-center justify-center">
          <Lottie 
            animationData={confettiAnimation} 
            loop={false} 
            className="w-32 h-32"
          />
        </div>
      )}
      
      {/* Stats overview */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="grid grid-cols-2 md:grid-cols-4 gap-4"
      >
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Target className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{completedToday.length}/{todayHabits.length}</p>
                <p className="text-sm text-muted-foreground">Today</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-orange-500/10 rounded-lg">
                <Flame className="w-5 h-5 text-orange-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{totalStreak}</p>
                <p className="text-sm text-muted-foreground">Total Streak</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-green-500/10 rounded-lg">
                <Trophy className="w-5 h-5 text-green-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{completionRate}%</p>
                <p className="text-sm text-muted-foreground">Success Rate</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-blue-500/10 rounded-lg">
                <CalendarDays className="w-5 h-5 text-blue-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{totalCompletions}</p>
                <p className="text-sm text-muted-foreground">Total Done</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Today's Habits */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-xl font-semibold">Today's Habits</CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                {new Date().toLocaleDateString('en-US', { 
                  weekday: 'long', 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}
              </p>
            </div>
            <Button onClick={onAddHabit} data-testid="dashboard-add-habit-btn">
              <Plus className="w-4 h-4 mr-2" />
              Add Habit
            </Button>
          </div>
        </CardHeader>
        
        <CardContent>
          {todayHabits.length === 0 ? (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-12"
            >
              <div className="text-6xl mb-4">🌱</div>
              <h3 className="text-xl font-semibold mb-2">No habits for today</h3>
              <p className="text-muted-foreground mb-4">
                Start building better habits by creating your first one.
              </p>
              <Button onClick={onAddHabit} data-testid="empty-state-add-habit-btn">
                <Plus className="w-4 h-4 mr-2" />
                Create Your First Habit
              </Button>
            </motion.div>
          ) : (
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragStart={handleDragStart}
              onDragEnd={handleDragEnd}
              modifiers={[restrictToVerticalAxis]}
            >
              <SortableContext 
                items={todayHabits.map(h => h.id)} 
                strategy={verticalListSortingStrategy}
              >
                <div className="space-y-4" data-testid="habits-list">
                  {todayHabits.map((habit) => (
                    <HabitCard
                      key={habit.id}
                      habit={habit}
                      onUpdate={updateHabit}
                      onDelete={handleDeleteHabit}
                      onEdit={onEditHabit}
                      showConfetti={triggerConfetti}
                    />
                  ))}
                </div>
              </SortableContext>
              
              <DragOverlay>
                {activeId ? (
                  <div className="opacity-50">
                    <HabitCard
                      habit={todayHabits.find(h => h.id === activeId)!}
                      onUpdate={() => {}}
                      onDelete={() => {}}
                      onEdit={() => {}}
                    />
                  </div>
                ) : null}
              </DragOverlay>
            </DndContext>
          )}
        </CardContent>
      </Card>
    </div>
  )
}