export const PROJECTS_UPDATED_EVENT = 'projects:updated'
const PROJECTS_KEY = 'kk_projects'
const NOTIFICATIONS_KEY = 'kk_notifications'
const DRAFT_KEY = 'kk_project_draft'

const isBrowser = typeof window !== 'undefined'

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
      return parsed.map((item) => ({
        ...item,
        tags: Array.isArray(item.tags) ? item.tags : [],
      }))
    }
  } catch {
    // ignore parse errors and fall back
  }
  return [...fallback]
}

export const saveProjects = (projects) => {
  const storage = getStorage()
  if (!storage) return
  storage.setItem(PROJECTS_KEY, JSON.stringify(projects))
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent(PROJECTS_UPDATED_EVENT))
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
  if (!storage) return
  storage.setItem(DRAFT_KEY, JSON.stringify(draft))
}

export const clearDraftProject = () => {
  const storage = getStorage()
  if (!storage) return
  storage.removeItem(DRAFT_KEY)
}

