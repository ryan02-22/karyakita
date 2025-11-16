/**
 * KaryaKita - Aplikasi Showcase Proyek Mahasiswa
 * 
 * File utama aplikasi yang mengatur routing dan manajemen autentikasi.
 * Menggunakan React Router untuk navigasi dan localStorage untuk session management.
 * 
 * @module App
 */

import { useEffect, useMemo, useState } from 'react'
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import LoginPage from './pages/LoginPage.jsx'
import DashboardPage from './pages/DashboardPage.jsx'
import ProjectFormPage from './pages/ProjectFormPage.jsx'
import ProjectDetailPage from './pages/ProjectDetailPage.jsx'
import ErrorBoundary from './components/ErrorBoundary.jsx'
import { createSession, clearSession, loadSession, SESSION_STORAGE_KEY } from './utils/security.js'

/**
 * Komponen untuk melindungi route yang memerlukan autentikasi
 * Jika user belum login, akan diarahkan ke halaman login
 * 
 * @param {Object} props - Props komponen
 * @param {boolean} props.isAuthenticated - Status autentikasi user
 * @param {React.ReactNode} props.children - Komponen yang akan dirender jika terautentikasi
 * @returns {JSX.Element} Navigate ke login atau render children
 */
const ProtectedRoute = ({ isAuthenticated, children }) => {
  if (!isAuthenticated) {
    return <Navigate to="/" replace />
  }
  return children
}

/**
 * Komponen utama aplikasi
 * Mengelola state autentikasi, session, dan routing
 */
function App() {
  /**
   * Profile default untuk mode pengunjung (guest)
   * Digunakan ketika user memilih "Masuk sebagai Pengunjung"
   * useMemo digunakan untuk menghindari re-render yang tidak perlu
   */
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

  /**
   * State untuk menyimpan informasi session user
   * Diinisialisasi dari localStorage saat komponen pertama kali dimount
   * Berisi: status autentikasi, profile user, token, dan waktu expire
   */
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

  /**
   * Effect untuk mendengarkan perubahan di localStorage
   * Berguna untuk sinkronisasi session antar tab/window browser
   * Ketika session berubah di tab lain, tab ini akan otomatis update
   */
  useEffect(() => {
    if (typeof window === 'undefined') return undefined
    const handleStorage = (event) => {
      // Hanya update jika perubahan terjadi pada key session
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

  /**
   * Context autentikasi yang menyediakan fungsi login, logout, dan guest
   * useMemo digunakan untuk menghindari re-create object setiap render
   * Hanya akan di-recreate jika guestProfile atau session berubah
   */
  const authContext = useMemo(
    () => ({
      /**
       * Fungsi untuk login dengan akun kampus
       * Membuat session baru dan menyimpannya ke localStorage
       * @param {Object} profile - Profile user yang akan login
       */
      login: (profile) => {
        const nextSession = createSession({ profile, isGuest: false })
        setSession({
          ...nextSession,
          isAuthenticated: true,
        })
      },
      /**
       * Fungsi untuk masuk sebagai pengunjung (guest)
       * Menggunakan guestProfile yang sudah didefinisikan
       */
      guest: () => {
        const nextSession = createSession({ profile: guestProfile, isGuest: true })
        setSession({
          ...nextSession,
          isAuthenticated: true,
        })
      },
      /**
       * Fungsi untuk logout
       * Menghapus session dari localStorage dan reset state
       */
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
      // Spread session untuk memberikan akses langsung ke semua property session
      ...session,
    }),
    [guestProfile, session],
  )

  /**
   * Render routing aplikasi
   * Menggunakan React Router untuk navigasi antar halaman
   * Setiap route yang memerlukan autentikasi dibungkus dengan ProtectedRoute
   */
  return (
    <BrowserRouter>
      <Routes>
        {/* Route untuk halaman login/register */}
        <Route
          path="/"
          element={
            <LoginPage
              onLogin={(profile) => authContext.login(profile)}
              onGuest={() => authContext.guest()}
              isAuthenticated={authContext.isAuthenticated}
              currentProfile={authContext.profile}
            />
          }
        />
        {/* Route untuk dashboard - memerlukan autentikasi */}
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
        {/* Route untuk membuat proyek baru - memerlukan autentikasi */}
        <Route
          path="/projects/new"
          element={
            <ProtectedRoute isAuthenticated={authContext.isAuthenticated}>
              <ErrorBoundary>
                <ProjectFormPage
                  mode="create"
                  isGuest={authContext.isGuest}
                  profile={authContext.profile ?? guestProfile}
                />
              </ErrorBoundary>
            </ProtectedRoute>
          }
        />
        {/* Route untuk melihat detail proyek - memerlukan autentikasi */}
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
        {/* Route untuk edit proyek - memerlukan autentikasi */}
        <Route
          path="/projects/:projectId/edit"
          element={
            <ProtectedRoute isAuthenticated={authContext.isAuthenticated}>
              <ErrorBoundary>
                <ProjectFormPage
                  mode="edit"
                  isGuest={authContext.isGuest}
                  profile={authContext.profile ?? guestProfile}
                />
              </ErrorBoundary>
            </ProtectedRoute>
          }
        />
        {/* Route catch-all untuk URL yang tidak dikenal - redirect ke login */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
