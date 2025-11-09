import { useCallback, useEffect, useMemo, useState } from 'react'
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import LoginPage from './pages/LoginPage.jsx'
import DashboardPage from './pages/DashboardPage.jsx'
import ProjectFormPage from './pages/ProjectFormPage.jsx'
import ProjectDetailPage from './pages/ProjectDetailPage.jsx'
import { authClient, clearSession, loadSession, persistSession, SESSION_STORAGE_KEY } from './utils/security.js'

const mapStoredSession = (stored) => ({
  isAuthenticated: !!stored?.token,
  isGuest: stored?.isGuest ?? false,
  profile: stored?.profile ?? null,
  token: stored?.token ?? null,
  issuedAt: stored?.issuedAt ?? null,
  expiresAt: stored?.expiresAt ?? null,
})

const ProtectedRoute = ({ isAuthenticated, children }) => {
  if (!isAuthenticated) {
    return <Navigate to="/" replace />
  }
  return children
}

function App() {
  const guestProfile = useMemo(
    () => ({
      id: 'guest',
      name: 'Pengunjung',
      nim: '-',
      department: 'Semua Jurusan',
      avatarColor: '#90A4AE',
      role: 'Pengunjung',
      verified: false,
      totalProjects: 0,
      totalEndorsements: 0,
      popularProject: 'Tidak tersedia',
    }),
    [],
  )

  const refreshSession = useCallback(async () => {
    const stored = loadSession()
    if (!stored?.token) {
      clearSession()
      setSession(mapStoredSession(null))
      return
    }
    try {
      const verified = await authClient.fetchSession(stored.token)
      if (verified) {
        persistSession(verified)
        setSession(mapStoredSession(verified))
      } else {
        clearSession()
        setSession(mapStoredSession(null))
      }
    } catch (error) {
      console.error('Gagal memuat sesi terbaru', error)
    }
  }, [])

  const [session, setSession] = useState(() => mapStoredSession(loadSession()))

  useEffect(() => {
    refreshSession()
  }, [refreshSession])

  useEffect(() => {
    if (typeof window === 'undefined') return undefined
    const handleStorage = (event) => {
      if (event.key === SESSION_STORAGE_KEY) {
        refreshSession()
      }
    }
    window.addEventListener('storage', handleStorage)
    return () => window.removeEventListener('storage', handleStorage)
  }, [refreshSession])

  const authContext = useMemo(() => {
    const applySession = (payload) => {
      if (payload) {
        persistSession(payload)
        setSession(mapStoredSession(payload))
      } else {
        refreshSession()
      }
    }

    return {
      login: applySession,
      guest: applySession,
      logout: async () => {
        try {
          if (session.token) {
            await authClient.logout(session.token)
          }
        } catch (error) {
          console.error('Gagal logout', error)
        } finally {
          clearSession()
          setSession(mapStoredSession(null))
        }
      },
      refreshSession,
      ...session,
    }
  }, [refreshSession, session])

  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/"
          element={
            <LoginPage
              onLogin={authContext.login}
              onGuest={authContext.guest}
              isAuthenticated={authContext.isAuthenticated}
            />
          }
        />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute isAuthenticated={authContext.isAuthenticated}>
              <DashboardPage
                onLogout={() => authContext.logout()}
                profile={authContext.profile ?? guestProfile}
                isGuest={authContext.isGuest}
                authToken={authContext.token}
              />
            </ProtectedRoute>
          }
        />
        <Route
          path="/projects/new"
          element={
            <ProtectedRoute isAuthenticated={authContext.isAuthenticated}>
              <ProjectFormPage
                mode="create"
                isGuest={authContext.isGuest}
                authToken={authContext.token}
              />
            </ProtectedRoute>
          }
        />
        <Route
          path="/projects/:projectId"
          element={
            <ProtectedRoute isAuthenticated={authContext.isAuthenticated}>
              <ProjectDetailPage isGuest={authContext.isGuest} />
            </ProtectedRoute>
          }
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
