import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './hooks/useAuth'

import Splash        from './pages/Splash'
import Login         from './pages/Login'
import Signup        from './pages/Signup'
import ProfileSetup  from './pages/ProfileSetup'
import Dashboard     from './pages/Dashboard'
import FoodScanner   from './pages/FoodScanner'
import MealPlanner   from './pages/MealPlanner'
import FoodDatabase  from './pages/FoodDatabase'
import AIChatbot     from './pages/AIChatbot'
import Progress      from './pages/Progress'
import Layout        from './components/layout/Layout'

function PrivateRoute({ children }) {
  const { user, loading } = useAuth()
  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 to-green-100">
      <div className="text-center">
        <div className="w-16 h-16 bg-primary-500 rounded-3xl flex items-center justify-center mx-auto mb-4 animate-pulse">
          <span className="text-3xl">🥗</span>
        </div>
        <p className="text-primary-600 font-semibold">Loading NutriPlan…</p>
      </div>
    </div>
  )
  return user ? children : <Navigate to="/login" replace />
}

function PublicRoute({ children }) {
  const { user, loading } = useAuth()
  if (loading) return null
  return user ? <Navigate to="/dashboard" replace /> : children
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/"        element={<Splash />} />
          <Route path="/login"   element={<PublicRoute><Login /></PublicRoute>} />
          <Route path="/signup"  element={<PublicRoute><Signup /></PublicRoute>} />
          <Route path="/setup"   element={<PrivateRoute><ProfileSetup /></PrivateRoute>} />

          <Route element={<PrivateRoute><Layout /></PrivateRoute>}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/scanner"   element={<FoodScanner />} />
            <Route path="/planner"   element={<MealPlanner />} />
            <Route path="/foods"     element={<FoodDatabase />} />
            <Route path="/chat"      element={<AIChatbot />} />
            <Route path="/progress"  element={<Progress />} />
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}
