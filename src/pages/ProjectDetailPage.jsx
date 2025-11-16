import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import {
  PiArrowLeft,
  PiChatsTeardrop,
  PiCode,
  PiGlobe,
  PiHeartStraight,
  PiLinkSimple,
  PiShareNetwork,
  PiTrash,
  PiYoutubeLogo,
} from 'react-icons/pi'
import { projects as defaultProjects, REVIEW_STATUS } from '../data/mockData.js'
import { loadProjects, saveProjects, deleteProject, PROJECTS_UPDATED_EVENT } from '../utils/storage.js'

const sampleComments = [
  {
    id: 'c-1',
    author: 'Pak Budi',
    role: 'Dosen Pembimbing',
    verified: true,
    message: 'Presentasi yang runut dan implementasi dashboardnya mudah dipahami.',
    timestamp: '2 hari lalu',
  },
  {
    id: 'c-2',
    author: 'Nadia',
    role: 'Mahasiswa',
    verified: false,
    message: 'Boleh share repo Github-nya? Ingin belajar dari struktur kodenya.',
    timestamp: '1 hari lalu',
  },
]

const ProjectDetailPage = ({ isGuest, profile }) => {
  const { projectId } = useParams()
  const navigate = useNavigate()
  const [projectCollection, setProjectCollection] = useState(() => loadProjects(defaultProjects))
  const [project, setProject] = useState(() =>
    projectCollection.find((item) => item.id === projectId),
  )
  const [actionFeedback, setActionFeedback] = useState(null)
  const [comments, setComments] = useState(sampleComments)
  const [newComment, setNewComment] = useState('')
  const [isEndorsed, setIsEndorsed] = useState(() => {
    // Check if user has already endorsed this project
    if (!profile?.id || typeof window === 'undefined') return false
    try {
      const endorsedKey = `kk_endorsed_${projectId}_${profile.id}`
      return localStorage.getItem(endorsedKey) === 'true'
    } catch {
      return false
    }
  })

  useEffect(() => {
    const refresh = () => {
      const list = loadProjects(defaultProjects)
      const updatedProject = list.find((item) => item.id === projectId)
      setProjectCollection(list)
      setProject(updatedProject)
      // Update isEndorsed state when project changes
      if (updatedProject && profile?.id) {
        try {
          const endorsedKey = `kk_endorsed_${projectId}_${profile.id}`
          setIsEndorsed(localStorage.getItem(endorsedKey) === 'true')
        } catch {
          setIsEndorsed(false)
        }
      }
    }
    refresh()
    if (typeof window !== 'undefined') {
      window.addEventListener(PROJECTS_UPDATED_EVENT, refresh)
      return () => window.removeEventListener(PROJECTS_UPDATED_EVENT, refresh)
    }
    return undefined
  }, [projectId, profile?.id])

  // Auto-clear action feedback after 5 seconds
  useEffect(() => {
    if (actionFeedback) {
      const timer = setTimeout(() => {
        setActionFeedback(null)
      }, 5000)
      return () => clearTimeout(timer)
    }
    return undefined
  }, [actionFeedback])

  if (!project) {
    return (
      <div className="page-with-padding">
        <button type="button" className="link-button" onClick={() => navigate('/dashboard')}>
          <PiArrowLeft size={18} />
          <span>Kembali ke Dashboard</span>
        </button>
        <div className="empty-state">
          <p>Proyek tidak ditemukan.</p>
        </div>
      </div>
    )
  }

  const reviewStatus = project.reviewStatus ?? REVIEW_STATUS.PUBLISHED
  const isLecturer = profile?.role === 'Dosen'
  const isOwner = profile?.id && project.ownerId === profile.id
  const canAccess =
    reviewStatus === REVIEW_STATUS.PUBLISHED || isLecturer || isOwner || profile?.role === 'Admin'
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
  const canSeeReviewNotes = isLecturer || isOwner

  if (!canAccess) {
    return (
      <div className="page-with-padding">
        <button type="button" className="link-button" onClick={() => navigate('/dashboard')}>
          <PiArrowLeft size={18} />
          <span>Kembali ke Dashboard</span>
        </button>
        <div className="empty-state">
          <p>Proyek ini belum dipublikasikan. Hubungi dosen peninjau untuk akses.</p>
        </div>
      </div>
    )
  }

  const reviewBanner =
    reviewStatus === REVIEW_STATUS.PENDING ? (
      <div className="banner-info">
        <strong>Proyek ini menunggu verifikasi dosen.</strong>
        <p>
          {isLecturer
            ? 'Tinjau konten proyek, lalu publikasikan atau tolak dengan catatan yang jelas.'
            : 'Sementara hanya dosen yang dapat melihat proyek ini. Anda akan mendapat pemberitahuan setelah disetujui.'}
        </p>
      </div>
    ) : reviewStatus === REVIEW_STATUS.REJECTED ? (
      <div className="banner-warning">
        <strong>Proyek dikembalikan untuk revisi sebelum dipublikasikan.</strong>
        {project.reviewNotes ? <p>Catatan dosen: {project.reviewNotes}</p> : null}
      </div>
    ) : null

  const applyProjectUpdate = (updates, feedback) => {
    const nextProject = { ...project, ...updates }
    const nextCollection = projectCollection.map((item) =>
      item.id === project.id ? nextProject : item,
    )
    saveProjects(nextCollection)
    setProject(nextProject)
    setProjectCollection(nextCollection)
    if (feedback) {
      setActionFeedback({ message: feedback, timestamp: new Date().toISOString() })
    }
  }

  const handleApprove = () => {
    if (!project) {
      setActionFeedback({ 
        message: 'Data proyek tidak ditemukan.', 
        timestamp: new Date().toISOString() 
      })
      return
    }
    try {
      const note = window.prompt(
        'Catatan untuk mahasiswa (opsional):',
        project.reviewNotes ?? '',
      )
      applyProjectUpdate(
        {
          reviewStatus: REVIEW_STATUS.PUBLISHED,
          reviewNotes: typeof note === 'string' ? note : project.reviewNotes ?? '',
          publishedAt: new Date().toISOString(),
        },
        'Proyek berhasil dipublikasikan dan terlihat oleh seluruh pengguna.',
      )
    } catch (error) {
      window.console.error('[ProjectDetail] Approve error:', error)
      setActionFeedback({ 
        message: 'Gagal mempublikasikan proyek. Silakan coba lagi.', 
        timestamp: new Date().toISOString() 
      })
    }
  }

  const handleReject = () => {
    if (!project) {
      setActionFeedback({ 
        message: 'Data proyek tidak ditemukan.', 
        timestamp: new Date().toISOString() 
      })
      return
    }
    try {
      const note = window.prompt(
        'Masukkan saran/revisi sebelum proyek dapat dipublikasikan:',
        project.reviewNotes ?? '',
      )
      if (note === null) return
      const trimmed = note.trim()
      if (!trimmed) {
        window.alert('Catatan revisi wajib diisi agar mahasiswa mengetahui perbaikan yang dibutuhkan.')
        return
      }
      applyProjectUpdate(
        {
          reviewStatus: REVIEW_STATUS.REJECTED,
          reviewNotes: trimmed,
          publishedAt: null,
        },
        'Proyek dikembalikan untuk revisi. Mahasiswa akan menerima catatan Anda.',
      )
    } catch (error) {
      window.console.error('[ProjectDetail] Reject error:', error)
      setActionFeedback({ 
        message: 'Gagal menolak proyek. Silakan coba lagi.', 
        timestamp: new Date().toISOString() 
      })
    }
  }

  const handleResubmit = () => {
    if (!project) {
      setActionFeedback({ 
        message: 'Data proyek tidak ditemukan.', 
        timestamp: new Date().toISOString() 
      })
      return
    }
    try {
      applyProjectUpdate(
        {
          reviewStatus: REVIEW_STATUS.PENDING,
          reviewNotes: project.reviewNotes ?? '',
          publishedAt: null,
        },
        'Proyek dikirim ulang ke dosen untuk ditinjau.',
      )
    } catch (error) {
      window.console.error('[ProjectDetail] Resubmit error:', error)
      setActionFeedback({ 
        message: 'Gagal mengirim ulang proyek. Silakan coba lagi.', 
        timestamp: new Date().toISOString() 
      })
    }
  }

  const handleEndorse = () => {
    if (isGuest || !profile || !project) {
      return
    }
    const newEndorsed = !isEndorsed
    const newEndorsements = newEndorsed 
      ? (project.endorsements ?? 0) + 1 
      : Math.max(0, (project.endorsements ?? 0) - 1)
    
    // Save endorsement state to localStorage
    if (typeof window !== 'undefined' && profile.id) {
      try {
        const endorsedKey = `kk_endorsed_${project.id}_${profile.id}`
        if (newEndorsed) {
          localStorage.setItem(endorsedKey, 'true')
        } else {
          localStorage.removeItem(endorsedKey)
        }
      } catch (error) {
        window.console.error('[ProjectDetail] Failed to save endorsement state:', error)
      }
    }
    
    applyProjectUpdate(
      {
        endorsements: newEndorsements,
      },
      newEndorsed ? 'Terima kasih atas endorsement Anda!' : 'Endorsement dihapus.',
    )
    setIsEndorsed(newEndorsed)
  }

  const handleShare = async () => {
    if (!project) return
    const url = window.location.href
    try {
      if (navigator.share && typeof navigator.share === 'function') {
        await navigator.share({
          title: project.title || 'Proyek KaryaKita',
          text: project.summary || '',
          url: url,
        })
      } else if (navigator.clipboard && typeof navigator.clipboard.writeText === 'function') {
        await navigator.clipboard.writeText(url)
        window.alert('Link proyek berhasil disalin ke clipboard!')
      } else {
        // Fallback untuk browser yang tidak support clipboard API
        const textArea = document.createElement('textarea')
        textArea.value = url
        textArea.style.position = 'fixed'
        textArea.style.opacity = '0'
        document.body.appendChild(textArea)
        textArea.select()
        try {
          document.execCommand('copy')
          window.alert('Link proyek berhasil disalin ke clipboard!')
        } catch (execError) {
          window.alert(`Link proyek: ${url}`)
        } finally {
          document.body.removeChild(textArea)
        }
      }
    } catch (error) {
      if (error.name !== 'AbortError') {
        try {
          if (navigator.clipboard && typeof navigator.clipboard.writeText === 'function') {
            await navigator.clipboard.writeText(url)
            window.alert('Link proyek berhasil disalin ke clipboard!')
          } else {
            window.alert(`Link proyek: ${url}`)
          }
        } catch (clipboardError) {
          window.console.error('[ProjectDetail] Share error:', clipboardError)
          window.alert(`Link proyek: ${url}`)
        }
      }
    }
  }

  const handleCommentSubmit = () => {
    if (!newComment.trim() || isGuest || !profile) {
      return
    }
    const comment = {
      id: `c-${Date.now()}`,
      author: profile.name,
      role: profile.role,
      verified: profile.verified ?? false,
      message: newComment.trim(),
      timestamp: 'Baru saja',
    }
    setComments([comment, ...comments])
    setNewComment('')
    setActionFeedback({ message: 'Komentar berhasil dikirim!', timestamp: new Date().toISOString() })
  }

  const handleDeleteProject = () => {
    if (!isOwner) {
      setActionFeedback({ 
        message: 'Anda tidak memiliki izin untuk menghapus proyek ini.', 
        timestamp: new Date().toISOString() 
      })
      return
    }

    if (!project) {
      setActionFeedback({ 
        message: 'Data proyek tidak ditemukan.', 
        timestamp: new Date().toISOString() 
      })
      return
    }

    const confirmMessage = `Apakah Anda yakin ingin menghapus proyek "${project.title || 'proyek ini'}"? Tindakan ini tidak dapat dibatalkan.`
    if (!window.confirm(confirmMessage)) {
      return
    }

    try {
      const updatedProjects = deleteProject(project.id, projectCollection)
      if (!updatedProjects) {
        throw new Error('Gagal menghapus proyek dari storage')
      }
      setActionFeedback({ 
        message: 'Proyek berhasil dihapus. Mengarahkan ke dashboard...', 
        timestamp: new Date().toISOString() 
      })
      
      setTimeout(() => {
        try {
          navigate('/dashboard')
        } catch (navError) {
          window.console.error('[ProjectDetail] Navigation error:', navError)
          window.location.href = '/dashboard'
        }
      }, 1500)
    } catch (error) {
      window.console.error('[ProjectDetail] Delete error:', error)
      setActionFeedback({ 
        message: 'Gagal menghapus proyek. Silakan coba lagi.', 
        timestamp: new Date().toISOString() 
      })
    }
  }

  return (
    <div className="page-with-padding">
      {actionFeedback ? (
        <div className="banner-info">
          <strong>{actionFeedback.message}</strong>
        </div>
      ) : null}
      {reviewBanner}
      <div className="page-header">
        <div className="breadcrumb">
          <button type="button" className="link-button" onClick={() => navigate(-1)}>
            <PiArrowLeft size={18} />
            <span>Kembali</span>
          </button>
          <span className="separator">/</span>
          <Link to="/dashboard" className="link-button">
            Dashboard
          </Link>
        </div>
        <h1 className="page-title">{project.title}</h1>
        <p className="page-subtitle">{project.summary}</p>
      </div>

      <div className="detail-layout">
        <main className="detail-main">
          <section className="media-slider">
            {[1, 2, 3].map((slide) => (
              <div
                key={slide}
                className="media-slide"
                style={{
                  background: project.thumbnail,
                  opacity: slide === 1 ? 1 : 0.85 - slide * 0.1,
                }}
              >
                <span>Preview #{slide}</span>
              </div>
            ))}
            <div className="slider-dots">
              {[1, 2, 3].map((dot) => (
                <button
                  key={dot}
                  type="button"
                  className={`dot ${dot === 1 ? 'active' : ''}`}
                  aria-label={`Slide ${dot}`}
                />
              ))}
            </div>
          </section>

          <section className="detail-section">
            <h2>Deskripsi</h2>
            <p>
              {project.summary} Aplikasi ini dirancang untuk mendukung kebutuhan civitas akademika
              dengan menyediakan integrasi data real-time, visualisasi intuitif, dan kemampuan
              analitik. Pengembangan dilakukan menggunakan React, Node.js, dan integrasi GraphQL
              untuk memastikan performa optimal.
            </p>
            <p>
              Proyek ini melibatkan riset pengguna, perancangan UI/UX responsif, serta implementasi
              algoritma analitik dasar untuk memprediksi kebutuhan sumber daya kampus.
            </p>
          </section>

          {canSeeReviewNotes && project.reviewNotes ? (
            <section className="detail-section">
              <h2>Catatan Dosen</h2>
              <p>{project.reviewNotes}</p>
            </section>
          ) : null}

          {project.demoLink ? (
            <section className="detail-section">
              <h2>Tautan Proyek</h2>
              <div className="detail-actions">
                <a
                  href={project.demoLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="button button-primary"
                  style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                >
                  {project.linkType === 'repository' ? (
                    <>
                      <PiCode size={18} />
                      <span>Lihat Repository</span>
                    </>
                  ) : project.linkType === 'demo' ? (
                    <>
                      <PiGlobe size={18} />
                      <span>Buka Live Demo</span>
                    </>
                  ) : project.linkType === 'documentation' ? (
                    <>
                      <PiLinkSimple size={18} />
                      <span>Buka Dokumentasi</span>
                    </>
                  ) : project.linkType === 'video' ? (
                    <>
                      <PiYoutubeLogo size={18} />
                      <span>Tonton Video Demo</span>
                    </>
                  ) : (
                    <>
                      <PiLinkSimple size={18} />
                      <span>Buka Tautan</span>
                    </>
                  )}
                </a>
                <button
                  type="button"
                  className={`button ${isEndorsed ? 'button-secondary' : 'button-primary'}`}
                  disabled={isGuest}
                  onClick={handleEndorse}
                  title={
                    isGuest ? 'Masuk dengan akun kampus untuk memberi endorsement' : undefined
                  }
                >
                  <PiHeartStraight size={18} />
                  <span>{isEndorsed ? 'Batal Endorse' : 'Endorse'}</span>
                </button>
                <button
                  type="button"
                  className="button button-ghost"
                  onClick={handleShare}
                >
                  <PiShareNetwork size={18} />
                  <span>Bagikan</span>
                </button>
              </div>
              <div style={{ marginTop: '0.75rem', fontSize: '0.875rem', color: 'var(--color-muted)' }}>
                <a
                  href={project.demoLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ color: 'var(--color-primary)', wordBreak: 'break-all' }}
                >
                  {project.demoLink}
                </a>
              </div>
            </section>
          ) : null}

          <section className="detail-section">
            <h2>Komentar</h2>
            {isGuest ? (
              <div className="banner-info">
                <strong>Mode Pengunjung</strong>
                <p>Login dengan email kampus untuk memberikan komentar atau mengikuti progres.</p>
              </div>
            ) : null}
            <div className="comment-editor">
              <textarea
                placeholder="Tinggalkan komentar atau catatan progres"
                disabled={isGuest}
                value={newComment}
                onChange={(event) => setNewComment(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === 'Enter' && (event.ctrlKey || event.metaKey)) {
                    handleCommentSubmit()
                  }
                }}
              />
              <button
                type="button"
                className="button button-primary"
                disabled={isGuest || !newComment.trim()}
                onClick={handleCommentSubmit}
                title={isGuest ? 'Komentar khusus akun kampus' : undefined}
              >
                Kirim Komentar
              </button>
            </div>
            <ul className="comment-list">
              {comments.map((comment) => (
                <li key={comment.id} className="comment-item">
                  <div className="comment-avatar">{comment.author.charAt(0)}</div>
                  <div className="comment-body">
                    <div className="comment-header">
                      <p className="comment-author">
                        {comment.author}
                        {comment.verified ? <span className="verified-badge">✔</span> : null}
                      </p>
                      <span className="comment-role">{comment.role}</span>
                      <span className="comment-time">{comment.timestamp}</span>
                    </div>
                    <p>{comment.message}</p>
                  </div>
                </li>
              ))}
            </ul>
          </section>
        </main>

        <aside className="detail-sidebar">
          <section className="detail-card">
            <h3>Informasi Proyek</h3>
            <ul className="detail-list">
              <li>
                <span>Mahasiswa</span>
                <span>
                  {project.owner?.name ?? 'Mahasiswa'}
                  {project.owner?.verified ? <span className="verified-badge">✔</span> : null}
                </span>
              </li>
              <li>
                <span>Jurusan</span>
                <span>{project.department}</span>
              </li>
              <li>
                <span>Tahun</span>
                <span>{project.year ?? '-'}</span>
              </li>
              <li>
                <span>Status</span>
                <span>{project.status}</span>
              </li>
              <li>
                <span>Review Dosen</span>
                <span className={`meta-pill verification ${statusClass}`}>{statusLabel}</span>
              </li>
            </ul>
            <div className="tag-group">
              {(project.tags ?? []).map((tag) => (
                <span key={tag} className="tag-chip">
                  #{tag}
                </span>
              ))}
            </div>
          </section>

          <section className="detail-card">
            <h3>Proyek Terkait</h3>
            <ul className="related-list">
              {projectCollection
                .filter((item) => item.id !== project.id)
                .slice(0, 3)
                .map((item) => (
                  <li key={item.id}>
                    <Link to={`/projects/${item.id}`}>{item.title}</Link>
                    <span>{item.department}</span>
                  </li>
                ))}
            </ul>
          </section>

          <section className="detail-card">
            <h3>Statistik</h3>
            <div className="statistic-box">
              <PiChatsTeardrop size={18} />
              <div>
                <p>{comments.length} komentar</p>
                <span>{project.endorsements} endorsement</span>
              </div>
            </div>
          </section>

          {isLecturer ? (
            <section className="detail-card">
              <h3>Aksi Dosen</h3>
              {reviewStatus === REVIEW_STATUS.PENDING ? (
                <p>Tentukan kelayakan proyek sebelum dipublikasikan ke seluruh pengguna.</p>
              ) : reviewStatus === REVIEW_STATUS.REJECTED ? (
                <p>
                  Proyek sudah dikembalikan dengan catatan. Setujui kembali jika mahasiswa telah
                  melakukan revisi.
                </p>
              ) : (
                <p>
                  Proyek sudah dipublikasikan. Anda bisa mengirim catatan tambahan atau
                  mengembalikannya untuk revisi jika diperlukan.
                </p>
              )}
              <div style={{ display: 'grid', gap: '0.75rem' }}>
                {reviewStatus !== REVIEW_STATUS.PUBLISHED ? (
                  <button
                    type="button"
                    className="button button-primary full-width"
                    onClick={handleApprove}
                  >
                    Setujui & Publikasikan
                  </button>
                ) : null}
                <button
                  type="button"
                  className="button button-secondary full-width"
                  onClick={handleReject}
                >
                  {reviewStatus === REVIEW_STATUS.PUBLISHED
                    ? 'Kembalikan untuk Revisi'
                    : 'Tolak & Beri Catatan'}
                </button>
              </div>
            </section>
          ) : null}

          {isOwner ? (
            <section className="detail-card">
              <h3>Aksi Mahasiswa</h3>
              {reviewStatus === REVIEW_STATUS.REJECTED ? (
                <>
                  <p>
                    Perbaiki proyek sesuai catatan dosen kemudian kirim ulang agar dapat ditinjau
                    kembali.
                  </p>
                  <button
                    type="button"
                    className="button button-primary full-width"
                    onClick={handleResubmit}
                  >
                    Kirim Ulang untuk Review
                  </button>
                </>
              ) : (
                <p>Anda dapat mengedit proyek ini kapan saja.</p>
              )}
              <button
                type="button"
                className="button button-secondary full-width"
                onClick={() => navigate(`/projects/${project.id}/edit`)}
                style={{ marginTop: '0.75rem' }}
              >
                Edit Proyek
              </button>
              <button
                type="button"
                className="button button-ghost full-width"
                onClick={handleDeleteProject}
                style={{
                  marginTop: '0.75rem',
                  color: 'var(--color-accent, #F2994A)',
                  borderColor: 'var(--color-accent, #F2994A)',
                }}
              >
                <PiTrash size={18} />
                <span>Hapus Proyek</span>
              </button>
            </section>
          ) : null}
        </aside>
      </div>
    </div>
  )
}

export default ProjectDetailPage


