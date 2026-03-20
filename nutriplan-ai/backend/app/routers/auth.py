from fastapi import APIRouter, HTTPException, Depends, Header
from app.schemas import UserSignup, UserLogin, UserProfile, AuthResponse
from app.database import get_supabase
from app.config import settings
from jose import jwt
from datetime import datetime, timedelta
from typing import Optional

router = APIRouter(prefix="/auth", tags=["Authentication"])

def create_access_token(data: dict):
    expire = datetime.utcnow() + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    data.update({"exp": expire})
    return jwt.encode(data, settings.SECRET_KEY, algorithm=settings.ALGORITHM)

def get_current_user(authorization: Optional[str] = Header(None)):
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Missing or invalid token")
    token = authorization.split(" ")[1]
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        return payload
    except Exception:
        raise HTTPException(status_code=401, detail="Invalid token")

@router.post("/signup", response_model=AuthResponse)
async def signup(user_data: UserSignup):
    supabase = get_supabase()
    try:
        response = supabase.auth.sign_up({
            "email": user_data.email,
            "password": user_data.password,
            "options": {"data": {"full_name": user_data.full_name}}
        })
        if response.user:
            # Store profile in profiles table
            supabase.table("profiles").upsert({
                "id": response.user.id,
                "email": user_data.email,
                "full_name": user_data.full_name,
                "created_at": datetime.utcnow().isoformat()
            }).execute()

            token = create_access_token({
                "sub": response.user.id,
                "email": user_data.email,
                "full_name": user_data.full_name
            })
            return AuthResponse(
                access_token=token,
                user_id=response.user.id,
                email=user_data.email,
                full_name=user_data.full_name
            )
        raise HTTPException(status_code=400, detail="Signup failed")
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.post("/login", response_model=AuthResponse)
async def login(credentials: UserLogin):
    supabase = get_supabase()
    try:
        response = supabase.auth.sign_in_with_password({
            "email": credentials.email,
            "password": credentials.password
        })
        if response.user:
            full_name = response.user.user_metadata.get("full_name", "")
            token = create_access_token({
                "sub": response.user.id,
                "email": credentials.email,
                "full_name": full_name
            })
            return AuthResponse(
                access_token=token,
                user_id=response.user.id,
                email=credentials.email,
                full_name=full_name
            )
        raise HTTPException(status_code=401, detail="Invalid credentials")
    except Exception as e:
        raise HTTPException(status_code=401, detail="Invalid email or password")

@router.get("/profile")
async def get_profile(current_user: dict = Depends(get_current_user)):
    supabase = get_supabase()
    user_id = current_user["sub"]
    result = supabase.table("profiles").select("*").eq("id", user_id).execute()
    if result.data:
        return result.data[0]
    raise HTTPException(status_code=404, detail="Profile not found")

@router.put("/profile")
async def update_profile(profile: UserProfile, current_user: dict = Depends(get_current_user)):
    supabase = get_supabase()
    user_id = current_user["sub"]
    update_data = profile.model_dump(exclude_none=True)
    update_data["id"] = user_id
    update_data["updated_at"] = datetime.utcnow().isoformat()

    # Auto-calculate calorie target if not set
    if not update_data.get("daily_calorie_target") and profile.weight and profile.height and profile.age:
        bmr = (10 * profile.weight + 6.25 * profile.height - 5 * profile.age)
        if profile.gender == "female":
            bmr -= 161
        else:
            bmr += 5
        activity_multipliers = {
            "sedentary": 1.2, "light": 1.375, "moderate": 1.55,
            "active": 1.725, "very_active": 1.9
        }
        multiplier = activity_multipliers.get(profile.activity_level, 1.55)
        tdee = int(bmr * multiplier)
        goal_adjustments = {"lose_weight": -500, "gain_muscle": 300, "maintain": 0, "eat_healthy": -200}
        update_data["daily_calorie_target"] = tdee + goal_adjustments.get(profile.goal, 0)

    result = supabase.table("profiles").upsert(update_data).execute()
    return {"message": "Profile updated", "data": result.data}
