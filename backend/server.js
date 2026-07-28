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
const resourceRoutes = require('./routes/resourceRoutes')
const verifyToken = require('./middleware/authMiddleware')

dotenv.config()

const app = express()

const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: { error: 'Too many requests. Please try again after 15 minutes.' }
})

const aiLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 10,
  message: { error: 'AI request limit reached. Please try again after 1 hour.' }
})

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: { error: 'Too many login attempts. Please try again after 15 minutes.' }
})

app.use(cors({
  origin: [
    'https://pathmind-ten.vercel.app',
    'https://pathmind.netlify.app',
    'http://localhost:5500',
    'http://127.0.0.1:5500'
  ],
  methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE'],
  credentials: true
}))
app.use(express.json())
app.use(generalLimiter)

app.get('/', (req, res) => {
  res.json({ message: 'PathMind backend is running' })
})

// Public routes
app.use('/api/auth', authLimiter, authRoutes)
app.use('/api/resources', resourceRoutes)

// Protected routes
app.use('/api/roadmap', verifyToken, aiLimiter, roadmapRoutes)
app.use('/api/resume', verifyToken, aiLimiter, resumeRoutes)
app.use('/api/quiz', verifyToken, aiLimiter, quizRoutes)
app.use('/api/progress', verifyToken, progressRoutes)
app.use('/api/schedule', verifyToken, scheduleRoutes)
app.use('/api/readiness', verifyToken, readinessRoutes)
app.use('/api/notifications', verifyToken, notificationRoutes)
app.use('/api/users', verifyToken, userRoutes)

const PORT = process.env.PORT || 5000
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})