import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { ChevronRight, ChevronLeft, Leaf, Check } from 'lucide-react'

const STEPS = ['Personal Info', 'Body Metrics', 'Goals & Diet', 'Region']

const GOALS = [
  { value: 'lose_weight',  label: '🏃 Lose Weight',   desc: 'Calorie deficit plan'      },
  { value: 'gain_muscle',  label: '💪 Gain Muscle',   desc: 'High protein plan'         },
  { value: 'maintain',     label: '⚖️ Maintain',       desc: 'Balanced nutrition'        },
  { value: 'eat_healthy',  label: '🥗 Eat Healthy',   desc: 'Clean, whole foods'        },
]
const DIETS = [
  { value: 'vegetarian', label: '🌿 Vegetarian' },
  { value: 'vegan',      label: '🌱 Vegan'      },
  { value: 'eggetarian', label: '🥚 Eggetarian' },
  { value: 'non_veg',    label: '🍗 Non-Veg'    },
]
const ACTIVITY = [
  { value: 'sedentary', label: 'Sedentary', desc: 'Office job, minimal exercise' },
  { value: 'light',     label: 'Light',     desc: '1-2 days/week exercise'       },
  { value: 'moderate',  label: 'Moderate',  desc: '3-5 days/week exercise'       },
  { value: 'active',    label: 'Active',    desc: '6-7 days/week exercise'       },
]
const REGIONS = ['South Indian','North Indian','Pan India','Any']

export default function ProfileSetup() {
  const { updateProfile } = useAuth()
  const navigate = useNavigate()
  const [step, setStep] = useState(0)
  const [loading, setLoading] = useState(false)
  const [data, setData] = useState({
    full_name:'', age:'', gender:'male', weight:'', height:'',
    goal:'maintain', diet_type:'vegetarian', activity_level:'moderate',
    region_preference:'South Indian'
  })

  const set = (k, v) => setData(d => ({...d, [k]: v}))

  const handleFinish = async () => {
    setLoading(true)
    try {
      await updateProfile({
        ...data,
        age: data.age ? parseInt(data.age) : undefined,
        weight: data.weight ? parseFloat(data.weight) : undefined,
        height: data.height ? parseFloat(data.height) : undefined,
      })
      navigate('/dashboard')
    } catch {
      navigate('/dashboard')
    } finally { setLoading(false) }
  }

  const OptionCard = ({ selected, onClick, children, extra }) => (
    <button onClick={onClick}
      className={`w-full text-left p-4 rounded-2xl border-2 transition-all font-medium ${
        selected ? 'border-primary-500 bg-primary-50 text-primary-700' : 'border-gray-100 bg-white text-gray-700 hover:border-gray-200'
      }`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="font-semibold">{children}</p>
          {extra && <p className="text-xs text-gray-400 mt-0.5">{extra}</p>}
        </div>
        {selected && <Check size={18} className="text-primary-500 flex-shrink-0" />}
      </div>
    </button>
  )

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-emerald-50 flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-6">
          <div className="w-12 h-12 bg-primary-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Leaf className="text-white" size={22} />
          </div>
          <h2 className="text-xl font-bold text-gray-900">Set Up Your Profile</h2>
          <p className="text-gray-500 text-sm mt-1">Help us personalize your nutrition plan</p>
        </div>

        {/* Progress */}
        <div className="flex gap-1.5 mb-6">
          {STEPS.map((s, i) => (
            <div key={s} className={`flex-1 h-1.5 rounded-full transition-all ${i <= step ? 'bg-primary-500' : 'bg-gray-200'}`} />
          ))}
        </div>
        <p className="text-center text-xs text-gray-400 mb-6">{STEPS[step]} ({step+1}/{STEPS.length})</p>

        <div className="card p-6">
          {/* Step 0 – Personal */}
          {step === 0 && (
            <div className="space-y-4">
              <h3 className="font-bold text-gray-900">Personal Information</h3>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Full Name</label>
                <input value={data.full_name} onChange={e => set('full_name', e.target.value)}
                  className="input-field" placeholder="Your name" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Age</label>
                <input type="number" min="10" max="100" value={data.age} onChange={e => set('age', e.target.value)}
                  className="input-field" placeholder="25" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Gender</label>
                <div className="flex gap-3">
                  {['male','female','other'].map(g => (
                    <button key={g} onClick={() => set('gender', g)}
                      className={`flex-1 py-2.5 rounded-2xl border-2 text-sm font-semibold capitalize transition-all ${
                        data.gender === g ? 'border-primary-500 bg-primary-50 text-primary-700' : 'border-gray-100 text-gray-600 hover:border-gray-200'
                      }`}>{g}</button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Step 1 – Body */}
          {step === 1 && (
            <div className="space-y-4">
              <h3 className="font-bold text-gray-900">Body Metrics</h3>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Weight (kg)</label>
                <input type="number" min="30" max="200" value={data.weight} onChange={e => set('weight', e.target.value)}
                  className="input-field" placeholder="65" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Height (cm)</label>
                <input type="number" min="100" max="250" value={data.height} onChange={e => set('height', e.target.value)}
                  className="input-field" placeholder="165" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Activity Level</label>
                <div className="space-y-2">
                  {ACTIVITY.map(a => (
                    <OptionCard key={a.value} selected={data.activity_level === a.value} onClick={() => set('activity_level', a.value)} extra={a.desc}>
                      {a.label}
                    </OptionCard>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Step 2 – Goals */}
          {step === 2 && (
            <div className="space-y-4">
              <h3 className="font-bold text-gray-900">Your Health Goal</h3>
              <div className="space-y-2">
                {GOALS.map(g => (
                  <OptionCard key={g.value} selected={data.goal === g.value} onClick={() => set('goal', g.value)} extra={g.desc}>
                    {g.label}
                  </OptionCard>
                ))}
              </div>
              <h3 className="font-bold text-gray-900 mt-4">Diet Preference</h3>
              <div className="grid grid-cols-2 gap-2">
                {DIETS.map(d => (
                  <OptionCard key={d.value} selected={data.diet_type === d.value} onClick={() => set('diet_type', d.value)}>
                    {d.label}
                  </OptionCard>
                ))}
              </div>
            </div>
          )}

          {/* Step 3 – Region */}
          {step === 3 && (
            <div className="space-y-4">
              <h3 className="font-bold text-gray-900">Cuisine Preference</h3>
              <p className="text-sm text-gray-500">We'll prioritize foods from your preferred region in meal plans.</p>
              <div className="space-y-2">
                {REGIONS.map(r => (
                  <OptionCard key={r} selected={data.region_preference === r} onClick={() => set('region_preference', r)}>
                    {r === 'South Indian' && '🌴 '}
                    {r === 'North Indian' && '🏔️ '}
                    {r === 'Pan India' && '🇮🇳 '}
                    {r === 'Any' && '🌍 '}
                    {r}
                  </OptionCard>
                ))}
              </div>
              <div className="bg-primary-50 rounded-2xl p-4 mt-4">
                <p className="text-sm text-primary-700 font-medium">🧮 Auto-calculated</p>
                <p className="text-xs text-primary-600 mt-1">Your daily calorie target will be calculated from your metrics and goal automatically.</p>
              </div>
            </div>
          )}

          {/* Nav buttons */}
          <div className="flex gap-3 mt-6">
            {step > 0 && (
              <button onClick={() => setStep(s => s-1)} className="btn-secondary flex items-center gap-1">
                <ChevronLeft size={16} /> Back
              </button>
            )}
            {step < STEPS.length - 1 ? (
              <button onClick={() => setStep(s => s+1)} className="btn-primary flex-1 flex items-center justify-center gap-1">
                Next <ChevronRight size={16} />
              </button>
            ) : (
              <button onClick={handleFinish} disabled={loading} className="btn-primary flex-1">
                {loading ? 'Saving…' : '🎉 Start My Journey'}
              </button>
            )}
          </div>

          <button onClick={() => navigate('/dashboard')} className="w-full mt-3 text-xs text-gray-400 hover:text-gray-600 text-center transition-colors">
            Skip for now
          </button>
        </div>
      </div>
    </div>
  )
}
