"use client"

import { createContext, useContext, useEffect, useState, type ReactNode } from "react"
import type { User, OnboardingData } from "@/lib/types"

interface AuthContextType {
  user: User | null
  isLoading: boolean
  isAuthenticated: boolean
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>
  signup: (email: string, password: string) => Promise<{ success: boolean; error?: string }>
  logout: () => void
  completeOnboarding: (data: OnboardingData) => void
  updateUser: (data: Partial<User>) => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

const STORAGE_KEY = "nutriplan_user"
const USERS_KEY = "nutriplan_users"

function calculateDailyCalories(data: OnboardingData): number {
  // Mifflin-St Jeor Equation
  let bmr: number
  if (data.gender === "male") {
    bmr = 10 * data.weight + 6.25 * data.height - 5 * data.age + 5
  } else {
    bmr = 10 * data.weight + 6.25 * data.height - 5 * data.age - 161
  }

  // Activity multiplier
  const activityMultipliers = {
    sedentary: 1.2,
    light: 1.375,
    moderate: 1.55,
    active: 1.725,
  }
  const tdee = bmr * activityMultipliers[data.activity_level]

  // Goal adjustment
  switch (data.goal) {
    case "lose_weight":
      return Math.round(tdee - 500)
    case "gain_muscle":
      return Math.round(tdee + 300)
    case "maintain":
      return Math.round(tdee)
    case "eat_healthy":
      return Math.round(tdee)
    default:
      return Math.round(tdee)
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Load user from localStorage on mount
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored) {
      try {
        const parsed = JSON.parse(stored)
        setUser(parsed)
      } catch {
        localStorage.removeItem(STORAGE_KEY)
      }
    }
    setIsLoading(false)
  }, [])

  const login = async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 500))

    // Check users in localStorage
    const usersJson = localStorage.getItem(USERS_KEY)
    const users = usersJson ? JSON.parse(usersJson) : {}

    if (users[email] && users[email].password === password) {
      const userData = users[email].user
      setUser(userData)
      localStorage.setItem(STORAGE_KEY, JSON.stringify(userData))
      return { success: true }
    }

    return { success: false, error: "Invalid email or password" }
  }

  const signup = async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 500))

    // Check if user already exists
    const usersJson = localStorage.getItem(USERS_KEY)
    const users = usersJson ? JSON.parse(usersJson) : {}

    if (users[email]) {
      return { success: false, error: "Email already registered" }
    }

    // Create new user (partial - needs onboarding)
    const newUser: Partial<User> = {
      id: crypto.randomUUID(),
      email,
      created_at: new Date().toISOString(),
    }

    // Store in users list
    users[email] = { password, user: newUser }
    localStorage.setItem(USERS_KEY, JSON.stringify(users))

    // Set as current user
    setUser(newUser as User)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newUser))

    return { success: true }
  }

  const logout = () => {
    setUser(null)
    localStorage.removeItem(STORAGE_KEY)
  }

  const completeOnboarding = (data: OnboardingData) => {
    if (!user) return

    const dailyCalorieTarget = calculateDailyCalories(data)

    const updatedUser: User = {
      ...user,
      ...data,
      daily_calorie_target: dailyCalorieTarget,
    }

    // Update in users list
    const usersJson = localStorage.getItem(USERS_KEY)
    const users = usersJson ? JSON.parse(usersJson) : {}
    if (users[user.email]) {
      users[user.email].user = updatedUser
      localStorage.setItem(USERS_KEY, JSON.stringify(users))
    }

    setUser(updatedUser)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedUser))
  }

  const updateUser = (data: Partial<User>) => {
    if (!user) return

    const updatedUser = { ...user, ...data }

    // Recalculate calories if relevant fields changed
    if (data.weight || data.height || data.age || data.goal || data.activity_level || data.gender) {
      updatedUser.daily_calorie_target = calculateDailyCalories(updatedUser as OnboardingData)
    }

    // Update in users list
    const usersJson = localStorage.getItem(USERS_KEY)
    const users = usersJson ? JSON.parse(usersJson) : {}
    if (users[user.email]) {
      users[user.email].user = updatedUser
      localStorage.setItem(USERS_KEY, JSON.stringify(users))
    }

    setUser(updatedUser)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedUser))
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: !!user && !!user.full_name,
        login,
        signup,
        logout,
        completeOnboarding,
        updateUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
