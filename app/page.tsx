"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { Leaf, Sparkles, Heart, Brain, TrendingUp, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/lib/context/auth-context"

const features = [
  { icon: Brain, text: "AI-Powered Plans" },
  { icon: Heart, text: "400+ Indian Foods" },
  { icon: TrendingUp, text: "Track Progress" },
  { icon: Sparkles, text: "Smart Suggestions" },
]

export default function SplashPage() {
  const router = useRouter()
  const { user, isLoading, isAuthenticated } = useAuth()
  const [showContent, setShowContent] = useState(false)

  useEffect(() => {
    // Show content after brief logo animation
    const timer = setTimeout(() => setShowContent(true), 800)
    return () => clearTimeout(timer)
  }, [])

  useEffect(() => {
    if (!isLoading) {
      if (isAuthenticated) {
        router.push("/dashboard")
      } else if (user && !user.full_name) {
        // User signed up but hasn't completed onboarding
        router.push("/setup")
      }
    }
  }, [isLoading, isAuthenticated, user, router])

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="flex flex-col items-center gap-4"
        >
          <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center shadow-xl shadow-green-200">
            <Leaf className="w-10 h-10 text-white" />
          </div>
          <div className="w-8 h-1 bg-green-200 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-green-500 rounded-full"
              initial={{ x: "-100%" }}
              animate={{ x: "100%" }}
              transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
            />
          </div>
        </motion.div>
      </div>
    )
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 flex flex-col overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-green-200/30 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-emerald-200/30 rounded-full blur-3xl" />
      </div>

      <div className="relative flex-1 flex flex-col items-center justify-center px-6 py-12">
        {/* Logo */}
        <motion.div
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="mb-8"
        >
          <div className="w-28 h-28 rounded-[2rem] bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center shadow-2xl shadow-green-200/50 relative">
            <Leaf className="w-14 h-14 text-white" />
            <motion.div
              className="absolute inset-0 rounded-[2rem] border-2 border-green-400/50"
              animate={{ scale: [1, 1.1, 1], opacity: [0.5, 0, 0.5] }}
              transition={{ repeat: Infinity, duration: 2 }}
            />
          </div>
        </motion.div>

        {/* Title */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={showContent ? { y: 0, opacity: 1 } : {}}
          transition={{ delay: 0.1, duration: 0.5 }}
          className="text-center mb-6"
        >
          <h1 className="text-4xl md:text-5xl font-extrabold text-foreground mb-2">
            Nutri<span className="text-primary">Plan</span>
          </h1>
          <p className="text-lg text-primary font-semibold">Smart AI</p>
        </motion.div>

        {/* Tagline */}
        <motion.p
          initial={{ y: 20, opacity: 0 }}
          animate={showContent ? { y: 0, opacity: 1 } : {}}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="text-xl md:text-2xl text-muted-foreground text-center mb-10 max-w-md text-balance"
        >
          Eat Smart. Live Better.
        </motion.p>

        {/* Feature pills */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={showContent ? { y: 0, opacity: 1 } : {}}
          transition={{ delay: 0.3, duration: 0.5 }}
          className="flex flex-wrap justify-center gap-3 mb-12 max-w-md"
        >
          {features.map((feature, index) => (
            <motion.div
              key={feature.text}
              initial={{ scale: 0.8, opacity: 0 }}
              animate={showContent ? { scale: 1, opacity: 1 } : {}}
              transition={{ delay: 0.4 + index * 0.1 }}
              className="flex items-center gap-2 px-4 py-2 bg-white/80 backdrop-blur-sm rounded-full shadow-sm border border-green-100"
            >
              <feature.icon className="w-4 h-4 text-primary" />
              <span className="text-sm font-medium text-foreground">{feature.text}</span>
            </motion.div>
          ))}
        </motion.div>

        {/* CTA Buttons */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={showContent ? { y: 0, opacity: 1 } : {}}
          transition={{ delay: 0.6, duration: 0.5 }}
          className="flex flex-col sm:flex-row gap-4 w-full max-w-sm"
        >
          <Button
            onClick={() => router.push("/signup")}
            size="lg"
            className="flex-1 h-14 text-lg font-semibold rounded-2xl bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 shadow-lg shadow-green-200/50 transition-all duration-300 hover:scale-[1.02]"
          >
            Get Started
            <ChevronRight className="w-5 h-5 ml-1" />
          </Button>
          <Button
            onClick={() => router.push("/login")}
            variant="outline"
            size="lg"
            className="flex-1 h-14 text-lg font-semibold rounded-2xl border-2 border-green-200 hover:bg-green-50 transition-all duration-300"
          >
            Sign In
          </Button>
        </motion.div>

        {/* Bottom text */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={showContent ? { opacity: 1 } : {}}
          transition={{ delay: 0.8 }}
          className="mt-8 text-sm text-muted-foreground text-center"
        >
          Your personal AI diet assistant for healthy Indian eating
        </motion.p>
      </div>
    </main>
  )
}
