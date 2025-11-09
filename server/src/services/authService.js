const bcrypt = require('bcryptjs')
const {
  findByEmail,
  findByNim,
  findById,
  createUser,
  mapRowToProfile,
} = require('../repositories/userRepository')
const {
  createSession,
  deleteSession,
  findByToken: findSessionByToken,
} = require('../repositories/sessionRepository')
const {
  ALLOWED_DOMAIN,
  normalizeEmail,
  normalizeNim,
  isAllowedEmail,
  isValidNim,
} = require('../utils/validators')

const SESSION_TTL_MINUTES = require('../config/env').SESSION_TTL_MINUTES

const guestProfile = {
  id: 'guest',
  name: 'Pengunjung',
  nim: '-',
  department: 'Semua Jurusan',
  role: 'Pengunjung',
  verified: false,
  avatarColor: '#90A4AE',
  totalProjects: 0,
  totalEndorsements: 0,
  popularProject: 'Tidak tersedia',
}

const buildSessionResponse = ({ session, profile }) => ({
  token: session.token,
  expiresAt: session.expiresAt,
  issuedAt: session.issuedAt,
  profile,
  isGuest: session.isGuest,
  ttlMinutes: SESSION_TTL_MINUTES,
})

const registerAccount = ({ name, nim, department, email, password }) => {
  if (!name || !nim || !department || !email || !password) {
    const error = new Error('Data registrasi tidak lengkap.')
    error.status = 400
    throw error
  }
  if (!isValidNim(nim)) {
    const error = new Error('NIM harus berupa angka minimal 6 digit.')
    error.status = 400
    throw error
  }
  if (!isAllowedEmail(email)) {
    const error = new Error(`Email harus menggunakan domain @${ALLOWED_DOMAIN}.`)
    error.status = 400
    throw error
  }
  if (password.length < 8) {
    const error = new Error('Kata sandi minimal 8 karakter.')
    error.status = 400
    throw error
  }
  const existingEmail = findByEmail(email)
  if (existingEmail) {
    const error = new Error('Email sudah terdaftar. Silakan login.')
    error.status = 409
    throw error
  }
  const existingNim = findByNim(nim)
  if (existingNim) {
    const error = new Error('NIM sudah terdaftar. Gunakan NIM lain atau login.')
    error.status = 409
    throw error
  }

  const user = createUser({
    name,
    nim,
    department,
    email,
    password,
  })

  const session = createSession({ userId: user.id, isGuest: false })
  return buildSessionResponse({ session, profile: mapRowToProfile(user) })
}

const loginWithIdentifier = ({ identifier, password }) => {
  if (!identifier || !password) {
    const error = new Error('Silakan isi email kampus atau NIM beserta kata sandi.')
    error.status = 400
    throw error
  }
  const normalizedIdentifier = identifier.trim().toLowerCase()
  let user
  if (normalizedIdentifier.includes('@')) {
    if (!isAllowedEmail(normalizedIdentifier)) {
      const error = new Error(`Email harus menggunakan domain @${ALLOWED_DOMAIN}.`)
      error.status = 400
      throw error
    }
    user = findByEmail(normalizeEmail(normalizedIdentifier))
  } else {
    if (!isValidNim(identifier)) {
      const error = new Error('Format NIM tidak valid.')
      error.status = 400
      throw error
    }
    user = findByNim(normalizeNim(identifier))
  }
  if (!user) {
    const error = new Error('Akun belum terdaftar. Gunakan email kampus atau daftar terlebih dahulu.')
    error.status = 404
    throw error
  }
  const passwordMatch = bcrypt.compareSync(password, user.passwordHash)
  if (!passwordMatch) {
    const error = new Error('Kata sandi tidak valid. Coba lagi.')
    error.status = 401
    throw error
  }
  const session = createSession({ userId: user.id, isGuest: false })
  return buildSessionResponse({ session, profile: mapRowToProfile(user) })
}

const createGuestSession = () => {
  const session = createSession({ userId: null, isGuest: true })
  return buildSessionResponse({ session, profile: guestProfile })
}

const logoutSession = (token) => {
  if (token) {
    deleteSession(token)
  }
}

const getSessionFromToken = (token) => {
  if (!token) return null
  const session = findSessionByToken(token)
  if (!session) return null
  if (session.isGuest) {
    return buildSessionResponse({ session, profile: guestProfile })
  }
  const user = findById(session.userId)
  if (!user) {
    deleteSession(token)
    return null
  }
  return buildSessionResponse({ session, profile: mapRowToProfile(user) })
}

module.exports = {
  registerAccount,
  loginWithIdentifier,
  createGuestSession,
  logoutSession,
  getSessionFromToken,
}

