import { Outlet, NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'
import {
  LayoutDashboard, Camera, CalendarDays, Database,
  MessageCircle, TrendingUp, LogOut, Leaf, Menu, X
} from 'lucide-react'
import { useState } from 'react'

const NAV = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard'     },
  { to: '/scanner',   icon: Camera,          label: 'Food Scanner'  },
  { to: '/planner',   icon: CalendarDays,    label: 'Meal Planner'  },
  { to: '/foods',     icon: Database,        label: 'Food Database' },
  { to: '/chat',      icon: MessageCircle,   label: 'AI Chatbot'    },
  { to: '/progress',  icon: TrendingUp,      label: 'Progress'      },
]

export default function Layout() {
  const { user, profile, logout } = useAuth()
  const navigate = useNavigate()
  const [mobileOpen, setMobileOpen] = useState(false)

  const handleLogout = () => { logout(); navigate('/login') }
  const initials = (user?.full_name || user?.email || 'U').slice(0,2).toUpperCase()

  const Sidebar = ({ mobile = false }) => (
    <aside className={`${mobile ? 'w-full' : 'w-64'} bg-white border-r border-gray-100 flex flex-col h-full`}>
      {/* Logo */}
      <div className="p-6 border-b border-gray-100">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-primary-400 to-primary-600 rounded-2xl flex items-center justify-center shadow-md">
            <Leaf className="text-white" size={20} />
          </div>
          <div>
            <h1 className="font-bold text-gray-900 text-base leading-tight">NutriPlan</h1>
            <p className="text-primary-500 text-xs font-semibold">Smart AI</p>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        {NAV.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to} to={to}
            onClick={() => setMobileOpen(false)}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3 rounded-2xl font-medium text-sm transition-all duration-200
              ${isActive
                ? 'bg-primary-500 text-white shadow-md shadow-primary-200'
                : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'}`
            }
          >
            <Icon size={18} />
            {label}
          </NavLink>
        ))}
      </nav>

      {/* User */}
      <div className="p-4 border-t border-gray-100">
        <div className="flex items-center gap-3 px-2 mb-3">
          <div className="w-9 h-9 bg-gradient-to-br from-primary-400 to-primary-600 rounded-full flex items-center justify-center text-white text-sm font-bold">
            {initials}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-gray-900 truncate">{user?.full_name || 'User'}</p>
            <p className="text-xs text-gray-400 truncate">{user?.email}</p>
          </div>
        </div>
        {profile?.daily_calorie_target && (
          <div className="bg-primary-50 rounded-2xl p-3 mb-3 text-center">
            <p className="text-xs text-primary-600 font-medium">Daily Target</p>
            <p className="text-lg font-bold text-primary-700">{profile.daily_calorie_target} <span className="text-xs font-normal">kcal</span></p>
          </div>
        )}
        <button onClick={handleLogout} className="w-full flex items-center gap-2 px-4 py-2 text-red-500 hover:bg-red-50 rounded-2xl transition-colors text-sm font-medium">
          <LogOut size={16} /> Sign Out
        </button>
      </div>
    </aside>
  )

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      {/* Desktop sidebar */}
      <div className="hidden lg:flex flex-shrink-0">
        <Sidebar />
      </div>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div className="absolute inset-0 bg-black/40" onClick={() => setMobileOpen(false)} />
          <div className="relative w-72 z-10 shadow-2xl">
            <Sidebar mobile />
          </div>
        </div>
      )}

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Mobile topbar */}
        <header className="lg:hidden bg-white border-b border-gray-100 px-4 py-3 flex items-center gap-3">
          <button onClick={() => setMobileOpen(true)} className="p-2 rounded-xl hover:bg-gray-100">
            <Menu size={20} className="text-gray-600" />
          </button>
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 bg-primary-500 rounded-lg flex items-center justify-center">
              <Leaf className="text-white" size={14} />
            </div>
            <span className="font-bold text-gray-900 text-sm">NutriPlan AI</span>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
