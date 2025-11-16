/**
 * Modul penyimpanan data untuk proyek, notifikasi, dan draft
 * 
 * Menyediakan fungsi-fungsi untuk:
 * - Menyimpan dan memuat data proyek dari localStorage
 * - Menyimpan dan memuat notifikasi
 * - Menyimpan dan memuat draft proyek
 * - Event system untuk update real-time antar komponen
 * 
 * @module storage
 */

// Nama event untuk memberitahu komponen lain bahwa data proyek telah diupdate
export const PROJECTS_UPDATED_EVENT = 'projects:updated'

// Key-key untuk localStorage
const PROJECTS_KEY = 'kk_projects' // Key untuk menyimpan data proyek
const NOTIFICATIONS_KEY = 'kk_notifications' // Key untuk menyimpan notifikasi
const DRAFT_KEY = 'kk_project_draft' // Key untuk menyimpan draft proyek

// Cek apakah kode berjalan di browser
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

export const loadProjects = (fallback = []) => {
  const storage = getStorage()
  if (!storage) return [...fallback]
  const raw = storage.getItem(PROJECTS_KEY)
  if (!raw) {
    storage.setItem(PROJECTS_KEY, JSON.stringify(fallback))
    return [...fallback]
  }
  try {
    const parsed = JSON.parse(raw)
    if (Array.isArray(parsed)) {
      return parsed.map((item) => {
        const derivedStatus = (() => {
          if (item.reviewStatus) return item.reviewStatus
          if (typeof item.approvalStatus === 'string') {
            if (item.approvalStatus.toLowerCase().includes('menunggu')) return 'pending'
            if (item.approvalStatus.toLowerCase().includes('tolak')) return 'rejected'
            if (item.approvalStatus.toLowerCase().includes('setuju')) return 'published'
          }
          return 'published'
        })()
        return {
          ...item,
          reviewStatus: derivedStatus,
          reviewNotes:
            typeof item.reviewNotes === 'string'
              ? item.reviewNotes
              : typeof item.reviewNote === 'string'
                ? item.reviewNote
                : '',
          ownerId: item.ownerId ?? null,
          tags: Array.isArray(item.tags) ? item.tags : [],
        }
      })
    }
  } catch {
    // ignore parse errors and fall back
  }
  return [...fallback]
}

export const saveProjects = (projects) => {
  const storage = getStorage()
  if (!storage) {
    throw new Error('LocalStorage tidak tersedia')
  }
  if (!Array.isArray(projects)) {
    throw new Error('Data proyek harus berupa array')
  }
  try {
    storage.setItem(PROJECTS_KEY, JSON.stringify(projects))
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent(PROJECTS_UPDATED_EVENT))
    }
  } catch (error) {
    if (error.name === 'QuotaExceededError') {
      throw new Error('Penyimpanan penuh. Silakan hapus beberapa data atau coba lagi.')
    }
    throw error
  }
}

export const loadNotifications = (fallback = []) => {
  const storage = getStorage()
  if (!storage) return [...fallback]
  const raw = storage.getItem(NOTIFICATIONS_KEY)
  if (!raw) {
    storage.setItem(NOTIFICATIONS_KEY, JSON.stringify(fallback))
    return [...fallback]
  }
  try {
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed : [...fallback]
  } catch {
    return [...fallback]
  }
}

export const saveNotifications = (notifications) => {
  const storage = getStorage()
  if (!storage) return
  storage.setItem(NOTIFICATIONS_KEY, JSON.stringify(notifications))
}

export const loadDraftProject = () => {
  const storage = getStorage()
  if (!storage) return null
  const raw = storage.getItem(DRAFT_KEY)
  if (!raw) return null
  try {
    return JSON.parse(raw)
  } catch {
    return null
  }
}

export const saveDraftProject = (draft) => {
  const storage = getStorage()
  if (!storage) {
    throw new Error('LocalStorage tidak tersedia')
  }
  try {
    storage.setItem(DRAFT_KEY, JSON.stringify(draft))
  } catch (error) {
    if (error.name === 'QuotaExceededError') {
      throw new Error('Penyimpanan penuh. Silakan hapus beberapa data atau coba lagi.')
    }
    throw error
  }
}

export const clearDraftProject = () => {
  const storage = getStorage()
  if (!storage) return
  storage.removeItem(DRAFT_KEY)
}

export const deleteProject = (projectId, projects) => {
  if (!Array.isArray(projects)) {
    throw new Error('Data proyek harus berupa array')
  }
  const filtered = projects.filter((item) => item.id !== projectId)
  saveProjects(filtered)
  return filtered
}

