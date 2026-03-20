"use client"

import { motion } from "framer-motion"
import { Plus, Star, Flame, Beef } from "lucide-react"
import type { Food, MealType } from "@/lib/types"
import { Badge } from "@/components/ui/badge"

interface FoodCardProps {
  food: Food
  onAdd?: (food: Food) => void
  onClick?: (food: Food) => void
  showAddButton?: boolean
  mealType?: MealType
  index?: number
}

export function FoodCard({ food, onAdd, onClick, showAddButton = true, index = 0 }: FoodCardProps) {
  return (
    <motion.div
      initial={{ y: 20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ delay: index * 0.05 }}
      className="bg-white rounded-2xl border border-green-100 overflow-hidden hover:shadow-lg transition-all duration-300 group"
    >
      {/* Image */}
      <div
        className="relative h-32 bg-gradient-to-br from-green-100 to-emerald-100 cursor-pointer"
        onClick={() => onClick?.(food)}
      >
        {food.image_url ? (
          <img
            src={food.image_url}
            alt={food.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            loading="lazy"
            onError={(e) => {
              e.currentTarget.style.display = "none"
            }}
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-4xl opacity-50">🍽️</span>
          </div>
        )}
        {/* Health score badge */}
        <div className="absolute top-2 left-2">
          <Badge
            className={`${
              food.health_score >= 8
                ? "bg-green-500"
                : food.health_score >= 6
                  ? "bg-yellow-500"
                  : "bg-orange-500"
            } text-white border-0`}
          >
            <Star className="w-3 h-3 mr-1" />
            {food.health_score}
          </Badge>
        </div>
        {/* Region badge */}
        <div className="absolute top-2 right-2">
          <Badge variant="secondary" className="bg-white/90 text-xs">
            {food.region.split(" ")[0]}
          </Badge>
        </div>
      </div>

      {/* Content */}
      <div className="p-3">
        <h3
          className="font-semibold text-foreground truncate cursor-pointer hover:text-primary transition-colors"
          onClick={() => onClick?.(food)}
        >
          {food.name}
        </h3>
        <p className="text-xs text-muted-foreground mb-2">{food.category}</p>

        {/* Macros */}
        <div className="flex items-center gap-2 text-xs mb-3">
          <div className="flex items-center gap-1 text-orange-600">
            <Flame className="w-3 h-3" />
            <span>{food.calories} kcal</span>
          </div>
          <div className="flex items-center gap-1 text-blue-600">
            <Beef className="w-3 h-3" />
            <span>{food.protein}g</span>
          </div>
        </div>

        {/* Add button */}
        {showAddButton && onAdd && (
          <button
            onClick={(e) => {
              e.stopPropagation()
              onAdd(food)
            }}
            className="w-full py-2 px-3 bg-primary/10 hover:bg-primary text-primary hover:text-white rounded-xl text-sm font-medium flex items-center justify-center gap-1 transition-all duration-200"
          >
            <Plus className="w-4 h-4" />
            Add to Meal
          </button>
        )}
      </div>
    </motion.div>
  )
}
