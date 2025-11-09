import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  PiBellSimple,
  PiBellSimpleRinging,
  PiChatCircleDots,
  PiMagnifyingGlass,
  PiPlus,
  PiSignOut,
} from 'react-icons/pi'
import {
  categories,
  departments,
  notifications as defaultNotifications,
  projects as defaultProjects,
  years,
} from '../data/mockData.js'

const Topbar = ({
  searchTerm,
  onSearch,
  onLogout,
  profile,
  isGuest,
  notifications,
  isNotificationsOpen,
  onToggleNotifications,
}) => {
  const hasUnread = notifications.some((item) => !item.read)

  return (
  <header className="topbar">
    <div className="topbar-brand">
      <Link to="/dashboard" className="brand-compact">
        <span className="brand-logo-small">K</span>
        <span className="brand-name">KaryaKita</span>
      </Link>
    </div>
    <label className="search-field" htmlFor="search">
      <PiMagnifyingGlass size={20} />
      <input
        id="search"
        type="search"
        placeholder="Cari proyek, kata kunci, atau nama mahasiswa"
        value={searchTerm}
        onChange={(event) => onSearch(event.target.value)}
      />
    </label>
    <div className="topbar-actions">
      <div className="topbar-notif">
        <button
          type="button"
          className={`topbar-icon ${isNotificationsOpen ? 'active' : ''}`}
          title="Notifikasi"
          onClick={onToggleNotifications}
          aria-haspopup="dialog"
          aria-expanded={isNotificationsOpen}
        >
          {hasUnread ? <PiBellSimpleRinging size={22} /> : <PiBellSimple size={22} />}
          <span className="badge">{notifications.length}</span>
        </button>
        {isNotificationsOpen ? (
          <div className="notification-dropdown" role="dialog" aria-label="Daftar notifikasi">
            <div className="notification-header">
              <h3>Notifikasi</h3>
              <span>{notifications.length} pesan</span>
            </div>
            <ul className="notification-list">
              {notifications.length > 0 ? (
                notifications.map((item) => (
                  <li
                    key={item.id}
                    className={`notification-item ${item.read ? 'read' : 'unread'}`}
                  >
                    <p className="notification-title">{item.title}</p>
                    <p className="notification-message">{item.message}</p>
                    <span className="notification-time">{item.timestamp}</span>
                  </li>
                ))
              ) : (
                <li className="notification-empty">
                  Tidak ada notifikasi baru. Tetap semangat berkarya!
                </li>
              )}
            </ul>
            <button
              type="button"
              className="link-button notification-footer"
              onClick={onToggleNotifications}
            >
              Tutup
            </button>
          </div>
        ) : null}
      </div>
      <div className="avatar-card">
        <div
          className="avatar-circle"
          aria-hidden
          style={{ background: profile?.avatarColor ?? '#2F80ED' }}
        >
          {profile?.name?.charAt(0) ?? 'P'}
        </div>
        <div className="avatar-info">
          <p className="avatar-name">
            {profile?.name ?? 'Pengguna'}
            {profile?.verified ? <span className="verified-badge">✔</span> : null}
          </p>
          <p className="avatar-meta">{isGuest ? 'Mode Pengunjung' : profile?.role}</p>
        </div>
        <button type="button" className="icon-only" onClick={onLogout} title="Keluar">
          <PiSignOut size={18} />
        </button>
      </div>
    </div>
  </header>
  )
}

const StatsStrip = ({ profile, isGuest }) => (
  <section className="stats-strip">
    <article className="stat-card">
      <p className="stat-label">Total Proyek</p>
      <p className="stat-value">{profile?.totalProjects ?? 0}</p>
    </article>
    <article className="stat-card">
      <p className="stat-label">Endorsements</p>
      <p className="stat-value">{profile?.totalEndorsements ?? 0}</p>
    </article>
    <article className="stat-card">
      <p className="stat-label">Proyek Populer</p>
      <p className="stat-value-small">
        {isGuest ? 'Login untuk melihat statistik pribadi' : profile?.popularProject ?? '-'}
      </p>
    </article>
  </section>
)

const SidebarFilters = ({
  filters,
  onChange,
  onReset,
  onAddProject,
  availableYears,
  availableDepartments,
  availableCategories,
  isGuest,
}) => (
  <aside className="sidebar">
    <div className="sidebar-header">
      <h2>Filter</h2>
      <button type="button" className="link-button" onClick={onReset}>
        Reset
      </button>
    </div>
    <label className="sidebar-label" htmlFor="department">
      Jurusan
    </label>
    <select
      id="department"
      className="form-input"
      value={filters.department}
      onChange={(event) => onChange('department', event.target.value)}
    >
      <option value="">Semua Jurusan</option>
      {availableDepartments.map((dept) => (
        <option key={dept} value={dept}>
          {dept}
        </option>
      ))}
    </select>

    <label className="sidebar-label" htmlFor="year">
      Tahun
    </label>
    <select
      id="year"
      className="form-input"
      value={filters.year}
      onChange={(event) => onChange('year', event.target.value)}
    >
      <option value="">Semua Tahun</option>
      {availableYears.map((year) => (
        <option key={year} value={year}>
          {year}
        </option>
      ))}
    </select>

    <label className="sidebar-label" htmlFor="category">
      Kategori
    </label>
    <select
      id="category"
      className="form-input"
      value={filters.category}
      onChange={(event) => onChange('category', event.target.value)}
    >
      <option value="">Semua Kategori</option>
      {availableCategories.map((category) => (
        <option key={category} value={category}>
          {category}
        </option>
      ))}
    </select>

    <button
      type="button"
      className="button button-primary full-width"
      onClick={onAddProject}
      disabled={isGuest}
      title={isGuest ? 'Hanya tersedia untuk akun kampus' : undefined}
    >
      <PiPlus size={18} />
      <span>Tambah Proyek</span>
    </button>
  </aside>
)

const ProjectCard = ({ project }) => {
  const ownerName = project.owner?.name ?? 'Mahasiswa'
  const ownerRole = project.owner?.role ?? 'Mahasiswa'
  const ownerVerified = Boolean(project.owner?.verified)
  const tags = Array.isArray(project.tags) ? project.tags : []

  return (
    <article className="project-card">
      <div className="project-thumbnail" style={{ background: project.thumbnail }}>
        <span className="project-year">{project.year}</span>
      </div>
      <div className="project-content">
        <div className="project-owner">
          <span className="owner-name">
            {ownerName}
            {ownerVerified ? <span className="verified-badge">✔</span> : null}
          </span>
          <span className="owner-role">{ownerRole}</span>
        </div>
        <h3 className="project-title">{project.title}</h3>
        <p className="project-summary">{project.summary}</p>
        <div className="project-meta">
          <span className="meta-pill">{project.department}</span>
          <span className="meta-pill status">{project.status}</span>
        </div>
        <div className="project-tags">
          {tags.length > 0 ? (
            tags.map((tag) => (
              <span className="tag-chip" key={tag}>
                #{tag}
              </span>
            ))
          ) : (
            <span className="tag-chip muted">#tag-proyek</span>
          )}
        </div>
        <div className="project-actions">
          <Link to={`/projects/${project.id}`} className="button button-secondary">
            <PiChatCircleDots size={18} />
            <span>Lihat</span>
          </Link>
          <span className="endorse-count">{project.endorsements ?? 0} endorse</span>
        </div>
      </div>
    </article>
  )
}

const ProjectGrid = ({ items }) => {
  if (items.length === 0) {
    return (
      <div className="empty-state">
        <p>Belum ada proyek. Klik ‘+ Tambah Proyek’ untuk mempublikasikan karyamu.</p>
      </div>
    )
  }
  return (
    <section className="project-grid">
      {items.map((project) => (
        <ProjectCard project={project} key={project.id} />
      ))}
    </section>
  )
}

const DASHBOARD_API_BASE = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:4000'

const DashboardPage = ({ onLogout, profile, isGuest, authToken }) => {
  const navigate = useNavigate()
  const [searchTerm, setSearchTerm] = useState('')
  const [filters, setFilters] = useState({
    department: '',
    year: '',
    category: '',
  })
  const [projectItems, setProjectItems] = useState(defaultProjects)
  const [notificationList, setNotificationList] = useState(defaultNotifications)
  const [notificationOpen, setNotificationOpen] = useState(false)

  useEffect(() => {
    const controller = new AbortController()
    const loadProjects = async () => {
      try {
        const response = await fetch(`${DASHBOARD_API_BASE}/api/projects`, {
          signal: controller.signal,
        })
        if (!response.ok) {
          throw new Error('Gagal memuat proyek dari server')
        }
        const data = await response.json()
        if (Array.isArray(data?.items)) {
          setProjectItems(data.items)
        }
      } catch (error) {
        if (error.name !== 'AbortError') {
          console.error(error)
        }
      }
    }
    loadProjects()
    return () => controller.abort()
  }, [])

  useEffect(() => {
    if (isGuest || !authToken) {
      setNotificationList(defaultNotifications)
      return undefined
    }
    const controller = new AbortController()
    const loadNotifications = async () => {
      try {
        const response = await fetch(`${DASHBOARD_API_BASE}/api/notifications`, {
          signal: controller.signal,
          headers: {
            Authorization: `Bearer ${authToken}`,
          },
        })
        if (!response.ok) {
          throw new Error('Gagal memuat notifikasi')
        }
        const data = await response.json()
        if (Array.isArray(data?.items)) {
          setNotificationList(data.items)
        }
      } catch (error) {
        if (error.name !== 'AbortError') {
          console.error(error)
        }
      }
    }
    loadNotifications()
    return () => controller.abort()
  }, [authToken, isGuest])

  const handleToggleNotifications = () => {
    setNotificationOpen((prevOpen) => {
      const next = !prevOpen
      if (!prevOpen) {
        setNotificationList((prevList) =>
          prevList.map((item) => ({
            ...item,
            read: true,
          })),
        )
      }
      return next
    })
  }

  const handleAddProject = () => {
    if (isGuest) {
      window.alert('Fitur tambah proyek hanya tersedia untuk akun kampus terdaftar.')
      return
    }
    navigate('/projects/new')
  }

  const filteredProjects = useMemo(() => {
    return projectItems.filter((project) => {
      const ownerName = project.owner?.name ?? ''
      const matchesSearch =
        searchTerm.trim().length === 0 ||
        [project.title ?? '', project.summary ?? '', ownerName, ...(project.tags ?? [])]
          .join(' ')
          .toLowerCase()
          .includes(searchTerm.toLowerCase())
      const matchesDepartment = !filters.department || project.department === filters.department
      const matchesYear = !filters.year || String(project.year) === filters.year
      const matchesCategory = !filters.category || project.category === filters.category

      return matchesSearch && matchesDepartment && matchesYear && matchesCategory
    })
  }, [filters.category, filters.department, filters.year, projectItems, searchTerm])

  return (
    <div className="dashboard-layout">
      <Topbar
        searchTerm={searchTerm}
        onSearch={setSearchTerm}
        onLogout={onLogout}
        profile={profile}
        isGuest={isGuest}
        notifications={notificationList}
        isNotificationsOpen={notificationOpen}
        onToggleNotifications={handleToggleNotifications}
      />
      {notificationOpen ? (
        <div
          className="notification-overlay"
          onClick={() => setNotificationOpen(false)}
          aria-hidden
        />
      ) : null}
      <div className="dashboard-body">
        <SidebarFilters
          filters={filters}
          onChange={(key, value) => setFilters((prev) => ({ ...prev, [key]: value }))}
          onReset={() =>
            setFilters({
              department: '',
              year: '',
              category: '',
            })
          }
          onAddProject={handleAddProject}
          availableYears={years}
          availableDepartments={departments}
          availableCategories={categories}
          isGuest={isGuest}
        />
        <main className="dashboard-main">
          {isGuest ? (
            <div className="banner-info">
              <strong>Mode Pengunjung</strong>
              <p>
                Anda dapat menelusuri proyek publik. Login dengan email kampus untuk menambahkan
                proyek baru, memberikan komentar, dan menyimpan portofolio pribadi.
              </p>
            </div>
          ) : null}
          <StatsStrip profile={profile} isGuest={isGuest} />
          <ProjectGrid items={filteredProjects} />
        </main>
      </div>
    </div>
  )
}

export default DashboardPage

