# 🥗 NutriPlan Smart AI

> AI-powered Indian nutrition assistant with 400+ foods, meal planning, food scanning, and a nutrition chatbot.

---

## 📁 Project Structure

```
nutriplan-ai/
├── frontend/                  ← React + Vite + Tailwind
│   ├── src/
│   │   ├── pages/             ← Splash, Login, Signup, Dashboard, FoodScanner,
│   │   │                          MealPlanner, FoodDatabase, AIChatbot, Progress
│   │   ├── components/
│   │   │   └── layout/        ← Layout, Sidebar
│   │   ├── hooks/             ← useAuth
│   │   ├── services/          ← api.js, supabase.js
│   │   └── App.jsx
│   ├── index.html
│   ├── tailwind.config.js
│   └── vite.config.js
├── backend/                   ← FastAPI + Python
│   ├── app/
│   │   ├── main.py            ← FastAPI entry point
│   │   ├── config.py          ← Settings (env vars)
│   │   ├── database.py        ← Supabase client
│   │   ├── schemas.py         ← Pydantic models
│   │   └── routers/
│   │       ├── auth.py        ← /auth/*
│   │       ├── foods.py       ← /foods/*
│   │       ├── meals.py       ← /generate-meal-plan
│   │       ├── ai.py          ← /scan-food, /ai-chat
│   │       └── progress.py    ← /progress/*
│   ├── requirements.txt
│   └── .env.example
├── data/
│   └── foods_400.json         ← 400 Indian foods dataset
├── schema.sql                 ← Supabase SQL schema
└── README.md
```

---

## ⚡ Quick Setup

### 1. Supabase Setup

1. Go to [supabase.com](https://supabase.com) and open your project
2. Navigate to **SQL Editor**
3. Paste and run the contents of `schema.sql`
4. Go to **Settings → API** and copy:
   - `Project URL`
   - `anon public` key
   - `service_role` key (for backend admin ops)
5. Go to **Authentication → Providers** → Enable **Google** (optional)

---

### 2. Backend Setup

```bash
cd nutriplan-ai/backend

# Copy env file
cp .env.example .env

# Edit .env with your actual keys:
#   SUPABASE_URL=https://ecjopmcqgqeiasbnmawl.supabase.co
#   SUPABASE_ANON_KEY=your_anon_key
#   SUPABASE_SERVICE_KEY=your_service_key
#   GEMINI_API_KEY=your_gemini_key  (optional – for real AI features)
#   SECRET_KEY=any-long-random-string

# Create virtual environment
python -m venv venv
source venv/bin/activate        # Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Run the server
uvicorn app.main:app --reload --port 8000
```

**Test:** Open http://localhost:8000/docs — you should see the Swagger UI.

---

### 3. Frontend Setup

```bash
cd nutriplan-ai/frontend

# Copy env file
cp .env.example .env

# Edit .env:
#   VITE_SUPABASE_URL=https://ecjopmcqgqeiasbnmawl.supabase.co
#   VITE_SUPABASE_ANON_KEY=your_anon_key
#   VITE_API_URL=http://localhost:8000

# Install dependencies
npm install

# Start dev server
npm run dev
```

**Open:** http://localhost:3000

---

## 🔑 Environment Variables

### Backend (`backend/.env`)

| Variable                  | Description                         | Required |
|---------------------------|-------------------------------------|----------|
| `SUPABASE_URL`            | Your Supabase project URL           | ✅       |
| `SUPABASE_ANON_KEY`       | Supabase anonymous key              | ✅       |
| `SUPABASE_SERVICE_KEY`    | Supabase service role key           | ✅       |
| `GEMINI_API_KEY`          | Google Gemini API key               | Optional |
| `SECRET_KEY`              | JWT signing secret (any long string)| ✅       |
| `ALGORITHM`               | JWT algorithm (default: HS256)      | ✅       |

### Frontend (`frontend/.env`)

| Variable                  | Description                         | Required |
|---------------------------|-------------------------------------|----------|
| `VITE_SUPABASE_URL`       | Your Supabase project URL           | ✅       |
| `VITE_SUPABASE_ANON_KEY`  | Supabase anonymous key              | ✅       |
| `VITE_API_URL`            | Backend URL (default: localhost:8000)| ✅      |

---

## 🤖 Google Gemini API (Optional)

For real AI food recognition and nutrition chatbot:

1. Go to [Google AI Studio](https://aistudio.google.com/app/apikey)
2. Create a new API key
3. Add to `backend/.env`: `GEMINI_API_KEY=your_key`
4. Restart the backend

Without the key, the app uses intelligent fallback responses.

---

## 🌐 API Endpoints

| Method | Endpoint               | Description               |
|--------|------------------------|---------------------------|
| POST   | `/auth/signup`         | Create account            |
| POST   | `/auth/login`          | Sign in                   |
| GET    | `/auth/profile`        | Get user profile          |
| PUT    | `/auth/profile`        | Update profile            |
| GET    | `/foods`               | List all foods (paginated)|
| GET    | `/foods/search?q=...`  | Search by name            |
| GET    | `/foods/filter`        | Filter by nutrition       |
| GET    | `/foods/{id}`          | Get single food           |
| POST   | `/generate-meal-plan`  | AI meal plan generation   |
| POST   | `/scan-food`           | Upload image, detect food |
| POST   | `/ai-chat`             | Nutrition chatbot         |
| POST   | `/progress/log-meal`   | Log a meal                |
| GET    | `/progress/daily-calories` | Today's summary       |
| GET    | `/progress/history`    | 7-day history             |
| DELETE | `/progress/log/{id}`   | Delete a meal log         |

---

## 🚀 Deployment

### Frontend → Vercel / Netlify

```bash
cd frontend
npm run build
# Deploy the `dist/` folder
```

Set environment variables in Vercel/Netlify dashboard:
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`
- `VITE_API_URL` → your backend URL

### Backend → Railway / Render / Fly.io

```bash
# Procfile (for Railway/Heroku)
echo "web: uvicorn app.main:app --host 0.0.0.0 --port \$PORT" > Procfile
```

Set all backend env vars in your hosting dashboard.

---

## 🍛 Food Dataset

The `data/foods_400.json` file contains **exactly 400 Indian foods**:

| Category       | Count |
|----------------|-------|
| South Indian   | 120   |
| North Indian   | 100   |
| Snacks         | 80    |
| Fruits         | 50    |
| Juices         | 50    |

Each food item includes: `id`, `name`, `region`, `category`, `calories`, `protein`, `carbs`, `fat`, `sugar`, `fiber`, `health_score`, `image_url`

---

## 🛠️ Tech Stack

| Layer     | Technology                          |
|-----------|-------------------------------------|
| Frontend  | React 18, Vite, Tailwind CSS, Recharts |
| Backend   | FastAPI, Python 3.10+               |
| Database  | Supabase (PostgreSQL + Auth + RLS)  |
| AI        | Google Gemini 1.5 Flash             |
| Auth      | Supabase Auth + JWT                 |
| Hosting   | Vercel (frontend) + Railway (backend)|

---

## 📱 Pages

- **Splash** – Landing with features overview
- **Login / Signup** – Email + Google OAuth
- **Profile Setup** – 4-step onboarding wizard
- **Dashboard** – Calorie ring, quick actions, today's meals
- **Food Scanner** – Upload image → AI recognition → log meal
- **Meal Planner** – Configure goals → Generate AI-powered 7-day plan
- **Food Database** – Search/filter 400+ Indian foods, log instantly
- **AI Chatbot** – NutriBot powered by Gemini, answers nutrition questions
- **Progress** – Daily log, 7-day trend chart, macro breakdown

---

Made with ❤️ for Indian nutrition 🇮🇳
