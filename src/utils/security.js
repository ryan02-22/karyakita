/**
 * Modul keamanan untuk manajemen autentikasi dan enkripsi
 * 
 * Menyediakan fungsi-fungsi untuk:
 * - Hash dan verifikasi password menggunakan bcrypt
 * - Manajemen session dan token
 * - Penyimpanan dan loading data akun
 * - Reset password dan verifikasi registrasi
 * 
 * @module security
 */

import bcrypt from 'bcryptjs'

// Key-key untuk localStorage
const ACCOUNTS_KEY = 'kk_accounts' // Key untuk menyimpan data akun
export const PROJECTS_STORAGE_KEY = 'kk_projects' // Key untuk menyimpan data proyek
export const RESET_STORAGE_KEY = 'kk_reset' // Key untuk menyimpan data reset password
export const REGISTER_VERIFICATION_KEY = 'kk_register_verify' // Key untuk verifikasi registrasi
export const SESSION_STORAGE_KEY = 'kk_session' // Key untuk menyimpan session
const SESSION_TTL_MINUTES = 120 // Time-to-live session dalam menit (2 jam)

// Cek apakah kode berjalan di browser (bukan di server)
const isBrowser = typeof window !== 'undefined'

/**
 * Mendapatkan akses ke localStorage dengan error handling
 * @returns {Storage|null} localStorage object atau null jika tidak tersedia
 */
const getStorage = () => {
  if (!isBrowser) return null
  try {
    return window.localStorage
  } catch {
    return null
  }
}

/**
 * Hash password menggunakan bcrypt dengan salt rounds 10
 * @param {string} password - Password yang akan di-hash
 * @returns {string} Hashed password
 */
export const hashPassword = (password) => bcrypt.hashSync(password, 10)

/**
 * Verifikasi password dengan hash yang tersimpan
 * @param {string} password - Password yang akan diverifikasi
 * @param {string} hash - Hash password yang tersimpan
 * @returns {boolean} True jika password cocok, false jika tidak
 */
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
    if (!Array.isArray(parsed)) {
      storage.setItem(ACCOUNTS_KEY, JSON.stringify(fallback))
      return [...fallback]
    }
    
    // Check if we need to migrate old email addresses (@gmail.com) to new ones (@kampus.ac.id)
    // Also check for old password hash that doesn't match the correct password
    const hasOldEmails = parsed.some(account => 
      account.email && account.email.includes('@gmail.com')
    )
    
    // Check if default users have old password hash
    const fallbackMap = new Map()
    if (Array.isArray(fallback) && fallback.length > 0) {
      fallback.forEach(user => {
        if (user.id) {
          fallbackMap.set(user.id, user)
        }
      })
    }
    
    const hasOldPasswordHash = parsed.some(account => {
      if (account.id && fallbackMap.has(account.id)) {
        const fallbackUser = fallbackMap.get(account.id)
        // If password hash is different, it needs update
        return account.password !== fallbackUser.password
      }
      return false
    })
    
    // If old emails or old password hash found, merge with fallback (prioritize fallback for default users)
    if ((hasOldEmails || hasOldPasswordHash) && fallbackMap.size > 0) {
      // Update existing accounts: replace default users with fallback versions, keep others
      const migrated = parsed.map(account => {
        if (account.id && fallbackMap.has(account.id)) {
          // Replace default user accounts with updated versions from fallback (includes correct email and password)
          return fallbackMap.get(account.id)
        }
        return account
      })
      
      // Add any new default users that don't exist yet
      fallback.forEach(fallbackUser => {
        const exists = migrated.some(acc => acc.id === fallbackUser.id)
        if (!exists) {
          migrated.push(fallbackUser)
        }
      })
      
      storage.setItem(ACCOUNTS_KEY, JSON.stringify(migrated))
      return migrated
    }
    
    return parsed
  } catch {
    storage.setItem(ACCOUNTS_KEY, JSON.stringify(fallback))
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

export const clearAccounts = (defaultAccounts = []) => {
  const storage = getStorage()
  if (!storage) return
  storage.setItem(ACCOUNTS_KEY, JSON.stringify(defaultAccounts))
}

export const deleteAccount = (accountId, accounts, currentUser) => {
  if (!currentUser) {
    return { success: false, message: 'Anda harus login terlebih dahulu.' }
  }
  if (currentUser.role !== 'Admin' && accountId !== currentUser.id) {
    return { success: false, message: 'Anda tidak memiliki izin untuk menghapus akun ini.' }
  }
  const updatedAccounts = accounts.filter((acc) => acc.id !== accountId)
  persistAccounts(updatedAccounts)
  return { success: true, accounts: updatedAccounts }
}

export const resetPasswordWithEmail = (email, accounts) => {
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
  return { success: true, code, email: account.email }
}

export const verifyResetCode = (code) => {
  const requestPayload = loadPasswordResetRequest()
  if (!requestPayload) {
    return { success: false, message: 'Token reset password tidak valid atau sudah kedaluwarsa.' }
  }
  const isValid = verifyPassword(code, requestPayload.tokenHash)
  if (!isValid) {
    return { success: false, message: 'Kode verifikasi tidak valid.' }
  }
  return { success: true, email: requestPayload.email }
}

export const updatePasswordWithToken = (newPassword, accounts) => {
  const requestPayload = loadPasswordResetRequest()
  if (!requestPayload) {
    return { success: false, message: 'Token reset password tidak valid atau sudah kedaluwarsa.' }
  }
  const account = accounts.find((item) => item.email.toLowerCase() === requestPayload.email.toLowerCase())
  if (!account) {
    return { success: false, message: 'Akun tidak ditemukan.' }
  }
  const updatedAccounts = accounts.map((acc) =>
    acc.id === account.id ? { ...acc, password: hashPassword(newPassword) } : acc,
  )
  persistAccounts(updatedAccounts)
  clearPasswordResetRequest()
  return { success: true, accounts: updatedAccounts }
}

export const sendRegistrationVerificationCode = (email) => {
  const storage = getStorage()
  if (!storage) {
    return { success: false, message: 'Penyimpanan lokal tidak tersedia.' }
  }
  const code = String(Math.floor(100000 + Math.random() * 900000))
  const payload = {
    email: email.toLowerCase(),
    tokenHash: hashPassword(code),
    expiresAt: Date.now() + 15 * 60 * 1000, // 15 menit
  }
  storage.setItem(REGISTER_VERIFICATION_KEY, JSON.stringify(payload))
  return { success: true, code, email: email.toLowerCase() }
}

export const verifyRegistrationCode = (code) => {
  const storage = getStorage()
  if (!storage) return { success: false, message: 'Penyimpanan lokal tidak tersedia.' }
  const raw = storage.getItem(REGISTER_VERIFICATION_KEY)
  if (!raw) {
    return { success: false, message: 'Kode verifikasi tidak ditemukan. Silakan kirim ulang kode.' }
  }
  try {
    const parsed = JSON.parse(raw)
    if (!parsed?.expiresAt || parsed.expiresAt < Date.now()) {
      storage.removeItem(REGISTER_VERIFICATION_KEY)
      return { success: false, message: 'Kode verifikasi sudah kedaluwarsa. Silakan kirim ulang kode.' }
    }
    const isValid = verifyPassword(code, parsed.tokenHash)
    if (!isValid) {
      return { success: false, message: 'Kode verifikasi tidak valid.' }
    }
    return { success: true, email: parsed.email }
  } catch {
    storage.removeItem(REGISTER_VERIFICATION_KEY)
    return { success: false, message: 'Kode verifikasi tidak valid.' }
  }
}

export const clearRegistrationVerification = () => {
  const storage = getStorage()
  if (!storage) return
  storage.removeItem(REGISTER_VERIFICATION_KEY)
}
