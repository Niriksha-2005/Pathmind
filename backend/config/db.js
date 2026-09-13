const mysql = require('mysql2')
const dotenv = require('dotenv')

dotenv.config()

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  enableKeepAlive: true,
  keepAliveInitialDelay: 0,
  connectTimeout: 60000,
  acquireTimeout: 60000,
  timeout: 60000
})

const db = {
  query: (sql, params, callback) => {
    if (typeof params === 'function') {
      callback = params
      params = []
    }
    pool.getConnection((err, connection) => {
      if (err) {
        console.log('Connection error:', err.message)
        if (callback) callback(err)
        return
      }
      connection.query(sql, params, (error, results) => {
        connection.release()
        if (callback) callback(error, results)
      })
    })
  }
}

setInterval(() => {
  pool.query('SELECT 1', (err) => {
    if (err) console.log('Keepalive failed:', err.message)
  })
}, 60000)

console.log('MySQL pool created successfully')

module.exports = db