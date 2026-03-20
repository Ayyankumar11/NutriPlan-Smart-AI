import { useState, useEffect, useCallback } from 'react'
import { foodsAPI, progressAPI } from '../services/api'
import { Search, Filter, X, Plus, Check, ChevronDown } from 'lucide-react'

const REGIONS     = ['All','South Indian','North Indian','Pan India']
const CATEGORIES  = ['All','Breakfast','Main Course','Curry','Side Dish','Snack','Fruit','Juice','Soup','Salad','Dessert','Bread','Beverage','Condiment']
const HEALTH_OPTS = [{ v:0, l:'Any' },{ v:7, l:'7+ Good' },{ v:8, l:'8+ Great' },{ v:9, l:'9+ Excellent' },{ v:10, l:'10 Perfect' }]

export default function FoodDatabase() {
  const [foods, setFoods]       = useState([])
  const [loading, setLoading]   = useState(false)
  const [query, setQuery]       = useState('')
  const [filters, setFilters]   = useState({ region:'All', category:'All', min_health_score:0, max_calories:'' })
  const [page, setPage]         = useState(1)
  const [total, setTotal]       = useState(0)
  const [showFilter, setShowFilter] = useState(false)
  const [logging, setLogging]   = useState({})
  const [logged, setLogged]     = useState({})
  const [selected, setSelected] = useState(null)

  const LIMIT = 20

  const load = useCallback(async (pg = 1, reset = false) => {
    setLoading(true)
    try {
      let res
      if (query.trim()) {
        res = await foodsAPI.search(query, 40)
        const all = res.data.results || []
        setFoods(reset ? all : prev => [...prev, ...all])
        setTotal(all.length)
      } else {
        const params = { page: pg, limit: LIMIT }
        if (filters.region     !== 'All') params.region   = filters.region
        if (filters.category   !== 'All') params.category = filters.category
        if (filters.min_health_score > 0) params.min_health_score = filters.min_health_score
        if (filters.max_calories)         params.max_calories     = filters.max_calories
        res = await foodsAPI.filter({ ...params, limit: LIMIT })
        const data = res.data.data || []
        setFoods(prev => reset || pg === 1 ? data : [...prev, ...data])
        setTotal(res.data.count || 0)
        setPage(pg)
      }
    } catch {}
    setLoading(false)
  }, [query, filters])

  useEffect(() => { load(1, true) }, [query, filters])

  const logFood = async (food, mealType = 'snack') => {
    setLogging(l => ({ ...l, [food.id]: true }))
    try {
      await progressAPI.logMeal({ food_id: food.id, food_name: food.name, meal_type: mealType, quantity_g: 100, calories: food.calories, protein: food.protein, carbs: food.carbs, fat: food.fat })
      setLogged(l => ({ ...l, [food.id]: true }))
    } catch {}
    setLogging(l => ({ ...l, [food.id]: false }))
  }

  const setFilter = (k, v) => { setFilters(f => ({ ...f, [k]: v })); setPage(1) }

  const healthColor = (s) => s >= 9 ? 'text-primary-600 bg-primary-50' : s >= 7 ? 'text-yellow-600 bg-yellow-50' : 'text-red-500 bg-red-50'

  return (
    <div className="p-4 lg:p-6 max-w-3xl mx-auto pb-8 page-enter">
      <div className="mb-5">
        <h1 className="text-2xl font-extrabold text-gray-900">Food Database</h1>
        <p className="text-gray-400 text-sm mt-1">400+ Indian foods with full nutrition data</p>
      </div>

      {/* Search + Filter row */}
      <div className="flex gap-2 mb-4">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
          <input value={query} onChange={e => setQuery(e.target.value)} placeholder="Search idli, biryani, mango…"
            className="input-field pl-10 pr-10" />
          {query && <button onClick={() => setQuery('')} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400"><X size={14}/></button>}
        </div>
        <button onClick={() => setShowFilter(f => !f)}
          className={`flex items-center gap-1.5 px-4 py-3 rounded-2xl border-2 font-semibold text-sm transition-all ${showFilter ? 'border-primary-500 bg-primary-50 text-primary-700' : 'border-gray-200 text-gray-600 hover:border-gray-300'}`}>
          <Filter size={15}/> Filters
        </button>
      </div>

      {/* Filter panel */}
      {showFilter && (
        <div className="card p-4 mb-4 animate-slide-up space-y-3">
          <div>
            <p className="text-xs font-bold text-gray-500 uppercase mb-2">Region</p>
            <div className="flex flex-wrap gap-2">
              {REGIONS.map(r => (
                <button key={r} onClick={() => setFilter('region', r)}
                  className={`px-3 py-1 rounded-xl text-xs font-bold border transition-all ${filters.region===r ? 'border-primary-500 bg-primary-50 text-primary-700' : 'border-gray-100 text-gray-600 hover:border-gray-200'}`}>{r}</button>
              ))}
            </div>
          </div>
          <div>
            <p className="text-xs font-bold text-gray-500 uppercase mb-2">Category</p>
            <div className="flex flex-wrap gap-2">
              {CATEGORIES.map(c => (
                <button key={c} onClick={() => setFilter('category', c)}
                  className={`px-3 py-1 rounded-xl text-xs font-bold border transition-all ${filters.category===c ? 'border-primary-500 bg-primary-50 text-primary-700' : 'border-gray-100 text-gray-600 hover:border-gray-200'}`}>{c}</button>
              ))}
            </div>
          </div>
          <div className="flex gap-4">
            <div className="flex-1">
              <p className="text-xs font-bold text-gray-500 uppercase mb-2">Health Score</p>
              <select value={filters.min_health_score} onChange={e => setFilter('min_health_score', parseInt(e.target.value))} className="input-field text-sm py-2">
                {HEALTH_OPTS.map(o => <option key={o.v} value={o.v}>{o.l}</option>)}
              </select>
            </div>
            <div className="flex-1">
              <p className="text-xs font-bold text-gray-500 uppercase mb-2">Max Calories</p>
              <input type="number" placeholder="e.g. 200" value={filters.max_calories}
                onChange={e => setFilter('max_calories', e.target.value)} className="input-field text-sm py-2" />
            </div>
          </div>
          <button onClick={() => setFilters({ region:'All', category:'All', min_health_score:0, max_calories:'' })}
            className="text-xs text-gray-400 hover:text-gray-600 transition-colors">Clear all filters</button>
        </div>
      )}

      {/* Stats */}
      <p className="text-sm text-gray-400 mb-3">Showing {foods.length} of {total} foods</p>

      {/* Food Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {foods.map(food => (
          <div key={food.id} className="card overflow-hidden hover:shadow-md transition-shadow">
            <div className="relative">
              <img src={food.image_url} alt={food.name} className="w-full h-36 object-cover"
                onError={e => { e.target.src = 'https://source.unsplash.com/600x400/?indian-food' }} />
              <div className="absolute top-2 right-2">
                <span className={`badge text-xs font-bold ${healthColor(food.health_score)}`}>⭐ {food.health_score}</span>
              </div>
              <div className="absolute bottom-2 left-2">
                <span className="badge bg-black/50 text-white text-xs backdrop-blur-sm">{food.region}</span>
              </div>
            </div>
            <div className="p-3">
              <div className="flex items-start justify-between mb-2">
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-gray-900 text-sm truncate">{food.name}</h3>
                  <p className="text-xs text-gray-400">{food.category}</p>
                </div>
                <div className="text-right flex-shrink-0 ml-2">
                  <p className="text-base font-extrabold text-primary-600">{food.calories}</p>
                  <p className="text-xs text-gray-400">kcal/100g</p>
                </div>
              </div>

              {/* Macro pills */}
              <div className="flex gap-1 mb-3">
                {[
                  { l:'P', v:food.protein, c:'bg-blue-100 text-blue-700'   },
                  { l:'C', v:food.carbs,   c:'bg-yellow-100 text-yellow-700'},
                  { l:'F', v:food.fat,     c:'bg-red-100 text-red-600'     },
                  { l:'Fi',v:food.fiber,   c:'bg-green-100 text-green-700' },
                ].map(m => (
                  <span key={m.l} className={`badge ${m.c} text-xs`}>{m.l}:{m.v}g</span>
                ))}
              </div>

              {/* Log button */}
              {logged[food.id] ? (
                <div className="flex items-center justify-center gap-1 py-1.5 bg-primary-50 rounded-xl text-xs text-primary-600 font-semibold">
                  <Check size={12}/> Logged
                </div>
              ) : (
                <div className="flex gap-2">
                  {['breakfast','lunch','dinner','snack'].map(t => (
                    <button key={t} onClick={() => logFood(food, t)} disabled={logging[food.id]}
                      title={`Log as ${t}`}
                      className="flex-1 py-1.5 border border-gray-100 rounded-xl text-xs font-semibold text-gray-500 hover:border-primary-400 hover:text-primary-600 transition-all">
                      {t === 'breakfast' ? '🌅' : t === 'lunch' ? '☀️' : t === 'dinner' ? '🌙' : '🍎'}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {loading && (
        <div className="flex justify-center py-8">
          <div className="w-8 h-8 border-4 border-primary-200 border-t-primary-500 rounded-full animate-spin" />
        </div>
      )}

      {!loading && !query && foods.length < total && (
        <button onClick={() => load(page + 1)} className="w-full mt-4 btn-secondary flex items-center justify-center gap-2">
          <ChevronDown size={16}/> Load More
        </button>
      )}

      {!loading && foods.length === 0 && (
        <div className="text-center py-16">
          <p className="text-4xl mb-3">🔍</p>
          <p className="font-bold text-gray-700">No foods found</p>
          <p className="text-sm text-gray-400 mt-1">Try different search terms or filters</p>
        </div>
      )}
    </div>
  )
}
