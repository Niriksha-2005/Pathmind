const express = require('express')
const router = express.Router()
const { markTopicDone, getProgress } = require('../controllers/progressController')

router.post('/mark', markTopicDone)
router.get('/:user_id', getProgress)

module.exports = router