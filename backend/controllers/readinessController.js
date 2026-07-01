const db = require('../config/db')

const getReadinessScore = (req, res) => {
  const { user_id } = req.params

  const roadmapQuery = `SELECT total_weeks, topics FROM roadmaps WHERE user_id = ?`
  const progressQuery = `SELECT topic_name FROM progress WHERE user_id = ? AND status = 'completed'`
  const userQuery = `SELECT target_company, target_months, hours_per_day FROM users WHERE id = ?`

  db.query(userQuery, [user_id], (err, user) => {
    if (err) return res.status(500).json({ error: err.message })
    if (user.length === 0) return res.status(404).json({ error: 'User not found' })

    db.query(roadmapQuery, [user_id], (err, roadmap) => {
      if (err) return res.status(500).json({ error: err.message })
      if (roadmap.length === 0) return res.status(404).json({ error: 'Roadmap not found' })

      db.query(progressQuery, [user_id], (err, progress) => {
        if (err) return res.status(500).json({ error: err.message })

        const totalTopics = roadmap[0].total_weeks
        const completed = progress.length
        const completionScore = Math.round((completed / totalTopics) * 100)

        const targetCompany = user[0].target_company.toLowerCase()
        let companyDifficulty = 1.0

        if (targetCompany.includes('google') || targetCompany.includes('microsoft')) {
          companyDifficulty = 1.3
        } else if (targetCompany.includes('amazon') || targetCompany.includes('adobe')) {
          companyDifficulty = 1.2
        } else if (targetCompany.includes('atlassian') || targetCompany.includes('walmart')) {
          companyDifficulty = 1.1
        }

        const rawScore = Math.round(completionScore / companyDifficulty)
        const finalScore = Math.min(rawScore, 100)

        let level = ''
        let message = ''
        let suggestion = ''

        if (finalScore >= 80) {
          level = 'Interview ready'
          message = 'You are well prepared. Start applying now.'
          suggestion = 'Give 3 mock interviews this week.'
        } else if (finalScore >= 60) {
          level = 'Getting there'
          message = 'Good progress. A few more weeks and you will be ready.'
          suggestion = 'Focus on completing DSA topics and start mock interviews.'
        } else if (finalScore >= 40) {
          level = 'In progress'
          message = 'You have started well. Stay consistent.'
          suggestion = 'Increase your daily study hours and avoid skipping days.'
        } else if (finalScore >= 20) {
          level = 'Early stage'
          message = 'You are at the beginning. Keep going.'
          suggestion = 'Complete at least 3 topics this week to build momentum.'
        } else {
          level = 'Just starting'
          message = 'Every expert was once a beginner. Start today.'
          suggestion = 'Complete your first topic today. One step at a time.'
        }

        res.json({
          user_id: parseInt(user_id),
          target_company: user[0].target_company,
          total_topics: totalTopics,
          completed_topics: completed,
          completion_percentage: completionScore,
          readiness_score: finalScore,
          level: level,
          message: message,
          suggestion: suggestion
        })
      })
    })
  })
}

module.exports = { getReadinessScore }





