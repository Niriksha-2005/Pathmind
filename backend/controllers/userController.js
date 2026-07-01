const db = require('../config/db')

const createUser = (req, res) => {
  const { name, email, branch, goal, target_company, hours_per_day, target_months } = req.body

  const query = `INSERT INTO users (name, email, branch, goal, target_company, hours_per_day, target_months) 
                 VALUES (?, ?, ?, ?, ?, ?, ?)`

  db.query(query, [name, email, branch, goal, target_company, hours_per_day, target_months], (err, result) => {
    if (err) {
      return res.status(500).json({ error: err.message })
    }
    res.status(201).json({ 
      message: 'User created successfully',
      userId: result.insertId 
    })
  })
}

module.exports = { createUser }