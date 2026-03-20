from pydantic import BaseModel, EmailStr
from typing import Optional, List
from datetime import datetime

# Auth Schemas
class UserSignup(BaseModel):
    email: EmailStr
    password: str
    full_name: str

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UserProfile(BaseModel):
    full_name: Optional[str] = None
    age: Optional[int] = None
    gender: Optional[str] = None
    weight: Optional[float] = None
    height: Optional[float] = None
    goal: Optional[str] = None          # lose_weight, gain_muscle, maintain, eat_healthy
    diet_type: Optional[str] = None     # vegetarian, vegan, non_veg, eggetarian
    activity_level: Optional[str] = None # sedentary, light, moderate, active, very_active
    region_preference: Optional[str] = None
    allergies: Optional[List[str]] = []
    daily_calorie_target: Optional[int] = None

class AuthResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user_id: str
    email: str
    full_name: Optional[str] = None

# Food Schemas
class FoodItem(BaseModel):
    id: str
    name: str
    region: str
    category: str
    calories: float
    protein: float
    carbs: float
    fat: float
    sugar: float
    fiber: float
    health_score: int
    image_url: str

class FoodFilter(BaseModel):
    region: Optional[str] = None
    category: Optional[str] = None
    min_calories: Optional[float] = None
    max_calories: Optional[float] = None
    min_protein: Optional[float] = None
    min_health_score: Optional[int] = None
    diet_type: Optional[str] = None

# Meal Plan Schemas
class MealPlanRequest(BaseModel):
    goal: str = "maintain"
    diet_type: str = "vegetarian"
    region_preference: str = "South Indian"
    daily_calories: int = 2000
    num_days: int = 7
    allergies: Optional[List[str]] = []

class MealEntry(BaseModel):
    food_id: str
    food_name: str
    calories: float
    protein: float
    carbs: float
    fat: float
    quantity_g: float = 100

class DayMealPlan(BaseModel):
    day: int
    breakfast: List[MealEntry]
    lunch: List[MealEntry]
    dinner: List[MealEntry]
    snacks: List[MealEntry]
    total_calories: float
    total_protein: float
    total_carbs: float
    total_fat: float

class MealPlanResponse(BaseModel):
    plan_id: str
    goal: str
    diet_type: str
    region: str
    daily_calorie_target: int
    days: List[DayMealPlan]
    generated_at: str

# Scanner Schemas
class ScanResponse(BaseModel):
    detected_food: str
    confidence: float
    nutrition: Optional[FoodItem] = None
    alternatives: List[FoodItem] = []
    ai_analysis: str

# Chatbot Schemas
class ChatMessage(BaseModel):
    role: str  # user or assistant
    content: str

class ChatRequest(BaseModel):
    message: str
    history: Optional[List[ChatMessage]] = []
    user_profile: Optional[UserProfile] = None

class ChatResponse(BaseModel):
    reply: str
    suggestions: Optional[List[str]] = []

# Meal Log Schemas
class MealLog(BaseModel):
    food_id: str
    food_name: str
    meal_type: str  # breakfast, lunch, dinner, snack
    quantity_g: float = 100
    calories: float
    protein: float
    carbs: float
    fat: float
    logged_at: Optional[str] = None

class DailyProgress(BaseModel):
    date: str
    total_calories: float
    total_protein: float
    total_carbs: float
    total_fat: float
    calorie_target: int
    meals: List[MealLog]
    progress_percentage: float
