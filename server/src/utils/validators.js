const ALLOWED_DOMAIN = 'kampus.ac.id'

const normalizeEmail = (email) => email.trim().toLowerCase()

const normalizeNim = (nim) => nim.replace(/\s+/g, '').toLowerCase()

const isAllowedEmail = (email) => normalizeEmail(email).endsWith(`@${ALLOWED_DOMAIN}`)

const isValidNim = (nim) => /^[0-9]{6,}$/.test(normalizeNim(nim))

module.exports = {
  ALLOWED_DOMAIN,
  normalizeEmail,
  normalizeNim,
  isAllowedEmail,
  isValidNim,
}

