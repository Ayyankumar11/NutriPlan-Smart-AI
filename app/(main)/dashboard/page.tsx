"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { Bell, Sparkles, ChevronRight, TrendingUp } from "lucide-react"
import { useAuth } from "@/lib/context/auth-context"
import { useMeals } from "@/lib/hooks/use-meals"
import { CalorieRing } from "@/components/dashboard/calorie-ring"
import { MacroPills } from "@/components/dashboard/macro-pills"
import { MealCard } from "@/components/dashboard/meal-card"
import { QuickActions } from "@/components/dashboard/quick-actions"
import { Card } from "@/components/ui/card"
import type { MealType } from "@/lib/types"

function getGreeting(): string {
  const hour = new Date().getHours()
  if (hour < 12) return "Good Morning"
  if (hour < 17) return "Good Afternoon"
  return "Good Evening"
}

function formatDate(date: Date): string {
  return date.toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  })
}

export default function DashboardPage() {
  const router = useRouter()
  const { user } = useAuth()
  const { todayMeals, removeMeal } = useMeals(user?.id)
  const [selectedMealType, setSelectedMealType] = useState<MealType | null>(null)

  const handleAddMeal = (mealType: MealType) => {
    router.push(`/foods?meal=${mealType}`)
  }

  const handleRemoveMeal = (mealId: string) => {
    removeMeal(mealId, todayMeals.date)
  }

  const dailyTarget = user?.daily_calorie_target || 2000

  // AI tip based on current state
  const getAITip = () => {
    const percentage = (todayMeals.totals.calories / dailyTarget) * 100
    if (percentage < 30) {
      return "Start your day with a nutritious breakfast rich in protein!"
    }
    if (percentage < 60) {
      return "Great progress! Consider adding some vegetables for fiber."
    }
    if (percentage < 90) {
      return "Almost there! A light snack can help reach your goal."
    }
    return "You've reached your calorie goal for today!"
  }

  return (
    <div className="min-h-screen">
      <div className="max-w-2xl mx-auto px-4 py-6 lg:py-8">
        {/* Header */}
        <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="flex items-center justify-between mb-6"
        >
          <div>
            <p className="text-muted-foreground text-sm">{formatDate(new Date())}</p>
            <h1 className="text-2xl font-bold text-foreground">
              {getGreeting()}, {user?.full_name?.split(" ")[0] || "there"}!
            </h1>
          </div>
          <button className="w-10 h-10 rounded-xl bg-white shadow-sm border border-green-100 flex items-center justify-center hover:bg-green-50 transition-colors">
            <Bell className="w-5 h-5 text-muted-foreground" />
          </button>
        </motion.div>

        {/* Calorie Ring Card */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="p-6 mb-6 bg-white/80 backdrop-blur-sm border-green-100">
            <div className="flex flex-col items-center">
              <CalorieRing consumed={todayMeals.totals.calories} target={dailyTarget} size={180} />
              <div className="w-full mt-6">
                <MacroPills
                  protein={todayMeals.totals.protein}
                  carbs={todayMeals.totals.carbs}
                  fat={todayMeals.totals.fat}
                />
              </div>
            </div>
          </Card>
        </motion.div>

        {/* AI Tip Card */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="p-4 mb-6 bg-gradient-to-r from-green-500 to-emerald-600 border-0">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center flex-shrink-0">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-white/80">AI Tip</p>
                <p className="text-white font-medium">{getAITip()}</p>
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Quick Actions */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="mb-6"
        >
          <h2 className="text-lg font-semibold text-foreground mb-3">Quick Actions</h2>
          <QuickActions />
        </motion.div>

        {/* Today's Meals */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="mb-6"
        >
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-semibold text-foreground">Today&apos;s Meals</h2>
            <button
              onClick={() => router.push("/progress")}
              className="flex items-center gap-1 text-sm text-primary font-medium hover:underline"
            >
              View History
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
          <div className="grid gap-4">
            {(["breakfast", "lunch", "dinner", "snack"] as MealType[]).map((mealType) => (
              <MealCard
                key={mealType}
                mealType={mealType}
                meals={todayMeals.meals[mealType]}
                onAddMeal={handleAddMeal}
                onRemoveMeal={handleRemoveMeal}
              />
            ))}
          </div>
        </motion.div>

        {/* Progress Link */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          <button
            onClick={() => router.push("/progress")}
            className="w-full p-4 bg-white/80 backdrop-blur-sm rounded-2xl border border-green-100 flex items-center gap-4 hover:bg-white transition-colors"
          >
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-600 flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-white" />
            </div>
            <div className="flex-1 text-left">
              <p className="font-semibold text-foreground">View Your Progress</p>
              <p className="text-sm text-muted-foreground">Track weekly calories and meal history</p>
            </div>
            <ChevronRight className="w-5 h-5 text-muted-foreground" />
          </button>
        </motion.div>
      </div>
    </div>
  )
}
