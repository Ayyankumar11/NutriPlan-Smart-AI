from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routers import auth, foods, meals, ai, progress

app = FastAPI(
    title="NutriPlan Smart AI",
    description="AI-powered Indian nutrition assistant with 400+ foods",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(foods.router)
app.include_router(meals.router)
app.include_router(ai.router)
app.include_router(progress.router)

@app.get("/", tags=["Health"])
async def root():
    return {
        "app": "NutriPlan Smart AI",
        "version": "1.0.0",
        "status": "running",
        "docs": "/docs",
        "endpoints": {
            "auth": ["/auth/signup", "/auth/login", "/auth/profile"],
            "foods": ["/foods", "/foods/search", "/foods/filter"],
            "meals": ["/generate-meal-plan"],
            "ai": ["/scan-food", "/ai-chat"],
            "progress": ["/progress/log-meal", "/progress/daily-calories", "/progress/history"]
        }
    }

@app.get("/health", tags=["Health"])
async def health():
    return {"status": "healthy"}
