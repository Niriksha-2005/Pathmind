const express = require('express')
const router = express.Router()
const { getDailySchedule } = require('../controllers/scheduleController')

router.post('/today', getDailySchedule)

module.exports = router