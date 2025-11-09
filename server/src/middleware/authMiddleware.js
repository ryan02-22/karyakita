const { getSessionFromToken } = require('../services/authService')
const { extractTokenFromRequest } = require('../utils/http')

const withSession = (req, _res, next) => {
  try {
    const token = extractTokenFromRequest(req)
    if (token) {
      const session = getSessionFromToken(token)
      if (session) {
        req.session = session
      }
    }
    next()
  } catch (error) {
    next(error)
  }
}

const requireAuth = (options = { allowGuest: false }) => (req, res, next) => {
  if (!req.session) {
    res.status(401).json({ message: 'Sesi tidak valid. Silakan login kembali.' })
    return
  }
  if (!options.allowGuest && req.session.isGuest) {
    res
      .status(403)
      .json({ message: 'Fitur ini hanya tersedia untuk akun kampus terdaftar.' })
    return
  }
  next()
}

module.exports = {
  withSession,
  requireAuth,
}

