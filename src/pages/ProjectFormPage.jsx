import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import {
  PiArrowLeft,
  PiCheckCircle,
  PiCode,
  PiGlobe,
  PiLinkSimple,
  PiMagnifyingGlass,
  PiPaperclip,
  PiPlus,
  PiTrash,
  PiUploadSimple,
  PiWarningCircle,
  PiX,
} from 'react-icons/pi'
import {
  categories,
  categoriesByDepartment,
  departments,
  tags,
  projects as defaultProjects,
  REVIEW_STATUS,
} from '../data/mockData.js'
import {
  loadDraftProject,
  loadProjects,
  saveDraftProject,
  saveProjects,
  clearDraftProject,
} from '../utils/storage.js'

const formatLocalizedDate = (value) => {
  if (!value) return ''
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return ''
  return new Intl.DateTimeFormat('id-ID', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(date)
}

const MAX_FILES = 5
const MAX_FILE_SIZE = 20 * 1024 * 1024
const PROJECT_STATUSES = ['Perencanaan', 'Sedang Berjalan', 'Selesai']

const DRAFT_INFO =
  'Draft tersimpan di perangkat ini. Lampiran tidak ikut tersimpan demi keamanan.'

const ProjectFormPage = ({ mode = 'create', isGuest = false, profile }) => {
  const navigate = useNavigate()
  const { projectId } = useParams()
  const initialReviewStatus =
    profile?.role === 'Dosen' ? REVIEW_STATUS.PUBLISHED : REVIEW_STATUS.PENDING
  
  // Safe initialization - don't call loadProjects during render
  const [existingProject, setExistingProject] = useState(null)
  const [isLoading, setIsLoading] = useState(true)

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    tags: [],
    category: '',
    department: Array.isArray(departments) && departments.length > 0 ? departments[0] : '',
    status: Array.isArray(PROJECT_STATUSES) && PROJECT_STATUSES.length > 1 ? PROJECT_STATUSES[1] : 'Sedang Berjalan',
    completionDate: new Date().toISOString().slice(0, 10),
    year: new Date().getFullYear().toString(),
    demoLink: '',
    linkType: 'repository', // 'repository', 'demo', 'documentation', 'other'
    imageFiles: [],
    documentFile: null,
    reviewStatus: initialReviewStatus,
  })
  const [submissionPreview, setSubmissionPreview] = useState(null)
  const [errors, setErrors] = useState({
    images: '',
    document: '',
  })
  const [statusFeedback, setStatusFeedback] = useState(null)
  const [submitting, setSubmitting] = useState(false)
  const [categorySearch, setCategorySearch] = useState('')
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false)

  // Load existing project for edit mode
  useEffect(() => {
    if (mode === 'edit' && projectId) {
      try {
        const projects = loadProjects(defaultProjects)
        const project = projects.find((p) => p.id === projectId)
        if (project) {
          setExistingProject(project)
          setFormData({
            title: project.title ?? '',
            description: project.summary ?? '',
            tags: Array.isArray(project.tags) ? project.tags : [],
            category: project.category ?? '',
            department: project.department ?? (Array.isArray(departments) && departments.length > 0 ? departments[0] : ''),
            status: project.status ?? (Array.isArray(PROJECT_STATUSES) && PROJECT_STATUSES.length > 1 ? PROJECT_STATUSES[1] : 'Sedang Berjalan'),
            completionDate: project.completionDate
              ? new Date(project.completionDate).toISOString().slice(0, 10)
              : new Date().toISOString().slice(0, 10),
            year: project.year?.toString() ?? new Date().getFullYear().toString(),
            demoLink: project.demoLink ?? '',
            linkType: project.linkType ?? 'repository',
            imageFiles: [],
            documentFile: null,
            reviewStatus: project.reviewStatus ?? initialReviewStatus,
          })
        } else {
          setStatusFeedback({
            message: 'Proyek tidak ditemukan.',
            type: 'error',
          })
          window.setTimeout(() => navigate('/dashboard'), 2000)
        }
      } catch (error) {
        window.console.error('[ProjectForm] Load project error:', error)
        setStatusFeedback({
          message: 'Gagal memuat data proyek. Silakan coba lagi.',
          type: 'error',
        })
        window.setTimeout(() => navigate('/dashboard'), 2000)
      } finally {
        setIsLoading(false)
      }
    } else if (mode === 'create') {
      try {
        const draft = loadDraftProject()
        if (draft) {
          setFormData((prev) => ({
            ...prev,
            ...draft,
            reviewStatus: draft.reviewStatus ?? initialReviewStatus,
          }))
          setStatusFeedback({
            message: `${DRAFT_INFO} Anda dapat melanjutkan dari data sebelumnya.`,
            type: 'info',
          })
        }
      } catch (error) {
        window.console.error('[ProjectForm] Load draft error:', error)
        // Continue without draft if error
      } finally {
        setIsLoading(false)
      }
    } else {
      setIsLoading(false)
    }
  }, [initialReviewStatus, mode, projectId, navigate])

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    // Reset kategori saat jurusan berubah, tapi jangan ubah tags kecuali user belum set tags
    if (field === 'department') {
      setFormData((prev) => {
        // Hanya reset category, tags tetap seperti sebelumnya atau set ke jurusan jika belum ada
        const updatedTags = prev.tags && prev.tags.length > 0 ? prev.tags : [value]
        return {
          ...prev,
          category: '',
          tags: updatedTags,
          [field]: value,
        }
      })
      setCategorySearch('')
    }
  }

  // Mendapatkan kategori berdasarkan jurusan yang dipilih
  const availableCategories = useMemo(() => {
    try {
      // Validate categoriesByDepartment exists
      if (!categoriesByDepartment || typeof categoriesByDepartment !== 'object') {
        window.console.warn('[ProjectForm] categoriesByDepartment is not defined, using categories')
        return Array.isArray(categories) ? categories : []
      }
      
      if (!formData?.department) {
        return Array.isArray(categories) ? categories : []
      }
      
      const deptCategories = categoriesByDepartment[formData.department] || (Array.isArray(categories) ? categories : [])
      if (!Array.isArray(deptCategories)) {
        return Array.isArray(categories) ? categories : []
      }
      
      if (!categorySearch?.trim()) {
        return deptCategories
      }
      
      const searchLower = categorySearch.toLowerCase()
      return deptCategories.filter((cat) => cat?.toLowerCase()?.includes(searchLower))
    } catch (error) {
      window.console.error('[ProjectForm] Available categories error:', error)
      return Array.isArray(categories) ? categories : []
    }
  }, [formData?.department, categorySearch])

  // Cek apakah input kategori sudah ada di daftar
  const isNewCategory = useMemo(() => {
    try {
      if (!categorySearch?.trim()) return false
      
      // Validate categoriesByDepartment exists
      if (!categoriesByDepartment || typeof categoriesByDepartment !== 'object') {
        return false
      }
      
      const searchLower = categorySearch.trim().toLowerCase()
      if (!formData?.department) return false
      
      const deptCategories = categoriesByDepartment[formData.department] || (Array.isArray(categories) ? categories : [])
      if (!Array.isArray(deptCategories)) return false
      
      return !deptCategories.some((cat) => cat?.toLowerCase() === searchLower)
    } catch (error) {
      window.console.error('[ProjectForm] Is new category error:', error)
      return false
    }
  }, [categorySearch, formData?.department])

  // Handler untuk menambahkan kategori baru
  const handleAddNewCategory = () => {
    const newCategory = categorySearch.trim()
    if (newCategory && isNewCategory) {
      handleInputChange('category', newCategory)
      setCategorySearch('')
      setShowCategoryDropdown(false)
      showStatus(`Kategori "${newCategory}" telah ditambahkan.`, 'success')
    }
  }

  const showStatus = (message, type = 'info') => {
    try {
      setStatusFeedback({ message, type })
    } catch (error) {
      window.console.error('[ProjectForm] Status feedback error:', error)
      // Fallback to alert if state update fails
      if (type === 'error') {
        window.alert(`Error: ${message}`)
      } else {
        window.alert(message)
      }
    }
  }

  const handleTagChange = (event) => {
    const selectedTags = Array.from(event.target.selectedOptions).map(
      (option) => option.value,
    )
    handleInputChange('tags', selectedTags)
  }

  const handleDateChange = (event) => {
    const value = event.target.value
    handleInputChange('completionDate', value)
    if (value) {
      const parsedYear = new Date(value).getFullYear()
      if (!Number.isNaN(parsedYear)) {
        handleInputChange('year', parsedYear.toString())
      }
    }
  }

  const imagePreviews = useMemo(() => {
    try {
      if (!formData || !formData.imageFiles) {
        return []
      }
      
      if (!Array.isArray(formData.imageFiles)) {
        window.console.warn('[ProjectForm] imageFiles is not an array:', formData.imageFiles)
        return []
      }

      const validFiles = formData.imageFiles.filter((file) => {
        const isValid = file instanceof File
        if (!isValid) {
          window.console.warn('[ProjectForm] Invalid file object:', file)
        }
        return isValid
      })

      if (validFiles.length === 0) {
        return []
      }

      const previews = validFiles.map((file) => {
        try {
          const url = URL.createObjectURL(file)
          const preview = {
            name: file.name || 'Unknown',
            url: url,
            size: file.size || 0,
          }
          window.console.log('[ProjectForm] Created preview:', preview.name, preview.url)
          return preview
        } catch (urlError) {
          window.console.error('[ProjectForm] Failed to create object URL:', urlError, file)
          return null
        }
      }).filter((preview) => preview !== null)
      
      window.console.log('[ProjectForm] Image previews:', previews.length, 'previews created')
      return previews
    } catch (error) {
      window.console.error('[ProjectForm] Image previews error:', error)
      return []
    }
  }, [formData?.imageFiles])

  useEffect(() => {
    return () => {
      try {
        if (Array.isArray(imagePreviews)) {
          imagePreviews.forEach((preview) => {
            if (preview?.url) {
              URL.revokeObjectURL(preview.url)
            }
          })
        }
      } catch (error) {
        window.console.error('[ProjectForm] Revoke URL error:', error)
      }
    }
  }, [imagePreviews])

  const handleRemoveImage = (fileName) => {
    try {
      const currentFiles = Array.isArray(formData.imageFiles) ? formData.imageFiles : []
      const updatedFiles = currentFiles.filter((file) => {
        if (file instanceof File) {
          return file.name !== fileName
        }
        return true
      })
      handleInputChange('imageFiles', updatedFiles)
    } catch (error) {
      window.console.error('[ProjectForm] Remove image error:', error)
      setErrors((prev) => ({
        ...prev,
        images: 'Gagal menghapus gambar. Silakan coba lagi.',
      }))
    }
  }

  const handleRemoveDocument = () => {
    handleInputChange('documentFile', null)
  }

  const handleImageUpload = (event) => {
    try {
      const files = Array.from(event.target.files || [])
      if (files.length === 0) return

      // Filter hanya file yang valid
      const validFiles = files.filter(
        (file) => file.type.startsWith('image/') && file.size <= MAX_FILE_SIZE,
      )

      // Cek jika ada file yang tidak valid
      const invalidFiles = files.filter(
        (file) => !file.type.startsWith('image/') || file.size > MAX_FILE_SIZE,
      )

      if (invalidFiles.length > 0) {
        setErrors((prev) => ({
          ...prev,
          images: 'Beberapa file tidak didukung atau ukuran melebihi 20MB. File yang valid akan ditambahkan.',
        }))
      } else {
        setErrors((prev) => ({ ...prev, images: '' }))
      }

      // Gabungkan dengan file yang sudah ada, batasi jumlah maksimal
      const currentFiles = Array.isArray(formData.imageFiles) ? formData.imageFiles : []
      const combined = [...currentFiles, ...validFiles].slice(0, MAX_FILES)

      // Update formData
      handleInputChange('imageFiles', combined)
      
      // Debug logging
      window.console.log('[ProjectForm] Image upload:', {
        totalFiles: files.length,
        validFiles: validFiles.length,
        invalidFiles: invalidFiles.length,
        currentFiles: currentFiles.length,
        combinedFiles: combined.length,
      })

      // Reset input untuk memungkinkan upload file yang sama lagi
      if (event.target) {
        event.target.value = ''
      }
    } catch (error) {
      window.console.error('[ProjectForm] Image upload error:', error)
      setErrors((prev) => ({
        ...prev,
        images: 'Gagal mengupload gambar. Silakan coba lagi.',
      }))
    }
  }

  const handleDocumentUpload = (event) => {
    const file = event.target.files?.[0]
    if (!file) return
    const isValidType =
      file.type === 'application/pdf' ||
      file.type === 'application/zip' ||
      file.name.endsWith('.pdf') ||
      file.name.endsWith('.zip')
    if (!isValidType || file.size > MAX_FILE_SIZE) {
      setErrors((prev) => ({
        ...prev,
        document: 'Gagal: format file tidak didukung atau ukuran melebihi 20MB.',
      }))
      return
    }
    setErrors((prev) => ({ ...prev, document: '' }))
    handleInputChange('documentFile', file)
  }

  const handleSubmit = async (publish = false, event) => {
    // Prevent default form submission
    if (event) {
      event.preventDefault()
      event.stopPropagation()
    }
    
    // Prevent multiple submissions
    if (submitting) {
      return
    }
    
    // Validate formData exists and extract values
    if (!formData) {
      showStatus('Form data tidak tersedia. Silakan refresh halaman.', 'error')
      return
    }
    
    const trimmedTitle = (formData.title || '').trim()
    const trimmedDescription = (formData.description || '').trim()
    const normalizedYear = formData.year ? Number.parseInt(formData.year, 10) : null
    const reviewStatus =
      profile?.role === 'Dosen' ? REVIEW_STATUS.PUBLISHED : REVIEW_STATUS.PENDING

    // Validate required fields for publish
    if (publish) {
      if (isGuest) {
        showStatus(
          'Publikasikan hanya tersedia untuk akun kampus. Silakan login dengan email kampus.',
          'error',
        )
        return
      }

      if (!trimmedTitle || !trimmedDescription || !formData.department || !formData.category) {
        showStatus(
          'Harap lengkapi judul, deskripsi, jurusan, dan bidang proyek sebelum mempublikasikan.',
          'error',
        )
        return
      }
    }

    try {
      const submissionPayload = {
        title: trimmedTitle,
        summary: trimmedDescription || 'Deskripsi belum diisi.',
        department: formData.department,
        category: formData.category,
        status: formData.status,
        completionDate: formData.completionDate || null,
        year: normalizedYear,
        tags: Array.isArray(formData.tags) ? formData.tags : [],
        thumbnail: '#2F80ED',
        demoLink: formData.demoLink || '',
        linkType: formData.linkType || 'repository',
        reviewStatus,
      }

      try {
        setSubmissionPreview({
          ...submissionPayload,
          attachments: {
            images: Array.isArray(formData.imageFiles)
              ? formData.imageFiles.map((file) => ({
                  name: file?.name || 'Unknown',
                  size: file?.size || 0,
                }))
              : [],
            document: formData.documentFile ? formData.documentFile.name : null,
          },
        })
      } catch (previewError) {
        window.console.error('[ProjectForm] Preview error:', previewError)
        // Continue even if preview fails
      }

      if (!publish) {
        try {
          saveDraftProject({
            title: trimmedTitle,
            description: trimmedDescription,
            tags: Array.isArray(formData.tags) ? formData.tags : [],
            category: formData.category || '',
            department: formData.department || '',
            status: formData.status || PROJECT_STATUSES[1],
            reviewStatus,
            completionDate: formData.completionDate || null,
            year: formData.year || new Date().getFullYear().toString(),
            demoLink: formData.demoLink || '',
        linkType: formData.linkType || 'repository',
            savedAt: new Date().toISOString(),
          })
          showStatus(DRAFT_INFO, 'success')
        } catch (draftError) {
          window.console.error('[ProjectForm] Draft save error:', draftError)
          showStatus('Gagal menyimpan draft. Silakan coba lagi.', 'error')
        } finally {
          setSubmitting(false)
        }
        return
      }

      // Publish mode - save project
      try {
        setSubmitting(true)
        const existingProjects = loadProjects(defaultProjects) || []
        const now = new Date().toISOString()
        const isDosen = profile?.role === 'Dosen'
        const derivedReviewStatus = isDosen ? REVIEW_STATUS.PUBLISHED : REVIEW_STATUS.PENDING

        if (mode === 'edit' && existingProject) {
          const updatedProject = {
            ...existingProject,
            title: trimmedTitle,
            summary: trimmedDescription,
            department: formData.department || '',
            category: formData.category || '',
            status: formData.status || PROJECT_STATUSES[1],
            completionDate: formData.completionDate || null,
            year: normalizedYear ?? new Date().getFullYear(),
            tags: Array.isArray(formData.tags) ? formData.tags : [],
            demoLink: formData.demoLink || '',
            linkType: formData.linkType || 'repository',
            updatedAt: now,
          }
          const updatedProjects = Array.isArray(existingProjects)
            ? existingProjects.map((p) => (p.id === existingProject.id ? updatedProject : p))
            : [updatedProject]
          
          try {
            saveProjects(updatedProjects)
            showStatus('Proyek berhasil diperbarui! Mengarahkan ke detail proyek...', 'success')
            setTimeout(() => {
              try {
                if (navigate && typeof navigate === 'function') {
                  navigate(`/projects/${existingProject.id}`)
                } else {
                  window.location.href = `/projects/${existingProject.id}`
                }
              } catch (navError) {
                window.console.error('[ProjectForm] Navigation error:', navError)
                showStatus('Proyek berhasil diperbarui, tetapi terjadi kesalahan saat navigasi.', 'error')
                // Fallback navigation
                try {
                  window.location.href = `/projects/${existingProject.id}`
                } catch {
                  window.alert('Proyek berhasil diperbarui. Silakan refresh halaman.')
                }
              }
            }, 800)
          } catch (saveError) {
            window.console.error('[ProjectForm] Save error:', saveError)
            showStatus('Gagal menyimpan proyek. Silakan coba lagi.', 'error')
          }
        } else {
          const newProject = {
            id: `p-${Date.now()}`,
            title: trimmedTitle,
            summary: trimmedDescription,
            department: formData.department || '',
            category: formData.category || '',
            status: formData.status || PROJECT_STATUSES[1],
            completionDate: formData.completionDate || null,
            year: normalizedYear ?? new Date().getFullYear(),
            tags: Array.isArray(formData.tags) ? formData.tags : [],
            thumbnail: '#2F80ED',
            endorsements: 0,
            demoLink: formData.demoLink || '',
            linkType: formData.linkType || 'repository',
            reviewStatus: derivedReviewStatus,
            reviewNotes: '',
            ownerId: profile?.id ?? null,
            owner: {
              name: profile?.name ?? 'Mahasiswa',
              verified: !!profile?.verified,
              role: profile?.role ?? 'Mahasiswa',
            },
            createdAt: now,
            publishedAt: isDosen ? now : null,
          }
          
          try {
            saveProjects([...existingProjects, newProject])
            clearDraftProject()
            if (profile?.role === 'Dosen') {
              showStatus('Proyek berhasil dipublikasikan! Mengarahkan ke Dashboard...', 'success')
            } else {
              showStatus(
                'Proyek berhasil dikirim ke dosen untuk verifikasi. Anda akan melihatnya setelah disetujui.',
                'success',
              )
            }
            setSubmissionPreview((prev) => {
              try {
                return {
                  ...prev,
                  submittedProject: newProject,
                  submittedAt: new Date().toISOString(),
                }
              } catch (error) {
                window.console.error('[ProjectForm] Set preview error:', error)
                return prev
              }
            })
            
            // Navigate after a short delay
            setTimeout(() => {
              try {
                if (navigate && typeof navigate === 'function') {
                  navigate('/dashboard')
                } else {
                  window.location.href = '/dashboard'
                }
              } catch (navError) {
                window.console.error('[ProjectForm] Navigation error:', navError)
                showStatus('Proyek berhasil dipublikasikan, tetapi terjadi kesalahan saat navigasi.', 'error')
                // Fallback navigation
                try {
                  window.location.href = '/dashboard'
                } catch {
                  window.alert('Proyek berhasil dipublikasikan. Silakan refresh halaman.')
                }
              }
            }, 800)
          } catch (saveError) {
            window.console.error('[ProjectForm] Save error:', saveError)
            showStatus('Gagal menyimpan proyek. Silakan coba lagi.', 'error')
          }
        }
      } catch (error) {
        window.console.error('[ProjectForm] Publish error:', error)
        showStatus(error.message ?? 'Publikasi gagal. Silakan coba kembali.', 'error')
      } finally {
        setSubmitting(false)
      }
    } catch (error) {
      window.console.error('[ProjectForm] Submit error:', error)
      showStatus('Terjadi kesalahan. Silakan coba lagi.', 'error')
      setSubmitting(false)
    }
  }

  const previewCard = useMemo(() => {
    try {
      return {
        title: formData?.title || 'Judul Proyek',
        description:
          formData?.description ||
          'Deskripsi singkat proyek akan tampil di sini. Buat ringkas dan menarik.',
        tags: Array.isArray(formData?.tags) ? formData.tags : [],
        category: formData?.category || 'Kategori',
        department: formData?.department || 'Jurusan',
        status: formData?.status || 'Sedang Berjalan',
        year: formData?.year || new Date().getFullYear().toString(),
        completionDate: formData?.completionDate || null,
      }
    } catch (error) {
      window.console.error('[ProjectForm] Preview card error:', error)
      return {
        title: 'Judul Proyek',
        description: 'Deskripsi singkat proyek akan tampil di sini. Buat ringkas dan menarik.',
        tags: [],
        category: 'Kategori',
        department: 'Jurusan',
        status: 'Sedang Berjalan',
        year: new Date().getFullYear().toString(),
        completionDate: null,
      }
    }
  }, [
    formData?.category,
    formData?.completionDate,
    formData?.description,
    formData?.department,
    formData?.status,
    formData?.tags,
    formData?.title,
    formData?.year,
  ])

  // Show loading state
  if (isLoading) {
    return (
      <div className="page-with-padding">
        <div style={{ padding: '2rem', textAlign: 'center' }}>
          <p>Memuat...</p>
        </div>
      </div>
    )
  }

  // Show error state if project not found in edit mode
  if (mode === 'edit' && !existingProject && !isLoading) {
    return (
      <div className="page-with-padding">
        <div style={{ padding: '2rem', textAlign: 'center' }}>
          <p>Proyek tidak ditemukan. Mengarahkan ke dashboard...</p>
        </div>
      </div>
    )
  }

  if (isGuest) {
    return (
      <div className="page-with-padding">
        <div className="page-header">
          <h1 className="page-title">Akses Terbatas</h1>
          <p className="page-subtitle">
            Fitur tambah atau edit proyek hanya tersedia untuk mahasiswa yang login dengan email
            kampus.
          </p>
        </div>
        <div className="detail-section">
          <p>
            Silakan logout dari mode pengunjung dan login menggunakan akun kampus untuk mulai
            mempublikasikan karyamu.
          </p>
          <div className="form-actions">
            <button type="button" className="button button-primary" onClick={() => navigate('/')}>
              Logout & Login Akun Kampus
            </button>
            <button type="button" className="button button-ghost" onClick={() => navigate(-1)}>
              Kembali ke Dashboard
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="page-with-padding">
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
        <h1 className="page-title">
          {mode === 'edit' ? 'Edit Proyek' : 'Tambah Proyek Baru'}
        </h1>
        <p className="page-subtitle">
          Lengkapi detail proyekmu agar mudah ditemukan oleh dosen dan recruiter.
        </p>
      </div>

      <div className="form-layout">
        <form
          className="form-card"
          onSubmit={async (event) => {
            event.preventDefault()
            event.stopPropagation()
            try {
              await handleSubmit(true, event)
            } catch (error) {
              window.console.error('[ProjectForm] Form submit error:', error)
              showStatus('Terjadi kesalahan saat memproses form. Silakan coba lagi.', 'error')
              setSubmitting(false)
            }
          }}
        >
          <label className="form-label" htmlFor="title">
            Judul Proyek
          </label>
          <input
            id="title"
            className="form-input"
            placeholder="Contoh: Smart Campus IoT Dashboard"
            value={formData.title}
            onChange={(event) => handleInputChange('title', event.target.value)}
          />

          <label className="form-label" htmlFor="description">
            Deskripsi
          </label>
          <textarea
            id="description"
            className="form-textarea"
            rows={6}
            placeholder="Tuliskan ringkasan proyek, peranmu, dan hasil akhir."
            value={formData.description}
            onChange={(event) => handleInputChange('description', event.target.value)}
          />

          <label className="form-label" htmlFor="tags">
            Tag / Kategori
          </label>
          <select
            id="tags"
            className="form-input"
            multiple
            value={formData.tags}
            onChange={handleTagChange}
          >
            {tags.map((tag) => (
              <option key={tag} value={tag}>
                {tag}
              </option>
            ))}
          </select>
          <div className="input-hint">
            Gunakan Ctrl / Command untuk memilih lebih dari satu tag.
          </div>

          <div className="form-grid">
              <div style={{ position: 'relative', width: '100%' }}>
                <label className="form-label" htmlFor="category">
                  Bidang Proyek
                </label>
                <div style={{ position: 'relative', width: '100%' }}>
                  <div className="input-with-icon" style={{ position: 'relative', width: '100%' }}>
                    <input
                      id="category"
                      type="text"
                      className="form-input"
                      placeholder="Cari atau pilih kategori..."
                      value={categorySearch || formData.category || ''}
                      onChange={(event) => {
                        const value = event.target.value
                        setCategorySearch(value)
                        setShowCategoryDropdown(true)
                        // Jika value cocok dengan kategori yang ada, langsung set
                        const matchingCategory = availableCategories.find(
                          (cat) => cat.toLowerCase() === value.toLowerCase(),
                        )
                        if (matchingCategory && value.toLowerCase() === matchingCategory.toLowerCase()) {
                          handleInputChange('category', matchingCategory)
                          setCategorySearch('')
                          setShowCategoryDropdown(false)
                        } else if (value.trim()) {
                          // Jika user mengetik kategori baru, set sebagai kategori baru
                          handleInputChange('category', value.trim())
                        } else {
                          handleInputChange('category', '')
                        }
                      }}
                      onKeyDown={(event) => {
                        // Enter untuk menambahkan kategori baru jika tidak ada di daftar
                        if (event.key === 'Enter' && isNewCategory && categorySearch.trim()) {
                          event.preventDefault()
                          handleAddNewCategory()
                        }
                      }}
                      onFocus={() => {
                        setShowCategoryDropdown(true)
                        if (formData.category) {
                          setCategorySearch('')
                        }
                      }}
                      onBlur={() => {
                        // Delay untuk memungkinkan klik pada dropdown
                        setTimeout(() => {
                          setShowCategoryDropdown(false)
                          if (!formData.category) {
                            setCategorySearch('')
                          }
                        }, 200)
                      }}
                      list="category-list"
                      style={{ paddingRight: categorySearch ? '3rem' : '1rem' }}
                    />
                    {categorySearch && (
                      <button
                        type="button"
                        className="icon-button"
                        onClick={() => {
                          setCategorySearch('')
                          setShowCategoryDropdown(true)
                        }}
                        style={{
                          position: 'absolute',
                          right: '2.5rem',
                          top: '50%',
                          transform: 'translateY(-50%)',
                          zIndex: 10,
                        }}
                        aria-label="Hapus pencarian"
                      >
                        <PiX size={18} />
                      </button>
                    )}
                  </div>
                  {showCategoryDropdown && (
                  <div
                    style={{
                      position: 'absolute',
                      top: 'calc(100% + 0.25rem)',
                      left: 0,
                      right: 0,
                      backgroundColor: 'var(--color-bg, #ffffff)',
                      border: '1px solid var(--color-border, #e0e0e0)',
                      borderRadius: '0.5rem',
                      maxHeight: '200px',
                      overflowY: 'auto',
                      zIndex: 1001,
                      boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
                      marginTop: '0.25rem',
                    }}
                  >
                    {isNewCategory && categorySearch.trim() && (
                      <button
                        type="button"
                        style={{
                          width: '100%',
                          padding: '0.75rem 1rem',
                          textAlign: 'left',
                          border: 'none',
                          background: 'var(--color-primary, #2F80ED)',
                          color: '#ffffff',
                          cursor: 'pointer',
                          fontSize: '0.875rem',
                          fontWeight: '500',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.5rem',
                        }}
                        onMouseDown={(e) => {
                          e.preventDefault()
                          handleAddNewCategory()
                        }}
                        onMouseEnter={(e) => {
                          e.target.style.backgroundColor = 'var(--color-primary-hover, #2563eb)'
                        }}
                        onMouseLeave={(e) => {
                          e.target.style.backgroundColor = 'var(--color-primary, #2F80ED)'
                        }}
                      >
                        <PiPlus size={16} />
                        <span>Tambah "{categorySearch.trim()}" sebagai kategori baru</span>
                      </button>
                    )}
                    {availableCategories.length > 0 && (
                      <>
                        {isNewCategory && categorySearch.trim() && (
                          <div
                            style={{
                              height: '1px',
                              backgroundColor: 'var(--color-border, #e0e0e0)',
                              margin: '0.25rem 0',
                            }}
                          />
                        )}
                        {availableCategories.map((category) => (
                          <button
                            key={category}
                            type="button"
                            style={{
                              width: '100%',
                              padding: '0.75rem 1rem',
                              textAlign: 'left',
                              border: 'none',
                              background: 'none',
                              cursor: 'pointer',
                              fontSize: '0.875rem',
                              color: 'var(--color-text, #333)',
                            }}
                            onMouseDown={(e) => {
                              e.preventDefault()
                              handleInputChange('category', category)
                              setCategorySearch('')
                              setShowCategoryDropdown(false)
                            }}
                            onMouseEnter={(e) => {
                              e.target.style.backgroundColor = 'var(--color-hover, #f5f5f5)'
                            }}
                            onMouseLeave={(e) => {
                              e.target.style.backgroundColor = 'transparent'
                            }}
                          >
                            {category}
                          </button>
                        ))}
                      </>
                    )}
                    {availableCategories.length === 0 && !isNewCategory && (
                      <div
                        style={{
                          padding: '1rem',
                          textAlign: 'center',
                          color: 'var(--color-muted, #666)',
                          fontSize: '0.875rem',
                        }}
                      >
                        Tidak ada kategori yang cocok
                      </div>
                    )}
                  </div>
                )}
                <datalist id="category-list">
                  {availableCategories.map((category) => (
                    <option key={category} value={category} />
                  ))}
                </datalist>
              </div>
            </div>
            <div>
              <label className="form-label" htmlFor="department">
                Jurusan
              </label>
              <select
                id="department"
                className="form-input"
                value={formData.department}
                onChange={(event) => handleInputChange('department', event.target.value)}
              >
                {departments.map((department) => (
                  <option key={department} value={department}>
                    {department}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="form-label" htmlFor="status">
                Status Proyek
              </label>
              <select
                id="status"
                className="form-input"
                value={formData.status}
                onChange={(event) => handleInputChange('status', event.target.value)}
              >
                {PROJECT_STATUSES.map((status) => (
                  <option key={status} value={status}>
                    {status}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="form-label" htmlFor="completionDate">
                Tanggal Pembuatan
              </label>
              <input
                id="completionDate"
                type="date"
                className="form-input"
                value={formData.completionDate}
                max={new Date().toISOString().slice(0, 10)}
                onChange={handleDateChange}
              />
              <div className="input-hint">Tahun proyek mengikuti tanggal yang dipilih.</div>
            </div>
          </div>

          <label className="form-label">Upload Gambar (maks. 5 file)</label>
          <label className="dropzone">
            <PiUploadSimple size={24} />
            <p>
              Drag & drop atau <span className="link-text">pilih file</span>
            </p>
            <input type="file" accept="image/*" multiple onChange={handleImageUpload} />
          </label>
          {errors.images ? <p className="form-error">{errors.images}</p> : null}
          {formData.imageFiles.length > 0 ? (
            <ul className="file-list">
              {formData.imageFiles.map((file) => (
                <li key={file.name}>
                  {file.name} ({(file.size / (1024 * 1024)).toFixed(2)} MB)
                </li>
              ))}
            </ul>
          ) : null}
          {imagePreviews.length > 0 ? (
            <div className="image-preview-grid" role="list" style={{ marginTop: '0.75rem' }}>
              {imagePreviews.map((preview, index) => {
                if (!preview || !preview.url) {
                  window.console.warn('[ProjectForm] Invalid preview:', preview)
                  return null
                }
                return (
                  <figure key={`${preview.name}-${index}`} className="image-preview-item" role="listitem">
                    <img 
                      src={preview.url} 
                      alt={preview.name || `Preview ${index + 1}`} 
                      loading="lazy"
                      onError={(e) => {
                        window.console.error('[ProjectForm] Image load error:', preview.url, e)
                        e.target.style.display = 'none'
                      }}
                    />
                    <figcaption>{preview.name || `Gambar ${index + 1}`}</figcaption>
                    <button
                      type="button"
                      className="icon-button image-preview-remove"
                      onClick={() => handleRemoveImage(preview.name)}
                      aria-label={`Hapus gambar ${preview.name}`}
                    >
                      <PiTrash size={16} />
                    </button>
                  </figure>
                )
              })}
            </div>
          ) : formData.imageFiles.length > 0 ? (
            <div style={{ marginTop: '0.75rem', padding: '0.75rem', background: 'rgba(242, 153, 74, 0.1)', borderRadius: '8px', color: '#c0641b', fontSize: '0.85rem' }}>
              <p style={{ margin: 0 }}>Gambar sedang diproses... ({formData.imageFiles.length} file)</p>
            </div>
          ) : null}

          <label className="form-label">Upload Dokumen (PDF/ZIP)</label>
          <label className="dropzone">
            <PiUploadSimple size={24} />
            <p>
              Tarik file di sini atau <span className="link-text">pilih dari komputermu</span>
            </p>
            <input
              type="file"
              accept=".pdf,.zip,application/pdf,application/zip"
              onChange={handleDocumentUpload}
            />
          </label>
          {errors.document ? <p className="form-error">{errors.document}</p> : null}
          {formData.documentFile ? (
            <div className="file-pill">
              <PiCheckCircle size={18} />
              <span>{formData.documentFile.name}</span>
              <button
                type="button"
                className="icon-button"
                onClick={handleRemoveDocument}
                aria-label="Hapus dokumen"
              >
                <PiTrash size={16} />
              </button>
            </div>
          ) : null}

          <label className="form-label" htmlFor="linkType">
            Tautan Proyek
          </label>
          <select
            id="linkType"
            className="form-input"
            value={formData.linkType}
            onChange={(event) => handleInputChange('linkType', event.target.value)}
          >
            <option value="repository">📦 Repository (GitHub/GitLab/Bitbucket)</option>
            <option value="demo">🌐 Live Demo / Aplikasi</option>
            <option value="documentation">📚 Dokumentasi</option>
            <option value="video">🎥 Video Demo</option>
            <option value="other">🔗 Tautan Lainnya</option>
          </select>
          <div className="input-hint">
            Pilih jenis tautan yang akan ditambahkan ke proyek Anda
          </div>

          <label className="form-label" htmlFor="demoLink" style={{ marginTop: '1rem' }}>
            URL Tautan
          </label>
          <div className="input-with-icon">
            <span className="icon-only" aria-hidden>
              {formData.linkType === 'repository' ? <PiCode size={18} /> :
               formData.linkType === 'demo' ? <PiGlobe size={18} /> :
               <PiLinkSimple size={18} />}
            </span>
            <input
              id="demoLink"
              type="url"
              className="form-input"
              placeholder={
                formData.linkType === 'repository' ? 'https://github.com/username/repo' :
                formData.linkType === 'demo' ? 'https://your-app.vercel.app' :
                formData.linkType === 'documentation' ? 'https://docs.example.com' :
                formData.linkType === 'video' ? 'https://youtube.com/watch?v=...' :
                'https://'
              }
              value={formData.demoLink}
              onChange={(event) => {
                const value = event.target.value.trim()
                handleInputChange('demoLink', value)
              }}
              pattern="https?://.*"
            />
          </div>
          <div className="input-hint">
            {formData.linkType === 'repository' && 'Contoh: https://github.com/username/project-name'}
            {formData.linkType === 'demo' && 'Contoh: https://your-app.vercel.app atau https://your-app.netlify.app'}
            {formData.linkType === 'documentation' && 'Contoh: https://docs.example.com atau link dokumentasi lainnya'}
            {formData.linkType === 'video' && 'Contoh: https://youtube.com/watch?v=... atau link video demo'}
            {formData.linkType === 'other' && 'Masukkan URL lengkap yang valid (harus dimulai dengan http:// atau https://)'}
          </div>

          <div className="form-actions">
            <button
              type="button"
              className="button button-ghost"
              onClick={async (event) => {
                event.preventDefault()
                event.stopPropagation()
                try {
                  await handleSubmit(false, event)
                } catch (error) {
                  window.console.error('[ProjectForm] Draft button error:', error)
                  showStatus('Terjadi kesalahan saat menyimpan draft. Silakan coba lagi.', 'error')
                  setSubmitting(false)
                }
              }}
              disabled={submitting}
            >
              Simpan sebagai Draft
            </button>
            <button type="submit" className="button button-primary" disabled={submitting}>
              {submitting ? 'Memproses...' : 'Publikasikan'}
            </button>
          </div>
          {statusFeedback ? (
            <div
              className={`status-banner ${
                statusFeedback.type === 'error'
                  ? 'error'
                  : statusFeedback.type === 'info'
                  ? 'info'
                  : 'success'
              }`}
            >
              <PiCheckCircle size={18} />
              <span>{statusFeedback.message}</span>
            </div>
          ) : null}
        </form>

        <aside className="preview-panel">
          <div className="preview-header">Live Preview</div>
          <article className="project-card">
            <div className="project-thumbnail preview-thumb">
              <span className="project-year">{previewCard.year}</span>
            </div>
            <div className="project-content">
              <h3 className="project-title">{previewCard.title}</h3>
              <p className="project-summary">{previewCard.description}</p>
              <div className="project-meta">
                <span className="meta-pill">{previewCard.category}</span>
                <span className="meta-pill">{previewCard.department}</span>
                <span className="meta-pill status">{previewCard.status}</span>
                {formatLocalizedDate(previewCard.completionDate) ? (
                  <span className="meta-pill muted">
                    {formatLocalizedDate(previewCard.completionDate)}
                  </span>
                ) : null}
              </div>
              <div className="project-tags">
                {previewCard.tags.length > 0 ? (
                  previewCard.tags.map((tag) => (
                    <span className="tag-chip" key={tag}>
                      #{tag}
                    </span>
                  ))
                ) : (
                  <span className="tag-chip muted">#tag-proyek</span>
                )}
              </div>
              {imagePreviews.length > 0 || formData.documentFile ? (
                <div className="attachment-preview">
                  <h4>Lampiran</h4>
                  {imagePreviews.length > 0 ? (
                    <div className="attachment-images">
                      {imagePreviews.map((preview, index) => {
                        if (!preview || !preview.url) return null
                        return (
                          <img 
                            key={`${preview.name}-${index}`} 
                            src={preview.url} 
                            alt={preview.name || `Preview ${index + 1}`} 
                            loading="lazy"
                            onError={(e) => {
                              window.console.error('[ProjectForm] Preview image load error:', preview.url, e)
                              e.target.style.display = 'none'
                            }}
                          />
                        )
                      })}
                    </div>
                  ) : null}
                  {formData.documentFile ? (
                    <div className="attachment-document">
                      <PiPaperclip size={16} />
                      <span>{formData.documentFile.name}</span>
                    </div>
                  ) : null}
                </div>
              ) : null}
            </div>
          </article>
          <div className="preview-note">
            <PiWarningCircle size={18} />
            <p>
              Pastikan preview sudah merepresentasikan dengan baik sebelum menekan tombol
              “Publikasikan”.
            </p>
          </div>
          {submissionPreview ? (
            <div className="submission-summary">
              <h4>Rangkuman Data</h4>
              <dl>
                <div>
                  <dt>Judul</dt>
                  <dd>{submissionPreview.title || '-'}</dd>
                </div>
                <div>
                  <dt>Status</dt>
                  <dd>{submissionPreview.status}</dd>
                </div>
                <div>
                  <dt>Jurusan</dt>
                  <dd>{submissionPreview.department}</dd>
                </div>
                <div>
                  <dt>Tanggal Pembuatan</dt>
                  <dd>{formatLocalizedDate(submissionPreview.completionDate) || '-'}</dd>
                </div>
                <div>
                  <dt>Tag</dt>
                  <dd>{submissionPreview.tags.length > 0 ? submissionPreview.tags.join(', ') : '-'}</dd>
                </div>
                <div>
                  <dt>Lampiran Gambar</dt>
                  <dd>
                    {submissionPreview.images.length > 0
                      ? `${submissionPreview.images.length} file`
                      : 'Tidak ada'}
                  </dd>
                </div>
                <div>
                  <dt>Dokumen</dt>
                  <dd>{submissionPreview.document ? submissionPreview.document.name : 'Tidak ada'}</dd>
                </div>
              </dl>
            </div>
          ) : null}
        </aside>
      </div>
    </div>
  )
}

export default ProjectFormPage

