import { useEffect, useMemo, useState } from 'react'
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import LoginPage from './pages/LoginPage.jsx'
import DashboardPage from './pages/DashboardPage.jsx'
import ProjectFormPage from './pages/ProjectFormPage.jsx'
import ProjectDetailPage from './pages/ProjectDetailPage.jsx'
import { createSession, clearSession, loadSession, SESSION_STORAGE_KEY } from './utils/security.js'

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

  const [session, setSession] = useState(() => {
    const stored = loadSession()
    return {
      isAuthenticated: stored.isAuthenticated ?? false,
      isGuest: stored.isGuest ?? false,
      profile: stored.profile ?? null,
      token: stored.token ?? null,
      issuedAt: stored.issuedAt ?? null,
      expiresAt: stored.expiresAt ?? null,
    }
  })

  useEffect(() => {
    if (typeof window === 'undefined') return undefined
    const handleStorage = (event) => {
      if (event.key === SESSION_STORAGE_KEY) {
        const stored = loadSession()
        setSession({
          isAuthenticated: stored.isAuthenticated ?? false,
          isGuest: stored.isGuest ?? false,
          profile: stored.profile ?? null,
          token: stored.token ?? null,
          issuedAt: stored.issuedAt ?? null,
          expiresAt: stored.expiresAt ?? null,
        })
      }
    }
    window.addEventListener('storage', handleStorage)
    return () => window.removeEventListener('storage', handleStorage)
  }, [])

  const authContext = useMemo(
    () => ({
      login: (profile) => {
        const nextSession = createSession({ profile, isGuest: false })
        setSession({
          ...nextSession,
          isAuthenticated: true,
        })
      },
      guest: () => {
        const nextSession = createSession({ profile: guestProfile, isGuest: true })
        setSession({
          ...nextSession,
          isAuthenticated: true,
        })
      },
      logout: () => {
        clearSession()
        setSession({
          isAuthenticated: false,
          isGuest: false,
          profile: null,
          token: null,
          issuedAt: null,
          expiresAt: null,
        })
      },
      ...session,
    }),
    [guestProfile, session],
  )

  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/"
          element={
            <LoginPage
              onLogin={(profile) => authContext.login(profile)}
              onGuest={() => authContext.guest()}
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
                profile={authContext.profile ?? guestProfile}
              />
            </ProtectedRoute>
          }
        />
        <Route
          path="/projects/:projectId"
          element={
            <ProtectedRoute isAuthenticated={authContext.isAuthenticated}>
              <ProjectDetailPage
                isGuest={authContext.isGuest}
                profile={authContext.profile ?? guestProfile}
              />
            </ProtectedRoute>
          }
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
