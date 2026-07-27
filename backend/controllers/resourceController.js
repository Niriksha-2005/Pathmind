const db = require('../config/db')

const getResource = (topic) => {
  return new Promise((resolve) => {
    const query = `
      SELECT * FROM resources 
      WHERE topic_name LIKE ? 
      AND is_free = TRUE
      ORDER BY FIELD(resource_type, 'youtube', 'article', 'practice')
      LIMIT 1
    `
    db.query(query, [`%${topic}%`], (err, result) => {
      if (err || result.length === 0) resolve(null)
      else resolve(result[0])
    })
  })
}

const getAllResources = (req, res) => {
  const { topic } = req.params

  const query = `
    SELECT * FROM resources 
    WHERE topic_name LIKE ?
    ORDER BY is_free DESC, FIELD(resource_type, 'youtube', 'article', 'practice')
    LIMIT 8
  `

  db.query(query, [`%${topic}%`], (err, result) => {
    if (err) return res.status(500).json({ error: err.message })
    res.json({ resources: result })
  })
}

module.exports = { getResource, getAllResources }