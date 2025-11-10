import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { PiEye, PiEyeSlash } from 'react-icons/pi'
import { defaultUsers, departments } from '../data/mockData.js'
import {
  hashPassword,
  verifyPassword,
  loadAccounts,
  persistAccounts,
} from '../utils/security.js'

const ALLOWED_DOMAIN = 'kampus.ac.id'

const normalizeNim = (value) => value.replace(/\s+/g, '').toLowerCase()

const MODES = {
  LOGIN: 'login',
  REGISTER: 'register',
  FORGOT: 'forgot',
}

const LoginPage = ({ onLogin, onGuest, isAuthenticated }) => {
  const navigate = useNavigate()
  const [mode, setMode] = useState(MODES.LOGIN)
  const [accountList, setAccountList] = useState(() => loadAccounts(defaultUsers))
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
    role: 'Mahasiswa',
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
    persistAccounts(accountList)
  }, [accountList])

  useEffect(() => {
    setFeedback(null)
  }, [mode])

  const handleLoginSubmit = (event) => {
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
      const sanitizedIdentifier = rawIdentifier.toLowerCase()
      let registeredUser
      if (sanitizedIdentifier.includes('@')) {
        if (!sanitizedIdentifier.endsWith(`@${ALLOWED_DOMAIN}`)) {
          setFeedback({
            type: 'error',
            message: `Email harus menggunakan domain @${ALLOWED_DOMAIN}.`,
          })
          return
        }
        registeredUser = accountList.find(
          (user) => user.email?.toLowerCase() === sanitizedIdentifier,
        )
      } else {
        const nimNormalized = normalizeNim(rawIdentifier)
        registeredUser = accountList.find((user) => {
          const candidate = normalizeNim(user.nim || user.profile?.nim || '')
          return candidate === nimNormalized
        })
      }

      if (!registeredUser) {
        setFeedback({
          type: 'error',
          message: 'Akun belum terdaftar. Gunakan email kampus atau daftar terlebih dahulu.',
        })
        return
      }

      const isHashed = /^(\$2[aby]?\$|\$2y\$)/.test(registeredUser.password)
      const passwordMatch = isHashed
        ? verifyPassword(password, registeredUser.password)
        : registeredUser.password === password

      if (!passwordMatch) {
        setFeedback({ type: 'error', message: 'Kata sandi tidak valid. Coba lagi.' })
        return
      }

      if (!isHashed) {
        const upgradedUser = {
          ...registeredUser,
          password: hashPassword(password),
        }
        setAccountList((prev) =>
          prev.map((user) => (user.id === upgradedUser.id ? upgradedUser : user)),
        )
      }

      setFeedback({
        type: 'success',
        message: 'Berhasil masuk. Mengarahkan ke dashboard...',
      })
      onLogin?.(registeredUser.profile)
      navigate('/dashboard')
    } finally {
      setLoginLoading(false)
    }
  }

  const handleGuestLogin = () => {
    setGuestLoading(true)
    setFeedback({
      type: 'success',
      message: 'Berhasil masuk sebagai pengunjung.',
    })
    onGuest?.()
    navigate('/dashboard')
    setGuestLoading(false)
  }

  const handleRegisterSubmit = (event) => {
    event.preventDefault()
    const sanitizedEmail = registerData.email.trim().toLowerCase()
    const trimmedNim = registerData.nim.trim()
    const normalizedNim = normalizeNim(trimmedNim)

    if (!registerData.name || !trimmedNim || !sanitizedEmail || !registerData.password) {
      setFeedback({ type: 'error', message: 'Lengkapi seluruh data registrasi.' })
      return
    }
    if (!/^[0-9]{6,}$/.test(normalizedNim)) {
      setFeedback({ type: 'error', message: 'NIM/NIP harus berupa angka minimal 6 digit.' })
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

    const isEmailTaken = accountList.some(
      (user) => user.email.toLowerCase() === sanitizedEmail,
    )
    if (isEmailTaken) {
      setFeedback({ type: 'error', message: 'Email sudah terdaftar. Silakan login.' })
      return
    }
    const isNimTaken = accountList.some((user) => {
      const candidate = normalizeNim(user.nim || user.profile?.nim || '')
      return candidate === normalizedNim
    })
    if (isNimTaken) {
      setFeedback({
        type: 'error',
        message: 'NIM/NIP sudah terdaftar. Gunakan identitas lain atau login.',
      })
      return
    }

    try {
      setRegisterLoading(true)
      const generatedId = `u-${Date.now()}`
      const hashedPassword = hashPassword(registerData.password)
      const selectedRole = registerData.role === 'Dosen' ? 'Dosen' : 'Mahasiswa'
      const newUser = {
        id: generatedId,
        email: sanitizedEmail,
        nim: normalizedNim,
        password: hashedPassword,
        profile: {
          id: generatedId,
          name: registerData.name.trim(),
          nim: trimmedNim,
          department: registerData.department,
          avatarColor: selectedRole === 'Dosen' ? '#8B5CF6' : '#2F80ED',
          role: selectedRole,
          verified: selectedRole === 'Dosen',
          totalProjects: 0,
          totalEndorsements: 0,
          popularProject: 'Belum ada proyek',
        },
      }

      setAccountList((prev) => [...prev, newUser])
      setFeedback({
        type: 'success',
        message: 'Registrasi berhasil! Silakan masuk menggunakan email/NIM dan kata sandi baru.',
      })
      setMode(MODES.LOGIN)
      setLoginIdentifier(trimmedNim)
      setPassword('')
      setRegisterData({
        name: '',
        nim: '',
        department: departments[0],
        email: '',
        password: '',
        confirmPassword: '',
        role: 'Mahasiswa',
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
              Gunakan email kampus: @kampus.ac.id. Mahasiswa memasukkan NIM, dosen dapat memakai NIP.
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
              NIM / NIP
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

            <label className="form-label" htmlFor="reg-role">
              Daftar Sebagai
            </label>
            <select
              id="reg-role"
              className="form-input"
              value={registerData.role}
              onChange={(event) =>
                setRegisterData((prev) => ({ ...prev, role: event.target.value }))
              }
            >
              <option value="Mahasiswa">Mahasiswa</option>
              <option value="Dosen">Dosen</option>
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
              Gunakan email kampus: @kampus.ac.id. Mahasiswa memasukkan NIM, dosen dapat memakai NIP.
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

