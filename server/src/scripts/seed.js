const bcrypt = require('bcryptjs')
const db = require('../db')
const { normalizeEmail, normalizeNim } = require('../utils/validators')

require('./migrate')

const seedUsers = () => {
  const defaultUsers = [
    {
      id: 'u-alya',
      name: 'Alya Putri',
      nim: '231234567',
      department: 'Teknik Informatika',
      email: 'alya@kampus.ac.id',
      role: 'Mahasiswa',
      verified: 1,
      avatarColor: '#2F80ED',
      totalProjects: 6,
      totalEndorsements: 18,
      popularProject: 'Smart Campus IoT Dashboard',
      passwordHash: bcrypt.hashSync('KaryaKita!2025', 10),
    },
    {
      id: 'u-dosen',
      name: 'Dosen Pengajar',
      nim: '1987654321',
      department: 'Teknik Informatika',
      email: 'dosen@kampus.ac.id',
      role: 'Dosen',
      verified: 1,
      avatarColor: '#27AE60',
      totalProjects: 0,
      totalEndorsements: 0,
      popularProject: null,
      passwordHash: bcrypt.hashSync('KaryaKita!2025', 10),
    },
    {
      id: 'u-admin',
      name: 'Administrator',
      nim: '000000000',
      department: 'Administrasi',
      email: 'admin@kampus.ac.id',
      role: 'Admin',
      verified: 1,
      avatarColor: '#E74C3C',
      totalProjects: 0,
      totalEndorsements: 0,
      popularProject: null,
      passwordHash: bcrypt.hashSync('KaryaKita!2025', 10),
    },
  ]

  const stmt = db.prepare(`
    INSERT OR IGNORE INTO users (
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
    ) VALUES (@id, @email, @nim, @nimNormalized, @passwordHash, @name, @department, @role, @verified, @avatarColor, @totalProjects, @totalEndorsements, @popularProject)
  `)

  defaultUsers.forEach((user) => {
    stmt.run({
      ...user,
      email: normalizeEmail(user.email),
      nimNormalized: normalizeNim(user.nim),
    })
  })
}

const seedProjects = () => {
  const projects = [
    {
      id: 'p-01',
      ownerId: 'u-alya',
      title: 'Smart Campus IoT Dashboard',
      summary:
        'Platform monitoring lingkungan kampus dengan sensor IoT real-time dan analitik interaktif.',
      department: 'Teknik Informatika',
      category: 'Teknik Informatika',
      status: 'Selesai',
      completionDate: '2024-05-30',
      year: 2024,
      thumbnail: '#6C63FF',
      endorsements: 9,
      tags: ['Teknik Informatika'],
      demoLink: 'https://example.com/SmartCampusIoTDashboard',
    },
    {
      id: 'p-02',
      ownerId: 'u-alya',
      title: 'EduPath Career Planner',
      summary:
        'Aplikasi web untuk membantu mahasiswa memetakan karier dengan rekomendasi skill dan portofolio.',
      department: 'Teknik Industri',
      category: 'Teknik Industri',
      status: 'Sedang Berjalan',
      completionDate: '2023-08-12',
      year: 2023,
      thumbnail: '#56CCF2',
      endorsements: 5,
      tags: ['Teknik Industri'],
      demoLink: 'https://example.com/EduPathCareerPlanner',
    },
    {
      id: 'p-03',
      ownerId: 'u-alya',
      title: 'FoodWaste Detector',
      summary:
        'Model computer vision untuk mendeteksi sisa makanan di kantin kampus dan memberikan laporan mingguan.',
      department: 'Teknik Lingkungan',
      category: 'Teknik Lingkungan',
      status: 'Selesai',
      completionDate: '2024-02-10',
      year: 2024,
      thumbnail: '#F2994A',
      endorsements: 7,
      tags: ['Teknik Lingkungan'],
      demoLink: 'https://example.com/FoodWasteDetector',
    },
    {
      id: 'p-04',
      ownerId: 'u-alya',
      title: 'Campus Event Hub',
      summary:
        'Portal event kampus dengan integrasi kalender pribadi dan sistem RSVP berbasis QR code.',
      department: 'Teknik Sipil',
      category: 'Teknik Sipil',
      status: 'Selesai',
      completionDate: '2022-11-15',
      year: 2022,
      thumbnail: '#9B51E0',
      endorsements: 11,
      tags: ['Teknik Sipil'],
      demoLink: 'https://example.com/CampusEventHub',
    },
  ]

  const insertProject = db.prepare(`
    INSERT OR IGNORE INTO projects (
      id,
      owner_id,
      title,
      summary,
      department,
      category,
      status,
      completion_date,
      year,
      thumbnail,
      demo_link,
      endorsements,
      created_at,
      updated_at
    ) VALUES (@id, @ownerId, @title, @summary, @department, @category, @status, @completionDate, @year, @thumbnail, @demoLink, @endorsements, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
  `)

  const insertTag = db.prepare(`
    INSERT OR IGNORE INTO project_tags (project_id, tag)
    VALUES (?, ?)
  `)

  const insertTags = db.transaction((projectId, tags) => {
    tags.forEach((tag) => insertTag.run(projectId, tag))
  })

  projects.forEach((project) => {
    insertProject.run(project)
    insertTags(project.id, project.tags ?? [])
  })
}

const seedNotifications = () => {
  const notifications = [
    {
      id: 'n-01',
      userId: 'u-alya',
      title: 'Komentar baru',
      message: 'Pak Budi memberikan komentar pada proyek Smart Campus IoT Dashboard.',
      timestamp: '2 menit lalu',
    },
    {
      id: 'n-02',
      userId: 'u-alya',
      title: 'Endorsement diterima',
      message: 'Rina Anggita meng-endorse proyek VR Campus Tour.',
      timestamp: '1 jam lalu',
    },
    {
      id: 'n-03',
      userId: 'u-alya',
      title: 'Verifikasi akun',
      message: 'Admin telah memverifikasi akun kampus Anda.',
      timestamp: 'Kemarin',
    },
  ]

  const stmt = db.prepare(`
    INSERT OR IGNORE INTO notifications (id, user_id, title, message, timestamp, read)
    VALUES (@id, @userId, @title, @message, @timestamp, 0)
  `)

  notifications.forEach((item) => stmt.run(item))
}

seedUsers()
seedProjects()
seedNotifications()

console.log('🌱 Data awal berhasil ditambahkan.')

