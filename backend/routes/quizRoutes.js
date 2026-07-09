const express = require('express')
const router = express.Router()
const { generateQuiz, submitQuiz, getMockQuestions } = require('../controllers/quizController')

router.post('/mock', getMockQuestions)

router.post('/generate', generateQuiz)
router.post('/submit', submitQuiz)
router.post('/mock', getMockQuestions)

module.exports = router