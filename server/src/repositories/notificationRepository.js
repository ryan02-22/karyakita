const { nanoid } = require('nanoid')
const db = require('../db')

const mapNotificationRow = (row) => ({
  id: row.id,
  title: row.title,
  message: row.message,
  timestamp: row.timestamp,
  read: Boolean(row.read),
})

const listNotificationsForUser = (userId) => {
  const stmt = db.prepare(`
    SELECT id, title, message, timestamp, read
    FROM notifications
    WHERE user_id = ?
    ORDER BY created_at DESC
  `)
  return stmt.all(userId).map(mapNotificationRow)
}

const createNotification = ({ userId, title, message, timestamp }) => {
  const id = `n-${nanoid(10)}`
  const stmt = db.prepare(`
    INSERT INTO notifications (id, user_id, title, message, timestamp, read)
    VALUES (?, ?, ?, ?, ?, 0)
  `)
  stmt.run(id, userId, title, message, timestamp ?? 'Baru saja')
  return mapNotificationRow({ id, title, message, timestamp: timestamp ?? 'Baru saja', read: 0 })
}

module.exports = {
  listNotificationsForUser,
  createNotification,
}

