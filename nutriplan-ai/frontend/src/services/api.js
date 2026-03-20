import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'

const api = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' }
})

// Attach token automatically
api.interceptors.request.use(config => {
  const token = localStorage.getItem('nutriplan_token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

// Handle 401 globally
api.interceptors.response.use(
  res => res,
  err => {
    if (err.response?.status === 401) {
      localStorage.removeItem('nutriplan_token')
      localStorage.removeItem('nutriplan_user')
      window.location.href = '/login'
    }
    return Promise.reject(err)
  }
)

// Auth
export const authAPI = {
  signup: (data) => api.post('/auth/signup', data),
  login:  (data) => api.post('/auth/login', data),
  getProfile: () => api.get('/auth/profile'),
  updateProfile: (data) => api.put('/auth/profile', data),
}

// Foods
export const foodsAPI = {
  getAll:      (params) => api.get('/foods', { params }),
  getById:     (id)     => api.get(`/foods/${id}`),
  search:      (q, limit = 10) => api.get('/foods/search', { params: { q, limit } }),
  filter:      (params) => api.get('/foods/filter', { params }),
  getCategories: ()     => api.get('/foods/categories'),
}

// Meals
export const mealsAPI = {
  generatePlan: (data) => api.post('/generate-meal-plan', data),
}

// AI
export const aiAPI = {
  scanFood: (file) => {
    const form = new FormData()
    form.append('file', file)
    return api.post('/scan-food', form, { headers: { 'Content-Type': 'multipart/form-data' } })
  },
  chat: (data) => api.post('/ai-chat', data),
}

// Progress
export const progressAPI = {
  logMeal:        (data)     => api.post('/progress/log-meal', data),
  getDailyCalories: (date)   => api.get('/progress/daily-calories', { params: { date_str: date } }),
  getHistory:     (days = 7) => api.get('/progress/history', { params: { days } }),
  deleteLog:      (id)       => api.delete(`/progress/log/${id}`),
}

export default api
