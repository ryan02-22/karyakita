const { nanoid } = require('nanoid')
const db = require('../db')
const { SESSION_TTL_MINUTES } = require('../config/env')

const SESSION_SELECT = `
  token,
  user_id as userId,
  is_guest as isGuest,
  issued_at as issuedAt,
  expires_at as expiresAt
`

const createSession = ({ userId, isGuest }) => {
  const issuedAt = Date.now()
  const expiresAt = issuedAt + SESSION_TTL_MINUTES * 60 * 1000
  const token = `sess_${nanoid(24)}`
  const stmt = db.prepare(`
    INSERT INTO sessions (token, user_id, is_guest, issued_at, expires_at)
    VALUES (?, ?, ?, ?, ?)
  `)
  stmt.run(token, userId, isGuest ? 1 : 0, issuedAt, expiresAt)
  return { token, userId, isGuest, issuedAt, expiresAt }
}

const deleteSession = (token) => {
  const stmt = db.prepare('DELETE FROM sessions WHERE token = ?')
  stmt.run(token)
}

const findByToken = (token) => {
  const stmt = db.prepare(`SELECT ${SESSION_SELECT} FROM sessions WHERE token = ? LIMIT 1`)
  const row = stmt.get(token)
  if (!row) return null
  if (!row.expiresAt || row.expiresAt < Date.now()) {
    deleteSession(token)
    return null
}
  return {
    ...row,
    isGuest: Boolean(row.isGuest),
  }
}

module.exports = {
  createSession,
  deleteSession,
  findByToken,
}

