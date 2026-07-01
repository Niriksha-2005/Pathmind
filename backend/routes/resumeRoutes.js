const express = require('express')
const router = express.Router()
const { upload, analyseResume } = require('../controllers/resumeController')

router.post('/analyse', upload.single('resume'), analyseResume)

module.exports = router