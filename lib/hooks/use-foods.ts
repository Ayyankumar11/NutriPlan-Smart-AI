"use client"

import { useState, useEffect, useMemo } from "react"
import type { Food } from "@/lib/types"
import foodsData from "@/lib/data/foods.json"

interface UseFoodsOptions {
  search?: string
  region?: string
  category?: string
  maxCalories?: number
  minHealthScore?: number
  dietType?: string
}

export function useFoods(options: UseFoodsOptions = {}) {
  const [isLoading, setIsLoading] = useState(true)

  // Transform the raw JSON data to match our Food type
  const allFoods = useMemo<Food[]>(() => {
    return (foodsData as Record<string, unknown>[]).map((item, index) => ({
      id: index + 1,
      name: String(item.name || ""),
      category: String(item.category || ""),
      region: String(item.region || ""),
      diet_type: getDietType(String(item.name || "")),
      calories: Number(item.calories) || 0,
      protein: Number(item.protein) || 0,
      carbs: Number(item.carbs) || 0,
      fat: Number(item.fat) || 0,
      fiber: Number(item.fiber) || 0,
      serving_size: "100g",
      health_score: Number(item.health_score) || 5,
      image_url: String(item.image_url || ""),
    }))
  }, [])

  useEffect(() => {
    // Simulate loading
    const timer = setTimeout(() => setIsLoading(false), 100)
    return () => clearTimeout(timer)
  }, [])

  const filteredFoods = useMemo(() => {
    let result = [...allFoods]

    // Search filter
    if (options.search) {
      const searchLower = options.search.toLowerCase()
      result = result.filter(
        (food) =>
          food.name.toLowerCase().includes(searchLower) ||
          food.category.toLowerCase().includes(searchLower) ||
          food.region.toLowerCase().includes(searchLower)
      )
    }

    // Region filter
    if (options.region && options.region !== "All") {
      result = result.filter((food) =>
        food.region.toLowerCase().includes(options.region!.toLowerCase())
      )
    }

    // Category filter
    if (options.category && options.category !== "All") {
      result = result.filter((food) =>
        food.category.toLowerCase().includes(options.category!.toLowerCase())
      )
    }

    // Max calories filter
    if (options.maxCalories && options.maxCalories > 0) {
      result = result.filter((food) => food.calories <= options.maxCalories!)
    }

    // Min health score filter
    if (options.minHealthScore && options.minHealthScore > 0) {
      result = result.filter((food) => food.health_score >= options.minHealthScore!)
    }

    // Diet type filter
    if (options.dietType && options.dietType !== "all") {
      const nonVegKeywords = ["chicken", "fish", "mutton", "prawn", "egg", "meat", "lamb", "beef", "pork"]
      const dairyKeywords = ["paneer", "curd", "milk", "ghee", "cheese", "butter", "cream"]

      if (options.dietType === "vegetarian") {
        result = result.filter(
          (food) => !nonVegKeywords.some((k) => food.name.toLowerCase().includes(k))
        )
      } else if (options.dietType === "vegan") {
        result = result.filter(
          (food) =>
            !nonVegKeywords.some((k) => food.name.toLowerCase().includes(k)) &&
            !dairyKeywords.some((k) => food.name.toLowerCase().includes(k))
        )
      } else if (options.dietType === "eggetarian") {
        const meatKeywords = ["chicken", "fish", "mutton", "prawn", "meat", "lamb", "beef", "pork"]
        result = result.filter(
          (food) => !meatKeywords.some((k) => food.name.toLowerCase().includes(k))
        )
      }
    }

    return result
  }, [allFoods, options])

  const categories = useMemo(() => {
    const cats = new Set(allFoods.map((f) => f.category))
    return ["All", ...Array.from(cats).sort()]
  }, [allFoods])

  const regions = useMemo(() => {
    const regs = new Set(allFoods.map((f) => f.region))
    return ["All", ...Array.from(regs).sort()]
  }, [allFoods])

  const getFoodById = (id: number): Food | undefined => {
    return allFoods.find((f) => f.id === id)
  }

  return {
    foods: filteredFoods,
    allFoods,
    categories,
    regions,
    isLoading,
    getFoodById,
    totalCount: allFoods.length,
  }
}

function getDietType(name: string): string {
  const nonVegKeywords = ["chicken", "fish", "mutton", "prawn", "meat", "lamb"]
  const eggKeywords = ["egg"]

  const nameLower = name.toLowerCase()

  if (nonVegKeywords.some((k) => nameLower.includes(k))) return "non_veg"
  if (eggKeywords.some((k) => nameLower.includes(k))) return "eggetarian"
  return "vegetarian"
}
