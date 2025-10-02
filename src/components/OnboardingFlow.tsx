'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useApp } from '@/contexts/AppContext'
import { User } from '@/types/habit'
import { Sparkles, Target, Trophy } from 'lucide-react'

export function OnboardingFlow() {
  const [name, setName] = useState('')
  const [step, setStep] = useState(0)
  const { completeOnboarding } = useApp()

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (name.trim()) {
      const user: User = {
        name: name.trim(),
        createdAt: new Date(),
        totalHabits: 0,
        totalCompletions: 0
      }
      completeOnboarding(user)
    }
  }

  const steps = [
    {
      title: 'Welcome to Habit Tracker',
      description: 'Build better habits with our professional, matte-designed tracker',
      icon: <Sparkles className="w-12 h-12 text-primary" />
    },
    {
      title: 'Track Your Progress',
      description: 'Visualize your journey with streaks, heatmaps, and achievements',
      icon: <Target className="w-12 h-12 text-primary" />
    },
    {
      title: 'Earn Achievements',
      description: 'Unlock badges and celebrate milestones as you build consistency',
      icon: <Trophy className="w-12 h-12 text-primary" />
    }
  ]

  const currentStep = steps[step]

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-background">
      <div className="w-full max-w-md">
        <motion.div
          key={step}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3 }}
        >
          <Card className="border-0 shadow-lg bg-card/50 backdrop-blur-sm">
            <CardHeader className="text-center pb-4">
              <motion.div 
                className="mx-auto mb-4"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
              >
                {currentStep.icon}
              </motion.div>
              <CardTitle className="text-2xl font-semibold tracking-tight">
                {currentStep.title}
              </CardTitle>
              <CardDescription className="text-muted-foreground mt-2">
                {currentStep.description}
              </CardDescription>
            </CardHeader>
            
            <CardContent>
              {step < 2 ? (
                <div className="space-y-4">
                  <div className="flex justify-center space-x-2 mb-6">
                    {steps.map((_, index) => (
                      <div
                        key={index}
                        className={`h-2 w-8 rounded-full transition-colors ${
                          index <= step ? 'bg-primary' : 'bg-muted'
                        }`}
                      />
                    ))}
                  </div>
                  <Button 
                    onClick={() => setStep(step + 1)} 
                    className="w-full h-11 font-medium"
                    data-testid="onboarding-next-btn"
                  >
                    Continue
                  </Button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="name" className="text-sm font-medium">
                      What should we call you?
                    </Label>
                    <Input
                      id="name"
                      type="text"
                      placeholder="Enter your name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="h-11"
                      data-testid="onboarding-name-input"
                      required
                      autoFocus
                    />
                  </div>
                  
                  <div className="flex justify-center space-x-2 mb-6">
                    {steps.map((_, index) => (
                      <div
                        key={index}
                        className={`h-2 w-8 rounded-full transition-colors ${
                          index <= step ? 'bg-primary' : 'bg-muted'
                        }`}
                      />
                    ))}
                  </div>
                  
                  <Button 
                    type="submit" 
                    className="w-full h-11 font-medium"
                    disabled={!name.trim()}
                    data-testid="onboarding-complete-btn"
                  >
                    Get Started
                  </Button>
                </form>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  )
}