const bcrypt = require('bcryptjs')
const { nanoid } = require('nanoid')
const db = require('../db')
const { normalizeEmail, normalizeNim } = require('../utils/validators')

const USER_SELECT_COLUMNS = `
  id,
  email,
  nim,
  nim_normalized as nimNormalized,
  password_hash as passwordHash,
  name,
  department,
  role,
  verified,
  avatar_color as avatarColor,
  total_projects as totalProjects,
  total_endorsements as totalEndorsements,
  popular_project as popularProject,
  created_at as createdAt
`

const mapRowToProfile = (row) => {
  if (!row) return null
  return {
    id: row.id,
    name: row.name,
    nim: row.nim,
    department: row.department,
    role: row.role,
    verified: Boolean(row.verified),
    avatarColor: row.avatarColor ?? '#2F80ED',
    totalProjects: row.totalProjects ?? 0,
    totalEndorsements: row.totalEndorsements ?? 0,
    popularProject: row.popularProject ?? 'Belum ada proyek',
  }
}

const findByEmail = (email) => {
  const stmt = db.prepare(`SELECT ${USER_SELECT_COLUMNS} FROM users WHERE email = ? LIMIT 1`)
  return stmt.get(normalizeEmail(email))
}

const findByNim = (nim) => {
  const stmt = db.prepare(
    `SELECT ${USER_SELECT_COLUMNS} FROM users WHERE nim_normalized = ? LIMIT 1`,
  )
  return stmt.get(normalizeNim(nim))
}

const findById = (id) => {
  const stmt = db.prepare(`SELECT ${USER_SELECT_COLUMNS} FROM users WHERE id = ? LIMIT 1`)
  return stmt.get(id)
}

const createUser = ({
  name,
  nim,
  department,
  email,
  password,
  role = 'Mahasiswa',
  avatarColor = '#2F80ED',
}) => {
  const id = `u-${nanoid(12)}`
  const normalizedEmail = normalizeEmail(email)
  const nimNormalized = normalizeNim(nim)
  const passwordHash = bcrypt.hashSync(password, 10)

  const stmt = db.prepare(`
    INSERT INTO users (
      id,
      email,
      nim,
      nim_normalized,
      password_hash,
      name,
      department,
      role,
      verified,
      avatar_color,
      total_projects,
      total_endorsements,
      popular_project
    )
    VALUES (@id, @email, @nim, @nimNormalized, @passwordHash, @name, @department, @role, @verified, @avatarColor, 0, 0, 'Belum ada proyek')
  `)

  stmt.run({
    id,
    email: normalizedEmail,
    nim,
    nimNormalized,
    passwordHash,
    name,
    department,
    role,
    verified: 0,
    avatarColor,
  })

  return findById(id)
}

module.exports = {
  mapRowToProfile,
  findByEmail,
  findByNim,
  findById,
  createUser,
}

