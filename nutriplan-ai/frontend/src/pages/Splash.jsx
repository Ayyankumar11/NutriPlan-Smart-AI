import { useNavigate } from 'react-router-dom'
import { useEffect } from 'react'
import { Leaf, Zap, ChefHat, TrendingUp } from 'lucide-react'

const FEATURES = [
  { icon: ChefHat,    label: '400+ Indian Foods',    color: 'bg-orange-100 text-orange-600' },
  { icon: Zap,        label: 'AI Meal Planning',     color: 'bg-blue-100 text-blue-600'   },
  { icon: TrendingUp, label: 'Progress Tracking',    color: 'bg-purple-100 text-purple-600'},
  { icon: Leaf,       label: 'Smart Nutrition',      color: 'bg-green-100 text-green-600' },
]

export default function Splash() {
  const navigate = useNavigate()

  useEffect(() => {
    const token = localStorage.getItem('nutriplan_token')
    if (token) navigate('/dashboard', { replace: true })
  }, [])

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-600 via-primary-500 to-emerald-400 flex flex-col items-center justify-center px-6 text-white relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2" />
      <div className="absolute bottom-0 left-0 w-72 h-72 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/2" />
      <div className="absolute top-1/3 left-8 text-6xl opacity-10">🥗</div>
      <div className="absolute bottom-1/3 right-8 text-5xl opacity-10">🍛</div>

      <div className="relative z-10 text-center max-w-sm w-full animate-fade-in">
        {/* Logo */}
        <div className="w-24 h-24 bg-white/20 backdrop-blur-sm rounded-[2rem] flex items-center justify-center mx-auto mb-6 shadow-2xl border border-white/30">
          <Leaf size={44} className="text-white" />
        </div>

        <h1 className="text-4xl font-extrabold mb-2 tracking-tight">NutriPlan</h1>
        <p className="text-xl font-semibold text-primary-100 mb-3">Smart AI</p>
        <p className="text-primary-100 text-sm leading-relaxed mb-10">
          Your intelligent Indian nutrition assistant. Track meals, scan food, and get personalized meal plans powered by AI.
        </p>

        {/* Feature pills */}
        <div className="grid grid-cols-2 gap-3 mb-10">
          {FEATURES.map(({ icon: Icon, label, color }) => (
            <div key={label} className="bg-white/15 backdrop-blur-sm rounded-2xl p-3 border border-white/20 flex items-center gap-2">
              <div className="w-8 h-8 bg-white/20 rounded-xl flex items-center justify-center flex-shrink-0">
                <Icon size={16} className="text-white" />
              </div>
              <span className="text-xs font-semibold text-white leading-tight">{label}</span>
            </div>
          ))}
        </div>

        {/* CTA Buttons */}
        <div className="space-y-3">
          <button
            onClick={() => navigate('/signup')}
            className="w-full bg-white text-primary-600 font-bold py-4 rounded-2xl text-base shadow-xl hover:shadow-2xl hover:-translate-y-0.5 transition-all duration-200"
          >
            Get Started Free
          </button>
          <button
            onClick={() => navigate('/login')}
            className="w-full bg-white/20 backdrop-blur-sm border border-white/30 text-white font-semibold py-4 rounded-2xl text-base hover:bg-white/30 transition-all duration-200"
          >
            Sign In
          </button>
        </div>

        <p className="mt-6 text-primary-200 text-xs">
          Supports 400+ Indian foods across all regions 🇮🇳
        </p>
      </div>
    </div>
  )
}
