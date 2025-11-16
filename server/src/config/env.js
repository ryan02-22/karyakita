/**
 * Environment Configuration Module
 * 
 * Mengelola konfigurasi aplikasi dari environment variables.
 * Menyediakan default values jika environment variable tidak diset.
 * 
 * @module config/env
 */

const path = require('path')

// Port untuk menjalankan server (default: 4000)
// Dapat diubah dengan environment variable PORT
const APP_PORT = Number.parseInt(process.env.PORT ?? '4000', 10)

// Time-to-live session dalam menit (default: 120 menit = 2 jam)
// Dapat diubah dengan environment variable SESSION_TTL_MINUTES
const SESSION_TTL_MINUTES = Number.parseInt(process.env.SESSION_TTL_MINUTES ?? '120', 10)

// Origin yang diizinkan untuk CORS (default: http://localhost:5173)
// Dapat diubah dengan environment variable ALLOWED_ORIGIN
const ALLOWED_ORIGIN = process.env.ALLOWED_ORIGIN ?? 'http://localhost:5173'

// Path ke database SQLite (default: server/data/app.db)
// Dapat diubah dengan environment variable SQLITE_PATH
const DB_PATH =
  process.env.SQLITE_PATH ??
  path.resolve(__dirname, '../../data/app.db')

module.exports = {
  APP_PORT,
  SESSION_TTL_MINUTES,
  ALLOWED_ORIGIN,
  DB_PATH,
}

