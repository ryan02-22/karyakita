const express = require('express')
const cors = require('cors')
const { APP_PORT, ALLOWED_ORIGIN } = require('./config/env')
const authRoutes = require('./routes/auth')
const projectRoutes = require('./routes/projects')
const notificationRoutes = require('./routes/notifications')

const app = express()

app.use(
  cors({
    origin: ALLOWED_ORIGIN,
    credentials: true,
  }),
)
app.use(express.json({ limit: '2mb' }))

app.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() })
})

app.get('/', (_req, res) => {
  res.json({
    status: 'ok',
    message: 'KaryaKita API siap. Gunakan endpoint /api/... untuk data, atau buka frontend di http://localhost:5173.',
    docs: 'Lihat README.md untuk panduan lengkap.',
  })
})

app.use('/api/auth', authRoutes)
app.use('/api/projects', projectRoutes)
app.use('/api/notifications', notificationRoutes)

app.use((req, res) => {
  res.status(404).json({ message: `Endpoint ${req.originalUrl} tidak ditemukan.` })
})

app.use((error, _req, res, _next) => {
  console.error(error)
  const status = error.status ?? 500
  res.status(status).json({
    message: error.message ?? 'Terjadi kesalahan pada server.',
  })
})

app.listen(APP_PORT, () => {
  console.log(`API server siap di http://localhost:${APP_PORT}`)
})

