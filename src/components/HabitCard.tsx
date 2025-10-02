'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { 
  Check, 
  MoreVertical, 
  Edit, 
  Trash2, 
  Flame,
  GripVertical,
  Calendar,
  Target
} from 'lucide-react'
import { Habit } from '@/types/habit'
import { 
  isHabitCompletedToday, 
  toggleHabitCompletion, 
  getHabitStats,
  isHabitDueToday
} from '@/lib/habits'

interface HabitCardProps {
  habit: Habit
  onUpdate: (habit: Habit) => void
  onDelete: (id: string) => void
  onEdit: (habit: Habit) => void
  showConfetti?: (callback: () => void) => void
}

export function HabitCard({ 
  habit, 
  onUpdate, 
  onDelete, 
  onEdit,
  showConfetti
}: HabitCardProps) {
  const [isCompleting, setIsCompleting] = useState(false)
  
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({ id: habit.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  const isCompleted = isHabitCompletedToday(habit)
  const isDue = isHabitDueToday(habit)
  const stats = getHabitStats(habit)

  const handleToggleCompletion = async () => {
    if (isCompleting) return
    
    setIsCompleting(true)
    const updatedHabit = toggleHabitCompletion(habit)
    
    // If habit was just completed (not uncompleted)
    if (!isCompleted && showConfetti) {
      showConfetti(() => {
        onUpdate(updatedHabit)
        setIsCompleting(false)
      })
    } else {
      onUpdate(updatedHabit)
      setIsCompleting(false)
    }
  }

  const getFrequencyText = () => {
    switch (habit.frequency) {
      case 'daily': return 'Daily'
      case 'weekly': return 'Weekly'
      case 'custom': 
        const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
        return habit.customDays ? 
          habit.customDays.map(d => days[d]).join(', ') : 
          'Custom'
      default: return 'Daily'
    }
  }

  if (!isDue) {
    return null // Don't render habits that aren't due today
  }

  return (
    <motion.div
      ref={setNodeRef}
      style={style}
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      whileHover={{ scale: isDragging ? 1 : 1.02 }}
      className={`${isDragging ? 'z-50' : ''}`}
      data-testid="habit-card"
    >
      <Card className={`group relative border-2 transition-all duration-200 ${
        isCompleted 
          ? 'border-green-200 bg-green-50/50 dark:border-green-800 dark:bg-green-950/20' 
          : 'border-border hover:border-primary/20'
      } ${
        isDragging ? 'shadow-lg rotate-2' : 'shadow-sm'
      }`}>
        {/* Drag handle */}
        <div
          className="absolute left-2 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity cursor-grab active:cursor-grabbing"
          {...attributes}
          {...listeners}
        >
          <GripVertical className="w-4 h-4 text-muted-foreground" />
        </div>

        <CardHeader className="pb-3 pl-10">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <motion.div
                className="text-2xl"
                animate={{ scale: isCompleted ? [1, 1.2, 1] : 1 }}
                transition={{ duration: 0.3 }}
              >
                {habit.emoji}
              </motion.div>
              <div className="flex-1">
                <h3 className={`font-semibold text-base ${
                  isCompleted ? 'text-muted-foreground line-through' : ''
                }`}>
                  {habit.title}
                </h3>
                <div className="flex items-center space-x-2 mt-1">
                  <Badge variant="outline" className="text-xs px-2 py-0">
                    {habit.category}
                  </Badge>
                  <Badge variant="secondary" className="text-xs px-2 py-0">
                    {getFrequencyText()}
                  </Badge>
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <AnimatePresence>
                {stats.currentStreak > 0 && (
                  <motion.div
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0, opacity: 0 }}
                    className="flex items-center space-x-1 text-orange-500"
                  >
                    <Flame className="w-4 h-4" />
                    <span className="text-sm font-medium">{stats.currentStreak}</span>
                  </motion.div>
                )}
              </AnimatePresence>
              
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="h-8 w-8 p-0"
                    data-testid="habit-menu-trigger"
                  >
                    <MoreVertical className="w-4 h-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => onEdit(habit)}>
                    <Edit className="w-4 h-4 mr-2" />
                    Edit
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    onClick={() => onDelete(habit.id)}
                    className="text-destructive focus:text-destructive"
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </CardHeader>

        <CardContent className="pt-0 pl-10">
          <div className="space-y-3">
            {/* Progress bar for 7-day completion rate */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">7-day progress</span>
                <span className="font-medium">{stats.completionRate7}%</span>
              </div>
              <Progress value={stats.completionRate7} className="h-2" />
            </div>

            {/* Stats */}
            <div className="flex items-center justify-between text-sm text-muted-foreground">
              <div className="flex items-center space-x-1">
                <Target className="w-4 h-4" />
                <span>{stats.totalCompletions} total</span>
              </div>
              <div className="flex items-center space-x-1">
                <Calendar className="w-4 h-4" />
                <span>Best: {stats.bestStreak} days</span>
              </div>
            </div>

            {/* Complete button */}
            <motion.div 
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Button
                onClick={handleToggleCompletion}
                disabled={isCompleting}
                className={`w-full h-10 font-medium transition-all duration-200 ${
                  isCompleted
                    ? 'bg-green-600 hover:bg-green-700 text-white'
                    : 'bg-primary hover:bg-primary/90'
                }`}
                data-testid="habit-complete-btn"
              >
                <motion.div
                  animate={isCompleting ? { rotate: 360 } : {}}
                  transition={{ duration: 0.5 }}
                  className="flex items-center space-x-2"
                >
                  <Check className="w-4 h-4" />
                  <span>
                    {isCompleting 
                      ? 'Updating...' 
                      : isCompleted 
                        ? 'Completed' 
                        : 'Mark Complete'
                    }
                  </span>
                </motion.div>
              </Button>
            </motion.div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}