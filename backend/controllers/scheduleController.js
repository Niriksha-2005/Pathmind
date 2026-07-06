const db = require('../config/db')

const getDailySchedule = (req, res) => {
  const { user_id, available_minutes } = req.body

  const roadmapQuery = `SELECT topics FROM roadmaps WHERE user_id = ?`
  const progressQuery = `SELECT topic_name FROM progress WHERE user_id = ? AND status = 'completed'`

  db.query(roadmapQuery, [user_id], (err, roadmap) => {
    if (err) return res.status(500).json({ error: err.message })
    if (roadmap.length === 0) return res.status(404).json({ error: 'Roadmap not found' })

    const allTopics = typeof roadmap[0].topics === 'string' 
      ? JSON.parse(roadmap[0].topics) 
      : roadmap[0].topics

    db.query(progressQuery, [user_id], (err, completedTopics) => {
      if (err) return res.status(500).json({ error: err.message })

      const completedNames = completedTopics.map(t => t.topic_name)

      const pendingTopics = allTopics.filter(
        t => !completedNames.includes(t.topic)
      )

      if (pendingTopics.length === 0) {
        return res.json({
          message: 'Congratulations! You have completed all topics.',
          task: null
        })
      }

      let task = null
      let message = ''

      if (available_minutes <= 30) {
        task = [{
          session: 'Quick session',
          topics: [{
            topic: pendingTopics[0].topic,
            resource_name: pendingTopics[0].resource_name,
            resource_url: pendingTopics[0].resource_url,
            suggested_minutes: 30,
            instruction: 'Watch intro video only. Get familiar with the concept.'
          }]
        }]
        message = 'Short session — just get familiar today'

      } else if (available_minutes <= 60) {
        task = [{
          session: 'Focus session',
          topics: [{
            topic: pendingTopics[0].topic,
            resource_name: pendingTopics[0].resource_name,
            resource_url: pendingTopics[0].resource_url,
            suggested_minutes: 60,
            instruction: 'Watch the full video and take notes.'
          }]
        }]
        message = 'Good session — watch and take notes'

      } else if (available_minutes <= 120) {
        const tasksToday = pendingTopics.slice(0, 2)
        task = [{
          session: 'Solid session',
          topics: tasksToday.map(t => ({
            topic: t.topic,
            resource_name: t.resource_name,
            resource_url: t.resource_url,
            suggested_minutes: Math.floor(available_minutes / tasksToday.length),
            instruction: 'Watch full video, take notes and solve 2 practice problems.'
          }))
        }]
        message = 'Solid session — cover 2 topics today'

      } else if (available_minutes <= 240) {
        const tasksToday = pendingTopics.slice(0, 3)
        task = [{
          session: 'Power session',
          topics: tasksToday.map(t => ({
            topic: t.topic,
            resource_name: t.resource_name,
            resource_url: t.resource_url,
            suggested_minutes: Math.floor(available_minutes / tasksToday.length),
            instruction: 'Watch full video, take notes, solve 5 practice problems and revise previous topic.'
          }))
        }]
        message = 'Power session — cover 3 topics today'

      } else {
        const morningTopics = pendingTopics.slice(0, 2)
        const afternoonTopic = pendingTopics.slice(2, 3)
        const eveningTopic = pendingTopics.slice(3, 4)

        task = [
          {
            session: 'Morning (0-90 mins)',
            topics: morningTopics.map(t => ({
              topic: t.topic,
              resource_name: t.resource_name,
              resource_url: t.resource_url,
              suggested_minutes: 45,
              instruction: 'Fresh brain — learn new concept fully. Watch video and take notes.'
            }))
          },
          {
            session: 'Break (90-105 mins)',
            topics: [{
              topic: 'Rest',
              instruction: 'Take a proper break. Walk, eat, hydrate.'
            }]
          },
          {
            session: 'Afternoon (105-210 mins)',
            topics: afternoonTopic.map(t => ({
              topic: t.topic,
              resource_name: t.resource_name,
              resource_url: t.resource_url,
              suggested_minutes: 60,
              instruction: 'Solve 5-10 practice problems on morning topics. Then start this new topic.'
            }))
          },
          {
            session: 'Break (210-225 mins)',
            topics: [{
              topic: 'Rest',
              instruction: 'Short break. Do not skip this.'
            }]
          },
          {
            session: 'Evening (225-360 mins)',
            topics: eveningTopic.map(t => ({
              topic: t.topic,
              resource_name: t.resource_name,
              resource_url: t.resource_url,
              suggested_minutes: 60,
              instruction: 'Learn new topic. End with 3 mock interview questions on todays topics.'
            }))
          }
        ]
        message = 'Full day plan — structured sessions with breaks for maximum retention'
      }

      res.json({
        message: message,
        available_minutes: available_minutes,
        task: task
      })
    })
  })
}

module.exports = { getDailySchedule }