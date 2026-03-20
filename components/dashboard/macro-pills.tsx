"use client"

import { motion } from "framer-motion"

interface MacroPillsProps {
  protein: number
  carbs: number
  fat: number
}

export function MacroPills({ protein, carbs, fat }: MacroPillsProps) {
  const macros = [
    { label: "Protein", value: protein, unit: "g", color: "bg-blue-500", bgColor: "bg-blue-50" },
    { label: "Carbs", value: carbs, unit: "g", color: "bg-amber-500", bgColor: "bg-amber-50" },
    { label: "Fat", value: fat, unit: "g", color: "bg-rose-500", bgColor: "bg-rose-50" },
  ]

  return (
    <div className="flex gap-3">
      {macros.map((macro, index) => (
        <motion.div
          key={macro.label}
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.6 + index * 0.1 }}
          className={`flex-1 ${macro.bgColor} rounded-2xl p-4`}
        >
          <div className="flex items-center gap-2 mb-1">
            <div className={`w-2 h-2 rounded-full ${macro.color}`} />
            <span className="text-xs font-medium text-muted-foreground">{macro.label}</span>
          </div>
          <p className="text-xl font-bold text-foreground">
            {macro.value}
            <span className="text-sm font-medium text-muted-foreground">{macro.unit}</span>
          </p>
        </motion.div>
      ))}
    </div>
  )
}
