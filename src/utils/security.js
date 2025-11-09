import bcrypt from 'bcryptjs'

const ACCOUNTS_KEY = 'kk_accounts'
export const PROJECTS_STORAGE_KEY = 'kk_projects'
export const RESET_STORAGE_KEY = 'kk_reset'
export const SESSION_STORAGE_KEY = 'kk_session'
const SESSION_TTL_MINUTES = 120

const isBrowser = typeof window !== 'undefined'

const getStorage = () => {
  if (!isBrowser) return null
  try {
    return window.localStorage
  } catch {
    return null
  }
}

export const hashPassword = (password) => bcrypt.hashSync(password, 10)

export const verifyPassword = (password, hash) => bcrypt.compareSync(password, hash)

export const generateSessionToken = () => {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID()
  }
  return `token_${Date.now()}_${Math.random().toString(36).slice(2)}`
}

export const persistAccounts = (accounts) => {
  const storage = getStorage()
  if (!storage) return
  storage.setItem(ACCOUNTS_KEY, JSON.stringify(accounts))
}

export const loadAccounts = (fallback = []) => {
  const storage = getStorage()
  if (!storage) return [...fallback]
  const raw = storage.getItem(ACCOUNTS_KEY)
  if (!raw) {
    storage.setItem(ACCOUNTS_KEY, JSON.stringify(fallback))
    return [...fallback]
  }
  try {
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed : [...fallback]
  } catch {
    return [...fallback]
  }
}

export const createSession = ({ profile, isGuest }) => {
  const issuedAt = Date.now()
  const expiresAt = issuedAt + SESSION_TTL_MINUTES * 60 * 1000
  const session = {
    token: generateSessionToken(),
    profile,
    isGuest,
    issuedAt,
    expiresAt,
  }
  persistSession(session)
  return session
}

export const persistSession = (session) => {
  const storage = getStorage()
  if (!storage) return
  if (!session) {
    storage.removeItem(SESSION_STORAGE_KEY)
    return
  }
  storage.setItem(SESSION_STORAGE_KEY, JSON.stringify(session))
}

export const loadSession = () => {
  const storage = getStorage()
  if (!storage) {
    return {
      isAuthenticated: false,
      isGuest: false,
      profile: null,
      token: null,
    }
  }
  const raw = storage.getItem(SESSION_STORAGE_KEY)
  if (!raw) {
    return {
      isAuthenticated: false,
      isGuest: false,
      profile: null,
      token: null,
    }
  }
  try {
    const parsed = JSON.parse(raw)
    if (parsed?.expiresAt && parsed.expiresAt < Date.now()) {
      storage.removeItem(SESSION_STORAGE_KEY)
      return {
        isAuthenticated: false,
        isGuest: false,
        profile: null,
        token: null,
      }
    }
    return {
      ...parsed,
      isAuthenticated: !!parsed?.token,
    }
  } catch {
    storage.removeItem(SESSION_STORAGE_KEY)
    return {
      isAuthenticated: false,
      isGuest: false,
      profile: null,
      token: null,
    }
  }
}

export const clearSession = () => {
  const storage = getStorage()
  if (!storage) return
  storage.removeItem(SESSION_STORAGE_KEY)
}

export const createPasswordResetRequest = (email, accounts = []) => {
  const account = accounts.find((item) => item.email.toLowerCase() === email.toLowerCase())
  if (!account) {
    return { success: false, message: 'Email tidak terdaftar.' }
  }
  const storage = getStorage()
  if (!storage) {
    return { success: false, message: 'Penyimpanan lokal tidak tersedia.' }
  }
  const code = String(Math.floor(100000 + Math.random() * 900000))
  const payload = {
    email: account.email,
    tokenHash: hashPassword(code),
    expiresAt: Date.now() + 15 * 60 * 1000,
  }
  storage.setItem(RESET_STORAGE_KEY, JSON.stringify(payload))
  return { success: true, code }
}

export const loadPasswordResetRequest = () => {
  const storage = getStorage()
  if (!storage) return null
  const raw = storage.getItem(RESET_STORAGE_KEY)
  if (!raw) return null
  try {
    const parsed = JSON.parse(raw)
    if (!parsed?.expiresAt || parsed.expiresAt < Date.now()) {
      storage.removeItem(RESET_STORAGE_KEY)
      return null
    }
    return parsed
  } catch {
    storage.removeItem(RESET_STORAGE_KEY)
    return null
  }
}

export const verifyPasswordResetToken = (token) => {
  const requestPayload = loadPasswordResetRequest()
  if (!requestPayload) return { valid: false, email: null }
  const isValid = verifyPassword(token, requestPayload.tokenHash)
  return { valid: isValid, email: isValid ? requestPayload.email : null }
}

export const clearPasswordResetRequest = () => {
  const storage = getStorage()
  if (!storage) return
  storage.removeItem(RESET_STORAGE_KEY)
}
