'use client'

import { motion } from 'framer-motion'
import { useApp } from '@/contexts/AppContext'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { Badge } from '@/components/ui/badge'
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel
} from '@/components/ui/dropdown-menu'
import { 
  Sun, 
  Moon, 
  Monitor, 
  User, 
  Trophy, 
  Settings,
  LogOut,
  Download,
  Upload
} from 'lucide-react'
import { ThemeMode } from '@/types/habit'
import { exportData, importData, clearAllData } from '@/lib/storage'

interface HeaderProps {
  onAddHabit?: () => void
}

export function Header({ onAddHabit }: HeaderProps) {
  const { state, setTheme } = useApp()
  const { user, theme, badges } = state
  
  const unlockedBadges = badges.filter(b => b.unlocked)
  const todayHabits = state.habits.filter(habit => {
    const today = new Date().getDay()
    return habit.frequency === 'daily' || 
           (habit.customDays && habit.customDays.includes(today))
  })
  const completedToday = todayHabits.filter(habit => 
    habit.completions.some(completion => {
      const today = new Date()
      const completionDate = new Date(completion)
      return completionDate.toDateString() === today.toDateString()
    })
  )

  const handleThemeChange = (newTheme: ThemeMode) => {
    setTheme(newTheme)
  }

  const handleExportData = () => {
    const data = exportData()
    const blob = new Blob([data], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `habit-tracker-backup-${new Date().toISOString().split('T')[0]}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const handleImportData = () => {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = '.json'
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0]
      if (file) {
        const reader = new FileReader()
        reader.onload = (e) => {
          const content = e.target?.result as string
          if (importData(content)) {
            // Refresh the page to load new data
            window.location.reload()
          } else {
            alert('Failed to import data. Please check the file format.')
          }
        }
        reader.readAsText(file)
      }
    }
    input.click()
  }

  const handleClearData = () => {
    if (confirm('Are you sure you want to clear all data? This cannot be undone.')) {
      clearAllData()
      window.location.reload()
    }
  }

  const getThemeIcon = () => {
    switch (theme) {
      case 'light': return <Sun className="w-4 h-4" />
      case 'dark': return <Moon className="w-4 h-4" />
      default: return <Monitor className="w-4 h-4" />
    }
  }

  return (
    <motion.header 
      className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60"
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="container flex h-16 items-center justify-between px-4">
        <div className="flex items-center space-x-4">
          <motion.div
            whileHover={{ scale: 1.05 }}
            className="flex items-center space-x-2"
          >
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-lg">H</span>
            </div>
            <h1 className="font-bold text-xl tracking-tight">Habit Tracker</h1>
          </motion.div>
          
          {completedToday.length > 0 && (
            <Badge variant="secondary" className="hidden sm:flex">
              {completedToday.length}/{todayHabits.length} completed today
            </Badge>
          )}
        </div>

        <div className="flex items-center space-x-4">
          {onAddHabit && (
            <Button 
              onClick={onAddHabit} 
              size="sm" 
              className="hidden sm:flex"
              data-testid="header-add-habit-btn"
            >
              Add Habit
            </Button>
          )}
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button 
                variant="ghost" 
                size="sm" 
                className="relative"
                data-testid="header-user-menu"
              >
                <User className="w-4 h-4" />
                <span className="ml-2 hidden sm:inline">{user?.name}</span>
                {unlockedBadges.length > 0 && (
                  <Badge 
                    variant="secondary" 
                    className="ml-2 px-1 py-0 text-xs min-w-5 h-5"
                  >
                    {unlockedBadges.length}
                  </Badge>
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>My Account</DropdownMenuLabel>
              <DropdownMenuItem disabled>
                <User className="w-4 h-4 mr-2" />
                {user?.name}
              </DropdownMenuItem>
              
              <DropdownMenuSeparator />
              
              <DropdownMenuItem>
                <Trophy className="w-4 h-4 mr-2" />
                Badges ({unlockedBadges.length})
              </DropdownMenuItem>
              
              <DropdownMenuSeparator />
              <DropdownMenuLabel>Theme</DropdownMenuLabel>
              
              <DropdownMenuItem onClick={() => handleThemeChange('light')}>
                <Sun className="w-4 h-4 mr-2" />
                Light
                {theme === 'light' && <span className="ml-auto">✓</span>}
              </DropdownMenuItem>
              
              <DropdownMenuItem onClick={() => handleThemeChange('dark')}>
                <Moon className="w-4 h-4 mr-2" />
                Dark
                {theme === 'dark' && <span className="ml-auto">✓</span>}
              </DropdownMenuItem>
              
              <DropdownMenuItem onClick={() => handleThemeChange('system')}>
                <Monitor className="w-4 h-4 mr-2" />
                System
                {theme === 'system' && <span className="ml-auto">✓</span>}
              </DropdownMenuItem>
              
              <DropdownMenuSeparator />
              <DropdownMenuLabel>Data</DropdownMenuLabel>
              
              <DropdownMenuItem onClick={handleExportData}>
                <Download className="w-4 h-4 mr-2" />
                Export Data
              </DropdownMenuItem>
              
              <DropdownMenuItem onClick={handleImportData}>
                <Upload className="w-4 h-4 mr-2" />
                Import Data
              </DropdownMenuItem>
              
              <DropdownMenuSeparator />
              
              <DropdownMenuItem 
                onClick={handleClearData}
                className="text-destructive focus:text-destructive"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Clear All Data
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </motion.header>
  )
}