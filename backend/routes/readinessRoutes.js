const express = require('express')
const router = express.Router()
const { getReadinessScore } = require('../controllers/readinessController')

router.get('/:user_id', getReadinessScore)

module.exports = router