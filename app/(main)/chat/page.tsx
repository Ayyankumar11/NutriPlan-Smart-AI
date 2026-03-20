"use client"

import { useState, useRef, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Send, Bot, User, Sparkles, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { useAuth } from "@/lib/context/auth-context"
import { useFoods } from "@/lib/hooks/use-foods"
import { generateAIResponse } from "@/lib/utils/ai-mock"
import type { ChatMessage } from "@/lib/types"

const starterQuestions = [
  "What should I eat for breakfast?",
  "High protein foods for vegetarians",
  "What are my daily calories?",
  "Suggest a weight loss meal",
  "Low calorie dinner ideas",
  "Best foods for muscle gain",
]

export default function ChatPage() {
  const { user } = useAuth()
  const { allFoods } = useFoods()
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [input, setInput] = useState("")
  const [isTyping, setIsTyping] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  // Initial welcome message
  useEffect(() => {
    if (messages.length === 0) {
      const welcomeMessage: ChatMessage = {
        id: "welcome",
        role: "assistant",
        content: `Hello${user?.full_name ? `, ${user.full_name}` : ""}! I'm your NutriPlan AI assistant. I can help you with:\n\n- Finding healthy Indian foods\n- Meal suggestions based on your goals\n- Nutrition information\n- Diet planning tips\n\nHow can I help you today?`,
        suggestions: starterQuestions.slice(0, 4),
        timestamp: new Date().toISOString(),
      }
      setMessages([welcomeMessage])
    }
  }, [user?.full_name, messages.length])

  // Auto scroll to bottom
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages])

  const handleSend = async (text?: string) => {
    const messageText = text || input.trim()
    if (!messageText) return

    // Add user message
    const userMessage: ChatMessage = {
      id: crypto.randomUUID(),
      role: "user",
      content: messageText,
      timestamp: new Date().toISOString(),
    }
    setMessages((prev) => [...prev, userMessage])
    setInput("")
    setIsTyping(true)

    // Simulate AI thinking
    await new Promise((resolve) => setTimeout(resolve, 1000 + Math.random() * 1000))

    // Generate AI response
    const aiResponse = generateAIResponse(messageText, user, allFoods)
    setMessages((prev) => [...prev, aiResponse])
    setIsTyping(false)

    // Focus input after response
    inputRef.current?.focus()
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const handleSuggestionClick = (suggestion: string) => {
    handleSend(suggestion)
  }

  return (
    <div className="h-[calc(100vh-5rem)] lg:h-screen flex flex-col">
      {/* Header */}
      <div className="px-4 py-4 border-b border-green-100 bg-white/80 backdrop-blur-sm">
        <div className="max-w-2xl mx-auto flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center">
            <Sparkles className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-foreground">NutriPlan AI</h1>
            <p className="text-sm text-muted-foreground">Your personal nutrition assistant</p>
          </div>
        </div>
      </div>

      {/* Chat messages */}
      <ScrollArea ref={scrollRef} className="flex-1 px-4 py-4">
        <div className="max-w-2xl mx-auto space-y-4">
          <AnimatePresence>
            {messages.map((message, index) => (
              <motion.div
                key={message.id}
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: index === messages.length - 1 ? 0 : 0 }}
                className={`flex gap-3 ${message.role === "user" ? "flex-row-reverse" : ""}`}
              >
                {/* Avatar */}
                <div
                  className={`w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center ${
                    message.role === "user"
                      ? "bg-primary text-white"
                      : "bg-gradient-to-br from-green-500 to-emerald-600 text-white"
                  }`}
                >
                  {message.role === "user" ? (
                    <User className="w-4 h-4" />
                  ) : (
                    <Bot className="w-4 h-4" />
                  )}
                </div>

                {/* Message bubble */}
                <div className={`flex-1 max-w-[80%] ${message.role === "user" ? "text-right" : ""}`}>
                  <Card
                    className={`inline-block px-4 py-3 ${
                      message.role === "user"
                        ? "bg-primary text-white rounded-2xl rounded-tr-md"
                        : "bg-white border-green-100 rounded-2xl rounded-tl-md"
                    }`}
                  >
                    <div
                      className={`text-sm whitespace-pre-wrap ${
                        message.role === "user" ? "text-white" : "text-foreground"
                      }`}
                    >
                      {message.content.split("\n").map((line, i) => (
                        <p key={i} className={i > 0 ? "mt-2" : ""}>
                          {line.startsWith("**") && line.endsWith("**") ? (
                            <strong>{line.slice(2, -2)}</strong>
                          ) : line.startsWith("- ") ? (
                            <span className="flex items-start gap-2">
                              <span className="text-primary mt-1">•</span>
                              <span>{line.slice(2)}</span>
                            </span>
                          ) : (
                            line
                          )}
                        </p>
                      ))}
                    </div>
                  </Card>

                  {/* Suggestions */}
                  {message.role === "assistant" && message.suggestions && message.suggestions.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-3">
                      {message.suggestions.map((suggestion) => (
                        <button
                          key={suggestion}
                          onClick={() => handleSuggestionClick(suggestion)}
                          className="px-3 py-1.5 bg-green-50 hover:bg-green-100 text-foreground text-xs font-medium rounded-full transition-colors"
                        >
                          {suggestion}
                        </button>
                      ))}
                    </div>
                  )}

                  {/* Timestamp */}
                  <p
                    className={`text-xs text-muted-foreground mt-1 ${
                      message.role === "user" ? "text-right" : ""
                    }`}
                  >
                    {new Date(message.timestamp).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>

          {/* Typing indicator */}
          {isTyping && (
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              className="flex gap-3"
            >
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center">
                <Bot className="w-4 h-4 text-white" />
              </div>
              <Card className="px-4 py-3 bg-white border-green-100 rounded-2xl rounded-tl-md">
                <div className="flex items-center gap-1">
                  <motion.div
                    animate={{ y: [0, -5, 0] }}
                    transition={{ repeat: Infinity, duration: 0.6, delay: 0 }}
                    className="w-2 h-2 bg-primary rounded-full"
                  />
                  <motion.div
                    animate={{ y: [0, -5, 0] }}
                    transition={{ repeat: Infinity, duration: 0.6, delay: 0.2 }}
                    className="w-2 h-2 bg-primary rounded-full"
                  />
                  <motion.div
                    animate={{ y: [0, -5, 0] }}
                    transition={{ repeat: Infinity, duration: 0.6, delay: 0.4 }}
                    className="w-2 h-2 bg-primary rounded-full"
                  />
                </div>
              </Card>
            </motion.div>
          )}
        </div>
      </ScrollArea>

      {/* Input area */}
      <div className="px-4 py-4 border-t border-green-100 bg-white/80 backdrop-blur-sm">
        <div className="max-w-2xl mx-auto">
          {/* Quick suggestions for empty state */}
          {messages.length <= 1 && (
            <div className="flex flex-wrap gap-2 mb-3">
              {starterQuestions.slice(0, 3).map((q) => (
                <button
                  key={q}
                  onClick={() => handleSend(q)}
                  className="px-3 py-1.5 bg-green-50 hover:bg-green-100 text-foreground text-sm font-medium rounded-full transition-colors"
                >
                  {q}
                </button>
              ))}
            </div>
          )}

          <div className="flex gap-2">
            <Input
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask about nutrition, foods, or diet..."
              className="flex-1 h-12 bg-white"
              disabled={isTyping}
            />
            <Button
              onClick={() => handleSend()}
              disabled={!input.trim() || isTyping}
              className="h-12 w-12 rounded-xl bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700"
            >
              {isTyping ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <Send className="w-5 h-5" />
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
