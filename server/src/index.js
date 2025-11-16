/**
 * Server Entry Point - KaryaKita API Server
 * 
 * File utama untuk menjalankan Express server.
 * Mengatur middleware, routes, dan error handling.
 * 
 * @module server
 */

const express = require('express')
const cors = require('cors')
const { APP_PORT, ALLOWED_ORIGIN } = require('./config/env')
const authRoutes = require('./routes/auth')
const projectRoutes = require('./routes/projects')
const notificationRoutes = require('./routes/notifications')

// Inisialisasi Express app
const app = express()

// Middleware CORS - mengizinkan request dari frontend
// ALLOWED_ORIGIN biasanya http://localhost:5173 untuk development
app.use(
  cors({
    origin: ALLOWED_ORIGIN,
    credentials: true, // Mengizinkan cookies/credentials
  }),
)

// Middleware untuk parse JSON body dengan limit 2MB
app.use(express.json({ limit: '2mb' }))

// Health check endpoint - untuk monitoring server status
app.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() })
})

// Root endpoint - informasi API
app.get('/', (_req, res) => {
  res.json({
    status: 'ok',
    message: 'KaryaKita API siap. Gunakan endpoint /api/... untuk data, atau buka frontend di http://localhost:5173.',
    docs: 'Lihat README.md untuk panduan lengkap.',
  })
})

// Route handlers untuk berbagai endpoint
app.use('/api/auth', authRoutes)           // Authentication endpoints
app.use('/api/projects', projectRoutes)    // Project management endpoints
app.use('/api/notifications', notificationRoutes) // Notification endpoints

// 404 handler - untuk endpoint yang tidak ditemukan
app.use((req, res) => {
  res.status(404).json({ message: `Endpoint ${req.originalUrl} tidak ditemukan.` })
})

// Error handler - menangkap semua error yang terjadi
app.use((error, _req, res, _next) => {
  console.error(error)
  const status = error.status ?? 500
  res.status(status).json({
    message: error.message ?? 'Terjadi kesalahan pada server.',
  })
})

// Start server pada port yang ditentukan
app.listen(APP_PORT, () => {
  console.log(`API server siap di http://localhost:${APP_PORT}`)
})

