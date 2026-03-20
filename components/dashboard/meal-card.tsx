"use client"

import { motion } from "framer-motion"
import { Plus, Coffee, Sun, Moon, Cookie, X } from "lucide-react"
import type { MealLog, MealType } from "@/lib/types"
import { Button } from "@/components/ui/button"

interface MealCardProps {
  mealType: MealType
  meals: MealLog[]
  onAddMeal: (mealType: MealType) => void
  onRemoveMeal?: (mealId: string) => void
}

const mealConfig = {
  breakfast: {
    icon: Coffee,
    label: "Breakfast",
    time: "6:00 - 10:00 AM",
    gradient: "from-orange-400 to-amber-500",
    bg: "bg-orange-50",
  },
  lunch: {
    icon: Sun,
    label: "Lunch",
    time: "12:00 - 2:00 PM",
    gradient: "from-green-400 to-emerald-500",
    bg: "bg-green-50",
  },
  dinner: {
    icon: Moon,
    label: "Dinner",
    time: "7:00 - 9:00 PM",
    gradient: "from-indigo-400 to-purple-500",
    bg: "bg-indigo-50",
  },
  snack: {
    icon: Cookie,
    label: "Snacks",
    time: "Anytime",
    gradient: "from-pink-400 to-rose-500",
    bg: "bg-pink-50",
  },
}

export function MealCard({ mealType, meals, onAddMeal, onRemoveMeal }: MealCardProps) {
  const config = mealConfig[mealType]
  const Icon = config.icon
  const totalCalories = meals.reduce((sum, m) => sum + m.calories, 0)

  return (
    <motion.div
      initial={{ y: 20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className={`${config.bg} rounded-2xl p-4 border border-white/50`}
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-3">
          <div
            className={`w-10 h-10 rounded-xl bg-gradient-to-br ${config.gradient} flex items-center justify-center shadow-sm`}
          >
            <Icon className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="font-semibold text-foreground">{config.label}</h3>
            <p className="text-xs text-muted-foreground">{config.time}</p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-lg font-bold text-foreground">{totalCalories}</p>
          <p className="text-xs text-muted-foreground">kcal</p>
        </div>
      </div>

      {/* Meal items */}
      {meals.length > 0 && (
        <div className="space-y-2 mb-3">
          {meals.map((meal) => (
            <div
              key={meal.id}
              className="flex items-center justify-between py-2 px-3 bg-white/60 rounded-xl"
            >
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground truncate">{meal.food_name}</p>
                <p className="text-xs text-muted-foreground">{meal.quantity_g}g</p>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold text-foreground">{meal.calories} kcal</span>
                {onRemoveMeal && (
                  <button
                    onClick={() => onRemoveMeal(meal.id)}
                    className="w-6 h-6 rounded-full bg-red-100 flex items-center justify-center text-red-500 hover:bg-red-200 transition-colors"
                  >
                    <X className="w-3 h-3" />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add button */}
      <Button
        variant="outline"
        onClick={() => onAddMeal(mealType)}
        className="w-full h-10 rounded-xl border-dashed border-2 bg-white/50 hover:bg-white"
      >
        <Plus className="w-4 h-4 mr-2" />
        Add Food
      </Button>
    </motion.div>
  )
}
