import bcrypt from 'bcryptjs'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:4000'
export const RESET_STORAGE_KEY = 'kk_reset'
export const SESSION_STORAGE_KEY = 'kk_session'

const isBrowser = typeof window !== 'undefined'

const getStorage = () => {
  if (!isBrowser) return null
  try {
    return window.localStorage
  } catch {
    return null
  }
}

const handleResponse = async (response) => {
  if (response.status === 204) {
    return null
  }
  const data = await response.json().catch(() => ({}))
  if (!response.ok) {
    const error = new Error(data?.message ?? 'Terjadi kesalahan pada server.')
    error.status = response.status
    throw error
  }
  return data
}

const request = async (path, options = {}) => {
  const defaults = {
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
  }
  const config = {
    ...defaults,
    ...options,
    headers: {
      ...defaults.headers,
      ...options.headers,
    },
  }
  const response = await fetch(`${API_BASE_URL}${path}`, config)
  return handleResponse(response)
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

export const authClient = {
  async login(identifier, password) {
    return request('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ identifier, password }),
    })
  },
  async register(payload) {
    return request('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify(payload),
    })
  },
  async guest() {
    return request('/api/auth/guest', {
      method: 'POST',
    })
  },
  async logout(token) {
    const headers = {}
    if (token) {
      headers.Authorization = `Bearer ${token}`
    }
    return request('/api/auth/logout', {
      method: 'POST',
      headers,
    }).catch(() => null)
  },
  async fetchSession(token) {
    if (!token) return null
    try {
      return await request('/api/auth/session', {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
    } catch (error) {
      if (error.status === 401) {
        return null
      }
      throw error
    }
  },
}

export const hashPassword = (password) => bcrypt.hashSync(password, 10)

export const verifyPassword = (password, hash) => bcrypt.compareSync(password, hash)

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

