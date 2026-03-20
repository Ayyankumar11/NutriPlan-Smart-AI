// User types
export interface User {
  id: string
  email: string
  full_name: string
  age: number
  gender: "male" | "female" | "other"
  weight: number
  height: number
  goal: "lose_weight" | "gain_muscle" | "maintain" | "eat_healthy"
  diet_type: "vegetarian" | "vegan" | "eggetarian" | "non_veg"
  activity_level: "sedentary" | "light" | "moderate" | "active"
  region_preference: string
  daily_calorie_target: number
  created_at: string
}

export interface OnboardingData {
  full_name: string
  age: number
  gender: "male" | "female" | "other"
  weight: number
  height: number
  goal: "lose_weight" | "gain_muscle" | "maintain" | "eat_healthy"
  diet_type: "vegetarian" | "vegan" | "eggetarian" | "non_veg"
  activity_level: "sedentary" | "light" | "moderate" | "active"
  region_preference: string
}

// Food types
export interface Food {
  id: number
  name: string
  category: string
  region: string
  diet_type: string
  calories: number
  protein: number
  carbs: number
  fat: number
  fiber: number
  serving_size: string
  health_score: number
  image_url: string
}

// Meal types
export type MealType = "breakfast" | "lunch" | "dinner" | "snack"

export interface MealLog {
  id: string
  food_id: number
  food_name: string
  meal_type: MealType
  quantity_g: number
  calories: number
  protein: number
  carbs: number
  fat: number
  date: string
  created_at: string
}

export interface DailyMeals {
  date: string
  meals: {
    breakfast: MealLog[]
    lunch: MealLog[]
    dinner: MealLog[]
    snack: MealLog[]
  }
  totals: {
    calories: number
    protein: number
    carbs: number
    fat: number
  }
}

// AI Meal Plan types
export interface MealPlanConfig {
  goal: string
  diet_type: string
  region: string
  daily_calories: number
  days: number
}

export interface PlannedMeal {
  food_id: number
  food_name: string
  meal_type: MealType
  serving_size: string
  calories: number
  protein: number
  carbs: number
  fat: number
}

export interface DayPlan {
  day: number
  date: string
  meals: {
    breakfast: PlannedMeal[]
    lunch: PlannedMeal[]
    dinner: PlannedMeal[]
    snack: PlannedMeal[]
  }
  totals: {
    calories: number
    protein: number
    carbs: number
    fat: number
  }
}

export interface MealPlan {
  id: string
  config: MealPlanConfig
  days: DayPlan[]
  created_at: string
}

// Chat types
export interface ChatMessage {
  id: string
  role: "user" | "assistant"
  content: string
  suggestions?: string[]
  timestamp: string
}

// Grocery types
export interface GroceryItem {
  id: string
  name: string
  category: string
  quantity: string
  checked: boolean
}

export interface GroceryList {
  id: string
  items: GroceryItem[]
  created_at: string
}

// Progress types
export interface DailyProgress {
  date: string
  calories: number
  protein: number
  carbs: number
  fat: number
  target_calories: number
}
