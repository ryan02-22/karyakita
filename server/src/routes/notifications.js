const express = require('express')
const { withSession, requireAuth } = require('../middleware/authMiddleware')
const { listNotificationsForUser } = require('../repositories/notificationRepository')

const router = express.Router()

router.use(withSession)

router.get('/', requireAuth(), (req, res, next) => {
  try {
    const items = listNotificationsForUser(req.session.profile.id)
    res.json({ items })
  } catch (error) {
    next(error)
  }
})

module.exports = router

