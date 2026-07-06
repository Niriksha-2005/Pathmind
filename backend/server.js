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

dotenv.config();

const app=express();


app.use(cors({
  origin: ['https://dancing-daifuku-169227.netlify.app', 'http://localhost:5500', 'http://127.0.0.1:5500'],
  methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE'],
  credentials: true
}))
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


const PORT =process.env.PORT || 5000
app.listen(PORT,()=>{
    console.log(`Server running on port ${PORT}`)
})