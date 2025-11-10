export const currentUser = {
  id: 'u-alya',
  name: 'Alya Putri',
  nim: '231234567',
  department: 'Teknik Informatika',
  avatarColor: '#2F80ED',
  role: 'Mahasiswa',
  verified: true,
  totalProjects: 6,
  totalEndorsements: 18,
  popularProject: 'Smart Campus IoT Dashboard',
}

export const defaultUsers = [
  {
    id: 'u-alya',
    email: 'alya@kampus.ac.id',
    nim: currentUser.nim,
    password: '$2b$10$oJPtfNC5aUEkclCJEyrgs.Ut2DsGohJB.JGxNmzjghIR4UfSRNKHO',
    profile: currentUser,
  },
  {
    id: 'u-dosen',
    email: 'dosen@kampus.ac.id',
    nim: '1987654321',
    password: '$2b$10$oJPtfNC5aUEkclCJEyrgs.Ut2DsGohJB.JGxNmzjghIR4UfSRNKHO',
    profile: {
      id: 'u-dosen',
      name: 'Dr. Budi Santoso',
      nim: '1987654321',
      department: 'Teknik Informatika',
      avatarColor: '#8B5CF6',
      role: 'Dosen',
      verified: true,
      totalProjects: 0,
      totalEndorsements: 0,
      popularProject: 'Panel Penilai Proyek Kampus',
    },
  },
]

export const REVIEW_STATUS = {
  PENDING: 'pending',
  PUBLISHED: 'published',
  REJECTED: 'rejected',
}

export const projects = [
  {
    id: 'p-01',
    title: 'Smart Campus IoT Dashboard',
    summary:
      'Platform monitoring lingkungan kampus dengan sensor IoT real-time dan analitik interaktif.',
    department: 'Teknik Informatika',
    year: 2024,
    status: 'Selesai',
    reviewStatus: REVIEW_STATUS.PUBLISHED,
    reviewNotes: '',
    category: 'Teknik Informatika',
    tags: ['Teknik Informatika'],
    thumbnail: '#6C63FF',
    ownerId: 'u-alya',
    owner: {
      name: 'Alya Putri',
      verified: true,
      role: 'Mahasiswa',
    },
    endorsements: 9,
    demoLink: 'https://example.com/SmartCampusIoTDashboard',
  },
  {
    id: 'p-02',
    title: 'EduPath Career Planner',
    summary:
      'Aplikasi web untuk membantu mahasiswa memetakan karier dengan rekomendasi skill dan portofolio.',
    department: 'Teknik Industri',
    year: 2023,
    status: 'Sedang Berjalan',
    reviewStatus: REVIEW_STATUS.PUBLISHED,
    reviewNotes: '',
    category: 'Teknik Industri',
    tags: ['Teknik Industri'],
    thumbnail: '#56CCF2',
    ownerId: 'u-raka',
    owner: {
      name: 'Raka Pratama',
      verified: false,
      role: 'Mahasiswa',
    },
    endorsements: 5,
    demoLink: 'https://example.com/EduPathCareerPlanner',
  },
  {
    id: 'p-03',
    title: 'FoodWaste Detector',
    summary:
      'Model computer vision untuk mendeteksi sisa makanan di kantin kampus dan memberikan laporan mingguan.',
    department: 'Teknik Lingkungan',
    year: 2024,
    status: 'Selesai',
    reviewStatus: REVIEW_STATUS.PUBLISHED,
    reviewNotes: '',
    category: 'Teknik Lingkungan',
    tags: ['Teknik Lingkungan'],
    thumbnail: '#F2994A',
    ownerId: 'u-dina',
    owner: {
      name: 'Dina Kartika',
      verified: true,
      role: 'Mahasiswa',
    },
    endorsements: 7,
    demoLink: 'https://example.com/FoodWasteDetector',
  },
  {
    id: 'p-04',
    title: 'Campus Event Hub',
    summary:
      'Portal event kampus dengan integrasi kalender pribadi dan sistem RSVP berbasis QR code.',
    department: 'Teknik Sipil',
    year: 2022,
    status: 'Selesai',
    reviewStatus: REVIEW_STATUS.PUBLISHED,
    reviewNotes: '',
    category: 'Teknik Sipil',
    tags: ['Teknik Sipil'],
    thumbnail: '#9B51E0',
    ownerId: 'u-bagas',
    owner: {
      name: 'Bagas Wicaksono',
      verified: false,
      role: 'Mahasiswa',
    },
    endorsements: 11,
    demoLink: 'https://example.com/CampusEventHub',
  },
]

export const categories = [
  'Teknik Informatika',
  'Arsitektur',
  'Teknik Sipil',
  'Teknik Industri',
  'Teknik Lingkungan',
  'Teknologi Hasil Pertanian',
]

export const departments = [...categories]

export const years = [2024, 2023, 2022, 2021]

export const tags = [...departments]

export const notifications = [
  {
    id: 'n-01',
    title: 'Komentar baru',
    message: 'Pak Budi memberikan komentar pada proyek Smart Campus IoT Dashboard.',
    timestamp: '2 menit lalu',
    read: false,
  },
  {
    id: 'n-02',
    title: 'Endorsement diterima',
    message: 'Rina Anggita meng-endorse proyek VR Campus Tour.',
    timestamp: '1 jam lalu',
    read: false,
  },
  {
    id: 'n-03',
    title: 'Verifikasi akun',
    message: 'Admin telah memverifikasi akun kampus Anda.',
    timestamp: 'Kemarin',
    read: true,
  },
]
 