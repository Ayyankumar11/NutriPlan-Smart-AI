"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Filter, X, ChevronDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import { Label } from "@/components/ui/label"

interface FoodFiltersProps {
  categories: string[]
  regions: string[]
  selectedCategory: string
  selectedRegion: string
  selectedDiet: string
  maxCalories: number
  minHealthScore: number
  onCategoryChange: (category: string) => void
  onRegionChange: (region: string) => void
  onDietChange: (diet: string) => void
  onMaxCaloriesChange: (calories: number) => void
  onMinHealthScoreChange: (score: number) => void
  onReset: () => void
}

const dietOptions = [
  { value: "all", label: "All" },
  { value: "vegetarian", label: "Vegetarian" },
  { value: "vegan", label: "Vegan" },
  { value: "eggetarian", label: "Eggetarian" },
  { value: "non_veg", label: "Non-Veg" },
]

export function FoodFilters({
  categories,
  regions,
  selectedCategory,
  selectedRegion,
  selectedDiet,
  maxCalories,
  minHealthScore,
  onCategoryChange,
  onRegionChange,
  onDietChange,
  onMaxCaloriesChange,
  onMinHealthScoreChange,
  onReset,
}: FoodFiltersProps) {
  const [isOpen, setIsOpen] = useState(false)

  const hasFilters =
    selectedCategory !== "All" ||
    selectedRegion !== "All" ||
    selectedDiet !== "all" ||
    maxCalories < 500 ||
    minHealthScore > 0

  return (
    <div className="mb-4">
      {/* Toggle button */}
      <div className="flex items-center gap-2">
        <Button
          variant={isOpen ? "default" : "outline"}
          onClick={() => setIsOpen(!isOpen)}
          className="gap-2"
        >
          <Filter className="w-4 h-4" />
          Filters
          {hasFilters && (
            <span className="w-5 h-5 rounded-full bg-white text-primary text-xs flex items-center justify-center">
              !
            </span>
          )}
          <ChevronDown className={`w-4 h-4 transition-transform ${isOpen ? "rotate-180" : ""}`} />
        </Button>
        {hasFilters && (
          <Button variant="ghost" size="sm" onClick={onReset} className="text-muted-foreground">
            <X className="w-4 h-4 mr-1" />
            Clear
          </Button>
        )}
      </div>

      {/* Filter panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="mt-4 p-4 bg-white rounded-2xl border border-green-100 space-y-5">
              {/* Category */}
              <div>
                <Label className="text-sm font-medium mb-2 block">Category</Label>
                <div className="flex flex-wrap gap-2">
                  {categories.slice(0, 10).map((cat) => (
                    <button
                      key={cat}
                      onClick={() => onCategoryChange(cat)}
                      className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                        selectedCategory === cat
                          ? "bg-primary text-white"
                          : "bg-green-50 text-foreground hover:bg-green-100"
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>

              {/* Region */}
              <div>
                <Label className="text-sm font-medium mb-2 block">Region</Label>
                <div className="flex flex-wrap gap-2">
                  {regions.map((reg) => (
                    <button
                      key={reg}
                      onClick={() => onRegionChange(reg)}
                      className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                        selectedRegion === reg
                          ? "bg-primary text-white"
                          : "bg-green-50 text-foreground hover:bg-green-100"
                      }`}
                    >
                      {reg}
                    </button>
                  ))}
                </div>
              </div>

              {/* Diet Type */}
              <div>
                <Label className="text-sm font-medium mb-2 block">Diet Type</Label>
                <div className="flex flex-wrap gap-2">
                  {dietOptions.map((diet) => (
                    <button
                      key={diet.value}
                      onClick={() => onDietChange(diet.value)}
                      className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                        selectedDiet === diet.value
                          ? "bg-primary text-white"
                          : "bg-green-50 text-foreground hover:bg-green-100"
                      }`}
                    >
                      {diet.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Max Calories */}
              <div>
                <Label className="text-sm font-medium mb-3 flex justify-between">
                  <span>Max Calories</span>
                  <span className="text-primary">{maxCalories} kcal</span>
                </Label>
                <Slider
                  value={[maxCalories]}
                  onValueChange={([val]) => onMaxCaloriesChange(val)}
                  min={50}
                  max={500}
                  step={10}
                  className="w-full"
                />
              </div>

              {/* Min Health Score */}
              <div>
                <Label className="text-sm font-medium mb-3 flex justify-between">
                  <span>Min Health Score</span>
                  <span className="text-primary">{minHealthScore}/10</span>
                </Label>
                <Slider
                  value={[minHealthScore]}
                  onValueChange={([val]) => onMinHealthScoreChange(val)}
                  min={0}
                  max={10}
                  step={1}
                  className="w-full"
                />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
