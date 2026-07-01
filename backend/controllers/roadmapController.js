const db = require('../config/db')
const Groq = require('groq-sdk')

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY
})

const generateRoadmap = async (req, res) => {
  const { user_id, branch, goal, target_company, hours_per_day, target_months } = req.body

  try {
    const completion = await groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages: [
        {
          role: 'user',
          content: `
          You are a career guidance expert for Indian students preparing for placements.
          
          Student profile:
          - Branch: ${branch}
          - Career goal: ${goal}
          - Target company: ${target_company}
          - Available hours per day: ${hours_per_day}
          - Target months: ${target_months}
          
          Generate a personalized week by week learning roadmap for this student.
          
          Return ONLY a JSON array with no extra text, no markdown, no explanation.
          
          Format exactly like this:
          [
            {
              "week": 1,
              "topic": "topic name",
              "hours": 14,
              "resource_name": "best free resource name",
              "resource_url": "actual youtube or website url"
            }
          ]
          
          Rules:
          - Only return the JSON array, nothing else
          - Use real free resources like YouTube, GFG, Leetcode, NPTEL
          - Make it specific to Indian placement context
          - Total weeks should match target months times 4
          - Hours per week should match hours per day times 7
          `
        }
      ]
    })

    let text = completion.choices[0].message.content
    text = text.replace(/```json/g, '').replace(/```/g, '').trim()

    const roadmap = JSON.parse(text)

    const query = `INSERT INTO roadmaps (user_id, topics, total_weeks) VALUES (?, ?, ?)`

    db.query(query, [user_id, JSON.stringify(roadmap), roadmap.length], (err, result) => {
      if (err) {
        return res.status(500).json({ error: err.message })
      }
      res.status(201).json({
        message: 'Roadmap generated successfully',
        roadmap_id: result.insertId,
        roadmap: roadmap
      })
    })

  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}

module.exports = { generateRoadmap }