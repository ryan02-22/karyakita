import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { PiEye, PiEyeSlash } from 'react-icons/pi'
import { departments } from '../data/mockData.js'
import { authClient, persistSession } from '../utils/security.js'

const ALLOWED_DOMAIN = 'kampus.ac.id'

const MODES = {
  LOGIN: 'login',
  REGISTER: 'register',
  FORGOT: 'forgot',
}

const LoginPage = ({ onLogin, onGuest, isAuthenticated }) => {
  const navigate = useNavigate()
  const [mode, setMode] = useState(MODES.LOGIN)
  const [loginIdentifier, setLoginIdentifier] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [feedback, setFeedback] = useState(null)
  const [registerData, setRegisterData] = useState({
    name: '',
    nim: '',
    department: departments[0],
    email: '',
    password: '',
    confirmPassword: '',
  })
  const [loginLoading, setLoginLoading] = useState(false)
  const [registerLoading, setRegisterLoading] = useState(false)
  const [guestLoading, setGuestLoading] = useState(false)

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard', { replace: true })
    }
  }, [isAuthenticated, navigate])

useEffect(() => {
  setFeedback(null)
}, [mode])

  const handleLoginSubmit = async (event) => {
    event.preventDefault()
    const rawIdentifier = loginIdentifier.trim()
    if (!rawIdentifier || !password) {
      setFeedback({
        type: 'error',
        message: 'Silakan isi email kampus atau NIM beserta kata sandi.',
      })
      return
    }
    try {
      setLoginLoading(true)
      const session = await authClient.login(rawIdentifier, password)
      persistSession(session)
      setFeedback({
        type: 'success',
        message: 'Berhasil masuk. Mengarahkan ke dashboard...',
      })
      onLogin?.(session)
      navigate('/dashboard')
    } catch (error) {
      setFeedback({
        type: 'error',
        message: error.message ?? 'Gagal masuk. Coba lagi.',
      })
    } finally {
      setLoginLoading(false)
    }
  }

  const handleGuestLogin = async () => {
    try {
      setGuestLoading(true)
      const session = await authClient.guest()
      persistSession(session)
      setFeedback({
        type: 'success',
        message: 'Berhasil masuk sebagai pengunjung.',
      })
      onGuest?.(session)
      navigate('/dashboard')
    } catch (error) {
      setFeedback({
        type: 'error',
        message: error.message ?? 'Gagal masuk sebagai pengunjung.',
      })
    } finally {
      setGuestLoading(false)
    }
  }

  const handleRegisterSubmit = async (event) => {
    event.preventDefault()
    const sanitizedEmail = registerData.email.trim().toLowerCase()
    const trimmedNim = registerData.nim.trim()
    if (!registerData.name || !trimmedNim || !sanitizedEmail || !registerData.password) {
      setFeedback({ type: 'error', message: 'Lengkapi seluruh data registrasi.' })
      return
    }
    if (!/^[0-9]{6,}$/.test(trimmedNim.replace(/\s+/g, ''))) {
      setFeedback({ type: 'error', message: 'NIM harus berupa angka minimal 6 digit.' })
      return
    }
    if (!sanitizedEmail.endsWith(`@${ALLOWED_DOMAIN}`)) {
      setFeedback({ type: 'error', message: `Email harus menggunakan domain @${ALLOWED_DOMAIN}.` })
      return
    }
    if (registerData.password.length < 8) {
      setFeedback({ type: 'error', message: 'Kata sandi minimal 8 karakter.' })
      return
    }
    if (registerData.password !== registerData.confirmPassword) {
      setFeedback({ type: 'error', message: 'Konfirmasi kata sandi tidak cocok.' })
      return
    }

    try {
      setRegisterLoading(true)
      const session = await authClient.register({
        name: registerData.name.trim(),
        nim: trimmedNim,
        department: registerData.department,
        email: sanitizedEmail,
        password: registerData.password,
      })
      persistSession(session)
      setFeedback({
        type: 'success',
        message: 'Registrasi berhasil! Mengarahkan ke dashboard...',
      })
      onLogin?.(session)
      navigate('/dashboard')
    } catch (error) {
      setFeedback({
        type: 'error',
        message: error.message ?? 'Registrasi gagal. Coba lagi.',
      })
    } finally {
      setRegisterLoading(false)
    }
  }

  const handleForgotSubmit = (event) => {
    event.preventDefault()
    setFeedback({
      type: 'info',
      message:
        'Reset password akan segera tersedia. Untuk saat ini silakan hubungi admin kampus.',
    })
  }

  return (
    <div className="auth-layout">
      <div className="auth-hero">
        <div className="brand">
          <div className="brand-logo">K</div>
          <div>
            <p className="brand-title">KaryaKita</p>
            <p className="brand-subtitle">
              Showcase karya terbaik mahasiswa dalam satu platform.
            </p>
          </div>
        </div>
        <div className="auth-illustration">
          <div className="bubble bubble-primary" />
          <div className="bubble bubble-secondary" />
          <div className="bubble bubble-tertiary" />
        </div>
      </div>
      <main className="auth-card">
        <h1 className="page-title">Masuk ke KaryaKita</h1>
        <p className="page-subtitle">
          Tampilkan proyekmu dan dapatkan apresiasi dari dosen serta recruiter.
        </p>
        <div className="auth-tabs">
          <button
            type="button"
            className={`auth-tab ${mode === MODES.LOGIN ? 'active' : ''}`}
            onClick={() => setMode(MODES.LOGIN)}
          >
            Masuk
          </button>
          <button
            type="button"
            className={`auth-tab ${mode === MODES.REGISTER ? 'active' : ''}`}
            onClick={() => setMode(MODES.REGISTER)}
          >
            Daftar
          </button>
          <button
            type="button"
            className={`auth-tab ${mode === MODES.FORGOT ? 'active' : ''}`}
            onClick={() => setMode(MODES.FORGOT)}
          >
            Lupa Password
          </button>
        </div>

        {feedback ? (
          <div className={`status-banner ${feedback.type}`}>
            <span>{feedback.message}</span>
          </div>
        ) : null}

        {mode === MODES.LOGIN ? (
          <form className="form" onSubmit={handleLoginSubmit}>
            <label className="form-label" htmlFor="login-id">
              Email Kampus atau NIM
            </label>
            <input
              id="login-id"
              type="text"
              className="form-input"
              placeholder="nama@kampus.ac.id atau 231234567"
              value={loginIdentifier}
              onChange={(event) => setLoginIdentifier(event.target.value)}
              autoComplete="username"
              autoCapitalize="none"
              autoCorrect="off"
            />
            <div className="input-hint">
              Gunakan email kampus: @kampus.ac.id atau masukkan NIM mahasiswa.
            </div>

            <label className="form-label" htmlFor="password">
              Kata Sandi
            </label>
            <div className="input-with-icon">
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                className="form-input"
                placeholder="Minimal 8 karakter"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
              />
              <button
                type="button"
                className="icon-button"
                onClick={() => setShowPassword((prev) => !prev)}
                aria-label={showPassword ? 'Sembunyikan kata sandi' : 'Tampilkan kata sandi'}
              >
                {showPassword ? <PiEyeSlash size={20} /> : <PiEye size={20} />}
              </button>
            </div>

            <button
              type="submit"
              className="button button-primary full-width"
              disabled={loginLoading}
            >
              {loginLoading ? 'Sedang memproses...' : 'Masuk ke KaryaKita'}
            </button>
          </form>
        ) : null}

        {mode === MODES.REGISTER ? (
          <form className="form" onSubmit={handleRegisterSubmit}>
            <label className="form-label" htmlFor="reg-name">
              Nama Lengkap
            </label>
            <input
              id="reg-name"
              className="form-input"
              placeholder="Contoh: Alya Putri"
              value={registerData.name}
              onChange={(event) =>
                setRegisterData((prev) => ({ ...prev, name: event.target.value }))
              }
            />

            <label className="form-label" htmlFor="reg-nim">
              NIM
            </label>
            <input
              id="reg-nim"
              className="form-input"
              placeholder="Contoh: 231234567"
              value={registerData.nim}
              onChange={(event) =>
                setRegisterData((prev) => ({ ...prev, nim: event.target.value }))
              }
            />

            <label className="form-label" htmlFor="reg-dept">
              Jurusan
            </label>
            <select
              id="reg-dept"
              className="form-input"
              value={registerData.department}
              onChange={(event) =>
                setRegisterData((prev) => ({ ...prev, department: event.target.value }))
              }
            >
              {departments.map((dept) => (
                <option key={dept} value={dept}>
                  {dept}
                </option>
              ))}
            </select>

            <label className="form-label" htmlFor="reg-email">
              Email Kampus
            </label>
            <input
              id="reg-email"
              type="email"
              className="form-input"
              placeholder="nama@kampus.ac.id"
              value={registerData.email}
              onChange={(event) =>
                setRegisterData((prev) => ({ ...prev, email: event.target.value }))
              }
            />
            <div className="input-hint">
              Gunakan email kampus: @kampus.ac.id atau masukkan NIM mahasiswa.
            </div>

            <label className="form-label" htmlFor="reg-password">
              Kata Sandi
            </label>
            <input
              id="reg-password"
              type="password"
              className="form-input"
              placeholder="Minimal 8 karakter"
              value={registerData.password}
              onChange={(event) =>
                setRegisterData((prev) => ({ ...prev, password: event.target.value }))
              }
            />

            <label className="form-label" htmlFor="reg-confirm">
              Konfirmasi Kata Sandi
            </label>
            <input
              id="reg-confirm"
              type="password"
              className="form-input"
              placeholder="Ulangi kata sandi"
              value={registerData.confirmPassword}
              onChange={(event) =>
                setRegisterData((prev) => ({
                  ...prev,
                  confirmPassword: event.target.value,
                }))
              }
            />

            <button
              type="submit"
              className="button button-primary full-width"
              disabled={registerLoading}
            >
              {registerLoading ? 'Mendaftarkan akun...' : 'Daftar Akun Kampus'}
            </button>
          </form>
        ) : null}

        {mode === MODES.FORGOT ? (
          <div className="form">
            <p className="form-text">
              Untuk reset password, silakan hubungi admin kampus atau tim KaryaKita. Kami akan
              menambahkan fitur reset otomatis pada pembaruan berikutnya.
            </p>
            <button
              type="button"
              className="button button-primary full-width"
              onClick={handleForgotSubmit}
            >
              Kirim Permintaan Bantuan
            </button>
          </div>
        ) : null}

        <button
          type="button"
          className="button button-ghost full-width"
          onClick={handleGuestLogin}
          disabled={guestLoading}
        >
          {guestLoading ? 'Mengaktifkan mode pengunjung...' : 'Masuk sebagai Pengunjung'}
        </button>
      </main>
    </div>
  )
}

export default LoginPage

