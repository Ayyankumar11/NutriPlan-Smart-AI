import { useState, useRef, useEffect } from 'react'
import { useAuth } from '../hooks/useAuth'
import { aiAPI } from '../services/api'
import { Send, Loader, Bot, User, Sparkles } from 'lucide-react'

const STARTERS = [
  '🥗 Best breakfast for weight loss?',
  '💪 High protein Indian foods?',
  '🍚 How many calories in biryani?',
  '🌿 Vegetarian protein sources?',
  '⚖️ How to maintain weight?',
  '🩺 Foods for diabetics?',
]

export default function AIChatbot() {
  const { profile } = useAuth()
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: "👋 Hi! I'm NutriBot, your AI nutrition assistant specializing in Indian cuisine!\n\nI can help you with:\n• Calorie counts for 400+ Indian foods\n• Personalized meal planning\n• Nutrition tips and healthy alternatives\n• Weight management advice\n\nWhat would you like to know today?",
      time: new Date().toLocaleTimeString([], { hour:'2-digit', minute:'2-digit' })
    }
  ])
  const [input, setInput]   = useState('')
  const [loading, setLoading] = useState(false)
  const bottomRef = useRef()
  const inputRef  = useRef()

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const send = async (text = input) => {
    const msg = text.trim()
    if (!msg || loading) return
    setInput('')

    const userMsg = { role: 'user', content: msg, time: new Date().toLocaleTimeString([], { hour:'2-digit', minute:'2-digit' }) }
    setMessages(m => [...m, userMsg])
    setLoading(true)

    try {
      const history = messages.slice(-8).map(m => ({ role: m.role, content: m.content }))
      const res = await aiAPI.chat({
        message: msg,
        history,
        user_profile: profile || undefined,
      })
      const botMsg = {
        role: 'assistant',
        content: res.data.reply,
        suggestions: res.data.suggestions || [],
        time: new Date().toLocaleTimeString([], { hour:'2-digit', minute:'2-digit' })
      }
      setMessages(m => [...m, botMsg])
    } catch {
      setMessages(m => [...m, {
        role: 'assistant',
        content: "Sorry, I'm having trouble connecting. Please check your backend server and try again.",
        time: new Date().toLocaleTimeString([], { hour:'2-digit', minute:'2-digit' })
      }])
    } finally {
      setLoading(false)
      setTimeout(() => inputRef.current?.focus(), 100)
    }
  }

  const handleKey = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send() }
  }

  const formatContent = (text) => {
    return text.split('\n').map((line, i) => {
      if (line.startsWith('•') || line.startsWith('-') || line.startsWith('*')) {
        return <li key={i} className="ml-4 list-none flex gap-2"><span>•</span><span>{line.slice(1).trim()}</span></li>
      }
      if (!line.trim()) return <br key={i} />
      return <p key={i} className="mb-1">{line}</p>
    })
  }

  return (
    <div className="flex flex-col h-full max-h-screen page-enter">
      {/* Header */}
      <div className="flex-shrink-0 px-4 lg:px-6 py-4 border-b border-gray-100 bg-white">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-primary-400 to-emerald-500 rounded-2xl flex items-center justify-center shadow-md">
            <Bot size={20} className="text-white" />
          </div>
          <div>
            <h1 className="font-extrabold text-gray-900">NutriBot</h1>
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 bg-primary-500 rounded-full animate-pulse" />
              <span className="text-xs text-gray-400">AI Nutrition Assistant</span>
            </div>
          </div>
          <div className="ml-auto">
            <span className="badge bg-primary-100 text-primary-700 flex items-center gap-1">
              <Sparkles size={10}/> Gemini AI
            </span>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 lg:px-6 py-4 space-y-4">
        {messages.map((msg, i) => (
          <div key={i} className={`flex gap-2 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
            {/* Avatar */}
            <div className={`w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center ${msg.role === 'user' ? 'bg-primary-500' : 'bg-gradient-to-br from-primary-400 to-emerald-500'}`}>
              {msg.role === 'user' ? <User size={14} className="text-white"/> : <Bot size={14} className="text-white"/>}
            </div>

            <div className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'} max-w-xs lg:max-w-md`}>
              <div className={`${msg.role === 'user' ? 'chat-bubble-user' : 'chat-bubble-bot'} text-sm leading-relaxed`}>
                <div className="space-y-0.5">{formatContent(msg.content)}</div>
              </div>

              {/* Suggestion chips */}
              {msg.role === 'assistant' && msg.suggestions?.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {msg.suggestions.map((s, j) => (
                    <button key={j} onClick={() => send(s)}
                      className="text-xs bg-primary-50 border border-primary-200 text-primary-700 rounded-full px-3 py-1 hover:bg-primary-100 transition-colors font-medium">
                      {s}
                    </button>
                  ))}
                </div>
              )}

              <span className="text-xs text-gray-300 mt-1 px-1">{msg.time}</span>
            </div>
          </div>
        ))}

        {/* Loading indicator */}
        {loading && (
          <div className="flex gap-2">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary-400 to-emerald-500 flex items-center justify-center flex-shrink-0">
              <Bot size={14} className="text-white"/>
            </div>
            <div className="chat-bubble-bot flex items-center gap-1.5">
              <div className="flex gap-1">
                {[0,1,2].map(i => (
                  <span key={i} className="w-2 h-2 bg-gray-300 rounded-full animate-bounce" style={{ animationDelay: `${i*0.15}s` }} />
                ))}
              </div>
            </div>
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* Quick starters (show only initially) */}
      {messages.length === 1 && (
        <div className="flex-shrink-0 px-4 lg:px-6 pb-2">
          <p className="text-xs text-gray-400 font-semibold mb-2">Quick questions:</p>
          <div className="flex gap-2 overflow-x-auto pb-1">
            {STARTERS.map(s => (
              <button key={s} onClick={() => send(s)}
                className="flex-shrink-0 text-xs bg-white border border-gray-200 text-gray-600 rounded-2xl px-3 py-2 hover:border-primary-400 hover:text-primary-600 transition-all font-medium shadow-sm">
                {s}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Input */}
      <div className="flex-shrink-0 px-4 lg:px-6 pb-4 pt-2 border-t border-gray-100 bg-white">
        <div className="flex gap-2 items-end">
          <textarea
            ref={inputRef}
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKey}
            placeholder="Ask about nutrition, recipes, calories…"
            rows={1}
            className="flex-1 input-field resize-none text-sm py-3 min-h-[48px] max-h-32 leading-relaxed"
            style={{ height: 'auto', overflowY: input.split('\n').length > 3 ? 'auto' : 'hidden' }}
            onInput={e => { e.target.style.height = 'auto'; e.target.style.height = e.target.scrollHeight + 'px' }}
          />
          <button
            onClick={() => send()}
            disabled={!input.trim() || loading}
            className="w-12 h-12 bg-primary-500 hover:bg-primary-600 disabled:opacity-40 text-white rounded-2xl flex items-center justify-center transition-all shadow-md flex-shrink-0">
            {loading ? <Loader size={18} className="animate-spin"/> : <Send size={18}/>}
          </button>
        </div>
        <p className="text-xs text-center text-gray-300 mt-2">Powered by Google Gemini AI · Specialized in Indian nutrition</p>
      </div>
    </div>
  )
}
