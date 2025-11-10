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
  REVIEW_STATUS,
  years,
} from '../data/mockData.js'
import { loadProjects, PROJECTS_UPDATED_EVENT } from '../utils/storage.js'

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
  const reviewStatus = project.reviewStatus ?? REVIEW_STATUS.PUBLISHED
  const statusLabel =
    reviewStatus === REVIEW_STATUS.PUBLISHED
      ? 'Dipublikasikan'
      : reviewStatus === REVIEW_STATUS.REJECTED
        ? 'Perlu Revisi'
        : 'Menunggu Review'
  const statusClass =
    reviewStatus === REVIEW_STATUS.PUBLISHED
      ? 'approved'
      : reviewStatus === REVIEW_STATUS.REJECTED
        ? 'rejected'
        : 'pending'

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
          <span className={`meta-pill verification ${statusClass}`}>{statusLabel}</span>
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

const ProjectGrid = ({ items, emptyMessage }) => {
  if (items.length === 0) {
    return (
      <div className="empty-state">
        <p>{emptyMessage}</p>
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

const PendingReviewList = ({ items }) => {
  if (items.length === 0) return null
  return (
    <section className="detail-card">
      <h3>Menunggu Review Dosen</h3>
      <ul
        style={{
          listStyle: 'none',
          margin: 0,
          padding: 0,
          display: 'flex',
          flexDirection: 'column',
          gap: '0.85rem',
        }}
      >
        {items.map((project) => (
          <li
            key={project.id}
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              gap: '1rem',
            }}
          >
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
              <p style={{ margin: 0, fontWeight: 600, color: 'var(--color-text)' }}>
                {project.title}
              </p>
              <span style={{ fontSize: '0.85rem', color: 'var(--color-muted)' }}>
                {project.department} • {project.owner?.name ?? 'Mahasiswa'} •{' '}
                {project.year ?? 'Tahun ?'}
              </span>
            </div>
            <Link to={`/projects/${project.id}`} className="button button-secondary">
              Tinjau
            </Link>
          </li>
        ))}
      </ul>
    </section>
  )
}

const DashboardPage = ({ onLogout, profile, isGuest }) => {
  const navigate = useNavigate()
  const [searchTerm, setSearchTerm] = useState('')
  const [filters, setFilters] = useState({
    department: '',
    year: '',
    category: '',
  })
  const [projectItems, setProjectItems] = useState(() => loadProjects(defaultProjects))
  const [notificationList, setNotificationList] = useState(defaultNotifications)
  const [notificationOpen, setNotificationOpen] = useState(false)

  useEffect(() => {
    const refresh = () => setProjectItems(loadProjects(defaultProjects))
    refresh()
    if (typeof window !== 'undefined') {
      window.addEventListener(PROJECTS_UPDATED_EVENT, refresh)
      return () => window.removeEventListener(PROJECTS_UPDATED_EVENT, refresh)
    }
    return undefined
  }, [])

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

  const viewerRole = profile?.role ?? (isGuest ? 'Pengunjung' : 'Mahasiswa')
  const isLecturer = viewerRole === 'Dosen'

  const filteredProjects = useMemo(() => {
    return projectItems.filter((project) => {
      const status = project.reviewStatus ?? REVIEW_STATUS.PUBLISHED
      const isOwner = profile?.id && project.ownerId === profile.id
      const isPublished = status === REVIEW_STATUS.PUBLISHED
      if (isGuest && !isPublished) {
        return false
      }
      if (!isGuest && !isLecturer && !isOwner && !isPublished) {
        return false
      }
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
  }, [
    filters.category,
    filters.department,
    filters.year,
    isGuest,
    isLecturer,
    profile?.id,
    projectItems,
    searchTerm,
  ])

  const pendingForLecturer = useMemo(
    () =>
      projectItems.filter(
        (project) => (project.reviewStatus ?? REVIEW_STATUS.PUBLISHED) === REVIEW_STATUS.PENDING,
      ),
    [projectItems],
  )
  const pendingForOwner = useMemo(() => {
    if (!profile?.id) return []
    return projectItems.filter(
      (project) =>
        project.ownerId === profile.id &&
        (project.reviewStatus ?? REVIEW_STATUS.PUBLISHED) === REVIEW_STATUS.PENDING,
    )
  }, [profile?.id, projectItems])
  const rejectedForOwner = useMemo(() => {
    if (!profile?.id) return []
    return projectItems.filter(
      (project) =>
        project.ownerId === profile.id &&
        (project.reviewStatus ?? REVIEW_STATUS.PUBLISHED) === REVIEW_STATUS.REJECTED,
    )
  }, [profile?.id, projectItems])

  const emptyMessage = isGuest
    ? 'Belum ada proyek publik untuk filter ini. Coba ubah kata kunci atau filter.'
    : isLecturer
      ? 'Tidak ada proyek yang cocok dengan filter ini. Tinjau daftar menunggu review atau sesuaikan filter.'
      : 'Belum ada proyek sesuai filter. Tambahkan karya baru atau ubah filter untuk melihat proyek lain.'

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
          {isLecturer && pendingForLecturer.length > 0 ? (
            <div className="banner-info">
              <strong>{pendingForLecturer.length} proyek menunggu verifikasi dosen.</strong>
              <p>Tinjau detail proyek, beri komentar, lalu setujui atau tolak dengan catatan.</p>
            </div>
          ) : null}
          {!isLecturer && pendingForOwner.length > 0 ? (
            <div className="banner-info">
              <strong>Proyek Anda sedang ditinjau dosen.</strong>
              <p>
                Proyek akan tampil ke publik setelah disetujui. Ikuti catatan dosen jika diminta
                revisi.
              </p>
            </div>
          ) : null}
          {!isLecturer && rejectedForOwner.length > 0 ? (
            <div className="banner-warning">
              <strong>{rejectedForOwner.length} proyek butuh revisi.</strong>
              <p>Buka detail proyek untuk melihat catatan dosen lalu perbarui dan ajukan ulang.</p>
            </div>
          ) : null}
          <StatsStrip profile={profile} isGuest={isGuest} />
          {isLecturer ? <PendingReviewList items={pendingForLecturer} /> : null}
          <ProjectGrid items={filteredProjects} emptyMessage={emptyMessage} />
        </main>
      </div>
    </div>
  )
}

export default DashboardPage

