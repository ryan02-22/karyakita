const express = require('express')
const {
  registerAccount,
  loginWithIdentifier,
  createGuestSession,
  logoutSession,
  getSessionFromToken,
} = require('../services/authService')
const { extractTokenFromRequest } = require('../utils/http')

const router = express.Router()

router.post('/register', (req, res, next) => {
  try {
    const { name, nim, department, email, password } = req.body ?? {}
    const result = registerAccount({ name, nim, department, email, password })
    res.status(201).json(result)
  } catch (error) {
    next(error)
  }
})

router.post('/login', (req, res, next) => {
  try {
    const { identifier, password } = req.body ?? {}
    const result = loginWithIdentifier({ identifier, password })
    res.json(result)
  } catch (error) {
    next(error)
  }
})

router.post('/guest', (_req, res, next) => {
  try {
    const session = createGuestSession()
    res.json(session)
  } catch (error) {
    next(error)
  }
})

router.post('/logout', (req, res, next) => {
  try {
    const token = extractTokenFromRequest(req)
    if (token) {
      logoutSession(token)
    }
    res.status(204).end()
  } catch (error) {
    next(error)
  }
})

router.get('/session', (req, res, next) => {
  try {
    const token = extractTokenFromRequest(req)
    const session = getSessionFromToken(token)
    if (!session) {
      res.status(401).json({ message: 'Sesi tidak ditemukan atau sudah kedaluwarsa.' })
      return
    }
    res.json(session)
  } catch (error) {
    next(error)
  }
})

module.exports = router

