import { useState, useRef } from 'react'
import { aiAPI, progressAPI } from '../services/api'
import { Camera, Upload, Loader, Check, Plus, X } from 'lucide-react'

export default function FoodScanner() {
  const [image, setImage]       = useState(null)
  const [preview, setPreview]   = useState(null)
  const [result, setResult]     = useState(null)
  const [loading, setLoading]   = useState(false)
  const [logged, setLogged]     = useState(false)
  const [error, setError]       = useState('')
  const fileRef = useRef()

  const handleFile = (file) => {
    if (!file || !file.type.startsWith('image/')) { setError('Please upload an image file'); return }
    setImage(file)
    setPreview(URL.createObjectURL(file))
    setResult(null)
    setLogged(false)
    setError('')
  }

  const handleDrop = (e) => {
    e.preventDefault()
    handleFile(e.dataTransfer.files[0])
  }

  const scanFood = async () => {
    if (!image) return
    setLoading(true); setError('')
    try {
      const res = await aiAPI.scanFood(image)
      setResult(res.data)
    } catch (err) {
      setError('Scan failed. Please try again.')
    } finally { setLoading(false) }
  }

  const logMeal = async (mealType = 'snack') => {
    if (!result?.nutrition) return
    const food = result.nutrition
    try {
      await progressAPI.logMeal({
        food_id: food.id,
        food_name: food.name,
        meal_type: mealType,
        quantity_g: 100,
        calories: food.calories,
        protein: food.protein,
        carbs: food.carbs,
        fat: food.fat,
      })
      setLogged(true)
    } catch { setError('Failed to log meal') }
  }

  const reset = () => { setImage(null); setPreview(null); setResult(null); setLogged(false); setError('') }

  const NutritionBadge = ({ label, value, unit, color }) => (
    <div className={`flex-1 rounded-2xl p-3 ${color} text-center`}>
      <p className="text-xs text-gray-500 font-medium">{label}</p>
      <p className="text-base font-extrabold text-gray-900">{value}<span className="text-xs font-normal ml-0.5">{unit}</span></p>
    </div>
  )

  return (
    <div className="p-4 lg:p-6 max-w-xl mx-auto space-y-5 page-enter pb-8">
      <div>
        <h1 className="text-2xl font-extrabold text-gray-900">Food Scanner</h1>
        <p className="text-gray-400 text-sm mt-1">Upload a photo and our AI identifies the food</p>
      </div>

      {error && (
        <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-2xl text-sm flex items-center gap-2">
          <X size={14} /> {error}
        </div>
      )}

      {/* Upload zone */}
      {!preview ? (
        <div
          onDrop={handleDrop} onDragOver={e => e.preventDefault()}
          onClick={() => fileRef.current?.click()}
          className="border-2 border-dashed border-gray-200 rounded-3xl p-10 flex flex-col items-center justify-center text-center cursor-pointer hover:border-primary-400 hover:bg-primary-50/50 transition-all group"
        >
          <div className="w-16 h-16 bg-primary-100 rounded-3xl flex items-center justify-center mb-4 group-hover:bg-primary-200 transition-colors">
            <Camera size={28} className="text-primary-500" />
          </div>
          <p className="font-bold text-gray-700">Drop your food photo here</p>
          <p className="text-sm text-gray-400 mt-1">or click to browse · JPG, PNG, WEBP</p>
          <div className="mt-4 flex items-center gap-2 text-xs text-gray-400">
            <span>🍛 Indian cuisine expert</span>
            <span>•</span>
            <span>🤖 Gemini AI powered</span>
          </div>
          <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={e => handleFile(e.target.files[0])} />
        </div>
      ) : (
        <div className="relative">
          <img src={preview} alt="Food preview" className="w-full h-64 object-cover rounded-3xl shadow-md" />
          <button onClick={reset}
            className="absolute top-3 right-3 w-8 h-8 bg-black/50 rounded-full flex items-center justify-center hover:bg-black/70 transition-colors">
            <X size={16} className="text-white" />
          </button>
          {result && (
            <div className="absolute bottom-3 left-3 bg-black/60 backdrop-blur-sm rounded-2xl px-3 py-1.5 flex items-center gap-2">
              <span className="text-white text-sm font-semibold">{result.detected_food}</span>
              <span className="text-green-400 text-xs">{Math.round(result.confidence * 100)}%</span>
            </div>
          )}
        </div>
      )}

      {/* Actions */}
      {preview && !result && (
        <button onClick={scanFood} disabled={loading} className="btn-primary w-full flex items-center justify-center gap-2">
          {loading ? <><Loader size={18} className="animate-spin" /> Analyzing with AI…</> : <><Camera size={18} /> Scan This Food</>}
        </button>
      )}

      {/* Results */}
      {result && (
        <div className="space-y-4 animate-fade-in">
          {/* Detection */}
          <div className="card p-5">
            <div className="flex items-start justify-between mb-3">
              <div>
                <h3 className="font-extrabold text-gray-900 text-xl">{result.detected_food}</h3>
                <p className="text-gray-400 text-sm">{result.nutrition?.region} · {result.nutrition?.category}</p>
              </div>
              <div className="text-right">
                <p className="text-2xl font-extrabold text-primary-600">{result.nutrition?.calories}</p>
                <p className="text-xs text-gray-400">kcal / 100g</p>
              </div>
            </div>
            <p className="text-sm text-gray-600 bg-gray-50 rounded-2xl p-3">{result.ai_analysis}</p>
          </div>

          {/* Nutrition */}
          {result.nutrition && (
            <div className="card p-5">
              <h4 className="font-bold text-gray-800 mb-3">Nutrition per 100g</h4>
              <div className="flex gap-2">
                <NutritionBadge label="Protein" value={result.nutrition.protein} unit="g" color="bg-blue-50" />
                <NutritionBadge label="Carbs"   value={result.nutrition.carbs}   unit="g" color="bg-yellow-50" />
                <NutritionBadge label="Fat"     value={result.nutrition.fat}     unit="g" color="bg-red-50"    />
                <NutritionBadge label="Fiber"   value={result.nutrition.fiber}   unit="g" color="bg-green-50" />
              </div>
              <div className="flex items-center gap-2 mt-3">
                <div className="health-bar flex-1">
                  <div className="h-2 bg-primary-500 rounded-full" style={{ width: `${result.nutrition.health_score * 10}%` }} />
                </div>
                <span className="text-sm font-bold text-primary-600">{result.nutrition.health_score}/10 health</span>
              </div>
            </div>
          )}

          {/* Log Meal */}
          {!logged ? (
            <div className="card p-5">
              <h4 className="font-bold text-gray-800 mb-3">Log this meal as:</h4>
              <div className="grid grid-cols-2 gap-2">
                {['breakfast','lunch','dinner','snack'].map(t => (
                  <button key={t} onClick={() => logMeal(t)}
                    className="py-2.5 border-2 border-gray-100 rounded-2xl text-sm font-semibold text-gray-600 hover:border-primary-400 hover:text-primary-600 capitalize transition-all">
                    {t === 'breakfast' ? '🌅' : t === 'lunch' ? '☀️' : t === 'dinner' ? '🌙' : '🍎'} {t}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="card p-5 bg-primary-50 border border-primary-200">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-primary-500 rounded-full flex items-center justify-center">
                  <Check size={20} className="text-white" />
                </div>
                <div>
                  <p className="font-bold text-primary-800">Meal logged!</p>
                  <p className="text-sm text-primary-600">Added to your daily tracker</p>
                </div>
              </div>
            </div>
          )}

          {/* Alternatives */}
          {result.alternatives?.length > 0 && (
            <div>
              <h4 className="font-bold text-gray-800 mb-3">Similar Foods</h4>
              <div className="flex gap-3 overflow-x-auto pb-2">
                {result.alternatives.map(food => (
                  <div key={food.id} className="card flex-shrink-0 w-32 overflow-hidden">
                    <img src={food.image_url} alt={food.name} className="w-full h-20 object-cover"
                      onError={e => { e.target.src = 'https://source.unsplash.com/600x400/?food' }} />
                    <div className="p-2">
                      <p className="text-xs font-semibold text-gray-800 truncate">{food.name}</p>
                      <p className="text-xs text-gray-400">{food.calories} kcal</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <button onClick={reset} className="btn-secondary w-full flex items-center justify-center gap-2">
            <Upload size={16} /> Scan Another Food
          </button>
        </div>
      )}
    </div>
  )
}
