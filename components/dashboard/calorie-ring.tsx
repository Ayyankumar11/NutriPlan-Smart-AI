"use client"

import { motion } from "framer-motion"

interface CalorieRingProps {
  consumed: number
  target: number
  size?: number
}

export function CalorieRing({ consumed, target, size = 200 }: CalorieRingProps) {
  const percentage = Math.min((consumed / target) * 100, 100)
  const strokeWidth = 12
  const radius = (size - strokeWidth) / 2
  const circumference = 2 * Math.PI * radius
  const offset = circumference - (percentage / 100) * circumference

  const getColor = () => {
    if (percentage < 50) return "#22c55e" // green
    if (percentage < 80) return "#eab308" // yellow
    if (percentage < 100) return "#f97316" // orange
    return "#ef4444" // red
  }

  const remaining = Math.max(target - consumed, 0)

  return (
    <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
      {/* Background circle */}
      <svg className="absolute" width={size} height={size}>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth={strokeWidth}
          className="text-green-100"
        />
      </svg>

      {/* Progress circle */}
      <svg
        className="absolute progress-ring"
        width={size}
        height={size}
        style={{ transform: "rotate(-90deg)" }}
      >
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={getColor()}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1.5, ease: "easeOut" }}
        />
      </svg>

      {/* Inner glow effect */}
      <div
        className="absolute rounded-full opacity-20 blur-lg"
        style={{
          width: size - strokeWidth * 4,
          height: size - strokeWidth * 4,
          backgroundColor: getColor(),
        }}
      />

      {/* Center content */}
      <div className="relative text-center z-10">
        <motion.p
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="text-4xl font-extrabold text-foreground"
        >
          {consumed}
        </motion.p>
        <p className="text-sm text-muted-foreground font-medium">of {target} kcal</p>
        <p className="text-xs text-primary font-semibold mt-1">
          {remaining > 0 ? `${remaining} left` : "Goal reached!"}
        </p>
      </div>
    </div>
  )
}
