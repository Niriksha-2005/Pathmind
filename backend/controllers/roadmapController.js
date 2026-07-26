const db = require('../config/db')
const Groq = require('groq-sdk')
const { getResource } = require('./resourceController')

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY })

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

    let roadmap = JSON.parse(text)

    // Replace AI suggested resources with curated verified ones
    const enrichedRoadmap = await Promise.all(
      roadmap.map(async (week) => {
        const curatedResource = await getResource(week.topic)
        if (curatedResource) {
          return {
            ...week,
            resource_name: curatedResource.resource_name,
            resource_url: curatedResource.resource_url
          }
        }
        return week
      })
    )

    const query = `INSERT INTO roadmaps (user_id, topics, total_weeks) VALUES (?, ?, ?)`

    db.query(query, [user_id, JSON.stringify(enrichedRoadmap), enrichedRoadmap.length], (err, result) => {
      if (err) {
        return res.status(500).json({ error: err.message })
      }
      res.status(201).json({
        message: 'Roadmap generated successfully',
        roadmap_id: result.insertId,
        roadmap: enrichedRoadmap
      })
    })

  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}

const getUserRoadmap = (req, res) => {
  const { user_id } = req.params

  const query = `SELECT * FROM roadmaps WHERE user_id = ? ORDER BY created_at DESC LIMIT 1`

  db.query(query, [user_id], (err, result) => {
    if (err) return res.status(500).json({ error: err.message })

    if (result.length === 0) {
      return res.json({ roadmap: null })
    }

    const topics = typeof result[0].topics === 'string'
      ? JSON.parse(result[0].topics)
      : result[0].topics

    res.json({
      roadmap_id: result[0].id,
      roadmap: topics
    })
  })
}

module.exports = { generateRoadmap, getUserRoadmap }