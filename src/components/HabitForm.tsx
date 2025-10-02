'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Habit, HABIT_CATEGORIES, HABIT_EMOJIS } from '@/types/habit'
import { createHabit } from '@/lib/habits'
import { useApp } from '@/contexts/AppContext'
import { X } from 'lucide-react'

interface HabitFormProps {
  isOpen: boolean
  onClose: () => void
  editingHabit?: Habit | null
}

const DAYS_OF_WEEK = [
  { value: 0, label: 'Sunday', short: 'Sun' },
  { value: 1, label: 'Monday', short: 'Mon' },
  { value: 2, label: 'Tuesday', short: 'Tue' },
  { value: 3, label: 'Wednesday', short: 'Wed' },
  { value: 4, label: 'Thursday', short: 'Thu' },
  { value: 5, label: 'Friday', short: 'Fri' },
  { value: 6, label: 'Saturday', short: 'Sat' },
]

export function HabitForm({ isOpen, onClose, editingHabit }: HabitFormProps) {
  const { addHabit, updateHabit, state } = useApp()
  const [formData, setFormData] = useState({
    title: '',
    emoji: '📝',
    category: 'Other' as const,
    frequency: 'daily' as const,
    customDays: [] as number[]
  })
  const [errors, setErrors] = useState<{ [key: string]: string }>({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    if (editingHabit) {
      setFormData({
        title: editingHabit.title,
        emoji: editingHabit.emoji,
        category: editingHabit.category as any,
        frequency: editingHabit.frequency,
        customDays: editingHabit.customDays || []
      })
    } else {
      setFormData({
        title: '',
        emoji: '📝',
        category: 'Other',
        frequency: 'daily',
        customDays: []
      })
    }
    setErrors({})
  }, [editingHabit, isOpen])

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {}

    if (!formData.title.trim()) {
      newErrors.title = 'Title is required'
    }

    if (formData.frequency === 'custom' && formData.customDays.length === 0) {
      newErrors.customDays = 'Please select at least one day'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) return

    setIsSubmitting(true)

    try {
      if (editingHabit) {
        // Update existing habit
        const updatedHabit: Habit = {
          ...editingHabit,
          title: formData.title.trim(),
          emoji: formData.emoji,
          category: formData.category,
          frequency: formData.frequency,
          customDays: formData.frequency === 'custom' ? formData.customDays : undefined
        }
        updateHabit(updatedHabit)
      } else {
        // Create new habit
        const nextOrder = Math.max(...state.habits.map(h => h.order), -1) + 1
        const newHabit = createHabit({
          title: formData.title.trim(),
          emoji: formData.emoji,
          category: formData.category,
          frequency: formData.frequency,
          customDays: formData.frequency === 'custom' ? formData.customDays : undefined,
          order: nextOrder
        })
        addHabit(newHabit)
      }
      
      onClose()
    } catch (error) {
      console.error('Error saving habit:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleEmojiSelect = (emoji: string) => {
    setFormData({ ...formData, emoji })
  }

  const handleCustomDayToggle = (day: number, checked: boolean) => {
    if (checked) {
      setFormData({
        ...formData,
        customDays: [...formData.customDays, day].sort((a, b) => a - b)
      })
    } else {
      setFormData({
        ...formData,
        customDays: formData.customDays.filter(d => d !== day)
      })
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            {editingHabit ? 'Edit Habit' : 'Create New Habit'}
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={onClose}
              className="h-6 w-6 p-0"
            >
              <X className="w-4 h-4" />
            </Button>
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="title">Habit Title *</Label>
            <Input
              id="title"
              placeholder="e.g., Drink 8 glasses of water"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className={errors.title ? 'border-destructive' : ''}
              data-testid="habit-title-input"
            />
            {errors.title && (
              <p className="text-sm text-destructive">{errors.title}</p>
            )}
          </div>

          {/* Emoji Selection */}
          <div className="space-y-2">
            <Label>Choose an Emoji</Label>
            <div className="grid grid-cols-8 gap-2 p-3 border rounded-lg">
              {HABIT_EMOJIS.map((emoji) => (
                <Button
                  key={emoji}
                  type="button"
                  variant={formData.emoji === emoji ? 'default' : 'ghost'}
                  className="h-10 w-10 p-0 text-xl"
                  onClick={() => handleEmojiSelect(emoji)}
                  data-testid={`emoji-${emoji}`}
                >
                  {emoji}
                </Button>
              ))}
            </div>
          </div>

          {/* Category */}
          <div className="space-y-2">
            <Label htmlFor="category">Category</Label>
            <Select
              value={formData.category}
              onValueChange={(value) => setFormData({ ...formData, category: value as any })}
            >
              <SelectTrigger data-testid="habit-category-select">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {HABIT_CATEGORIES.map((category) => (
                  <SelectItem key={category} value={category}>
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Frequency */}
          <div className="space-y-2">
            <Label htmlFor="frequency">Frequency</Label>
            <Select
              value={formData.frequency}
              onValueChange={(value) => setFormData({ 
                ...formData, 
                frequency: value as any,
                customDays: value === 'custom' ? formData.customDays : []
              })}
            >
              <SelectTrigger data-testid="habit-frequency-select">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="daily">Daily</SelectItem>
                <SelectItem value="weekly">Weekly (Sundays)</SelectItem>
                <SelectItem value="custom">Custom Days</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Custom Days Selection */}
          {formData.frequency === 'custom' && (
            <div className="space-y-2">
              <Label>Select Days *</Label>
              <div className="grid grid-cols-4 gap-2">
                {DAYS_OF_WEEK.map((day) => (
                  <div key={day.value} className="flex items-center space-x-2">
                    <Checkbox
                      id={`day-${day.value}`}
                      checked={formData.customDays.includes(day.value)}
                      onCheckedChange={(checked) => 
                        handleCustomDayToggle(day.value, checked as boolean)
                      }
                      data-testid={`day-checkbox-${day.value}`}
                    />
                    <Label 
                      htmlFor={`day-${day.value}`} 
                      className="text-sm font-normal"
                    >
                      {day.short}
                    </Label>
                  </div>
                ))}
              </div>
              {errors.customDays && (
                <p className="text-sm text-destructive">{errors.customDays}</p>
              )}
            </div>
          )}

          {/* Preview */}
          <Card className="bg-muted/50">
            <CardHeader className="pb-2">
              <div className="flex items-center space-x-3">
                <span className="text-2xl">{formData.emoji}</span>
                <div>
                  <h4 className="font-medium">{formData.title || 'Habit Title'}</h4>
                  <div className="flex items-center space-x-2 mt-1">
                    <Badge variant="outline" className="text-xs">
                      {formData.category}
                    </Badge>
                    <Badge variant="secondary" className="text-xs">
                      {formData.frequency === 'daily' && 'Daily'}
                      {formData.frequency === 'weekly' && 'Weekly'}
                      {formData.frequency === 'custom' && (
                        formData.customDays.length > 0
                          ? formData.customDays.map(d => DAYS_OF_WEEK[d].short).join(', ')
                          : 'Custom'
                      )}
                    </Badge>
                  </div>
                </div>
              </div>
            </CardHeader>
          </Card>

          {/* Submit Buttons */}
          <div className="flex space-x-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="flex-1"
              disabled={isSubmitting}
              data-testid="habit-form-cancel-btn"
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              className="flex-1"
              disabled={isSubmitting}
              data-testid="habit-form-submit-btn"
            >
              {isSubmitting 
                ? 'Saving...' 
                : editingHabit 
                  ? 'Update Habit' 
                  : 'Create Habit'
              }
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}