import { useState, useEffect, createContext, useContext } from 'react'
import { authAPI } from '../services/api'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser]       = useState(null)
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const stored = localStorage.getItem('nutriplan_user')
    const token  = localStorage.getItem('nutriplan_token')
    if (stored && token) {
      setUser(JSON.parse(stored))
      loadProfile()
    }
    setLoading(false)
  }, [])

  const loadProfile = async () => {
    try {
      const res = await authAPI.getProfile()
      setProfile(res.data)
    } catch { /* profile may not exist yet */ }
  }

  const login = async (email, password) => {
    const res = await authAPI.login({ email, password })
    const { access_token, ...userData } = res.data
    localStorage.setItem('nutriplan_token', access_token)
    localStorage.setItem('nutriplan_user', JSON.stringify(userData))
    setUser(userData)
    await loadProfile()
    return res.data
  }

  const signup = async (email, password, full_name) => {
    const res = await authAPI.signup({ email, password, full_name })
    const { access_token, ...userData } = res.data
    localStorage.setItem('nutriplan_token', access_token)
    localStorage.setItem('nutriplan_user', JSON.stringify(userData))
    setUser(userData)
    return res.data
  }

  const logout = () => {
    localStorage.removeItem('nutriplan_token')
    localStorage.removeItem('nutriplan_user')
    setUser(null)
    setProfile(null)
  }

  const updateProfile = async (data) => {
    const res = await authAPI.updateProfile(data)
    await loadProfile()
    return res.data
  }

  return (
    <AuthContext.Provider value={{ user, profile, loading, login, signup, logout, updateProfile, loadProfile }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
