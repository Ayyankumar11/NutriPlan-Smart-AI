from fastapi import APIRouter, Query, HTTPException
from typing import Optional, List
import json, os

router = APIRouter(prefix="/foods", tags=["Foods"])

# Load food dataset
_foods_cache = None

def get_foods():
    global _foods_cache
    if _foods_cache is None:
        data_path = os.path.join(os.path.dirname(__file__), "../../data/foods_400.json")
        if not os.path.exists(data_path):
            data_path = os.path.join(os.path.dirname(__file__), "../../../data/foods_400.json")
        with open(data_path, "r", encoding="utf-8") as f:
            _foods_cache = json.load(f)
    return _foods_cache

@router.get("/", summary="Get all foods with optional pagination")
async def get_all_foods(
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100),
    region: Optional[str] = None,
    category: Optional[str] = None
):
    foods = get_foods()
    if region:
        foods = [f for f in foods if f["region"].lower() == region.lower()]
    if category:
        foods = [f for f in foods if f["category"].lower() == category.lower()]
    total = len(foods)
    start = (page - 1) * limit
    return {
        "total": total,
        "page": page,
        "limit": limit,
        "pages": (total + limit - 1) // limit,
        "data": foods[start:start + limit]
    }

@router.get("/search", summary="Search foods by name")
async def search_foods(
    q: str = Query(..., min_length=1),
    limit: int = Query(10, ge=1, le=50)
):
    foods = get_foods()
    query = q.lower()
    results = [f for f in foods if query in f["name"].lower()][:limit]
    return {"query": q, "results": results, "count": len(results)}

@router.get("/categories", summary="Get all categories")
async def get_categories():
    foods = get_foods()
    regions = list(set(f["region"] for f in foods))
    categories = list(set(f["category"] for f in foods))
    return {"regions": sorted(regions), "categories": sorted(categories)}

@router.get("/filter", summary="Filter foods by nutrition criteria")
async def filter_foods(
    min_calories: Optional[float] = None,
    max_calories: Optional[float] = None,
    min_protein: Optional[float] = None,
    max_fat: Optional[float] = None,
    min_health_score: Optional[int] = None,
    region: Optional[str] = None,
    category: Optional[str] = None,
    diet_type: Optional[str] = None,
    limit: int = Query(20, ge=1, le=100)
):
    foods = get_foods()

    NON_VEG_KEYWORDS = ["chicken", "mutton", "fish", "prawn", "egg", "meat", "lamb"]

    filtered = []
    for f in foods:
        if min_calories and f["calories"] < min_calories: continue
        if max_calories and f["calories"] > max_calories: continue
        if min_protein and f["protein"] < min_protein: continue
        if max_fat and f["fat"] > max_fat: continue
        if min_health_score and f["health_score"] < min_health_score: continue
        if region and f["region"].lower() != region.lower(): continue
        if category and f["category"].lower() != category.lower(): continue
        if diet_type in ("vegetarian", "vegan"):
            if any(kw in f["name"].lower() for kw in NON_VEG_KEYWORDS):
                continue
        filtered.append(f)

    return {"count": len(filtered), "data": filtered[:limit]}

@router.get("/{food_id}", summary="Get a food by ID")
async def get_food(food_id: str):
    foods = get_foods()
    for f in foods:
        if f["id"] == food_id:
            return f
    raise HTTPException(status_code=404, detail=f"Food '{food_id}' not found")
