import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { progressAPI, foodsAPI } from '../services/api'
import { Camera, CalendarDays, MessageCircle, TrendingUp, Flame, Droplets, Zap, ChevronRight } from 'lucide-react'

const QUICK_LINKS = [
  { to: '/scanner', icon: Camera,       label: 'Scan Food',    bg: 'bg-orange-100', color: 'text-orange-600', desc: 'AI recognition' },
  { to: '/planner', icon: CalendarDays, label: 'Meal Plan',    bg: 'bg-blue-100',   color: 'text-blue-600',   desc: 'Personalized'   },
  { to: '/chat',    icon: MessageCircle,label: 'AI Chat',      bg: 'bg-purple-100', color: 'text-purple-600', desc: 'Nutrition help' },
  { to: '/foods',   icon: TrendingUp,   label: 'Foods DB',     bg: 'bg-green-100',  color: 'text-green-600',  desc: '400+ foods'     },
]

export default function Dashboard() {
  const { user, profile } = useAuth()
  const navigate = useNavigate()
  const [progress, setProgress] = useState(null)
  const [trending, setTrending] = useState([])
  const today = new Date().toISOString().split('T')[0]

  useEffect(() => {
    progressAPI.getDailyCalories(today).then(r => setProgress(r.data)).catch(() => {})
    foodsAPI.filter({ min_health_score: 9, limit: 6 }).then(r => setTrending(r.data.data || [])).catch(() => {})
  }, [])

  const target    = progress?.calorie_target || profile?.daily_calorie_target || 2000
  const consumed  = progress?.total_calories || 0
  const remaining = Math.max(0, target - consumed)
  const pct       = Math.min(100, Math.round((consumed / target) * 100))

  const macros = [
    { label: 'Protein', val: progress?.total_protein || 0, unit: 'g', color: 'bg-blue-500',   icon: Zap     },
    { label: 'Carbs',   val: progress?.total_carbs   || 0, unit: 'g', color: 'bg-yellow-500', icon: Flame   },
    { label: 'Fat',     val: progress?.total_fat     || 0, unit: 'g', color: 'bg-red-400',    icon: Droplets},
  ]

  const hour = new Date().getHours()
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening'

  return (
    <div className="p-4 lg:p-6 max-w-3xl mx-auto space-y-6 page-enter pb-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-gray-400 text-sm">{greeting} 👋</p>
          <h1 className="text-2xl font-extrabold text-gray-900">{user?.full_name?.split(' ')[0] || 'Welcome'}!</h1>
        </div>
        <div className="text-right">
          <p className="text-xs text-gray-400">{new Date().toLocaleDateString('en-IN', { weekday:'long', month:'short', day:'numeric' })}</p>
          {profile?.goal && (
            <span className="badge bg-primary-100 text-primary-700 mt-1">
              {profile.goal.replace('_',' ')}
            </span>
          )}
        </div>
      </div>

      {/* Calorie Ring Card */}
      <div className="card p-6 bg-gradient-to-br from-primary-500 to-emerald-500 text-white">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-primary-100 text-sm font-medium">Today's Calories</p>
            <p className="text-4xl font-extrabold mt-1">{Math.round(consumed)}</p>
            <p className="text-primary-200 text-sm">of {target} kcal target</p>
            <p className="mt-2 text-white font-semibold">{Math.round(remaining)} kcal remaining</p>
          </div>
          <div className="relative w-24 h-24">
            <svg viewBox="0 0 36 36" className="w-full h-full -rotate-90">
              <circle cx="18" cy="18" r="15.9" fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth="3" />
              <circle cx="18" cy="18" r="15.9" fill="none" stroke="white" strokeWidth="3"
                strokeDasharray={`${pct} ${100-pct}`} strokeLinecap="round" />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-white font-extrabold text-lg">{pct}%</span>
            </div>
          </div>
        </div>

        {/* Macro pills */}
        <div className="flex gap-2 mt-4">
          {macros.map(m => (
            <div key={m.label} className="flex-1 bg-white/20 rounded-2xl p-2.5 text-center backdrop-blur-sm">
              <p className="text-white/70 text-xs">{m.label}</p>
              <p className="text-white font-bold text-sm">{Math.round(m.val)}g</p>
            </div>
          ))}
        </div>
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="font-bold text-gray-900 mb-3">Quick Actions</h2>
        <div className="grid grid-cols-2 gap-3">
          {QUICK_LINKS.map(({ to, icon: Icon, label, bg, color, desc }) => (
            <button key={to} onClick={() => navigate(to)}
              className="card p-4 text-left hover:shadow-md transition-all hover:-translate-y-0.5 active:scale-95">
              <div className={`w-10 h-10 ${bg} rounded-2xl flex items-center justify-center mb-3`}>
                <Icon size={20} className={color} />
              </div>
              <p className="font-bold text-gray-900 text-sm">{label}</p>
              <p className="text-gray-400 text-xs mt-0.5">{desc}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Today's Meals */}
      {progress?.meals?.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-bold text-gray-900">Today's Meals</h2>
            <button onClick={() => navigate('/progress')} className="text-primary-500 text-sm font-semibold flex items-center gap-1">
              View all <ChevronRight size={14} />
            </button>
          </div>
          <div className="space-y-2">
            {(progress.meals || []).slice(0,4).map((meal, i) => (
              <div key={i} className="card px-4 py-3 flex items-center gap-3">
                <div className="w-10 h-10 bg-gray-100 rounded-2xl flex items-center justify-center text-lg flex-shrink-0">
                  {meal.meal_type === 'breakfast' ? '🌅' : meal.meal_type === 'lunch' ? '☀️' : meal.meal_type === 'dinner' ? '🌙' : '🍎'}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-gray-900 text-sm truncate">{meal.food_name}</p>
                  <p className="text-gray-400 text-xs capitalize">{meal.meal_type} · {meal.quantity_g}g</p>
                </div>
                <p className="text-primary-600 font-bold text-sm flex-shrink-0">{Math.round(meal.calories)} kcal</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Top Healthy Foods */}
      {trending.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-bold text-gray-900">Top Healthy Picks</h2>
            <button onClick={() => navigate('/foods')} className="text-primary-500 text-sm font-semibold flex items-center gap-1">
              All foods <ChevronRight size={14} />
            </button>
          </div>
          <div className="flex gap-3 overflow-x-auto pb-2 -mx-1 px-1">
            {trending.map(food => (
              <div key={food.id} className="card flex-shrink-0 w-36 overflow-hidden">
                <img src={food.image_url} alt={food.name} className="w-full h-24 object-cover"
                  onError={e => { e.target.src = 'https://source.unsplash.com/600x400/?healthy-food' }} />
                <div className="p-2.5">
                  <p className="font-semibold text-gray-900 text-xs leading-tight truncate">{food.name}</p>
                  <div className="flex items-center justify-between mt-1">
                    <span className="text-xs text-gray-400">{food.calories} kcal</span>
                    <span className={`text-xs font-bold ${food.health_score >= 9 ? 'text-primary-500' : 'text-orange-500'}`}>
                      ⭐ {food.health_score}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
