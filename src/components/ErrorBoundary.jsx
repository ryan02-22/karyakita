/**
 * Error Boundary Component
 * 
 * Komponen untuk menangkap error JavaScript di dalam tree komponen React.
 * Mencegah seluruh aplikasi crash ketika terjadi error di salah satu komponen.
 * 
 * Cara kerja:
 * 1. Menangkap error yang terjadi di komponen child
 * 2. Menampilkan UI fallback yang user-friendly
 * 3. Log error ke console untuk debugging
 * 
 * @module ErrorBoundary
 */

import { Component } from 'react'

class ErrorBoundary extends Component {
  /**
   * Constructor - Inisialisasi state
   * @param {Object} props - Props komponen
   */
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  /**
   * Static method yang dipanggil ketika terjadi error
   * Mengupdate state untuk menampilkan UI fallback
   * @param {Error} error - Error yang terjadi
   * @returns {Object} State baru dengan hasError: true
   */
  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }

  /**
   * Lifecycle method yang dipanggil setelah error terjadi
   * Digunakan untuk logging error (bisa dikirim ke error tracking service)
   * @param {Error} error - Error yang terjadi
   * @param {Object} errorInfo - Informasi tambahan tentang error
   */
  componentDidCatch(error, errorInfo) {
    console.error('[ErrorBoundary] Caught error:', error, errorInfo)
    // Di sini bisa ditambahkan pengiriman error ke service seperti Sentry, LogRocket, dll
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="page-with-padding">
          <div style={{ padding: '2rem', textAlign: 'center' }}>
            <h2>Terjadi Kesalahan</h2>
            <p>Maaf, terjadi kesalahan saat memuat halaman. Silakan refresh halaman atau kembali ke dashboard.</p>
            <button
              type="button"
              className="button button-primary"
              onClick={() => window.location.href = '/dashboard'}
              style={{ marginTop: '1rem' }}
            >
              Kembali ke Dashboard
            </button>
            <button
              type="button"
              className="button button-ghost"
              onClick={() => window.location.reload()}
              style={{ marginTop: '0.5rem' }}
            >
              Refresh Halaman
            </button>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}

export default ErrorBoundary

