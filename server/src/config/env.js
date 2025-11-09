const path = require('path')

const APP_PORT = Number.parseInt(process.env.PORT ?? '4000', 10)
const SESSION_TTL_MINUTES = Number.parseInt(process.env.SESSION_TTL_MINUTES ?? '120', 10)
const ALLOWED_ORIGIN = process.env.ALLOWED_ORIGIN ?? 'http://localhost:5173'
const DB_PATH =
  process.env.SQLITE_PATH ??
  path.resolve(__dirname, '../../data/app.db')

module.exports = {
  APP_PORT,
  SESSION_TTL_MINUTES,
  ALLOWED_ORIGIN,
  DB_PATH,
}

