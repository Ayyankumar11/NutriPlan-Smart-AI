import type { Metadata, Viewport } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { AuthProvider } from "@/lib/context/auth-context"

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
})

export const metadata: Metadata = {
  title: "NutriPlan Smart AI - Eat Smart. Live Better.",
  description:
    "Your personal AI diet assistant for healthy Indian eating. Track calories, get personalized meal plans, and achieve your health goals with 400+ Indian foods.",
  keywords: [
    "nutrition app",
    "diet planner",
    "Indian food",
    "calorie tracker",
    "meal planning",
    "AI diet assistant",
    "healthy eating",
  ],
  authors: [{ name: "NutriPlan" }],
  openGraph: {
    title: "NutriPlan Smart AI",
    description: "Your personal AI diet assistant for healthy Indian eating",
    type: "website",
  },
}

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#22c55e" },
    { media: "(prefers-color-scheme: dark)", color: "#15803d" },
  ],
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} font-sans antialiased`}>
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  )
}
