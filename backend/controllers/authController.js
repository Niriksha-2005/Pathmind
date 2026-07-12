const db = require('../config/db')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')

const signup = async (req, res) => {
  const { name, email, password, branch, goal, target_company, hours_per_day, target_months } = req.body

  if (!name || !email || !password) {
    return res.status(400).json({ error: 'Name, email and password are required' })
  }
  if (password.length < 8) {
    return res.status(400).json({ error: 'Password must be minimum 8 characters' })
  }

  if (!/[0-9]/.test(password)) {
    return res.status(400).json({ error: 'Password must contain at least one number' })
  }

  if (!/[!@#$%^&*]/.test(password)) {
    return res.status(400).json({ error: 'Password must contain at least one special character' })
  }

  try {
    const checkQuery = `SELECT * FROM users WHERE email = ?`
    db.query(checkQuery, [email], async (err, existing) => {
      if (err) return res.status(500).json({ error: err.message })
      if (existing.length > 0) {
        return res.status(400).json({ error: 'Email already registered. Please login.' })
      }

      const hashedPassword = await bcrypt.hash(password, 10)

      const insertQuery = `INSERT INTO users (name, email, password, branch, goal, target_company, hours_per_day, target_months) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`

      db.query(insertQuery, [name, email, hashedPassword, branch, goal, target_company, hours_per_day, target_months], (err, result) => {
        if (err) return res.status(500).json({ error: err.message })

        const token = jwt.sign(
          { userId: result.insertId, email },
          process.env.JWT_SECRET,
          { expiresIn: '7d' }
        )

        res.status(201).json({
          message: 'Account created successfully',
          token,
          userId: result.insertId,
          name
        })
      })
    })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}

const login = async (req, res) => {
  const { email, password } = req.body

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' })
  }

  const query = `SELECT * FROM users WHERE email = ?`

  db.query(query, [email], async (err, users) => {
    if (err) return res.status(500).json({ error: err.message })
    if (users.length === 0) {
      return res.status(400).json({ error: 'No account found with this email' })
    }

    const user = users[0]
    const isMatch = await bcrypt.compare(password, user.password)

    if (!isMatch) {
      return res.status(400).json({ error: 'Incorrect password' })
    }

    const token = jwt.sign(
      { userId: user.id, email },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    )

    res.json({
      message: 'Login successful',
      token,
      userId: user.id,
      name: user.name
    })
  })
}

module.exports = { signup, login }