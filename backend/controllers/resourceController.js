const db = require('../config/db')

const getResource = (topic) => {
  return new Promise((resolve) => {
    const query = `
      SELECT * FROM resources 
      WHERE topic_name LIKE ? 
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

module.exports = { getResource }