const express = require('express')
const cors = require('cors')
const dotenv = require('dotenv')
const rateLimit = require('express-rate-limit')
const db = require('./config/db.js')
const userRoutes = require('./routes/userRoutes')
const roadmapRoutes = require('./routes/roadmapRoutes')
const progressRoutes = require('./routes/progressRoutes')
const scheduleRoutes = require('./routes/scheduleRoutes')
const readinessRoutes = require('./routes/readinessRoutes')
const resumeRoutes = require('./routes/resumeRoutes')
const authRoutes = require('./routes/authRoutes')
const quizRoutes = require('./routes/quizRoutes')
const notificationRoutes = require('./routes/notificationRoutes')

dotenv.config()

const app = express()

// General rate limit — all routes
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,
  message: { error: 'Too many requests. Please try again after 15 minutes.' }
})

// Strict limit for AI routes — protect Groq quota
const aiLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 10,
  message: { error: 'AI request limit reached. Please try again after 1 hour.' }
})

// Auth limit — prevent brute force
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5,
  message: { error: 'Too many login attempts. Please try again after 15 minutes.' }
})

app.use(cors())
app.use(express.json())
app.use(generalLimiter)

app.get('/', (req, res) => {
  res.json({ message: 'PathMind backend is running' })
})

app.use('/api/auth', authLimiter, authRoutes)
app.use('/api/users', userRoutes)
app.use('/api/roadmap', aiLimiter, roadmapRoutes)
app.use('/api/resume', aiLimiter, resumeRoutes)
app.use('/api/quiz', aiLimiter, quizRoutes)
app.use('/api/progress', progressRoutes)
app.use('/api/schedule', scheduleRoutes)
app.use('/api/readiness', readinessRoutes)
app.use('/api/notifications', notificationRoutes)

const PORT = process.env.PORT || 5000
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})