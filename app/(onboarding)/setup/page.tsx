"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import {
  Leaf,
  ArrowRight,
  ArrowLeft,
  User,
  Scale,
  Target,
  Salad,
  Activity,
  Loader2,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useAuth } from "@/lib/context/auth-context"
import type { OnboardingData } from "@/lib/types"

const steps = [
  { id: 1, title: "Personal Info", icon: User },
  { id: 2, title: "Body Metrics", icon: Scale },
  { id: 3, title: "Your Goal", icon: Target },
  { id: 4, title: "Diet Preference", icon: Salad },
]

const goals = [
  { value: "lose_weight", label: "Lose Weight", desc: "Reduce body fat and slim down", icon: "📉" },
  { value: "gain_muscle", label: "Gain Muscle", desc: "Build muscle mass and strength", icon: "💪" },
  { value: "maintain", label: "Maintain Weight", desc: "Keep your current weight stable", icon: "⚖️" },
  { value: "eat_healthy", label: "Eat Healthy", desc: "Improve overall nutrition habits", icon: "🥗" },
]

const dietTypes = [
  { value: "vegetarian", label: "Vegetarian", desc: "No meat or fish", icon: "🥬" },
  { value: "vegan", label: "Vegan", desc: "No animal products", icon: "🌱" },
  { value: "eggetarian", label: "Eggetarian", desc: "Vegetarian + eggs", icon: "🥚" },
  { value: "non_veg", label: "Non-Vegetarian", desc: "All foods included", icon: "🍗" },
]

const activityLevels = [
  { value: "sedentary", label: "Sedentary", desc: "Little to no exercise" },
  { value: "light", label: "Light", desc: "Exercise 1-3 days/week" },
  { value: "moderate", label: "Moderate", desc: "Exercise 3-5 days/week" },
  { value: "active", label: "Active", desc: "Exercise 6-7 days/week" },
]

const regions = ["South Indian", "North Indian", "Pan India", "All Regions"]

export default function SetupPage() {
  const router = useRouter()
  const { user, isLoading: authLoading, completeOnboarding } = useAuth()
  const [step, setStep] = useState(1)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState<OnboardingData>({
    full_name: "",
    age: 25,
    gender: "male",
    weight: 70,
    height: 170,
    goal: "eat_healthy",
    diet_type: "vegetarian",
    activity_level: "moderate",
    region_preference: "All Regions",
  })

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login")
    }
  }, [authLoading, user, router])

  const updateFormData = (key: keyof OnboardingData, value: string | number) => {
    setFormData((prev) => ({ ...prev, [key]: value }))
  }

  const nextStep = () => {
    if (step < 4) setStep(step + 1)
  }

  const prevStep = () => {
    if (step > 1) setStep(step - 1)
  }

  const handleSubmit = async () => {
    setIsSubmitting(true)
    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 1000))
    completeOnboarding(formData)
    router.push("/dashboard")
  }

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 flex flex-col">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-green-200/30 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-emerald-200/30 rounded-full blur-3xl" />
      </div>

      <div className="relative flex-1 flex flex-col px-6 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center shadow-lg shadow-green-200/50">
            <Leaf className="w-6 h-6 text-white" />
          </div>
          <div className="text-sm font-medium text-muted-foreground">Step {step} of 4</div>
        </div>

        {/* Progress bar */}
        <div className="flex gap-2 mb-8">
          {steps.map((s) => (
            <div
              key={s.id}
              className={`h-1.5 flex-1 rounded-full transition-colors duration-300 ${
                s.id <= step ? "bg-primary" : "bg-green-100"
              }`}
            />
          ))}
        </div>

        {/* Step indicator */}
        <div className="flex gap-2 mb-8 overflow-x-auto pb-2 scrollbar-hide">
          {steps.map((s) => (
            <button
              key={s.id}
              onClick={() => s.id < step && setStep(s.id)}
              disabled={s.id > step}
              className={`flex items-center gap-2 px-4 py-2 rounded-full whitespace-nowrap transition-all duration-300 ${
                s.id === step
                  ? "bg-primary text-primary-foreground shadow-md"
                  : s.id < step
                    ? "bg-white text-foreground shadow-sm cursor-pointer hover:bg-green-50"
                    : "bg-green-50 text-muted-foreground"
              }`}
            >
              <s.icon className="w-4 h-4" />
              <span className="text-sm font-medium">{s.title}</span>
            </button>
          ))}
        </div>

        {/* Step Content */}
        <div className="flex-1 max-w-md mx-auto w-full">
          <AnimatePresence mode="wait">
            {/* Step 1: Personal Info */}
            {step === 1 && (
              <motion.div
                key="step1"
                initial={{ x: 20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: -20, opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="space-y-6"
              >
                <div className="text-center mb-6">
                  <h2 className="text-2xl font-bold text-foreground mb-2">Tell us about yourself</h2>
                  <p className="text-muted-foreground">Help us personalize your experience</p>
                </div>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Your Name</Label>
                    <Input
                      id="name"
                      placeholder="Enter your name"
                      value={formData.full_name}
                      onChange={(e) => updateFormData("full_name", e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="age">Age</Label>
                    <Input
                      id="age"
                      type="number"
                      min={10}
                      max={100}
                      value={formData.age}
                      onChange={(e) => updateFormData("age", parseInt(e.target.value) || 25)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Gender</Label>
                    <div className="grid grid-cols-3 gap-3">
                      {["male", "female", "other"].map((g) => (
                        <button
                          key={g}
                          type="button"
                          onClick={() => updateFormData("gender", g as "male" | "female" | "other")}
                          className={`py-3 px-4 rounded-xl border-2 text-sm font-medium transition-all duration-200 ${
                            formData.gender === g
                              ? "border-primary bg-primary/10 text-primary"
                              : "border-input bg-white hover:border-primary/50"
                          }`}
                        >
                          {g.charAt(0).toUpperCase() + g.slice(1)}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Step 2: Body Metrics */}
            {step === 2 && (
              <motion.div
                key="step2"
                initial={{ x: 20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: -20, opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="space-y-6"
              >
                <div className="text-center mb-6">
                  <h2 className="text-2xl font-bold text-foreground mb-2">Your Body Metrics</h2>
                  <p className="text-muted-foreground">We&apos;ll calculate your ideal calorie intake</p>
                </div>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="weight">Weight (kg)</Label>
                    <Input
                      id="weight"
                      type="number"
                      min={30}
                      max={200}
                      value={formData.weight}
                      onChange={(e) => updateFormData("weight", parseInt(e.target.value) || 70)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="height">Height (cm)</Label>
                    <Input
                      id="height"
                      type="number"
                      min={100}
                      max={250}
                      value={formData.height}
                      onChange={(e) => updateFormData("height", parseInt(e.target.value) || 170)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Activity Level</Label>
                    <div className="space-y-2">
                      {activityLevels.map((level) => (
                        <button
                          key={level.value}
                          type="button"
                          onClick={() =>
                            updateFormData(
                              "activity_level",
                              level.value as "sedentary" | "light" | "moderate" | "active"
                            )
                          }
                          className={`w-full flex items-center justify-between p-4 rounded-xl border-2 transition-all duration-200 ${
                            formData.activity_level === level.value
                              ? "border-primary bg-primary/10"
                              : "border-input bg-white hover:border-primary/50"
                          }`}
                        >
                          <div className="text-left">
                            <p className="font-medium text-foreground">{level.label}</p>
                            <p className="text-sm text-muted-foreground">{level.desc}</p>
                          </div>
                          <Activity
                            className={`w-5 h-5 ${formData.activity_level === level.value ? "text-primary" : "text-muted-foreground"}`}
                          />
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Step 3: Goal */}
            {step === 3 && (
              <motion.div
                key="step3"
                initial={{ x: 20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: -20, opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="space-y-6"
              >
                <div className="text-center mb-6">
                  <h2 className="text-2xl font-bold text-foreground mb-2">What&apos;s your goal?</h2>
                  <p className="text-muted-foreground">We&apos;ll customize your meal plans accordingly</p>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  {goals.map((goal) => (
                    <button
                      key={goal.value}
                      type="button"
                      onClick={() =>
                        updateFormData(
                          "goal",
                          goal.value as "lose_weight" | "gain_muscle" | "maintain" | "eat_healthy"
                        )
                      }
                      className={`flex flex-col items-center p-5 rounded-2xl border-2 transition-all duration-200 ${
                        formData.goal === goal.value
                          ? "border-primary bg-primary/10 shadow-md"
                          : "border-input bg-white hover:border-primary/50"
                      }`}
                    >
                      <span className="text-3xl mb-2">{goal.icon}</span>
                      <p className="font-semibold text-foreground text-center">{goal.label}</p>
                      <p className="text-xs text-muted-foreground text-center mt-1">{goal.desc}</p>
                    </button>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Step 4: Diet Preference */}
            {step === 4 && (
              <motion.div
                key="step4"
                initial={{ x: 20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: -20, opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="space-y-6"
              >
                <div className="text-center mb-6">
                  <h2 className="text-2xl font-bold text-foreground mb-2">Diet Preference</h2>
                  <p className="text-muted-foreground">Choose your dietary style</p>
                </div>

                <div className="grid grid-cols-2 gap-3 mb-6">
                  {dietTypes.map((diet) => (
                    <button
                      key={diet.value}
                      type="button"
                      onClick={() =>
                        updateFormData(
                          "diet_type",
                          diet.value as "vegetarian" | "vegan" | "eggetarian" | "non_veg"
                        )
                      }
                      className={`flex flex-col items-center p-5 rounded-2xl border-2 transition-all duration-200 ${
                        formData.diet_type === diet.value
                          ? "border-primary bg-primary/10 shadow-md"
                          : "border-input bg-white hover:border-primary/50"
                      }`}
                    >
                      <span className="text-3xl mb-2">{diet.icon}</span>
                      <p className="font-semibold text-foreground">{diet.label}</p>
                      <p className="text-xs text-muted-foreground text-center mt-1">{diet.desc}</p>
                    </button>
                  ))}
                </div>

                <div className="space-y-2">
                  <Label>Cuisine Preference</Label>
                  <div className="grid grid-cols-2 gap-2">
                    {regions.map((region) => (
                      <button
                        key={region}
                        type="button"
                        onClick={() => updateFormData("region_preference", region)}
                        className={`py-3 px-4 rounded-xl border-2 text-sm font-medium transition-all duration-200 ${
                          formData.region_preference === region
                            ? "border-primary bg-primary/10 text-primary"
                            : "border-input bg-white hover:border-primary/50"
                        }`}
                      >
                        {region}
                      </button>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Navigation buttons */}
        <div className="flex gap-4 mt-8 max-w-md mx-auto w-full">
          {step > 1 && (
            <Button variant="outline" onClick={prevStep} className="flex-1 h-14 rounded-2xl text-lg font-medium">
              <ArrowLeft className="w-5 h-5 mr-2" />
              Back
            </Button>
          )}
          {step < 4 ? (
            <Button
              onClick={nextStep}
              disabled={step === 1 && !formData.full_name}
              className="flex-1 h-14 rounded-2xl text-lg font-semibold bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 shadow-lg shadow-green-200/50"
            >
              Continue
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          ) : (
            <Button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="flex-1 h-14 rounded-2xl text-lg font-semibold bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 shadow-lg shadow-green-200/50"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Setting up...
                </>
              ) : (
                <>
                  Complete Setup
                  <ArrowRight className="w-5 h-5 ml-2" />
                </>
              )}
            </Button>
          )}
        </div>
      </div>
    </main>
  )
}
