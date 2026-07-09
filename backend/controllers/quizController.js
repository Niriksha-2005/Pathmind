const Groq = require('groq-sdk')
const db = require('../config/db')

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY })

const generateQuiz = async (req, res) => {
  const { topic } = req.body

  if (!topic) {
    return res.status(400).json({ error: 'Topic is required' })
  }

  try {
    const completion = await groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages: [
        {
          role: 'user',
          content: `
          Generate exactly 3 multiple choice questions to test a student's understanding of: ${topic}

          These questions are for Indian engineering students preparing for placements.

          Return ONLY a JSON array with no extra text, no markdown, no explanation.

          Format exactly like this:
          [
            {
              "question": "question text here",
              "options": ["option A", "option B", "option C", "option D"],
              "correct": 0
            }
          ]

          Rules:
          - correct is the index (0,1,2,3) of the correct option in the options array
          - Make questions practical and interview relevant
          - Difficulty should be medium
          - Return exactly 3 questions
          - Only return the JSON array, nothing else
          `
        }
      ]
    })

    let text = completion.choices[0].message.content
    text = text.replace(/```json/g, '').replace(/```/g, '').trim()

    const questions = JSON.parse(text)

    res.json({
      topic,
      questions
    })

  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}

const submitQuiz = async (req, res) => {
  const { user_id, topic_name, answers, correct_answers } = req.body

  let score = 0
  answers.forEach((answer, index) => {
    if (answer === correct_answers[index]) score++
  })

  const passed = score >= 2

  if (passed) {
    const checkQuery = `SELECT * FROM progress WHERE user_id = ? AND topic_name = ?`
    db.query(checkQuery, [user_id, topic_name], (err, existing) => {
      if (err) return res.status(500).json({ error: err.message })

      if (existing.length > 0) {
        const updateQuery = `UPDATE progress SET status = 'completed', completed_at = NOW() WHERE user_id = ? AND topic_name = ?`
        db.query(updateQuery, [user_id, topic_name], (err) => {
          if (err) return res.status(500).json({ error: err.message })
          res.json({ passed: true, score, message: 'Quiz passed! Topic marked as completed.' })
        })
      } else {
        const insertQuery = `INSERT INTO progress (user_id, topic_name, status, completed_at) VALUES (?, ?, 'completed', NOW())`
        db.query(insertQuery, [user_id, topic_name], (err) => {
          if (err) return res.status(500).json({ error: err.message })
          res.json({ passed: true, score, message: 'Quiz passed! Topic marked as completed.' })
        })
      }
    })
  } else {
    res.json({
      passed: false,
      score,
      message: `You got ${score}/3. You need at least 2/3 to pass. Study more and try again.`
    })
  }
}

const getMockQuestions = async (req, res) => {
  const { user_id } = req.body

  const progressQuery = `SELECT topic_name FROM progress WHERE user_id = ? AND status = 'completed' ORDER BY completed_at DESC LIMIT 1`
  const roadmapQuery = `SELECT topics FROM roadmaps WHERE user_id = ?`

  db.query(roadmapQuery, [user_id], (err, roadmap) => {
    if (err) return res.status(500).json({ error: err.message })
    if (roadmap.length === 0) return res.status(404).json({ error: 'Roadmap not found' })

    const allTopics = typeof roadmap[0].topics === 'string'
      ? JSON.parse(roadmap[0].topics)
      : roadmap[0].topics

    db.query(progressQuery, [user_id], async (err, recent) => {
      if (err) return res.status(500).json({ error: err.message })

      let currentTopic = allTopics[0].topic

      if (recent.length > 0) {
        const lastCompleted = recent[0].topic_name
        const lastIndex = allTopics.findIndex(t => t.topic === lastCompleted)
        if (lastIndex !== -1 && lastIndex + 1 < allTopics.length) {
          currentTopic = allTopics[lastIndex + 1].topic
        }
      }

      try {
        const completion = await groq.chat.completions.create({
          model: 'llama-3.3-70b-versatile',
          messages: [
            {
              role: 'user',
              content: `
              You are a technical interviewer at a product based company like Google or Microsoft.

              The student is currently studying: ${currentTopic}

              Generate exactly 3 interview questions for this topic that would be asked in a real placement interview for Indian engineering students.

              Return ONLY a JSON array with no extra text, no markdown, no explanation.

              Format exactly like this:
              [
                {
                  "question": "interview question here",
                  "hint": "one line hint to think about",
                  "answer": "concise but complete answer in 3-4 lines"
                }
              ]

              Rules:
              - Mix easy, medium and hard questions
              - Make them practical and coding focused
              - Return exactly 3 questions
              - Only return the JSON array
              `
            }
          ]
        })

        let text = completion.choices[0].message.content
        text = text.replace(/```json/g, '').replace(/```/g, '').trim()
        const questions = JSON.parse(text)

        res.json({
          topic: currentTopic,
          questions
        })

      } catch (err) {
        res.status(500).json({ error: err.message })
      }
    })
  })
}

module.exports = { generateQuiz, submitQuiz, getMockQuestions }