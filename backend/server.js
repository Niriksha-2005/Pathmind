const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const db=require('./config/db.js')
const userRoutes = require('./routes/userRoutes')
const roadmapRoutes = require('./routes/roadmapRoutes')
const progressRoutes = require('./routes/progressRoutes')
const scheduleRoutes = require('./routes/scheduleRoutes')
const readinessRoutes = require('./routes/readinessRoutes')
const resumeRoutes = require('./routes/resumeRoutes')
const authRoutes = require('./routes/authRoutes')
const quizRoutes = require('./routes/quizRoutes')



dotenv.config();

const app=express();


app.use(cors())
app.use(express.json());

app.get('/',(req,res)=>{
    res.json({ message: 'PathMind backend is running' })
})




app.use('/api/users', userRoutes)
app.use('/api/roadmap', roadmapRoutes)
app.use('/api/progress', progressRoutes)
app.use('/api/schedule', scheduleRoutes)
app.use('/api/readiness', readinessRoutes)
app.use('/api/resume', resumeRoutes)
app.use('/api/auth', authRoutes)
app.use('/api/quiz', quizRoutes)

const PORT =process.env.PORT || 5000
app.listen(PORT,()=>{
    console.log(`Server running on port ${PORT}`)
})