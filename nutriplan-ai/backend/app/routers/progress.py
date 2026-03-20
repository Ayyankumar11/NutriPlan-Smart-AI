from fastapi import APIRouter, Depends, HTTPException
from app.schemas import MealLog, DailyProgress
from app.routers.auth import get_current_user
from app.database import get_supabase
from datetime import datetime, date
from typing import Optional

router = APIRouter(prefix="/progress", tags=["Progress Tracking"])

@router.post("/log-meal")
async def log_meal(
    meal: MealLog,
    current_user: dict = Depends(get_current_user)
):
    supabase = get_supabase()
    user_id = current_user["sub"]
    log_entry = {
        "user_id": user_id,
        "food_id": meal.food_id,
        "food_name": meal.food_name,
        "meal_type": meal.meal_type,
        "quantity_g": meal.quantity_g,
        "calories": meal.calories,
        "protein": meal.protein,
        "carbs": meal.carbs,
        "fat": meal.fat,
        "logged_at": meal.logged_at or datetime.utcnow().isoformat(),
        "date": (meal.logged_at or datetime.utcnow().isoformat())[:10]
    }
    result = supabase.table("meal_logs").insert(log_entry).execute()
    return {"message": "Meal logged successfully", "data": result.data}

@router.get("/daily-calories")
async def get_daily_calories(
    date_str: Optional[str] = None,
    current_user: dict = Depends(get_current_user)
):
    supabase = get_supabase()
    user_id = current_user["sub"]
    target_date = date_str or date.today().isoformat()

    logs = supabase.table("meal_logs").select("*").eq("user_id", user_id).eq("date", target_date).execute()
    profile = supabase.table("profiles").select("daily_calorie_target").eq("id", user_id).execute()

    calorie_target = 2000
    if profile.data:
        calorie_target = profile.data[0].get("daily_calorie_target") or 2000

    meals = logs.data or []
    total_cal = sum(m["calories"] for m in meals)
    total_protein = sum(m["protein"] for m in meals)
    total_carbs = sum(m["carbs"] for m in meals)
    total_fat = sum(m["fat"] for m in meals)

    return DailyProgress(
        date=target_date,
        total_calories=round(total_cal, 1),
        total_protein=round(total_protein, 1),
        total_carbs=round(total_carbs, 1),
        total_fat=round(total_fat, 1),
        calorie_target=calorie_target,
        meals=[MealLog(**m) for m in meals],
        progress_percentage=min(100, round((total_cal / calorie_target) * 100, 1))
    )

@router.get("/history")
async def get_progress_history(
    days: int = 7,
    current_user: dict = Depends(get_current_user)
):
    supabase = get_supabase()
    user_id = current_user["sub"]
    from datetime import timedelta
    dates = [(date.today() - timedelta(days=i)).isoformat() for i in range(days)]

    profile = supabase.table("profiles").select("daily_calorie_target").eq("id", user_id).execute()
    calorie_target = 2000
    if profile.data:
        calorie_target = profile.data[0].get("daily_calorie_target") or 2000

    history = []
    for d in dates:
        logs = supabase.table("meal_logs").select("*").eq("user_id", user_id).eq("date", d).execute()
        meals = logs.data or []
        total_cal = round(sum(m["calories"] for m in meals), 1)
        history.append({
            "date": d,
            "total_calories": total_cal,
            "calorie_target": calorie_target,
            "progress_percentage": min(100, round((total_cal / calorie_target) * 100, 1)),
            "meal_count": len(meals)
        })

    return {"history": history, "calorie_target": calorie_target}

@router.delete("/log/{log_id}")
async def delete_log(
    log_id: str,
    current_user: dict = Depends(get_current_user)
):
    supabase = get_supabase()
    user_id = current_user["sub"]
    supabase.table("meal_logs").delete().eq("id", log_id).eq("user_id", user_id).execute()
    return {"message": "Log entry deleted"}
