import { useState } from 'react'
import { useAuth } from '../hooks/useAuth'
import { mealsAPI, progressAPI } from '../services/api'
import { CalendarDays, Loader, ChevronDown, ChevronUp, Plus, Check, Leaf } from 'lucide-react'

const GOALS   = [{ v:'lose_weight',label:'🏃 Lose Weight'},{ v:'gain_muscle',label:'💪 Gain Muscle'},{ v:'maintain',label:'⚖️ Maintain'},{ v:'eat_healthy',label:'🥗 Eat Healthy'}]
const DIETS   = [{ v:'vegetarian',label:'🌿 Veg'},{ v:'vegan',label:'🌱 Vegan'},{ v:'eggetarian',label:'🥚 Egg'},{ v:'non_veg',label:'🍗 Non-Veg'}]
const REGIONS = ['South Indian','North Indian','Pan India','Any']

const MEAL_ICONS = { breakfast:'🌅', lunch:'☀️', dinner:'🌙', snacks:'🍎' }

export default function MealPlanner() {
  const { profile } = useAuth()
  const [config, setConfig] = useState({
    goal: profile?.goal || 'maintain',
    diet_type: profile?.diet_type || 'vegetarian',
    region_preference: profile?.region_preference || 'South Indian',
    daily_calories: profile?.daily_calorie_target || 2000,
    num_days: 7,
  })
  const [plan, setPlan]       = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState('')
  const [expanded, setExpanded] = useState({})
  const [logged, setLogged]   = useState({})

  const set = (k, v) => setConfig(c => ({ ...c, [k]: v }))

  const generate = async () => {
    setLoading(true); setError(''); setPlan(null); setLogged({})
    try {
      const res = await mealsAPI.generatePlan(config)
      setPlan(res.data)
      setExpanded({ 0: true })
    } catch (e) {
      setError(e.response?.data?.detail || 'Failed to generate plan. Try again.')
    } finally { setLoading(false) }
  }

  const logEntire = async (day) => {
    const meals = [...day.breakfast, ...day.lunch, ...day.dinner, ...day.snacks]
    for (const [type, items] of [['breakfast', day.breakfast],['lunch', day.lunch],['dinner', day.dinner],['snack', day.snacks]]) {
      for (const item of items) {
        try {
          await progressAPI.logMeal({ food_id: item.food_id, food_name: item.food_name, meal_type: type, quantity_g: item.quantity_g, calories: item.calories, protein: item.protein, carbs: item.carbs, fat: item.fat })
        } catch {}
      }
    }
    setLogged(l => ({ ...l, [day.day]: true }))
  }

  const toggle = (i) => setExpanded(e => ({ ...e, [i]: !e[i] }))

  return (
    <div className="p-4 lg:p-6 max-w-2xl mx-auto space-y-5 page-enter pb-8">
      <div>
        <h1 className="text-2xl font-extrabold text-gray-900">Meal Planner</h1>
        <p className="text-gray-400 text-sm mt-1">AI-generated personalized meal plans</p>
      </div>

      {/* Config card */}
      <div className="card p-5 space-y-4">
        <h2 className="font-bold text-gray-800">Customize Your Plan</h2>

        <div>
          <label className="block text-sm font-semibold text-gray-600 mb-2">Goal</label>
          <div className="grid grid-cols-2 gap-2">
            {GOALS.map(g => (
              <button key={g.v} onClick={() => set('goal', g.v)}
                className={`py-2.5 px-3 rounded-2xl border-2 text-sm font-semibold transition-all ${config.goal===g.v ? 'border-primary-500 bg-primary-50 text-primary-700' : 'border-gray-100 text-gray-600 hover:border-gray-200'}`}>
                {g.label}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-600 mb-2">Diet Type</label>
          <div className="flex gap-2">
            {DIETS.map(d => (
              <button key={d.v} onClick={() => set('diet_type', d.v)}
                className={`flex-1 py-2 rounded-2xl border-2 text-xs font-bold transition-all ${config.diet_type===d.v ? 'border-primary-500 bg-primary-50 text-primary-700' : 'border-gray-100 text-gray-600 hover:border-gray-200'}`}>
                {d.label}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-600 mb-2">Cuisine Region</label>
          <div className="flex gap-2 flex-wrap">
            {REGIONS.map(r => (
              <button key={r} onClick={() => set('region_preference', r)}
                className={`px-3 py-1.5 rounded-xl border-2 text-xs font-bold transition-all ${config.region_preference===r ? 'border-primary-500 bg-primary-50 text-primary-700' : 'border-gray-100 text-gray-600 hover:border-gray-200'}`}>
                {r}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold text-gray-600 mb-1.5">Daily Calories</label>
            <input type="number" min={800} max={4000} step={50} value={config.daily_calories}
              onChange={e => set('daily_calories', parseInt(e.target.value))}
              className="input-field text-center font-bold" />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-600 mb-1.5">Days</label>
            <select value={config.num_days} onChange={e => set('num_days', parseInt(e.target.value))} className="input-field">
              {[1,3,5,7,14].map(d => <option key={d} value={d}>{d} day{d>1?'s':''}</option>)}
            </select>
          </div>
        </div>

        {error && <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-2xl text-sm">{error}</div>}

        <button onClick={generate} disabled={loading} className="btn-primary w-full flex items-center justify-center gap-2">
          {loading ? <><Loader size={18} className="animate-spin"/> Generating your plan…</> : <><Leaf size={18}/> Generate Meal Plan</>}
        </button>
      </div>

      {/* Plan output */}
      {plan && (
        <div className="space-y-3 animate-fade-in">
          <div className="flex items-center justify-between">
            <h2 className="font-bold text-gray-900">{plan.num_days || config.num_days}-Day Plan</h2>
            <div className="flex gap-2">
              <span className="badge bg-primary-100 text-primary-700">{plan.diet_type}</span>
              <span className="badge bg-blue-100 text-blue-700">{plan.region}</span>
            </div>
          </div>

          {plan.days.map((day, i) => (
            <div key={day.day} className="card overflow-hidden">
              {/* Day header */}
              <button onClick={() => toggle(i)} className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-primary-100 rounded-2xl flex items-center justify-center">
                    <CalendarDays size={18} className="text-primary-600" />
                  </div>
                  <div className="text-left">
                    <p className="font-bold text-gray-900">Day {day.day}</p>
                    <p className="text-xs text-gray-400">{Math.round(day.total_calories)} kcal · {Math.round(day.total_protein)}g protein</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {logged[day.day] && <Check size={16} className="text-primary-500" />}
                  {expanded[i] ? <ChevronUp size={18} className="text-gray-400"/> : <ChevronDown size={18} className="text-gray-400"/>}
                </div>
              </button>

              {expanded[i] && (
                <div className="border-t border-gray-100 px-4 pb-4">
                  {/* Macro bar */}
                  <div className="flex gap-2 mt-3 mb-4">
                    {[
                      { label:'Calories', val: Math.round(day.total_calories), unit:'kcal', color:'text-orange-600 bg-orange-50' },
                      { label:'Protein',  val: Math.round(day.total_protein),  unit:'g',    color:'text-blue-600 bg-blue-50'   },
                      { label:'Carbs',    val: Math.round(day.total_carbs),    unit:'g',    color:'text-yellow-600 bg-yellow-50'},
                      { label:'Fat',      val: Math.round(day.total_fat),      unit:'g',    color:'text-red-500 bg-red-50'     },
                    ].map(m => (
                      <div key={m.label} className={`flex-1 rounded-xl p-2 text-center ${m.color}`}>
                        <p className="text-xs opacity-70">{m.label}</p>
                        <p className="text-xs font-extrabold">{m.val}{m.unit}</p>
                      </div>
                    ))}
                  </div>

                  {/* Meals */}
                  {Object.entries({ breakfast: day.breakfast, lunch: day.lunch, dinner: day.dinner, snacks: day.snacks }).map(([type, items]) => (
                    items.length > 0 && (
                      <div key={type} className="mb-3">
                        <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">
                          {MEAL_ICONS[type]} {type}
                        </p>
                        {items.map((item, j) => (
                          <div key={j} className="flex items-center gap-2 py-2 border-b border-gray-50 last:border-0">
                            <div className="flex-1">
                              <p className="text-sm font-semibold text-gray-800">{item.food_name}</p>
                              <p className="text-xs text-gray-400">{item.quantity_g}g · {item.protein}g protein</p>
                            </div>
                            <span className="text-sm font-bold text-primary-600">{Math.round(item.calories)} kcal</span>
                          </div>
                        ))}
                      </div>
                    )
                  ))}

                  {/* Log button */}
                  {!logged[day.day] ? (
                    <button onClick={() => logEntire(day)}
                      className="w-full mt-2 flex items-center justify-center gap-2 py-2.5 bg-primary-50 border border-primary-200 text-primary-700 rounded-2xl text-sm font-semibold hover:bg-primary-100 transition-colors">
                      <Plus size={16} /> Log All Meals for Day {day.day}
                    </button>
                  ) : (
                    <div className="mt-2 flex items-center justify-center gap-2 py-2.5 bg-green-50 border border-green-200 text-green-700 rounded-2xl text-sm font-semibold">
                      <Check size={16} /> Logged!
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
