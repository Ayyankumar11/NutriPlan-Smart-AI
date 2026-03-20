import type { Food, MealPlanConfig, DayPlan, ChatMessage, User } from "@/lib/types"

// AI Chat response generator
export function generateAIResponse(message: string, user: User | null, foods: Food[]): ChatMessage {
  const lowerMessage = message.toLowerCase()
  let response = ""
  let suggestions: string[] = []

  // Greeting patterns
  if (lowerMessage.includes("hello") || lowerMessage.includes("hi") || lowerMessage.includes("hey")) {
    response = `Hello${user?.full_name ? `, ${user.full_name}` : ""}! I'm your NutriPlan AI assistant. I can help you with:\n\n- Finding healthy Indian foods\n- Suggesting meals based on your goals\n- Answering nutrition questions\n- Creating meal plans\n\nWhat would you like to know?`
    suggestions = ["High protein breakfast", "Low calorie lunch", "My daily calories", "Suggest a meal plan"]
  }
  // Calorie queries
  else if (lowerMessage.includes("calorie") && lowerMessage.includes("daily")) {
    if (user?.daily_calorie_target) {
      response = `Based on your profile, your daily calorie target is **${user.daily_calorie_target} kcal**.\n\nThis is calculated from your:\n- Age: ${user.age}\n- Weight: ${user.weight}kg\n- Height: ${user.height}cm\n- Activity: ${user.activity_level}\n- Goal: ${user.goal.replace("_", " ")}`
      suggestions = ["How to reduce calories?", "High protein foods", "Low calorie meals"]
    } else {
      response = "I don't have your profile data yet. Please complete your profile setup to get personalized calorie recommendations."
      suggestions = ["Setup my profile", "General calorie info"]
    }
  }
  // Protein queries
  else if (lowerMessage.includes("protein") || lowerMessage.includes("high protein")) {
    const highProteinFoods = foods.filter((f) => f.protein >= 15).slice(0, 5)
    response = `Here are some high-protein Indian foods:\n\n${highProteinFoods.map((f) => `- **${f.name}**: ${f.protein}g protein, ${f.calories} kcal`).join("\n")}\n\nPaneer, dal, eggs, chicken, and fish are excellent protein sources in Indian cuisine!`
    suggestions = ["Vegetarian protein", "Post-workout meal", "Protein for muscle gain"]
  }
  // Weight loss
  else if (lowerMessage.includes("weight loss") || lowerMessage.includes("lose weight")) {
    const lowCalFoods = foods.filter((f) => f.calories <= 150 && f.health_score >= 7).slice(0, 5)
    response = `For weight loss, focus on:\n\n1. **Calorie deficit**: Eat 500 fewer calories than you burn\n2. **High protein**: Keeps you full longer\n3. **Fiber-rich foods**: Vegetables, dal, whole grains\n\nGreat low-calorie options:\n${lowCalFoods.map((f) => `- ${f.name}: ${f.calories} kcal`).join("\n")}`
    suggestions = ["Low calorie breakfast", "Healthy snacks", "Create weight loss plan"]
  }
  // Breakfast
  else if (lowerMessage.includes("breakfast")) {
    const breakfastFoods = foods.filter((f) => f.category === "Breakfast").slice(0, 5)
    response = `Here are healthy Indian breakfast options:\n\n${breakfastFoods.map((f) => `- **${f.name}**: ${f.calories} kcal, ${f.protein}g protein`).join("\n")}\n\nIdli, poha, and upma are light yet nutritious choices!`
    suggestions = ["High protein breakfast", "Quick breakfast", "South Indian breakfast"]
  }
  // Lunch
  else if (lowerMessage.includes("lunch")) {
    const lunchFoods = foods.filter((f) => f.category === "Main Course" || f.category === "Curry").slice(0, 5)
    response = `Great Indian lunch ideas:\n\n${lunchFoods.map((f) => `- **${f.name}**: ${f.calories} kcal`).join("\n")}\n\nA balanced lunch should have rice/roti, dal/curry, and vegetables.`
    suggestions = ["Light lunch options", "Office lunch ideas", "Vegetarian lunch"]
  }
  // Dinner
  else if (lowerMessage.includes("dinner")) {
    response = `For a healthy Indian dinner:\n\n- Keep it **light** - your metabolism slows at night\n- Have dinner **2-3 hours** before sleep\n- Include **protein** for muscle repair\n- Avoid heavy curries late at night\n\nGood options: Khichdi, vegetable soup, grilled fish, dal with chapati.`
    suggestions = ["Light dinner options", "Protein-rich dinner", "Quick dinner recipes"]
  }
  // Snacks
  else if (lowerMessage.includes("snack")) {
    const snacks = foods.filter((f) => f.category === "Snack" && f.health_score >= 6).slice(0, 5)
    response = `Healthy Indian snack ideas:\n\n${snacks.map((f) => `- **${f.name}**: ${f.calories} kcal`).join("\n")}\n\nRoasted chana, fruits, makhana, and sprouts are great healthy options!`
    suggestions = ["Evening snacks", "Office snacks", "Post-workout snacks"]
  }
  // Vegetarian
  else if (lowerMessage.includes("vegetarian") || lowerMessage.includes("veg")) {
    const vegFoods = foods.filter((f) => !f.name.toLowerCase().includes("chicken") && !f.name.toLowerCase().includes("fish") && !f.name.toLowerCase().includes("mutton") && !f.name.toLowerCase().includes("prawn")).slice(0, 6)
    response = `Great vegetarian Indian options:\n\n${vegFoods.map((f) => `- **${f.name}**: ${f.calories} kcal, ${f.protein}g protein`).join("\n")}\n\nIndian cuisine has amazing vegetarian variety with dal, paneer, and vegetables!`
    suggestions = ["Vegan options", "Vegetarian protein", "Paneer recipes"]
  }
  // Food specific query
  else if (lowerMessage.includes("calories in") || lowerMessage.includes("nutrition")) {
    const foodName = message.split(/calories in|nutrition of/i)[1]?.trim()
    if (foodName) {
      const food = foods.find((f) => f.name.toLowerCase().includes(foodName.toLowerCase()))
      if (food) {
        response = `**${food.name}** (per serving):\n\n- Calories: ${food.calories} kcal\n- Protein: ${food.protein}g\n- Carbs: ${food.carbs}g\n- Fat: ${food.fat}g\n- Health Score: ${food.health_score}/10`
        suggestions = ["Similar foods", "Add to my meal", "Healthier alternatives"]
      } else {
        response = `I couldn't find "${foodName}" in my database. Try searching for common Indian foods like idli, dosa, dal, or biryani.`
        suggestions = ["Browse all foods", "Search again", "Popular foods"]
      }
    }
  }
  // Default response
  else {
    response = `I understand you're asking about "${message}". Here are some things I can help you with:\n\n- Finding foods by nutrition (protein, calories)\n- Meal suggestions for your goals\n- Diet planning tips\n- Indian food nutrition info\n\nTry asking something specific!`
    suggestions = ["High protein foods", "Low calorie meals", "My daily calories", "Suggest breakfast"]
  }

  return {
    id: crypto.randomUUID(),
    role: "assistant",
    content: response,
    suggestions,
    timestamp: new Date().toISOString(),
  }
}

// Meal plan generator
export function generateMealPlan(config: MealPlanConfig, foods: Food[], user: User | null): DayPlan[] {
  const { diet_type, region, daily_calories, days } = config

  // Filter foods based on preferences
  let filteredFoods = [...foods]

  // Diet type filter
  if (diet_type === "vegetarian") {
    filteredFoods = filteredFoods.filter(
      (f) =>
        !f.name.toLowerCase().includes("chicken") &&
        !f.name.toLowerCase().includes("fish") &&
        !f.name.toLowerCase().includes("mutton") &&
        !f.name.toLowerCase().includes("prawn") &&
        !f.name.toLowerCase().includes("egg")
    )
  } else if (diet_type === "vegan") {
    filteredFoods = filteredFoods.filter(
      (f) =>
        !f.name.toLowerCase().includes("chicken") &&
        !f.name.toLowerCase().includes("fish") &&
        !f.name.toLowerCase().includes("mutton") &&
        !f.name.toLowerCase().includes("prawn") &&
        !f.name.toLowerCase().includes("egg") &&
        !f.name.toLowerCase().includes("paneer") &&
        !f.name.toLowerCase().includes("curd") &&
        !f.name.toLowerCase().includes("milk")
    )
  } else if (diet_type === "eggetarian") {
    filteredFoods = filteredFoods.filter(
      (f) =>
        !f.name.toLowerCase().includes("chicken") &&
        !f.name.toLowerCase().includes("fish") &&
        !f.name.toLowerCase().includes("mutton") &&
        !f.name.toLowerCase().includes("prawn")
    )
  }

  // Region filter (if not "All")
  if (region && region !== "All") {
    const regionFiltered = filteredFoods.filter((f) => f.region.toLowerCase().includes(region.toLowerCase()))
    if (regionFiltered.length > 20) {
      filteredFoods = regionFiltered
    }
  }

  // Categorize foods
  const breakfastFoods = filteredFoods.filter((f) => f.category === "Breakfast")
  const mainCourse = filteredFoods.filter((f) => f.category === "Main Course" || f.category === "Curry")
  const sideDish = filteredFoods.filter((f) => f.category === "Side Dish")
  const snacks = filteredFoods.filter((f) => f.category === "Snack" && f.health_score >= 6)

  // Calorie distribution: Breakfast 25%, Lunch 35%, Dinner 30%, Snack 10%
  const breakfastCal = Math.round(daily_calories * 0.25)
  const lunchCal = Math.round(daily_calories * 0.35)
  const dinnerCal = Math.round(daily_calories * 0.3)
  const snackCal = Math.round(daily_calories * 0.1)

  const dayPlans: DayPlan[] = []

  for (let day = 1; day <= days; day++) {
    const date = new Date()
    date.setDate(date.getDate() + day - 1)
    const dateStr = date.toISOString().split("T")[0]

    // Pick random foods for each meal
    const pickFood = (arr: Food[], targetCal: number) => {
      const suitable = arr.filter((f) => f.calories <= targetCal + 50)
      return suitable[Math.floor(Math.random() * suitable.length)] || arr[0]
    }

    const breakfast1 = pickFood(breakfastFoods, breakfastCal * 0.6)
    const breakfast2 = pickFood(sideDish.length ? sideDish : breakfastFoods, breakfastCal * 0.4)

    const lunch1 = pickFood(mainCourse, lunchCal * 0.5)
    const lunch2 = pickFood(sideDish.length ? sideDish : mainCourse, lunchCal * 0.3)
    const lunch3 = pickFood(sideDish.length ? sideDish : mainCourse, lunchCal * 0.2)

    const dinner1 = pickFood(mainCourse, dinnerCal * 0.6)
    const dinner2 = pickFood(sideDish.length ? sideDish : mainCourse, dinnerCal * 0.4)

    const snack1 = pickFood(snacks.length ? snacks : breakfastFoods, snackCal)

    const createPlannedMeal = (food: Food | undefined) => {
      if (!food) return null
      return {
        food_id: food.id,
        food_name: food.name,
        meal_type: "breakfast" as const,
        serving_size: food.serving_size || "1 serving",
        calories: food.calories,
        protein: food.protein,
        carbs: food.carbs,
        fat: food.fat,
      }
    }

    const meals = {
      breakfast: [createPlannedMeal(breakfast1), createPlannedMeal(breakfast2)].filter(Boolean) as any[],
      lunch: [createPlannedMeal(lunch1), createPlannedMeal(lunch2), createPlannedMeal(lunch3)].filter(Boolean) as any[],
      dinner: [createPlannedMeal(dinner1), createPlannedMeal(dinner2)].filter(Boolean) as any[],
      snack: [createPlannedMeal(snack1)].filter(Boolean) as any[],
    }

    const allMeals = [...meals.breakfast, ...meals.lunch, ...meals.dinner, ...meals.snack]

    dayPlans.push({
      day,
      date: dateStr,
      meals,
      totals: {
        calories: allMeals.reduce((sum, m) => sum + m.calories, 0),
        protein: Math.round(allMeals.reduce((sum, m) => sum + m.protein, 0)),
        carbs: Math.round(allMeals.reduce((sum, m) => sum + m.carbs, 0)),
        fat: Math.round(allMeals.reduce((sum, m) => sum + m.fat, 0)),
      },
    })
  }

  return dayPlans
}

// Generate grocery list from meal plan
export function generateGroceryList(dayPlans: DayPlan[], foods: Food[]) {
  const ingredients: Record<string, { name: string; category: string; count: number }> = {}

  dayPlans.forEach((day) => {
    const allMeals = [...day.meals.breakfast, ...day.meals.lunch, ...day.meals.dinner, ...day.meals.snack]

    allMeals.forEach((meal) => {
      const food = foods.find((f) => f.id === meal.food_id)
      if (food) {
        const key = food.name.toLowerCase()
        if (ingredients[key]) {
          ingredients[key].count++
        } else {
          ingredients[key] = {
            name: food.name,
            category: getCategoryForGrocery(food.category),
            count: 1,
          }
        }
      }
    })
  })

  return Object.values(ingredients).map((item) => ({
    id: crypto.randomUUID(),
    name: item.name,
    category: item.category,
    quantity: item.count > 1 ? `${item.count} servings` : "1 serving",
    checked: false,
  }))
}

function getCategoryForGrocery(foodCategory: string): string {
  const mapping: Record<string, string> = {
    Breakfast: "Grains",
    "Main Course": "Grains & Rice",
    Curry: "Vegetables & Spices",
    "Side Dish": "Vegetables",
    Snack: "Snacks",
    Dessert: "Sweets",
    Soup: "Vegetables",
    Condiment: "Condiments",
  }
  return mapping[foodCategory] || "Other"
}
