"use client"

import { useState, useCallback, useMemo, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { motion } from "framer-motion"
import { Search, Loader2, Check, X, ChevronLeft } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { FoodCard } from "@/components/food/food-card"
import { FoodFilters } from "@/components/food/food-filters"
import { useFoods } from "@/lib/hooks/use-foods"
import { useMeals } from "@/lib/hooks/use-meals"
import { useAuth } from "@/lib/context/auth-context"
import type { Food, MealType } from "@/lib/types"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import { Slider } from "@/components/ui/slider"
import { Label } from "@/components/ui/label"

function FoodsContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const mealTypeParam = searchParams.get("meal") as MealType | null

  const { user } = useAuth()
  const { addMeal } = useMeals(user?.id)

  const [search, setSearch] = useState("")
  const [debouncedSearch, setDebouncedSearch] = useState("")
  const [category, setCategory] = useState("All")
  const [region, setRegion] = useState("All")
  const [diet, setDiet] = useState("all")
  const [maxCalories, setMaxCalories] = useState(500)
  const [minHealthScore, setMinHealthScore] = useState(0)

  // Add meal dialog state
  const [selectedFood, setSelectedFood] = useState<Food | null>(null)
  const [selectedMealType, setSelectedMealType] = useState<MealType>(mealTypeParam || "breakfast")
  const [quantity, setQuantity] = useState(100)
  const [showSuccess, setShowSuccess] = useState(false)

  // Debounce search
  const handleSearchChange = useCallback((value: string) => {
    setSearch(value)
    const timer = setTimeout(() => setDebouncedSearch(value), 300)
    return () => clearTimeout(timer)
  }, [])

  const { foods, categories, regions, isLoading, totalCount } = useFoods({
    search: debouncedSearch,
    category,
    region,
    dietType: diet,
    maxCalories,
    minHealthScore,
  })

  const handleResetFilters = () => {
    setCategory("All")
    setRegion("All")
    setDiet("all")
    setMaxCalories(500)
    setMinHealthScore(0)
  }

  const handleAddFood = (food: Food) => {
    setSelectedFood(food)
    setQuantity(100)
    if (mealTypeParam) {
      setSelectedMealType(mealTypeParam)
    }
  }

  const confirmAddMeal = () => {
    if (!selectedFood) return

    addMeal(selectedFood, selectedMealType, quantity)
    setSelectedFood(null)
    setShowSuccess(true)

    setTimeout(() => {
      setShowSuccess(false)
      if (mealTypeParam) {
        router.push("/dashboard")
      }
    }, 1500)
  }

  const mealTypes: { value: MealType; label: string }[] = [
    { value: "breakfast", label: "Breakfast" },
    { value: "lunch", label: "Lunch" },
    { value: "dinner", label: "Dinner" },
    { value: "snack", label: "Snack" },
  ]

  return (
    <div className="min-h-screen">
      <div className="max-w-4xl mx-auto px-4 py-6">
        {/* Header */}
        <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="mb-6"
        >
          {mealTypeParam && (
            <button
              onClick={() => router.back()}
              className="flex items-center gap-1 text-muted-foreground hover:text-foreground mb-4"
            >
              <ChevronLeft className="w-5 h-5" />
              Back to Dashboard
            </button>
          )}
          <h1 className="text-2xl font-bold text-foreground mb-1">
            {mealTypeParam ? `Add to ${mealTypeParam.charAt(0).toUpperCase() + mealTypeParam.slice(1)}` : "Food Database"}
          </h1>
          <p className="text-muted-foreground">
            {totalCount} Indian foods with complete nutrition info
          </p>
        </motion.div>

        {/* Search */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="mb-4"
        >
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <Input
              placeholder="Search foods..."
              value={search}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="pl-12 h-14 bg-white"
            />
            {search && (
              <button
                onClick={() => {
                  setSearch("")
                  setDebouncedSearch("")
                }}
                className="absolute right-4 top-1/2 -translate-y-1/2"
              >
                <X className="w-5 h-5 text-muted-foreground hover:text-foreground" />
              </button>
            )}
          </div>
        </motion.div>

        {/* Filters */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <FoodFilters
            categories={categories}
            regions={regions}
            selectedCategory={category}
            selectedRegion={region}
            selectedDiet={diet}
            maxCalories={maxCalories}
            minHealthScore={minHealthScore}
            onCategoryChange={setCategory}
            onRegionChange={setRegion}
            onDietChange={setDiet}
            onMaxCaloriesChange={setMaxCalories}
            onMinHealthScoreChange={setMinHealthScore}
            onReset={handleResetFilters}
          />
        </motion.div>

        {/* Results count */}
        <p className="text-sm text-muted-foreground mb-4">
          Showing {foods.length} {foods.length === 1 ? "food" : "foods"}
        </p>

        {/* Foods grid */}
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : foods.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-lg font-medium text-foreground mb-2">No foods found</p>
            <p className="text-muted-foreground">Try adjusting your search or filters</p>
            <Button variant="outline" onClick={handleResetFilters} className="mt-4">
              Reset Filters
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {foods.slice(0, 50).map((food, index) => (
              <FoodCard
                key={food.id}
                food={food}
                onAdd={handleAddFood}
                onClick={() => router.push(`/foods/${food.id}`)}
                showAddButton
                index={index}
              />
            ))}
          </div>
        )}

        {foods.length > 50 && (
          <p className="text-center text-muted-foreground mt-6">
            Showing first 50 results. Refine your search to see more specific foods.
          </p>
        )}
      </div>

      {/* Add to Meal Dialog */}
      <Dialog open={!!selectedFood} onOpenChange={() => setSelectedFood(null)}>
        <DialogContent className="max-w-sm mx-4">
          <DialogHeader>
            <DialogTitle>Add to Meal</DialogTitle>
            <DialogDescription>
              Add {selectedFood?.name} to your meal log
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 py-4">
            {/* Quantity slider */}
            <div>
              <Label className="flex justify-between mb-3">
                <span>Quantity</span>
                <span className="text-primary font-semibold">{quantity}g</span>
              </Label>
              <Slider
                value={[quantity]}
                onValueChange={([val]) => setQuantity(val)}
                min={25}
                max={500}
                step={25}
              />
            </div>

            {/* Calculated nutrition */}
            {selectedFood && (
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-orange-50 rounded-xl p-3 text-center">
                  <p className="text-lg font-bold text-foreground">
                    {Math.round((selectedFood.calories * quantity) / 100)}
                  </p>
                  <p className="text-xs text-muted-foreground">kcal</p>
                </div>
                <div className="bg-blue-50 rounded-xl p-3 text-center">
                  <p className="text-lg font-bold text-foreground">
                    {Math.round((selectedFood.protein * quantity) / 100 * 10) / 10}g
                  </p>
                  <p className="text-xs text-muted-foreground">Protein</p>
                </div>
              </div>
            )}

            {/* Meal type selection */}
            <div>
              <Label className="mb-2 block">Add to</Label>
              <div className="grid grid-cols-2 gap-2">
                {mealTypes.map((type) => (
                  <button
                    key={type.value}
                    onClick={() => setSelectedMealType(type.value)}
                    className={`py-3 px-4 rounded-xl text-sm font-medium transition-all ${
                      selectedMealType === type.value
                        ? "bg-primary text-white"
                        : "bg-green-50 text-foreground hover:bg-green-100"
                    }`}
                  >
                    {type.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="flex gap-3">
            <Button variant="outline" onClick={() => setSelectedFood(null)} className="flex-1">
              Cancel
            </Button>
            <Button onClick={confirmAddMeal} className="flex-1">
              <Check className="w-4 h-4 mr-2" />
              Add Food
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Success toast */}
      {showSuccess && (
        <motion.div
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 50, opacity: 0 }}
          className="fixed bottom-24 left-1/2 -translate-x-1/2 px-6 py-3 bg-green-600 text-white rounded-full shadow-lg flex items-center gap-2"
        >
          <Check className="w-5 h-5" />
          Added to {selectedMealType}!
        </motion.div>
      )}
    </div>
  )
}

export default function FoodsPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    }>
      <FoodsContent />
    </Suspense>
  )
}
