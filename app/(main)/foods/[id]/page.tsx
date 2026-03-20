"use client"

import { useState, use } from "react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { ChevronLeft, Star, Plus, Check, Flame, Beef, Wheat, Droplets, Leaf } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Slider } from "@/components/ui/slider"
import { Label } from "@/components/ui/label"
import { useFoods } from "@/lib/hooks/use-foods"
import { useMeals } from "@/lib/hooks/use-meals"
import { useAuth } from "@/lib/context/auth-context"
import type { MealType } from "@/lib/types"

export default function FoodDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params)
  const router = useRouter()
  const { user } = useAuth()
  const { getFoodById, foods } = useFoods()
  const { addMeal } = useMeals(user?.id)

  const foodId = parseInt(resolvedParams.id)
  const food = getFoodById(foodId)

  const [quantity, setQuantity] = useState(100)
  const [selectedMealType, setSelectedMealType] = useState<MealType>("lunch")
  const [showSuccess, setShowSuccess] = useState(false)

  if (!food) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-lg font-medium text-foreground mb-2">Food not found</p>
          <Button onClick={() => router.push("/foods")}>Back to Foods</Button>
        </div>
      </div>
    )
  }

  const handleAddMeal = () => {
    addMeal(food, selectedMealType, quantity)
    setShowSuccess(true)
    setTimeout(() => {
      setShowSuccess(false)
      router.push("/dashboard")
    }, 1500)
  }

  // Get similar foods
  const similarFoods = foods
    .filter((f) => f.category === food.category && f.id !== food.id)
    .slice(0, 4)

  const mealTypes: { value: MealType; label: string }[] = [
    { value: "breakfast", label: "Breakfast" },
    { value: "lunch", label: "Lunch" },
    { value: "dinner", label: "Dinner" },
    { value: "snack", label: "Snack" },
  ]

  const nutritionItems = [
    { icon: Flame, label: "Calories", value: food.calories, unit: "kcal", color: "text-orange-500", bg: "bg-orange-50" },
    { icon: Beef, label: "Protein", value: food.protein, unit: "g", color: "text-blue-500", bg: "bg-blue-50" },
    { icon: Wheat, label: "Carbs", value: food.carbs, unit: "g", color: "text-amber-500", bg: "bg-amber-50" },
    { icon: Droplets, label: "Fat", value: food.fat, unit: "g", color: "text-rose-500", bg: "bg-rose-50" },
    { icon: Leaf, label: "Fiber", value: food.fiber, unit: "g", color: "text-green-500", bg: "bg-green-50" },
  ]

  return (
    <div className="min-h-screen pb-32">
      {/* Header image */}
      <div className="relative h-64 bg-gradient-to-br from-green-100 to-emerald-100">
        {food.image_url && (
          <img
            src={food.image_url}
            alt={food.name}
            className="w-full h-full object-cover"
            onError={(e) => {
              e.currentTarget.style.display = "none"
            }}
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />

        {/* Back button */}
        <button
          onClick={() => router.back()}
          className="absolute top-4 left-4 w-10 h-10 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center shadow-md"
        >
          <ChevronLeft className="w-5 h-5 text-foreground" />
        </button>

        {/* Health score */}
        <div className="absolute top-4 right-4">
          <Badge
            className={`${
              food.health_score >= 8
                ? "bg-green-500"
                : food.health_score >= 6
                  ? "bg-yellow-500"
                  : "bg-orange-500"
            } text-white border-0 text-base px-3 py-1`}
          >
            <Star className="w-4 h-4 mr-1" />
            {food.health_score}/10
          </Badge>
        </div>
      </div>

      {/* Content */}
      <div className="px-4 -mt-6 relative z-10">
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="bg-white rounded-t-3xl p-6 shadow-lg"
        >
          {/* Title */}
          <div className="mb-6">
            <div className="flex items-start justify-between mb-2">
              <h1 className="text-2xl font-bold text-foreground">{food.name}</h1>
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              <Badge variant="secondary">{food.category}</Badge>
              <Badge variant="outline">{food.region}</Badge>
              <Badge
                variant="outline"
                className={
                  food.diet_type === "vegetarian"
                    ? "border-green-500 text-green-600"
                    : food.diet_type === "vegan"
                      ? "border-emerald-500 text-emerald-600"
                      : "border-red-500 text-red-600"
                }
              >
                {food.diet_type === "non_veg" ? "Non-Veg" : food.diet_type.charAt(0).toUpperCase() + food.diet_type.slice(1)}
              </Badge>
            </div>
          </div>

          {/* Nutrition grid */}
          <div className="mb-6">
            <h2 className="text-lg font-semibold text-foreground mb-3">Nutrition per 100g</h2>
            <div className="grid grid-cols-3 gap-3">
              {nutritionItems.map((item) => (
                <div key={item.label} className={`${item.bg} rounded-xl p-3 text-center`}>
                  <item.icon className={`w-5 h-5 mx-auto mb-1 ${item.color}`} />
                  <p className="text-lg font-bold text-foreground">
                    {item.value}
                    <span className="text-xs font-normal text-muted-foreground ml-0.5">{item.unit}</span>
                  </p>
                  <p className="text-xs text-muted-foreground">{item.label}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Quantity selector */}
          <div className="mb-6">
            <Label className="flex justify-between mb-3">
              <span className="text-lg font-semibold">Serving Size</span>
              <span className="text-primary font-bold">{quantity}g</span>
            </Label>
            <Slider
              value={[quantity]}
              onValueChange={([val]) => setQuantity(val)}
              min={25}
              max={500}
              step={25}
            />
            <div className="flex justify-between text-xs text-muted-foreground mt-1">
              <span>25g</span>
              <span>500g</span>
            </div>
          </div>

          {/* Calculated values */}
          <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl p-4 mb-6">
            <p className="text-sm text-muted-foreground mb-2">For {quantity}g serving:</p>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-3xl font-bold text-foreground">
                  {Math.round((food.calories * quantity) / 100)}
                </p>
                <p className="text-sm text-muted-foreground">Calories</p>
              </div>
              <div className="flex gap-4 text-center">
                <div>
                  <p className="text-lg font-bold text-blue-600">
                    {Math.round((food.protein * quantity) / 100 * 10) / 10}g
                  </p>
                  <p className="text-xs text-muted-foreground">Protein</p>
                </div>
                <div>
                  <p className="text-lg font-bold text-amber-600">
                    {Math.round((food.carbs * quantity) / 100 * 10) / 10}g
                  </p>
                  <p className="text-xs text-muted-foreground">Carbs</p>
                </div>
                <div>
                  <p className="text-lg font-bold text-rose-600">
                    {Math.round((food.fat * quantity) / 100 * 10) / 10}g
                  </p>
                  <p className="text-xs text-muted-foreground">Fat</p>
                </div>
              </div>
            </div>
          </div>

          {/* Meal type selection */}
          <div className="mb-6">
            <Label className="text-lg font-semibold mb-3 block">Add to Meal</Label>
            <div className="grid grid-cols-4 gap-2">
              {mealTypes.map((type) => (
                <button
                  key={type.value}
                  onClick={() => setSelectedMealType(type.value)}
                  className={`py-3 px-2 rounded-xl text-sm font-medium transition-all ${
                    selectedMealType === type.value
                      ? "bg-primary text-white shadow-md"
                      : "bg-green-50 text-foreground hover:bg-green-100"
                  }`}
                >
                  {type.label}
                </button>
              ))}
            </div>
          </div>

          {/* Similar foods */}
          {similarFoods.length > 0 && (
            <div>
              <h2 className="text-lg font-semibold text-foreground mb-3">Similar Foods</h2>
              <div className="flex gap-3 overflow-x-auto pb-2 -mx-2 px-2">
                {similarFoods.map((f) => (
                  <button
                    key={f.id}
                    onClick={() => router.push(`/foods/${f.id}`)}
                    className="flex-shrink-0 w-28 text-center"
                  >
                    <div className="w-28 h-20 bg-green-100 rounded-xl mb-2 overflow-hidden">
                      {f.image_url && (
                        <img
                          src={f.image_url}
                          alt={f.name}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.currentTarget.style.display = "none"
                          }}
                        />
                      )}
                    </div>
                    <p className="text-xs font-medium text-foreground truncate">{f.name}</p>
                    <p className="text-xs text-muted-foreground">{f.calories} kcal</p>
                  </button>
                ))}
              </div>
            </div>
          )}
        </motion.div>
      </div>

      {/* Fixed bottom button */}
      <div className="fixed bottom-20 lg:bottom-4 left-0 right-0 px-4 lg:max-w-md lg:mx-auto">
        <Button
          onClick={handleAddMeal}
          className="w-full h-14 text-lg font-semibold rounded-2xl bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 shadow-lg"
        >
          <Plus className="w-5 h-5 mr-2" />
          Add {quantity}g to {selectedMealType.charAt(0).toUpperCase() + selectedMealType.slice(1)}
        </Button>
      </div>

      {/* Success toast */}
      {showSuccess && (
        <motion.div
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 50, opacity: 0 }}
          className="fixed bottom-36 left-1/2 -translate-x-1/2 px-6 py-3 bg-green-600 text-white rounded-full shadow-lg flex items-center gap-2 z-50"
        >
          <Check className="w-5 h-5" />
          Added to {selectedMealType}!
        </motion.div>
      )}
    </div>
  )
}
