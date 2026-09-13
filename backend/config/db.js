const mysql = require('mysql2')
const dotenv = require('dotenv')

dotenv.config()

const db = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  enableKeepAlive: true,
  keepAliveInitialDelay: 10000,
  connectTimeout: 60000
})

// Keep connection alive every 5 minutes
setInterval(() => {
  db.query('SELECT 1', (err) => {
    if (err) {
      console.log('Keep alive query failed:', err.message)
    }
  })
}, 300000)

console.log('MySQL pool created successfully')

module.exports = db