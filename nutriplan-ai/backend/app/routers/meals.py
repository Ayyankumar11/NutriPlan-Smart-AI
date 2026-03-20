from fastapi import APIRouter, HTTPException, Depends
from app.schemas import MealPlanRequest, MealPlanResponse, DayMealPlan, MealEntry
from app.routers.auth import get_current_user
from app.routers.foods import get_foods
from datetime import datetime
import uuid, random

router = APIRouter(tags=["Meal Planner"])

NON_VEG_KEYWORDS = ["chicken", "mutton", "fish", "prawn", "egg", "meat", "lamb"]

def filter_foods_for_plan(foods, diet_type, region, allergies):
    result = []
    for f in foods:
        name_lower = f["name"].lower()
        if diet_type in ("vegetarian", "vegan"):
            if any(kw in name_lower for kw in NON_VEG_KEYWORDS):
                continue
        if allergies:
            if any(al.lower() in name_lower for al in allergies):
                continue
        if region and region != "All":
            if f["region"] not in (region, "Pan India"):
                continue
        result.append(f)
    return result

def pick_foods(pool, meal_type, target_calories, count=2):
    MEAL_CATEGORY_HINTS = {
        "breakfast": ["Breakfast", "Beverage"],
        "lunch": ["Main Course", "Curry", "Side Dish", "Bread"],
        "dinner": ["Main Course", "Curry", "Side Dish", "Soup"],
        "snack": ["Snack", "Fruit", "Juice"]
    }
    hints = MEAL_CATEGORY_HINTS.get(meal_type, [])
    preferred = [f for f in pool if f["category"] in hints]
    if len(preferred) < count:
        preferred = pool
    preferred_sorted = sorted(preferred, key=lambda x: x["health_score"], reverse=True)
    selected = preferred_sorted[:max(count * 3, 10)]
    chosen = random.sample(selected, min(count, len(selected)))

    entries = []
    for food in chosen:
        quantity = 100.0
        if food["calories"] > 0:
            quantity = min(300, max(50, (target_calories / count) / food["calories"] * 100))
        scale = quantity / 100.0
        entries.append(MealEntry(
            food_id=food["id"],
            food_name=food["name"],
            calories=round(food["calories"] * scale, 1),
            protein=round(food["protein"] * scale, 1),
            carbs=round(food["carbs"] * scale, 1),
            fat=round(food["fat"] * scale, 1),
            quantity_g=round(quantity, 0)
        ))
    return entries

@router.post("/generate-meal-plan", response_model=MealPlanResponse)
async def generate_meal_plan(
    request: MealPlanRequest,
    current_user: dict = Depends(get_current_user)
):
    foods = get_foods()
    pool = filter_foods_for_plan(foods, request.diet_type, request.region_preference, request.allergies or [])

    if len(pool) < 10:
        raise HTTPException(status_code=400, detail="Not enough foods match your filters. Try relaxing preferences.")

    CALORIE_SPLITS = {
        "lose_weight": {"breakfast": 0.25, "lunch": 0.35, "dinner": 0.30, "snack": 0.10},
        "gain_muscle":  {"breakfast": 0.30, "lunch": 0.30, "dinner": 0.30, "snack": 0.10},
        "maintain":     {"breakfast": 0.25, "lunch": 0.35, "dinner": 0.30, "snack": 0.10},
        "eat_healthy":  {"breakfast": 0.25, "lunch": 0.35, "dinner": 0.30, "snack": 0.10},
    }
    splits = CALORIE_SPLITS.get(request.goal, CALORIE_SPLITS["maintain"])

    days = []
    for day_num in range(1, request.num_days + 1):
        breakfast = pick_foods(pool, "breakfast", request.daily_calories * splits["breakfast"], 2)
        lunch = pick_foods(pool, "lunch", request.daily_calories * splits["lunch"], 3)
        dinner = pick_foods(pool, "dinner", request.daily_calories * splits["dinner"], 3)
        snacks = pick_foods(pool, "snack", request.daily_calories * splits["snack"], 2)

        all_meals = breakfast + lunch + dinner + snacks
        days.append(DayMealPlan(
            day=day_num,
            breakfast=breakfast,
            lunch=lunch,
            dinner=dinner,
            snacks=snacks,
            total_calories=round(sum(m.calories for m in all_meals), 1),
            total_protein=round(sum(m.protein for m in all_meals), 1),
            total_carbs=round(sum(m.carbs for m in all_meals), 1),
            total_fat=round(sum(m.fat for m in all_meals), 1),
        ))

    return MealPlanResponse(
        plan_id=str(uuid.uuid4()),
        goal=request.goal,
        diet_type=request.diet_type,
        region=request.region_preference,
        daily_calorie_target=request.daily_calories,
        days=days,
        generated_at=datetime.utcnow().isoformat()
    )
