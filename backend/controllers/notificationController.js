const db = require('../config/db')

const getNotifications = (req, res) => {
  const { user_id } = req.params

  const progressQuery = `SELECT * FROM progress WHERE user_id = ? AND status = 'completed'`
  const roadmapQuery = `SELECT total_weeks FROM roadmaps WHERE user_id = ?`
  const userQuery = `SELECT name, target_company, target_months, goal, created_at FROM users WHERE id = ?`
  const recentQuery = `SELECT completed_at FROM progress WHERE user_id = ? AND status = 'completed' ORDER BY completed_at DESC LIMIT 1`
  const peerQuery = `
    SELECT AVG(completion_pct) as avg_completion
    FROM (
      SELECT p.user_id,
        COUNT(*) * 100.0 / r.total_weeks as completion_pct
      FROM progress p
      JOIN roadmaps r ON r.user_id = p.user_id
      WHERE p.status = 'completed'
      GROUP BY p.user_id, r.total_weeks
    ) as user_completions
  `

  db.query(userQuery, [user_id], (err, user) => {
    if (err) return res.status(500).json({ error: err.message })
    if (user.length === 0) return res.status(404).json({ error: 'User not found' })

    db.query(roadmapQuery, [user_id], (err, roadmap) => {
      if (err) return res.status(500).json({ error: err.message })
      if (roadmap.length === 0) return res.status(404).json({ error: 'Roadmap not found' })

      db.query(progressQuery, [user_id], (err, progress) => {
        if (err) return res.status(500).json({ error: err.message })

        db.query(recentQuery, [user_id], (err, recent) => {
          if (err) return res.status(500).json({ error: err.message })

          db.query(peerQuery, (err, peerData) => {
            if (err) return res.status(500).json({ error: err.message })

            const totalTopics = roadmap[0].total_weeks
            const completed = progress.length
            const percentage = Math.round((completed / totalTopics) * 100)
            const userName = user[0].name.split(' ')[0]
            const targetCompany = user[0].target_company
            const avgCompletion = peerData[0].avg_completion || 0

            const notifications = []

            // Study streak notification
            if (recent.length > 0) {
              const lastStudied = new Date(recent[0].completed_at)
              const today = new Date()
              const diffDays = Math.floor((today - lastStudied) / (1000 * 60 * 60 * 24))

              if (diffDays === 0) {
                notifications.push({
                  type: 'success',
                  icon: '🔥',
                  message: `Great work ${userName}! You studied today. Keep the streak going!`
                })
              } else if (diffDays === 1) {
                notifications.push({
                  type: 'warning',
                  icon: '⚠️',
                  message: `${userName}, you haven't studied today. Don't break your streak!`
                })
              } else if (diffDays >= 2) {
                notifications.push({
                  type: 'danger',
                  icon: '🚨',
                  message: `${userName}, you haven't studied in ${diffDays} days. Get back on track!`
                })
              }
            } else {
              notifications.push({
                type: 'info',
                icon: '👋',
                message: `Welcome ${userName}! Start your first topic today to begin your journey.`
              })
            }

            // Real peer comparison — only show if student has completed at least 1 topic
            if (completed >= 1 && avgCompletion > 0) {
              if (percentage > avgCompletion) {
                const aheadBy = Math.round(percentage - avgCompletion)
                notifications.push({
                  type: 'motivation',
                  icon: '💪',
                  message: `You are ${aheadBy}% ahead of the average PathMind student targeting ${targetCompany}. Keep it up!`
                })
              } else if (percentage === Math.round(avgCompletion)) {
                notifications.push({
                  type: 'info',
                  icon: '📊',
                  message: `You are right at the average completion rate. Push a little harder to get ahead!`
                })
              } else {
                const behindBy = Math.round(avgCompletion - percentage)
                notifications.push({
                  type: 'warning',
                  icon: '📊',
                  message: `You are ${behindBy}% behind the average PathMind student. Complete more topics to catch up!`
                })
              }
            }

            // Milestone notifications
            if (percentage >= 75) {
              notifications.push({
                type: 'success',
                icon: '🏆',
                message: `Incredible! You have completed ${percentage}% of your roadmap. You are almost interview ready!`
              })
            } else if (percentage >= 50) {
              notifications.push({
                type: 'success',
                icon: '🎯',
                message: `Halfway there! You have completed ${percentage}% of your roadmap. Stay consistent!`
              })
            } else if (percentage >= 25) {
              notifications.push({
                type: 'info',
                icon: '📈',
                message: `Good progress! ${percentage}% done. ${totalTopics - completed} topics remaining.`
              })
            }

            // Weekly target — only show after 1 week
            const createdAt = new Date(user[0].created_at)
            const today = new Date()
            const daysElapsed = Math.floor((today - createdAt) / (1000 * 60 * 60 * 24))

            if (daysElapsed >= 7) {
              const weeksElapsed = Math.floor(daysElapsed / 7) + 1
              const expectedTopics = Math.min(totalTopics, weeksElapsed * Math.ceil(totalTopics / user[0].target_months / 4))

              if (completed < expectedTopics) {
                notifications.push({
                  type: 'warning',
                  icon: '📅',
                  message: `You are slightly behind schedule. Try to complete ${expectedTopics - completed} more topic(s) this week.`
                })
              } else {
                notifications.push({
                  type: 'success',
                  icon: '✅',
                  message: `You are on track with your ${user[0].target_months} month plan. Great consistency!`
                })
              }
            }

            res.json({ notifications })
          })
        })
      })
    })
  })
}

module.exports = { getNotifications }