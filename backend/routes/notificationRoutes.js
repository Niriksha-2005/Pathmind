const express = require('express')
const router = express.Router()
const { getNotifications } = require('../controllers/notificationController')

router.get('/:user_id', getNotifications)

module.exports = router