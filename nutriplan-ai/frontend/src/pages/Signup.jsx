import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { Eye, EyeOff, Leaf, User, Mail, Lock } from 'lucide-react'

export default function Signup() {
  const { signup } = useAuth()
  const navigate = useNavigate()
  const [form, setForm]       = useState({ full_name: '', email: '', password: '', confirm: '' })
  const [showPwd, setShowPwd] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState('')

  const handle = async (e) => {
    e.preventDefault()
    setError('')
    if (form.password !== form.confirm) { setError('Passwords do not match'); return }
    if (form.password.length < 6) { setError('Password must be at least 6 characters'); return }
    setLoading(true)
    try {
      await signup(form.email, form.password, form.full_name)
      navigate('/setup')
    } catch (err) {
      setError(err.response?.data?.detail || 'Signup failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-emerald-50 flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2 mb-6">
            <div className="w-12 h-12 bg-primary-500 rounded-2xl flex items-center justify-center shadow-md">
              <Leaf className="text-white" size={24} />
            </div>
            <span className="text-2xl font-extrabold text-gray-900">NutriPlan</span>
          </Link>
          <h2 className="text-2xl font-bold text-gray-900">Create your account</h2>
          <p className="text-gray-500 mt-1 text-sm">Start your personalized nutrition journey</p>
        </div>

        <div className="card p-8">
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-2xl text-sm">{error}</div>
          )}

          <form onSubmit={handle} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Full Name</label>
              <div className="relative">
                <User size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                <input type="text" required value={form.full_name}
                  onChange={e => setForm(f => ({...f, full_name: e.target.value}))}
                  className="input-field pl-10" placeholder="Priya Sharma" />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Email</label>
              <div className="relative">
                <Mail size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                <input type="email" required value={form.email}
                  onChange={e => setForm(f => ({...f, email: e.target.value}))}
                  className="input-field pl-10" placeholder="you@example.com" />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Password</label>
              <div className="relative">
                <Lock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                <input type={showPwd ? 'text' : 'password'} required value={form.password}
                  onChange={e => setForm(f => ({...f, password: e.target.value}))}
                  className="input-field pl-10 pr-10" placeholder="Min. 6 characters" />
                <button type="button" onClick={() => setShowPwd(s => !s)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                  {showPwd ? <EyeOff size={16}/> : <Eye size={16}/>}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Confirm Password</label>
              <div className="relative">
                <Lock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                <input type="password" required value={form.confirm}
                  onChange={e => setForm(f => ({...f, confirm: e.target.value}))}
                  className="input-field pl-10" placeholder="Repeat password" />
              </div>
            </div>

            <button type="submit" disabled={loading} className="btn-primary w-full mt-2">
              {loading ? 'Creating account…' : 'Create Account'}
            </button>
          </form>

          <p className="mt-4 text-center text-xs text-gray-400">
            By signing up you agree to our Terms of Service & Privacy Policy.
          </p>
          <p className="mt-4 text-center text-sm text-gray-500">
            Already have an account?{' '}
            <Link to="/login" className="text-primary-600 font-semibold hover:underline">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  )
}
