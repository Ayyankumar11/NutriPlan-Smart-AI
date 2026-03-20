import { useState, useEffect } from 'react'
import { progressAPI, foodsAPI } from '../services/api'
import { useAuth } from '../hooks/useAuth'
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, BarChart, Bar, Cell } from 'recharts'
import { TrendingUp, Trash2, Plus, Search } from 'lucide-react'

const MEAL_TYPES = ['breakfast','lunch','dinner','snack']
const MEAL_ICONS = { breakfast:'🌅', lunch:'☀️', dinner:'🌙', snack:'🍎' }

export default function Progress() {
  const { profile } = useAuth()
  const [daily, setDaily]     = useState(null)
  const [history, setHistory] = useState([])
  const [today] = useState(new Date().toISOString().split('T')[0])
  const [tab, setTab]         = useState('today')
  const [showLog, setShowLog] = useState(false)
  const [searchQ, setSearchQ] = useState('')
  const [searchRes, setSearchRes] = useState([])
  const [searching, setSearching] = useState(false)
  const [logMealType, setLogMealType] = useState('snack')

  const loadToday   = () => progressAPI.getDailyCalories(today).then(r => setDaily(r.data)).catch(() => {})
  const loadHistory = () => progressAPI.getHistory(7).then(r => setHistory(r.data.history || [])).catch(() => {})

  useEffect(() => { loadToday(); loadHistory() }, [])

  const deleteLog = async (id) => {
    await progressAPI.deleteLog(id).catch(() => {})
    loadToday()
  }

  const searchFood = async () => {
    if (!searchQ.trim()) return
    setSearching(true)
    try {
      const res = await foodsAPI.search(searchQ, 8)
      setSearchRes(res.data.results || [])
    } catch {}
    setSearching(false)
  }

  const addFood = async (food) => {
    await progressAPI.logMeal({
      food_id: food.id, food_name: food.name,
      meal_type: logMealType, quantity_g: 100,
      calories: food.calories, protein: food.protein,
      carbs: food.carbs, fat: food.fat,
    }).catch(() => {})
    setShowLog(false); setSearchQ(''); setSearchRes([])
    loadToday(); loadHistory()
  }

  const target   = daily?.calorie_target || profile?.daily_calorie_target || 2000
  const consumed = daily?.total_calories || 0
  const pct      = Math.min(100, Math.round((consumed / target) * 100))

  const barColor = (val, tgt) => {
    const p = (val / tgt) * 100
    if (p < 70)  return '#22c55e'
    if (p < 90)  return '#f59e0b'
    if (p < 110) return '#22c55e'
    return '#ef4444'
  }

  return (
    <div className="p-4 lg:p-6 max-w-2xl mx-auto pb-8 page-enter">
      <div className="flex items-center justify-between mb-5">
        <div>
          <h1 className="text-2xl font-extrabold text-gray-900">Progress</h1>
          <p className="text-gray-400 text-sm mt-1">Track your daily nutrition</p>
        </div>
        <button onClick={() => setShowLog(true)}
          className="btn-primary flex items-center gap-2 py-2.5 px-4 text-sm">
          <Plus size={16}/> Log Meal
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-100 rounded-2xl p-1 mb-5">
        {['today','history'].map(t => (
          <button key={t} onClick={() => setTab(t)}
            className={`flex-1 py-2 rounded-xl text-sm font-semibold capitalize transition-all ${tab===t ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>
            {t === 'today' ? "Today's Log" : '7-Day History'}
          </button>
        ))}
      </div>

      {/* TODAY TAB */}
      {tab === 'today' && (
        <div className="space-y-4">
          {/* Calorie summary */}
          <div className="card p-5">
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-bold text-gray-900">Daily Summary</h2>
              <span className="text-sm font-semibold text-gray-400">{today}</span>
            </div>

            {/* Progress bar */}
            <div className="mb-4">
              <div className="flex justify-between text-xs text-gray-400 mb-1.5">
                <span>{Math.round(consumed)} kcal consumed</span>
                <span>{target} kcal target</span>
              </div>
              <div className="health-bar">
                <div
                  className={`h-full rounded-full transition-all duration-700 ${pct > 110 ? 'bg-red-400' : pct > 90 ? 'bg-yellow-400' : 'bg-primary-500'}`}
                  style={{ width: `${pct}%` }}
                />
              </div>
              <p className="text-center text-xs mt-1.5 font-semibold text-gray-500">{pct}% of daily goal</p>
            </div>

            {/* Macro grid */}
            <div className="grid grid-cols-3 gap-2">
              {[
                { l:'Protein', v: daily?.total_protein || 0, u:'g', c:'bg-blue-50 text-blue-700'   },
                { l:'Carbs',   v: daily?.total_carbs   || 0, u:'g', c:'bg-yellow-50 text-yellow-700'},
                { l:'Fat',     v: daily?.total_fat     || 0, u:'g', c:'bg-red-50 text-red-600'     },
              ].map(m => (
                <div key={m.l} className={`rounded-2xl p-3 text-center ${m.c}`}>
                  <p className="text-xs font-medium opacity-70">{m.l}</p>
                  <p className="text-lg font-extrabold">{Math.round(m.v)}<span className="text-xs font-normal ml-0.5">{m.u}</span></p>
                </div>
              ))}
            </div>
          </div>

          {/* Meal list */}
          {(daily?.meals || []).length === 0 ? (
            <div className="card p-8 text-center">
              <p className="text-4xl mb-3">🍽️</p>
              <p className="font-bold text-gray-700">No meals logged yet</p>
              <p className="text-sm text-gray-400 mt-1">Log your first meal to start tracking</p>
              <button onClick={() => setShowLog(true)} className="btn-primary mt-4 text-sm py-2.5 px-5">
                + Log First Meal
              </button>
            </div>
          ) : (
            Object.entries(
              (daily?.meals || []).reduce((acc, m) => { (acc[m.meal_type] = acc[m.meal_type] || []).push(m); return acc }, {})
            ).map(([type, items]) => (
              <div key={type} className="card p-4">
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-lg">{MEAL_ICONS[type] || '🍴'}</span>
                  <h3 className="font-bold text-gray-800 capitalize">{type}</h3>
                  <span className="ml-auto text-xs text-gray-400 font-semibold">
                    {Math.round(items.reduce((s,m) => s + m.calories, 0))} kcal
                  </span>
                </div>
                <div className="space-y-2">
                  {items.map((meal, i) => (
                    <div key={i} className="flex items-center gap-2 bg-gray-50 rounded-2xl px-3 py-2">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-gray-800 truncate">{meal.food_name}</p>
                        <p className="text-xs text-gray-400">{meal.quantity_g}g · P:{Math.round(meal.protein)}g · C:{Math.round(meal.carbs)}g · F:{Math.round(meal.fat)}g</p>
                      </div>
                      <span className="text-sm font-bold text-primary-600 flex-shrink-0">{Math.round(meal.calories)}</span>
                      {meal.id && (
                        <button onClick={() => deleteLog(meal.id)} className="text-gray-300 hover:text-red-400 transition-colors ml-1">
                          <Trash2 size={14}/>
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* HISTORY TAB */}
      {tab === 'history' && (
        <div className="space-y-4">
          {/* Chart */}
          <div className="card p-5">
            <h2 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
              <TrendingUp size={18} className="text-primary-500"/> 7-Day Calorie Trend
            </h2>
            {history.length > 0 ? (
              <ResponsiveContainer width="100%" height={180}>
                <AreaChart data={[...history].reverse()}>
                  <defs>
                    <linearGradient id="grad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#22c55e" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#22c55e" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="date" tick={{ fontSize:10 }} tickFormatter={d => d.slice(5)} />
                  <YAxis tick={{ fontSize:10 }} width={35} />
                  <Tooltip formatter={(v) => [`${Math.round(v)} kcal`,'Calories']} labelFormatter={l => l} />
                  <Area type="monotone" dataKey="total_calories" stroke="#22c55e" fill="url(#grad)" strokeWidth={2} dot={{ fill:'#22c55e', r:3 }} />
                  <Area type="monotone" dataKey="calorie_target" stroke="#e5e7eb" strokeDasharray="4 2" fill="none" strokeWidth={1.5} />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-44 flex items-center justify-center text-gray-300">No data yet</div>
            )}
          </div>

          {/* Daily summary cards */}
          <div className="space-y-2">
            {history.map(d => (
              <div key={d.date} className="card px-4 py-3 flex items-center gap-3">
                <div className="w-10 h-10 bg-gray-100 rounded-2xl flex items-center justify-center flex-shrink-0">
                  <span className="text-sm font-bold text-gray-600">{new Date(d.date).getDate()}</span>
                </div>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-gray-800">
                    {new Date(d.date).toLocaleDateString('en-IN', { weekday:'short', month:'short', day:'numeric' })}
                  </p>
                  <div className="health-bar mt-1.5 w-full">
                    <div className="h-full rounded-full" style={{ width:`${d.progress_percentage}%`, backgroundColor: barColor(d.total_calories, d.calorie_target) }} />
                  </div>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="text-sm font-bold text-gray-900">{Math.round(d.total_calories)}</p>
                  <p className="text-xs text-gray-400">{d.progress_percentage}%</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Log Meal Modal */}
      {showLog && (
        <div className="fixed inset-0 z-50 flex items-end lg:items-center justify-center">
          <div className="absolute inset-0 bg-black/40" onClick={() => setShowLog(false)} />
          <div className="relative bg-white rounded-t-3xl lg:rounded-3xl w-full max-w-md p-6 shadow-2xl">
            <h3 className="font-bold text-gray-900 text-lg mb-4">Log a Meal</h3>

            <div className="mb-3">
              <label className="text-sm font-semibold text-gray-600 block mb-1.5">Meal Type</label>
              <div className="flex gap-2">
                {MEAL_TYPES.map(t => (
                  <button key={t} onClick={() => setLogMealType(t)}
                    className={`flex-1 py-2 rounded-xl border-2 text-xs font-bold transition-all capitalize ${logMealType===t ? 'border-primary-500 bg-primary-50 text-primary-700' : 'border-gray-100 text-gray-500 hover:border-gray-200'}`}>
                    {MEAL_ICONS[t]} {t}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex gap-2 mb-3">
              <input value={searchQ} onChange={e => setSearchQ(e.target.value)}
                onKeyDown={e => e.key==='Enter' && searchFood()}
                placeholder="Search Indian food…" className="input-field flex-1 py-2.5 text-sm" />
              <button onClick={searchFood} className="btn-primary px-4 py-2.5 text-sm flex items-center gap-1">
                {searching ? '…' : <Search size={16}/>}
              </button>
            </div>

            <div className="space-y-2 max-h-64 overflow-y-auto">
              {searchRes.map(food => (
                <button key={food.id} onClick={() => addFood(food)}
                  className="w-full flex items-center gap-3 p-3 hover:bg-primary-50 rounded-2xl transition-colors text-left">
                  <img src={food.image_url} alt={food.name} className="w-10 h-10 rounded-xl object-cover flex-shrink-0"
                    onError={e => { e.target.src='https://source.unsplash.com/100x100/?food' }} />
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-gray-800 text-sm truncate">{food.name}</p>
                    <p className="text-xs text-gray-400">{food.region} · {food.calories} kcal/100g</p>
                  </div>
                  <Plus size={18} className="text-primary-500 flex-shrink-0" />
                </button>
              ))}
              {searchQ && searchRes.length === 0 && !searching && (
                <p className="text-center text-sm text-gray-400 py-4">No foods found. Try another search.</p>
              )}
              {!searchQ && (
                <p className="text-center text-sm text-gray-400 py-4">Type a food name above to search 400+ Indian foods</p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
