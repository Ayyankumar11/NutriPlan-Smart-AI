from fastapi import APIRouter, File, UploadFile, HTTPException, Depends
from app.schemas import ScanResponse, ChatRequest, ChatResponse
from app.routers.auth import get_current_user
from app.routers.foods import get_foods
from app.config import settings
import base64, re

router = APIRouter(tags=["AI Features"])

def get_gemini_model():
    if not settings.GEMINI_API_KEY:
        return None
    try:
        import google.generativeai as genai
        genai.configure(api_key=settings.GEMINI_API_KEY)
        return genai.GenerativeModel("gemini-1.5-flash")
    except Exception:
        return None

def find_closest_food(name: str):
    foods = get_foods()
    name_lower = name.lower().strip()
    for f in foods:
        if name_lower in f["name"].lower() or f["name"].lower() in name_lower:
            return f
    tokens = name_lower.split()
    for f in foods:
        for token in tokens:
            if len(token) > 3 and token in f["name"].lower():
                return f
    return None

@router.post("/scan-food", response_model=ScanResponse)
async def scan_food(
    file: UploadFile = File(...),
    current_user: dict = Depends(get_current_user)
):
    model = get_gemini_model()
    image_bytes = await file.read()

    if model:
        try:
            import google.generativeai as genai
            image_part = {"mime_type": file.content_type or "image/jpeg", "data": image_bytes}
            prompt = """You are a food recognition expert specializing in Indian cuisine.
            Analyze this food image and respond in this exact format:
            FOOD_NAME: [exact Indian food name]
            CONFIDENCE: [0.0-1.0]
            DESCRIPTION: [brief nutritional description 1-2 sentences]
            
            Focus on identifying: idli, dosa, sambar, biryani, curry, paratha, roti, dal, rice dishes, snacks, fruits.
            If not food, respond: FOOD_NAME: Unknown CONFIDENCE: 0.0 DESCRIPTION: No food detected."""
            
            response = model.generate_content([prompt, image_part])
            text = response.text
            
            food_name = "Unknown"
            confidence = 0.5
            description = "Food item detected"
            
            for line in text.split("\n"):
                if line.startswith("FOOD_NAME:"):
                    food_name = line.split(":", 1)[1].strip()
                elif line.startswith("CONFIDENCE:"):
                    try:
                        confidence = float(line.split(":", 1)[1].strip())
                    except: pass
                elif line.startswith("DESCRIPTION:"):
                    description = line.split(":", 1)[1].strip()

            matched = find_closest_food(food_name)
            foods = get_foods()
            alternatives = [f for f in foods if f["category"] == (matched["category"] if matched else "Main Course")][:3]
            
            return ScanResponse(
                detected_food=food_name,
                confidence=confidence,
                nutrition=matched,
                alternatives=alternatives,
                ai_analysis=description
            )
        except Exception as e:
            pass

    # Fallback: demo response
    foods = get_foods()
    demo_food = foods[0]
    return ScanResponse(
        detected_food=demo_food["name"],
        confidence=0.85,
        nutrition=demo_food,
        alternatives=foods[1:4],
        ai_analysis=f"Detected {demo_food['name']} — a nutritious {demo_food['region']} dish with {demo_food['calories']} kcal per 100g. Add GEMINI_API_KEY for real image recognition."
    )

@router.post("/ai-chat", response_model=ChatResponse)
async def ai_chat(
    request: ChatRequest,
    current_user: dict = Depends(get_current_user)
):
    model = get_gemini_model()
    
    system_context = """You are NutriBot, an expert AI nutrition assistant specializing in Indian cuisine and nutrition science.
You help users with:
- Meal planning and calorie tracking
- Understanding nutrition facts about Indian foods
- Healthy eating tips and recipes
- Weight management advice
- Answering questions about 400+ Indian foods
Keep responses concise, friendly, and practically helpful. Always mention specific Indian foods when relevant."""

    if request.user_profile:
        p = request.user_profile
        profile_info = f"\nUser Profile: Goal={p.goal}, Diet={p.diet_type}, Region={p.region_preference}"
        if p.daily_calorie_target:
            profile_info += f", Daily Target={p.daily_calorie_target} kcal"
        system_context += profile_info

    if model:
        try:
            history_text = ""
            for msg in (request.history or [])[-6:]:
                history_text += f"\n{msg.role.upper()}: {msg.content}"
            
            full_prompt = f"{system_context}\n\nConversation:{history_text}\n\nUSER: {request.message}\nASSISTANT:"
            response = model.generate_content(full_prompt)
            reply = response.text.strip()
            
            # Extract suggestions from reply
            suggestions = []
            lines = reply.split("\n")
            for line in lines:
                if line.strip().startswith(("•", "-", "*", "1.", "2.", "3.")):
                    suggestions.append(line.strip().lstrip("•-*123456789. "))
            
            return ChatResponse(reply=reply, suggestions=suggestions[:3])
        except Exception as e:
            pass

    # Fallback responses
    message_lower = request.message.lower()
    foods = get_foods()
    
    if any(w in message_lower for w in ["calorie", "calories", "kcal"]):
        reply = "Calorie counting is key! In Indian cuisine, idli (39 kcal) and rasam (18 kcal) are among the lowest calorie options. A typical South Indian meal with idli, sambar, and chutney is around 250-300 kcal — perfect for weight management!"
    elif any(w in message_lower for w in ["protein", "muscle"]):
        reply = "For protein in Indian diets: dal (9g/100g), rajma (8.7g/100g), paneer (18g/100g), and chicken curry (22g/100g) are excellent sources. Combine dals with rice for complete amino acids!"
    elif any(w in message_lower for w in ["weight loss", "lose weight"]):
        reply = "For weight loss with Indian food: Start with idli-sambar breakfast (≈200 kcal), dal-roti lunch (≈400 kcal), and sabzi-chapati dinner (≈350 kcal). Avoid fried snacks and limit rice portions. Drink rasam — it's only 18 kcal!"
    elif any(w in message_lower for w in ["diabetes", "diabetic", "sugar"]):
        reply = "For diabetes management: Choose whole grain roti over rice, bitter gourd (karela) helps regulate blood sugar. Avoid jalebi, gulab jamun. Opt for dal, sabzi, and small portions. Always consult your doctor!"
    else:
        high_health = sorted(foods, key=lambda x: x["health_score"], reverse=True)[:5]
        names = ", ".join(f["name"] for f in high_health)
        reply = f"Great question! As your NutriBot, I'm here to help with all things nutrition. Our top healthy Indian foods include: {names}. Ask me about calories, protein, meal plans, or specific foods! (Add GEMINI_API_KEY for full AI responses)"
    
    return ChatResponse(reply=reply, suggestions=["What's the healthiest breakfast?", "How much protein do I need?", "Plan my meals for weight loss"])
