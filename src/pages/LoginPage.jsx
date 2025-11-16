import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { PiEye, PiEyeSlash } from 'react-icons/pi'
import { defaultUsers, departments } from '../data/mockData.js'
import {
  hashPassword,
  verifyPassword,
  loadAccounts,
  persistAccounts,
  clearAccounts,
  deleteAccount,
  resetPasswordWithEmail,
  verifyResetCode,
  updatePasswordWithToken,
  sendRegistrationVerificationCode,
  verifyRegistrationCode,
  clearRegistrationVerification,
} from '../utils/security.js'

const ALLOWED_DOMAIN = 'kampus.ac.id'

const normalizeNim = (value) => value.replace(/\s+/g, '').toLowerCase()

const MODES = {
  LOGIN: 'login',
  REGISTER: 'register',
  FORGOT: 'forgot',
}

const LoginPage = ({ onLogin, onGuest, isAuthenticated, currentProfile }) => {
  const navigate = useNavigate()
  const [mode, setMode] = useState(MODES.LOGIN)
  // Load accounts and ensure default users are migrated if needed
  const [accountList, setAccountList] = useState(() => {
    const loaded = loadAccounts(defaultUsers)
    // Double-check: if any default user has old email or old password hash, force update
    const defaultUserIds = new Set(defaultUsers.map(u => u.id))
    const defaultUserMap = new Map(defaultUsers.map(u => [u.id, u]))
    
    const needsUpdate = loaded.some(acc => {
      if (!defaultUserIds.has(acc.id)) return false
      // Check for old email
      if (acc.email && acc.email.includes('@gmail.com')) return true
      // Check for old password hash
      const defaultUser = defaultUserMap.get(acc.id)
      if (defaultUser && acc.password !== defaultUser.password) return true
      return false
    })
    
    if (needsUpdate) {
      // Replace default users with correct versions (includes correct email and password)
      const otherAccounts = loaded.filter(acc => !defaultUserIds.has(acc.id))
      const migrated = [...defaultUsers, ...otherAccounts]
      // Immediately persist the migrated accounts
      persistAccounts(migrated)
      return migrated
    }
    return loaded
  })
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
    step: 'form', // 'form', 'verify'
    verificationCode: '',
  })
  const [forgotPasswordData, setForgotPasswordData] = useState({
    email: '',
    verificationCode: '',
    newPassword: '',
    confirmNewPassword: '',
    step: 'email', // 'email', 'verify', 'newpassword'
  })
  const [loginLoading, setLoginLoading] = useState(false)
  const [registerLoading, setRegisterLoading] = useState(false)
  const [guestLoading, setGuestLoading] = useState(false)
  const [forgotPasswordLoading, setForgotPasswordLoading] = useState(false)

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
    // Reset step registrasi saat mode berubah
    if (mode !== MODES.REGISTER) {
      setRegisterData((prev) => ({
        ...prev,
        step: 'form',
        verificationCode: '',
      }))
    }
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

    setLoginLoading(true)
    try {
      const sanitizedIdentifier = rawIdentifier.toLowerCase()
      let registeredUser
      if (sanitizedIdentifier.includes('@')) {
        if (!sanitizedIdentifier.endsWith(`@${ALLOWED_DOMAIN}`)) {
          setFeedback({
            type: 'error',
            message: `Email harus menggunakan domain @${ALLOWED_DOMAIN}.`,
          })
          setLoginLoading(false)
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
        setLoginLoading(false)
        return
      }

      const isHashed = /^(\$2[aby]?\$|\$2y\$)/.test(registeredUser.password)
      const passwordMatch = isHashed
        ? verifyPassword(password, registeredUser.password)
        : registeredUser.password === password

      if (!passwordMatch) {
        setFeedback({ type: 'error', message: 'Kata sandi tidak valid. Coba lagi.' })
        setLoginLoading(false)
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
    } catch (error) {
      window.console.error('[LoginPage] Login error:', error)
      setFeedback({
        type: 'error',
        message: 'Terjadi kesalahan saat login. Silakan coba lagi.',
      })
    } finally {
      setLoginLoading(false)
    }
  }

  const handleGuestLogin = () => {
    try {
      setGuestLoading(true)
      setFeedback({
        type: 'success',
        message: 'Berhasil masuk sebagai pengunjung.',
      })
      onGuest?.()
      navigate('/dashboard')
    } catch (error) {
      window.console.error('[LoginPage] Guest login error:', error)
      setFeedback({
        type: 'error',
        message: 'Terjadi kesalahan saat masuk sebagai pengunjung. Silakan coba lagi.',
      })
    } finally {
      setGuestLoading(false)
    }
  }

  const handleRegisterSubmit = async (event) => {
    event.preventDefault()
    const sanitizedEmail = registerData.email.trim().toLowerCase()
    const trimmedNim = registerData.nim.trim()
    const normalizedNim = normalizeNim(trimmedNim)

    if (registerData.step === 'form') {
      // Step 1: Validasi form dan kirim kode verifikasi
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

      // Kirim kode verifikasi
      try {
        setRegisterLoading(true)
        const result = sendRegistrationVerificationCode(sanitizedEmail)
        if (result.success) {
          setRegisterData((prev) => ({ ...prev, step: 'verify' }))
          setFeedback({
            type: 'success',
            message: `Kode verifikasi telah dikirim ke ${result.email}. Kode: ${result.code} (untuk testing, kode ini akan dikirim via email di produksi).`,
          })
        } else {
          setFeedback({ type: 'error', message: result.message || 'Gagal mengirim kode verifikasi.' })
        }
      } catch (error) {
        setFeedback({ type: 'error', message: 'Gagal mengirim kode verifikasi. Silakan coba lagi.' })
      } finally {
        setRegisterLoading(false)
      }
    } else if (registerData.step === 'verify') {
      // Step 2: Verifikasi kode dan buat akun
      const code = registerData.verificationCode.trim()
      if (!code) {
        setFeedback({ type: 'error', message: 'Silakan masukkan kode verifikasi.' })
        return
      }

      try {
        setRegisterLoading(true)
        const verifyResult = verifyRegistrationCode(code)
        if (!verifyResult.success) {
          setFeedback({ type: 'error', message: verifyResult.message })
          return
        }

        // Kode valid, buat akun
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
        clearRegistrationVerification()
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
          step: 'form',
          verificationCode: '',
        })
      } catch (error) {
        setFeedback({ type: 'error', message: 'Gagal membuat akun. Silakan coba lagi.' })
      } finally {
        setRegisterLoading(false)
      }
    }
  }

  const handleForgotSubmit = async (event) => {
    event.preventDefault()

    if (forgotPasswordData.step === 'email') {
      const email = forgotPasswordData.email.trim().toLowerCase()
      if (!email) {
        setFeedback({ type: 'error', message: 'Silakan masukkan email Anda.' })
        return
      }
      if (!email.endsWith(`@${ALLOWED_DOMAIN}`)) {
        setFeedback({ type: 'error', message: `Email harus menggunakan domain @${ALLOWED_DOMAIN}.` })
        return
      }

      try {
        setForgotPasswordLoading(true)
        const result = resetPasswordWithEmail(email, accountList)
        if (result.success) {
          setForgotPasswordData((prev) => ({ ...prev, step: 'verify', email: result.email }))
          setFeedback({
            type: 'success',
            message: `Kode verifikasi telah dikirim ke ${result.email}. Kode: ${result.code} (untuk testing, kode ini akan dikirim via email di produksi).`,
          })
        } else {
          setFeedback({ type: 'error', message: result.message })
        }
      } catch (error) {
        setFeedback({ type: 'error', message: 'Gagal mengirim kode verifikasi. Silakan coba lagi.' })
      } finally {
        setForgotPasswordLoading(false)
      }
    } else if (forgotPasswordData.step === 'verify') {
      const code = forgotPasswordData.verificationCode.trim()
      if (!code) {
        setFeedback({ type: 'error', message: 'Silakan masukkan kode verifikasi.' })
        return
      }

      try {
        setForgotPasswordLoading(true)
        const result = verifyResetCode(code)
        if (result.success) {
          setForgotPasswordData((prev) => ({ ...prev, step: 'newpassword' }))
          setFeedback({
            type: 'success',
            message: 'Kode verifikasi valid. Silakan masukkan password baru.',
          })
        } else {
          setFeedback({ type: 'error', message: result.message })
        }
      } catch (error) {
        setFeedback({ type: 'error', message: 'Gagal memverifikasi kode. Silakan coba lagi.' })
      } finally {
        setForgotPasswordLoading(false)
      }
    } else if (forgotPasswordData.step === 'newpassword') {
      const newPassword = forgotPasswordData.newPassword
      const confirmPassword = forgotPasswordData.confirmNewPassword

      if (!newPassword || !confirmPassword) {
        setFeedback({ type: 'error', message: 'Silakan lengkapi password baru dan konfirmasi.' })
        return
      }
      if (newPassword.length < 8) {
        setFeedback({ type: 'error', message: 'Password minimal 8 karakter.' })
        return
      }
      if (newPassword !== confirmPassword) {
        setFeedback({ type: 'error', message: 'Konfirmasi password tidak cocok.' })
        return
      }

      try {
        setForgotPasswordLoading(true)
        const result = updatePasswordWithToken(newPassword, accountList)
        if (result.success) {
          setAccountList(result.accounts)
          setFeedback({
            type: 'success',
            message: 'Password berhasil diubah! Silakan login dengan password baru.',
          })
          setForgotPasswordData({
            email: '',
            verificationCode: '',
            newPassword: '',
            confirmNewPassword: '',
            step: 'email',
          })
          setMode(MODES.LOGIN)
        } else {
          setFeedback({ type: 'error', message: result.message })
        }
      } catch (error) {
        setFeedback({ type: 'error', message: 'Gagal mengubah password. Silakan coba lagi.' })
      } finally {
        setForgotPasswordLoading(false)
      }
    }
  }

  const handleResetAccounts = () => {
    const currentRole = currentProfile?.role
    const isAdmin = currentRole === 'Admin'

    if (!isAdmin && !currentProfile) {
      setFeedback({
        type: 'error',
        message: 'Anda harus login terlebih dahulu untuk mereset akun.',
      })
      return
    }

    if (isAdmin) {
      const confirmed = window.confirm(
        'Sebagai Admin, Anda akan mereset SEMUA akun yang terdaftar ke akun default. Tindakan ini tidak dapat dibatalkan. Lanjutkan?',
      )
      if (!confirmed) return

      try {
        clearAccounts(defaultUsers)
        setAccountList(defaultUsers)
        setFeedback({
          type: 'success',
          message: 'Semua akun telah direset ke akun default. Anda dapat menggunakan akun default untuk login.',
        })
      } catch (error) {
        setFeedback({
          type: 'error',
          message: 'Gagal mereset akun. Silakan coba lagi.',
        })
      }
    } else {
      // User biasa (Mahasiswa atau Dosen) bisa menghapus akun sendiri
      const roleLabel = currentRole === 'Dosen' ? 'Dosen' : 'Mahasiswa'
      const userEmail = currentProfile?.email || 'akun Anda'
      const confirmed = window.confirm(
        `Sebagai ${roleLabel}, Anda akan menghapus akun Anda sendiri (${userEmail}). Tindakan ini tidak dapat dibatalkan. Lanjutkan?`,
      )
      if (!confirmed) return

      try {
        if (!currentProfile?.id) {
          setFeedback({
            type: 'error',
            message: 'Data profil tidak valid. Silakan login ulang.',
          })
          return
        }
        const result = deleteAccount(currentProfile.id, accountList, currentProfile)
        if (result.success) {
          setAccountList(result.accounts)
          setFeedback({
            type: 'success',
            message: 'Akun Anda telah dihapus. Silakan daftar kembali jika diperlukan.',
          })
          onGuest?.()
        } else {
          setFeedback({
            type: 'error',
            message: result.message || 'Gagal menghapus akun. Silakan coba lagi.',
          })
        }
      } catch (error) {
        window.console.error('[LoginPage] Delete account error:', error)
        setFeedback({
          type: 'error',
          message: 'Gagal menghapus akun. Silakan coba lagi.',
        })
      }
    }
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
              Gunakan email: @kampus.ac.id. Mahasiswa memasukkan NIM, dosen dapat memakai NIP.
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
                autoComplete="current-password"
                data-form-type="password"
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
            {registerData.step === 'form' ? (
              <>
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
                  <option value="Mahasiswa">Mahasiswa - Unggah dan publikasikan proyek karya</option>
                  <option value="Dosen">Dosen - Review dan verifikasi proyek mahasiswa</option>
                </select>
                <div className="input-hint">
                  {registerData.role === 'Dosen'
                    ? 'Dosen dapat langsung memverifikasi dan mengelola proyek mahasiswa setelah registrasi.'
                    : 'Mahasiswa dapat mengunggah proyek yang akan direview oleh dosen sebelum dipublikasikan.'}
                </div>

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
                  Gunakan email: @kampus.ac.id. Mahasiswa memasukkan NIM, dosen dapat memakai NIP.
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
                  autoComplete="new-password"
                  data-form-type="password"
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
                  autoComplete="new-password"
                  data-form-type="password"
                />

                <button
                  type="submit"
                  className="button button-primary full-width"
                  disabled={registerLoading}
                >
                  {registerLoading ? 'Mengirim kode verifikasi...' : 'Kirim Kode Verifikasi'}
                </button>
              </>
            ) : (
              <>
                <p className="form-text">
                  Kode verifikasi telah dikirim ke {registerData.email}. Silakan masukkan kode yang
                  diterima untuk menyelesaikan registrasi.
                </p>
                <label className="form-label" htmlFor="reg-verify-code">
                  Kode Verifikasi
                </label>
                <input
                  id="reg-verify-code"
                  type="text"
                  className="form-input"
                  placeholder="Masukkan 6 digit kode"
                  value={registerData.verificationCode}
                  onChange={(event) =>
                    setRegisterData((prev) => ({
                      ...prev,
                      verificationCode: event.target.value,
                    }))
                  }
                  maxLength={6}
                  required
                />
                <div className="input-hint">Kode berlaku selama 15 menit</div>
                <button
                  type="submit"
                  className="button button-primary full-width"
                  disabled={registerLoading}
                >
                  {registerLoading ? 'Memverifikasi dan membuat akun...' : 'Verifikasi & Daftar'}
                </button>
                <button
                  type="button"
                  className="button button-ghost full-width"
                  onClick={() =>
                    setRegisterData((prev) => ({
                      ...prev,
                      step: 'form',
                      verificationCode: '',
                    }))
                  }
                >
                  Kembali ke Form
                </button>
              </>
            )}
          </form>
        ) : null}

        {mode === MODES.FORGOT ? (
          <form className="form" onSubmit={handleForgotSubmit}>
            {forgotPasswordData.step === 'email' ? (
              <>
                <p className="form-text">
                  Masukkan email Anda yang terdaftar. Kami akan mengirimkan kode verifikasi ke email
                  tersebut.
                </p>
                <label className="form-label" htmlFor="forgot-email">
                  Email Terdaftar
                </label>
                <input
                  id="forgot-email"
                  type="email"
                  className="form-input"
                  placeholder="nama@kampus.ac.id"
                  value={forgotPasswordData.email}
                  onChange={(event) =>
                    setForgotPasswordData((prev) => ({ ...prev, email: event.target.value }))
                  }
                  required
                />
                <div className="input-hint">Email harus menggunakan domain @kampus.ac.id</div>
                <button
                  type="submit"
                  className="button button-primary full-width"
                  disabled={forgotPasswordLoading}
                >
                  {forgotPasswordLoading ? 'Mengirim kode...' : 'Kirim Kode Verifikasi'}
                </button>
              </>
            ) : forgotPasswordData.step === 'verify' ? (
              <>
                <p className="form-text">
                  Kode verifikasi telah dikirim ke {forgotPasswordData.email}. Silakan masukkan kode
                  yang diterima.
                </p>
                <label className="form-label" htmlFor="forgot-code">
                  Kode Verifikasi
                </label>
                <input
                  id="forgot-code"
                  type="text"
                  className="form-input"
                  placeholder="Masukkan 6 digit kode"
                  value={forgotPasswordData.verificationCode}
                  onChange={(event) =>
                    setForgotPasswordData((prev) => ({
                      ...prev,
                      verificationCode: event.target.value,
                    }))
                  }
                  maxLength={6}
                  required
                />
                <div className="input-hint">Kode berlaku selama 15 menit</div>
                <button
                  type="submit"
                  className="button button-primary full-width"
                  disabled={forgotPasswordLoading}
                >
                  {forgotPasswordLoading ? 'Memverifikasi...' : 'Verifikasi Kode'}
                </button>
                <button
                  type="button"
                  className="button button-ghost full-width"
                  onClick={() =>
                    setForgotPasswordData((prev) => ({ ...prev, step: 'email', email: '' }))
                  }
                >
                  Kembali
                </button>
              </>
            ) : (
              <>
                <p className="form-text">Kode verifikasi valid. Silakan masukkan password baru Anda.</p>
                <label className="form-label" htmlFor="forgot-new-password">
                  Password Baru
                </label>
                <input
                  id="forgot-new-password"
                  type="password"
                  className="form-input"
                  placeholder="Minimal 8 karakter"
                  value={forgotPasswordData.newPassword}
                  onChange={(event) =>
                    setForgotPasswordData((prev) => ({ ...prev, newPassword: event.target.value }))
                  }
                  autoComplete="new-password"
                  data-form-type="password"
                  required
                />
                <label className="form-label" htmlFor="forgot-confirm-password">
                  Konfirmasi Password Baru
                </label>
                <input
                  id="forgot-confirm-password"
                  type="password"
                  className="form-input"
                  placeholder="Ulangi password baru"
                  value={forgotPasswordData.confirmNewPassword}
                  onChange={(event) =>
                    setForgotPasswordData((prev) => ({
                      ...prev,
                      confirmNewPassword: event.target.value,
                    }))
                  }
                  autoComplete="new-password"
                  data-form-type="password"
                  required
                />
                <button
                  type="submit"
                  className="button button-primary full-width"
                  disabled={forgotPasswordLoading}
                >
                  {forgotPasswordLoading ? 'Mengubah password...' : 'Ubah Password'}
                </button>
                <button
                  type="button"
                  className="button button-ghost full-width"
                  onClick={() =>
                    setForgotPasswordData((prev) => ({
                      ...prev,
                      step: 'verify',
                      newPassword: '',
                      confirmNewPassword: '',
                    }))
                  }
                >
                  Kembali
                </button>
              </>
            )}
          </form>
        ) : null}

        <button
          type="button"
          className="button button-ghost full-width"
          onClick={handleGuestLogin}
          disabled={guestLoading}
        >
          {guestLoading ? 'Mengaktifkan mode pengunjung...' : 'Masuk sebagai Pengunjung'}
        </button>

        {currentProfile ? (
          <div style={{ marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid var(--color-border)' }}>
            <button
              type="button"
              className="button button-ghost full-width"
              onClick={handleResetAccounts}
              style={{ fontSize: '0.875rem', color: 'var(--color-error, #dc3545)' }}
              title={
                currentProfile.role === 'Admin'
                  ? 'Reset semua akun yang terdaftar ke akun default (Admin only)'
                  : 'Hapus akun Anda sendiri'
              }
            >
              {currentProfile.role === 'Admin' ? 'Reset Semua Akun (Admin)' : 'Hapus Akun Saya'}
            </button>
            <p style={{ fontSize: '0.75rem', color: 'var(--color-muted)', textAlign: 'center', marginTop: '0.5rem' }}>
              {currentProfile.role === 'Admin'
                ? 'Hapus semua akun yang terdaftar dan kembalikan ke akun default'
                : currentProfile.role === 'Dosen'
                  ? 'Hapus akun dosen Anda sendiri secara permanen'
                  : 'Hapus akun Anda sendiri secara permanen'}
            </p>
          </div>
        ) : null}
      </main>
    </div>
  )
}

export default LoginPage

