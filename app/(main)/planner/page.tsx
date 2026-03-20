"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  Sparkles,
  CalendarDays,
  ChevronDown,
  ChevronRight,
  Loader2,
  Check,
  Coffee,
  Sun,
  Moon,
  Cookie,
  Plus,
  RefreshCw,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { Badge } from "@/components/ui/badge"
import { useAuth } from "@/lib/context/auth-context"
import { useFoods } from "@/lib/hooks/use-foods"
import { useMeals } from "@/lib/hooks/use-meals"
import { generateMealPlan } from "@/lib/utils/ai-mock"
import type { MealPlanConfig, DayPlan, MealType } from "@/lib/types"

const goals = [
  { value: "lose_weight", label: "Weight Loss" },
  { value: "gain_muscle", label: "Muscle Gain" },
  { value: "maintain", label: "Maintain" },
  { value: "eat_healthy", label: "Eat Healthy" },
]

const dietTypes = [
  { value: "vegetarian", label: "Vegetarian" },
  { value: "vegan", label: "Vegan" },
  { value: "eggetarian", label: "Eggetarian" },
  { value: "non_veg", label: "Non-Veg" },
]

const regions = ["All", "South Indian", "North Indian", "Pan India"]

const mealIcons = {
  breakfast: Coffee,
  lunch: Sun,
  dinner: Moon,
  snack: Cookie,
}

export default function PlannerPage() {
  const { user } = useAuth()
  const { allFoods } = useFoods()
  const { addMeal } = useMeals(user?.id)

  const [config, setConfig] = useState<MealPlanConfig>({
    goal: user?.goal || "eat_healthy",
    diet_type: user?.diet_type || "vegetarian",
    region: user?.region_preference || "All",
    daily_calories: user?.daily_calorie_target || 2000,
    days: 7,
  })

  const [mealPlan, setMealPlan] = useState<DayPlan[] | null>(null)
  const [isGenerating, setIsGenerating] = useState(false)
  const [expandedDay, setExpandedDay] = useState<number | null>(0)
  const [showSuccess, setShowSuccess] = useState<string | null>(null)

  const handleGenerate = async () => {
    setIsGenerating(true)
    // Simulate AI processing
    await new Promise((resolve) => setTimeout(resolve, 2000))
    const plan = generateMealPlan(config, allFoods, user)
    setMealPlan(plan)
    setExpandedDay(0)
    setIsGenerating(false)
  }

  const handleAddDayMeals = (day: DayPlan) => {
    const today = new Date().toISOString().split("T")[0]
    if (day.date === today) {
      // Add all meals from this day
      day.meals.breakfast.forEach((meal) => {
        const food = allFoods.find((f) => f.id === meal.food_id)
        if (food) addMeal(food, "breakfast", 100)
      })
      day.meals.lunch.forEach((meal) => {
        const food = allFoods.find((f) => f.id === meal.food_id)
        if (food) addMeal(food, "lunch", 100)
      })
      day.meals.dinner.forEach((meal) => {
        const food = allFoods.find((f) => f.id === meal.food_id)
        if (food) addMeal(food, "dinner", 100)
      })
      day.meals.snack.forEach((meal) => {
        const food = allFoods.find((f) => f.id === meal.food_id)
        if (food) addMeal(food, "snack", 100)
      })

      setShowSuccess(`Day ${day.day} meals added!`)
      setTimeout(() => setShowSuccess(null), 2000)
    }
  }

  return (
    <div className="min-h-screen pb-20">
      <div className="max-w-2xl mx-auto px-4 py-6">
        {/* Header */}
        <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="mb-6"
        >
          <h1 className="text-2xl font-bold text-foreground mb-1">AI Meal Planner</h1>
          <p className="text-muted-foreground">Generate personalized meal plans with AI</p>
        </motion.div>

        {/* Config Card */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="p-5 mb-6 bg-white/80 backdrop-blur-sm border-green-100">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center">
                <Sparkles className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="font-semibold text-foreground">Configure Your Plan</h2>
                <p className="text-sm text-muted-foreground">Customize based on your preferences</p>
              </div>
            </div>

            <div className="space-y-5">
              {/* Goal */}
              <div>
                <Label className="mb-2 block">Goal</Label>
                <div className="grid grid-cols-2 gap-2">
                  {goals.map((goal) => (
                    <button
                      key={goal.value}
                      onClick={() => setConfig((c) => ({ ...c, goal: goal.value }))}
                      className={`py-2.5 px-3 rounded-xl text-sm font-medium transition-all ${
                        config.goal === goal.value
                          ? "bg-primary text-white"
                          : "bg-green-50 text-foreground hover:bg-green-100"
                      }`}
                    >
                      {goal.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Diet type */}
              <div>
                <Label className="mb-2 block">Diet Type</Label>
                <div className="grid grid-cols-2 gap-2">
                  {dietTypes.map((diet) => (
                    <button
                      key={diet.value}
                      onClick={() => setConfig((c) => ({ ...c, diet_type: diet.value }))}
                      className={`py-2.5 px-3 rounded-xl text-sm font-medium transition-all ${
                        config.diet_type === diet.value
                          ? "bg-primary text-white"
                          : "bg-green-50 text-foreground hover:bg-green-100"
                      }`}
                    >
                      {diet.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Region */}
              <div>
                <Label className="mb-2 block">Cuisine Preference</Label>
                <div className="flex flex-wrap gap-2">
                  {regions.map((region) => (
                    <button
                      key={region}
                      onClick={() => setConfig((c) => ({ ...c, region }))}
                      className={`py-2 px-4 rounded-full text-sm font-medium transition-all ${
                        config.region === region
                          ? "bg-primary text-white"
                          : "bg-green-50 text-foreground hover:bg-green-100"
                      }`}
                    >
                      {region}
                    </button>
                  ))}
                </div>
              </div>

              {/* Calories */}
              <div>
                <Label className="flex justify-between mb-3">
                  <span>Daily Calories</span>
                  <span className="text-primary font-semibold">{config.daily_calories} kcal</span>
                </Label>
                <Slider
                  value={[config.daily_calories]}
                  onValueChange={([val]) => setConfig((c) => ({ ...c, daily_calories: val }))}
                  min={1200}
                  max={3500}
                  step={100}
                />
              </div>

              {/* Days */}
              <div>
                <Label className="flex justify-between mb-3">
                  <span>Number of Days</span>
                  <span className="text-primary font-semibold">{config.days} days</span>
                </Label>
                <Slider
                  value={[config.days]}
                  onValueChange={([val]) => setConfig((c) => ({ ...c, days: val }))}
                  min={1}
                  max={14}
                  step={1}
                />
              </div>
            </div>

            <Button
              onClick={handleGenerate}
              disabled={isGenerating}
              className="w-full h-14 mt-6 text-lg font-semibold rounded-2xl bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 shadow-lg"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Generating Plan...
                </>
              ) : mealPlan ? (
                <>
                  <RefreshCw className="w-5 h-5 mr-2" />
                  Regenerate Plan
                </>
              ) : (
                <>
                  <Sparkles className="w-5 h-5 mr-2" />
                  Generate Meal Plan
                </>
              )}
            </Button>
          </Card>
        </motion.div>

        {/* Meal Plan Results */}
        <AnimatePresence>
          {mealPlan && (
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -20, opacity: 0 }}
              className="space-y-4"
            >
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-foreground">Your {config.days}-Day Plan</h2>
                <Badge variant="secondary">
                  <CalendarDays className="w-3 h-3 mr-1" />
                  {config.daily_calories} kcal/day
                </Badge>
              </div>

              {mealPlan.map((day, dayIndex) => {
                const isExpanded = expandedDay === dayIndex
                const isToday = day.date === new Date().toISOString().split("T")[0]

                return (
                  <motion.div
                    key={day.day}
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: dayIndex * 0.1 }}
                  >
                    <Card className="overflow-hidden border-green-100">
                      {/* Day header */}
                      <button
                        onClick={() => setExpandedDay(isExpanded ? null : dayIndex)}
                        className="w-full p-4 flex items-center justify-between hover:bg-green-50/50 transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <div
                            className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold ${
                              isToday
                                ? "bg-primary text-white"
                                : "bg-green-100 text-foreground"
                            }`}
                          >
                            {day.day}
                          </div>
                          <div className="text-left">
                            <p className="font-semibold text-foreground">
                              Day {day.day}
                              {isToday && (
                                <Badge className="ml-2 bg-primary/20 text-primary border-0">Today</Badge>
                              )}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              {new Date(day.date).toLocaleDateString("en-US", {
                                weekday: "short",
                                month: "short",
                                day: "numeric",
                              })}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="text-right">
                            <p className="font-semibold text-foreground">{day.totals.calories} kcal</p>
                            <p className="text-xs text-muted-foreground">
                              P: {day.totals.protein}g | C: {day.totals.carbs}g | F: {day.totals.fat}g
                            </p>
                          </div>
                          <ChevronDown
                            className={`w-5 h-5 text-muted-foreground transition-transform ${
                              isExpanded ? "rotate-180" : ""
                            }`}
                          />
                        </div>
                      </button>

                      {/* Expanded meals */}
                      <AnimatePresence>
                        {isExpanded && (
                          <motion.div
                            initial={{ height: 0 }}
                            animate={{ height: "auto" }}
                            exit={{ height: 0 }}
                            className="overflow-hidden"
                          >
                            <div className="px-4 pb-4 space-y-3">
                              {(["breakfast", "lunch", "dinner", "snack"] as MealType[]).map((mealType) => {
                                const Icon = mealIcons[mealType]
                                const meals = day.meals[mealType]
                                if (meals.length === 0) return null

                                return (
                                  <div
                                    key={mealType}
                                    className="bg-green-50/50 rounded-xl p-3"
                                  >
                                    <div className="flex items-center gap-2 mb-2">
                                      <Icon className="w-4 h-4 text-primary" />
                                      <span className="text-sm font-medium text-foreground capitalize">
                                        {mealType}
                                      </span>
                                    </div>
                                    <div className="space-y-1">
                                      {meals.map((meal, i) => (
                                        <div
                                          key={i}
                                          className="flex items-center justify-between text-sm"
                                        >
                                          <span className="text-muted-foreground">{meal.food_name}</span>
                                          <span className="text-foreground font-medium">
                                            {meal.calories} kcal
                                          </span>
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                )
                              })}

                              {isToday && (
                                <Button
                                  onClick={() => handleAddDayMeals(day)}
                                  variant="outline"
                                  className="w-full mt-2"
                                >
                                  <Plus className="w-4 h-4 mr-2" />
                                  Add Today&apos;s Meals to Log
                                </Button>
                              )}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </Card>
                  </motion.div>
                )
              })}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Success toast */}
      <AnimatePresence>
        {showSuccess && (
          <motion.div
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 50, opacity: 0 }}
            className="fixed bottom-24 left-1/2 -translate-x-1/2 px-6 py-3 bg-green-600 text-white rounded-full shadow-lg flex items-center gap-2 z-50"
          >
            <Check className="w-5 h-5" />
            {showSuccess}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
