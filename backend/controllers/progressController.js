const db = require('../config/db')

const markTopicDone = (req, res) => {
  const { user_id, topic_name } = req.body

  const checkQuery = `SELECT * FROM progress WHERE user_id = ? AND topic_name = ?`

  db.query(checkQuery, [user_id, topic_name], (err, existing) => {
    if (err) return res.status(500).json({ error: err.message })

    if (existing.length > 0) {
      const updateQuery = `UPDATE progress SET status = 'completed', completed_at = NOW() WHERE user_id = ? AND topic_name = ?`
      db.query(updateQuery, [user_id, topic_name], (err) => {
        if (err) return res.status(500).json({ error: err.message })
        res.json({ message: 'Topic marked as completed' })
      })
    } else {
      const insertQuery = `INSERT INTO progress (user_id, topic_name, status, completed_at) VALUES (?, ?, 'completed', NOW())`
      db.query(insertQuery, [user_id, topic_name], (err) => {
        if (err) return res.status(500).json({ error: err.message })
        res.json({ message: 'Topic marked as completed' })
      })
    }
  })
}

const getProgress = (req, res) => {
  const { user_id } = req.params

  const progressQuery = `SELECT * FROM progress WHERE user_id = ?`
  const roadmapQuery = `SELECT total_weeks FROM roadmaps WHERE user_id = ?`

  db.query(roadmapQuery, [user_id], (err, roadmap) => {
    if (err) return res.status(500).json({ error: err.message })
    if (roadmap.length === 0) return res.status(404).json({ error: 'Roadmap not found' })

    const totalTopics = roadmap[0].total_weeks

    db.query(progressQuery, [user_id], (err, progress) => {
      if (err) return res.status(500).json({ error: err.message })

      const completed = progress.filter(p => p.status === 'completed').length
      const percentage = Math.round((completed / totalTopics) * 100)

      res.json({
        total_topics: totalTopics,
        completed: completed,
        percentage: percentage,
        topics: progress
      })
    })
  })
}

module.exports = { markTopicDone, getProgress }