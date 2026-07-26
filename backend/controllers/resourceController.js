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
      if (err || result.length === 0) {
        resolve(null)
      } else {
        resolve(result[0])
      }
    })
  })
}

const getAllResources = (topic) => {
  return new Promise((resolve) => {
    const query = `
      SELECT * FROM resources 
      WHERE topic_name LIKE ?
      ORDER BY is_free DESC, FIELD(resource_type, 'youtube', 'article', 'practice')
      LIMIT 5
    `
    db.query(query, [`%${topic}%`], (err, result) => {
      if (err || result.length === 0) {
        resolve([])
      } else {
        resolve(result)
      }
    })
  })
}

module.exports = { getResource, getAllResources }