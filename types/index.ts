export interface User {
  id: string;
  name: string;
  email: string;
  age: number;
  gender: "male" | "female";
  height: number;
  weight: number;
  goal: "weight-loss" | "weight-gain" | "muscle-gain" | "maintain";
  dietType: "veg" | "non-veg" | "vegan" | "eggetarian";
  activityLevel: "sedentary" | "light" | "moderate" | "active" | "very-active";
  createdAt: string;
  targetCalories?: number;
  targetProtein?: number;
  targetCarbs?: number;
  targetFats?: number;
}

export interface Food {
  id: string;
  name: string;
  nameHindi?: string;
  category: string;
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
  fiber?: number;
  servingSize: string;
  servingGrams: number;
  imageUrl?: string;
  isVeg: boolean;
  isVegan?: boolean;
  region?: string;
}

export interface MealItem {
  id: string;
  foodId: string;
  food: Food;
  quantity: number;
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
}

export interface Meal {
  id: string;
  userId: string;
  date: string;
  type: "breakfast" | "lunch" | "dinner" | "snacks";
  items: MealItem[];
  totalCalories: number;
  totalProtein: number;
  totalCarbs: number;
  totalFats: number;
}

export interface DailyLog {
  date: string;
  meals: Meal[];
  totalCalories: number;
  totalProtein: number;
  totalCarbs: number;
  totalFats: number;
  water: number;
}

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: string;
}

export interface GroceryItem {
  id: string;
  name: string;
  quantity: string;
  category: string;
  checked: boolean;
}

export interface MealPlan {
  id: string;
  date: string;
  breakfast: Food[];
  lunch: Food[];
  dinner: Food[];
  snacks: Food[];
  totalCalories: number;
  totalProtein: number;
  totalCarbs: number;
  totalFats: number;
}

export type FoodCategory =
  | "south-indian"
  | "north-indian"
  | "street-food"
  | "snacks"
  | "beverages"
  | "fruits"
  | "vegetables"
  | "dairy"
  | "grains"
  | "proteins"
  | "sweets"
  | "fast-food";

export const FOOD_CATEGORIES: { value: FoodCategory; label: string }[] = [
  { value: "south-indian", label: "South Indian" },
  { value: "north-indian", label: "North Indian" },
  { value: "street-food", label: "Street Food" },
  { value: "snacks", label: "Snacks" },
  { value: "beverages", label: "Beverages" },
  { value: "fruits", label: "Fruits" },
  { value: "vegetables", label: "Vegetables" },
  { value: "dairy", label: "Dairy" },
  { value: "grains", label: "Grains & Cereals" },
  { value: "proteins", label: "Proteins" },
  { value: "sweets", label: "Sweets & Desserts" },
  { value: "fast-food", label: "Fast Food" },
];

export const GOALS = [
  { value: "weight-loss", label: "Weight Loss", icon: "TrendingDown" },
  { value: "weight-gain", label: "Weight Gain", icon: "TrendingUp" },
  { value: "muscle-gain", label: "Muscle Gain", icon: "Dumbbell" },
  { value: "maintain", label: "Maintain Weight", icon: "Scale" },
];

export const DIET_TYPES = [
  { value: "veg", label: "Vegetarian", color: "green" },
  { value: "non-veg", label: "Non-Vegetarian", color: "red" },
  { value: "vegan", label: "Vegan", color: "emerald" },
  { value: "eggetarian", label: "Eggetarian", color: "yellow" },
];

export const ACTIVITY_LEVELS = [
  { value: "sedentary", label: "Sedentary", description: "Little or no exercise" },
  { value: "light", label: "Lightly Active", description: "Light exercise 1-3 days/week" },
  { value: "moderate", label: "Moderately Active", description: "Moderate exercise 3-5 days/week" },
  { value: "active", label: "Very Active", description: "Hard exercise 6-7 days/week" },
  { value: "very-active", label: "Extra Active", description: "Very hard exercise & physical job" },
];
