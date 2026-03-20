-- ============================================================
-- NutriPlan Smart AI – Supabase SQL Schema
-- Run this in your Supabase project's SQL Editor
-- ============================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================
-- PROFILES TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS profiles (
  id                   UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email                TEXT,
  full_name            TEXT,
  age                  INTEGER,
  gender               TEXT CHECK (gender IN ('male','female','other')),
  weight               NUMERIC(5,1),
  height               NUMERIC(5,1),
  goal                 TEXT CHECK (goal IN ('lose_weight','gain_muscle','maintain','eat_healthy')),
  diet_type            TEXT CHECK (diet_type IN ('vegetarian','vegan','eggetarian','non_veg')),
  activity_level       TEXT CHECK (activity_level IN ('sedentary','light','moderate','active','very_active')),
  region_preference    TEXT,
  allergies            TEXT[] DEFAULT '{}',
  daily_calorie_target INTEGER,
  created_at           TIMESTAMPTZ DEFAULT NOW(),
  updated_at           TIMESTAMPTZ DEFAULT NOW()
);

-- Auto-update updated_at
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = NOW(); RETURN NEW; END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ============================================================
-- MEAL LOGS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS meal_logs (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id     UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  food_id     TEXT NOT NULL,
  food_name   TEXT NOT NULL,
  meal_type   TEXT NOT NULL CHECK (meal_type IN ('breakfast','lunch','dinner','snack')),
  quantity_g  NUMERIC(7,1) DEFAULT 100,
  calories    NUMERIC(7,1) NOT NULL,
  protein     NUMERIC(6,1) DEFAULT 0,
  carbs       NUMERIC(6,1) DEFAULT 0,
  fat         NUMERIC(6,1) DEFAULT 0,
  date        DATE DEFAULT CURRENT_DATE,
  logged_at   TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_meal_logs_user_date ON meal_logs(user_id, date);
CREATE INDEX IF NOT EXISTS idx_meal_logs_user_id   ON meal_logs(user_id);

-- ============================================================
-- MEAL PLANS TABLE (optional persistence)
-- ============================================================
CREATE TABLE IF NOT EXISTS meal_plans (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id     UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  plan_data   JSONB NOT NULL,
  goal        TEXT,
  diet_type   TEXT,
  region      TEXT,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_meal_plans_user_id ON meal_plans(user_id);

-- ============================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================

-- Profiles
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE USING (auth.uid() = id);

-- Meal logs
ALTER TABLE meal_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own meal logs"
  ON meal_logs FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own meal logs"
  ON meal_logs FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own meal logs"
  ON meal_logs FOR DELETE USING (auth.uid() = user_id);

-- Meal plans
ALTER TABLE meal_plans ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own meal plans"
  ON meal_plans FOR ALL USING (auth.uid() = user_id);

-- ============================================================
-- HELPFUL VIEWS
-- ============================================================

CREATE OR REPLACE VIEW daily_summaries AS
SELECT
  user_id,
  date,
  SUM(calories) AS total_calories,
  SUM(protein)  AS total_protein,
  SUM(carbs)    AS total_carbs,
  SUM(fat)      AS total_fat,
  COUNT(*)      AS meal_count
FROM meal_logs
GROUP BY user_id, date;

-- ============================================================
-- DONE – Your Supabase schema is ready!
-- ============================================================
