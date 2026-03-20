"use client"

import { motion } from "framer-motion"
import { Camera, CalendarDays, MessageSquare, Search } from "lucide-react"
import { useRouter } from "next/navigation"

const actions = [
  {
    icon: Camera,
    label: "Scan Food",
    href: "/scanner",
    gradient: "from-purple-500 to-violet-600",
    bg: "bg-purple-50",
  },
  {
    icon: CalendarDays,
    label: "Meal Plan",
    href: "/planner",
    gradient: "from-blue-500 to-cyan-600",
    bg: "bg-blue-50",
  },
  {
    icon: MessageSquare,
    label: "Ask AI",
    href: "/chat",
    gradient: "from-green-500 to-emerald-600",
    bg: "bg-green-50",
  },
  {
    icon: Search,
    label: "Find Food",
    href: "/foods",
    gradient: "from-orange-500 to-amber-600",
    bg: "bg-orange-50",
  },
]

export function QuickActions() {
  const router = useRouter()

  return (
    <div className="grid grid-cols-4 gap-3">
      {actions.map((action, index) => (
        <motion.button
          key={action.label}
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.8 + index * 0.1 }}
          onClick={() => router.push(action.href)}
          className={`${action.bg} rounded-2xl p-4 flex flex-col items-center gap-2 hover:scale-105 transition-transform duration-200`}
        >
          <div
            className={`w-12 h-12 rounded-xl bg-gradient-to-br ${action.gradient} flex items-center justify-center shadow-md`}
          >
            <action.icon className="w-6 h-6 text-white" />
          </div>
          <span className="text-xs font-medium text-foreground">{action.label}</span>
        </motion.button>
      ))}
    </div>
  )
}
