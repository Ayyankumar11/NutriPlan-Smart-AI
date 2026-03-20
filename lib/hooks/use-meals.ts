"use client"

import { useState, useEffect, useCallback } from "react"
import type { MealLog, DailyMeals, MealType, Food } from "@/lib/types"

const MEALS_KEY = "nutriplan_meals"

function getTodayKey(): string {
  return new Date().toISOString().split("T")[0]
}

function getEmptyDailyMeals(date: string): DailyMeals {
  return {
    date,
    meals: {
      breakfast: [],
      lunch: [],
      dinner: [],
      snack: [],
    },
    totals: {
      calories: 0,
      protein: 0,
      carbs: 0,
      fat: 0,
    },
  }
}

function calculateTotals(meals: DailyMeals["meals"]) {
  const allMeals = [...meals.breakfast, ...meals.lunch, ...meals.dinner, ...meals.snack]
  return {
    calories: Math.round(allMeals.reduce((sum, m) => sum + m.calories, 0)),
    protein: Math.round(allMeals.reduce((sum, m) => sum + m.protein, 0)),
    carbs: Math.round(allMeals.reduce((sum, m) => sum + m.carbs, 0)),
    fat: Math.round(allMeals.reduce((sum, m) => sum + m.fat, 0)),
  }
}

export function useMeals(userId: string | undefined) {
  const [allMeals, setAllMeals] = useState<Record<string, DailyMeals>>({})
  const [isLoading, setIsLoading] = useState(true)

  // Load meals from localStorage
  useEffect(() => {
    if (!userId) {
      setIsLoading(false)
      return
    }

    const stored = localStorage.getItem(`${MEALS_KEY}_${userId}`)
    if (stored) {
      try {
        setAllMeals(JSON.parse(stored))
      } catch {
        setAllMeals({})
      }
    }
    setIsLoading(false)
  }, [userId])

  // Save meals to localStorage whenever they change
  useEffect(() => {
    if (userId && !isLoading) {
      localStorage.setItem(`${MEALS_KEY}_${userId}`, JSON.stringify(allMeals))
    }
  }, [allMeals, userId, isLoading])

  const getTodayMeals = useCallback((): DailyMeals => {
    const today = getTodayKey()
    return allMeals[today] || getEmptyDailyMeals(today)
  }, [allMeals])

  const getMealsForDate = useCallback(
    (date: string): DailyMeals => {
      return allMeals[date] || getEmptyDailyMeals(date)
    },
    [allMeals]
  )

  const addMeal = useCallback(
    (food: Food, mealType: MealType, quantity: number = 100) => {
      const today = getTodayKey()
      const multiplier = quantity / 100

      const mealLog: MealLog = {
        id: crypto.randomUUID(),
        food_id: food.id,
        food_name: food.name,
        meal_type: mealType,
        quantity_g: quantity,
        calories: Math.round(food.calories * multiplier),
        protein: Math.round(food.protein * multiplier * 10) / 10,
        carbs: Math.round(food.carbs * multiplier * 10) / 10,
        fat: Math.round(food.fat * multiplier * 10) / 10,
        date: today,
        created_at: new Date().toISOString(),
      }

      setAllMeals((prev) => {
        const dayMeals = prev[today] || getEmptyDailyMeals(today)
        const updatedMeals = {
          ...dayMeals.meals,
          [mealType]: [...dayMeals.meals[mealType], mealLog],
        }

        return {
          ...prev,
          [today]: {
            date: today,
            meals: updatedMeals,
            totals: calculateTotals(updatedMeals),
          },
        }
      })

      return mealLog
    },
    []
  )

  const removeMeal = useCallback((mealId: string, date: string) => {
    setAllMeals((prev) => {
      const dayMeals = prev[date]
      if (!dayMeals) return prev

      const updatedMeals = {
        breakfast: dayMeals.meals.breakfast.filter((m) => m.id !== mealId),
        lunch: dayMeals.meals.lunch.filter((m) => m.id !== mealId),
        dinner: dayMeals.meals.dinner.filter((m) => m.id !== mealId),
        snack: dayMeals.meals.snack.filter((m) => m.id !== mealId),
      }

      return {
        ...prev,
        [date]: {
          date,
          meals: updatedMeals,
          totals: calculateTotals(updatedMeals),
        },
      }
    })
  }, [])

  const getWeeklyProgress = useCallback(() => {
    const result = []
    for (let i = 6; i >= 0; i--) {
      const date = new Date()
      date.setDate(date.getDate() - i)
      const dateKey = date.toISOString().split("T")[0]
      const dayMeals = allMeals[dateKey] || getEmptyDailyMeals(dateKey)
      result.push({
        date: dateKey,
        day: date.toLocaleDateString("en-US", { weekday: "short" }),
        ...dayMeals.totals,
      })
    }
    return result
  }, [allMeals])

  const getMealHistory = useCallback(
    (days: number = 7): MealLog[] => {
      const logs: MealLog[] = []
      const today = new Date()

      for (let i = 0; i < days; i++) {
        const date = new Date(today)
        date.setDate(date.getDate() - i)
        const dateKey = date.toISOString().split("T")[0]
        const dayMeals = allMeals[dateKey]

        if (dayMeals) {
          logs.push(
            ...dayMeals.meals.breakfast,
            ...dayMeals.meals.lunch,
            ...dayMeals.meals.dinner,
            ...dayMeals.meals.snack
          )
        }
      }

      return logs.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    },
    [allMeals]
  )

  return {
    todayMeals: getTodayMeals(),
    getMealsForDate,
    addMeal,
    removeMeal,
    getWeeklyProgress,
    getMealHistory,
    isLoading,
  }
}
