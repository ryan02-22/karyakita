import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  PiArrowLeft,
  PiCheckCircle,
  PiLinkSimple,
  PiPaperclip,
  PiTrash,
  PiUploadSimple,
  PiWarningCircle,
} from 'react-icons/pi'
import { categories, departments, tags } from '../data/mockData.js'

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
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:4000'

const ProjectFormPage = ({ mode = 'create', isGuest = false, authToken }) => {
  const navigate = useNavigate()
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    tags: [],
    category: '',
    department: departments[0] ?? '',
    status: PROJECT_STATUSES[1],
    completionDate: new Date().toISOString().slice(0, 10),
    year: new Date().getFullYear().toString(),
    demoLink: '',
    imageFiles: [],
    documentFile: null,
  })
  const [submissionPreview, setSubmissionPreview] = useState(null)
  const [errors, setErrors] = useState({
    images: '',
    document: '',
  })
  const [statusFeedback, setStatusFeedback] = useState(null)
  const [submitting, setSubmitting] = useState(false)

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const showStatus = (message, type = 'info') => {
    setStatusFeedback({ message, type })
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

  const imagePreviews = useMemo(
    () =>
      formData.imageFiles.map((file) => ({
        name: file.name,
        url: URL.createObjectURL(file),
        size: file.size,
      })),
    [formData.imageFiles],
  )

  useEffect(
    () => () => {
      imagePreviews.forEach((preview) => URL.revokeObjectURL(preview.url))
    },
    [imagePreviews],
  )

  const handleRemoveImage = (fileName) => {
    handleInputChange(
      'imageFiles',
      formData.imageFiles.filter((file) => file.name !== fileName),
    )
  }

  const handleRemoveDocument = () => {
    handleInputChange('documentFile', null)
  }

  const handleImageUpload = (event) => {
    const files = Array.from(event.target.files || [])
    const combined = [...formData.imageFiles, ...files].slice(0, MAX_FILES)
    const invalidFile = files.find(
      (file) => !file.type.startsWith('image/') || file.size > MAX_FILE_SIZE,
    )
    if (invalidFile) {
      setErrors((prev) => ({
        ...prev,
        images: 'Gagal: format file tidak didukung atau ukuran melebihi 20MB.',
      }))
      return
    }
    setErrors((prev) => ({ ...prev, images: '' }))
    handleInputChange('imageFiles', combined)
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

  const handleSubmit = async (publish = false) => {
    const trimmedTitle = formData.title.trim()
    const trimmedDescription = formData.description.trim()
    const normalizedYear = formData.year ? Number.parseInt(formData.year, 10) : null

    const submissionPayload = {
      title: trimmedTitle,
      summary: trimmedDescription || 'Deskripsi belum diisi.',
      department: formData.department,
      category: formData.category,
      status: formData.status,
      completionDate: formData.completionDate || null,
      year: normalizedYear,
      tags: formData.tags,
      thumbnail: '#2F80ED',
      demoLink: formData.demoLink || '',
    }

    setSubmissionPreview({
      ...submissionPayload,
      attachments: {
        images: formData.imageFiles.map((file) => ({
          name: file.name,
          size: file.size,
        })),
        document: formData.documentFile ? formData.documentFile.name : null,
      },
    })

    if (!publish) {
      showStatus('Draft tersimpan. Lanjutkan kapan saja dari Dashboard.', 'success')
      return
    }

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

    if (!authToken) {
      showStatus(
        'Sesi autentikasi tidak ditemukan. Silakan login ulang sebelum mempublikasikan.',
        'error',
      )
      return
    }

    try {
      setSubmitting(true)
      const response = await fetch(`${API_BASE_URL}/api/projects`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify(submissionPayload),
      })
      const result = await response.json().catch(() => null)
      if (!response.ok) {
        const message =
          result?.message ?? 'Publikasi gagal. Silakan cek data dan coba kembali.'
        throw new Error(message)
      }
      showStatus('Proyek berhasil dipublikasikan! Mengarahkan ke Dashboard...', 'success')
      setSubmissionPreview((prev) => ({
        ...prev,
        submittedProject: result,
        submittedAt: new Date().toISOString(),
      }))
      window.setTimeout(() => navigate('/dashboard'), 800)
    } catch (error) {
      window.console.error('[ProjectForm] Publish error:', error)
      showStatus(error.message ?? 'Publikasi gagal. Silakan coba kembali.', 'error')
    } finally {
      setSubmitting(false)
    }
  }

  const previewCard = useMemo(
    () => ({
      title: formData.title || 'Judul Proyek',
      description:
        formData.description ||
        'Deskripsi singkat proyek akan tampil di sini. Buat ringkas dan menarik.',
      tags: formData.tags,
      category: formData.category || 'Kategori',
      department: formData.department || 'Jurusan',
      status: formData.status,
      year: formData.year,
      completionDate: formData.completionDate,
    }),
    [
      formData.category,
      formData.completionDate,
      formData.description,
      formData.department,
      formData.status,
      formData.tags,
      formData.title,
      formData.year,
    ],
  )

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
          onSubmit={(event) => {
            event.preventDefault()
            handleSubmit(true)
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
            <div>
              <label className="form-label" htmlFor="category">
                Bidang Proyek
              </label>
              <select
                id="category"
                className="form-input"
                value={formData.category}
                onChange={(event) => handleInputChange('category', event.target.value)}
              >
                <option value="">Pilih kategori</option>
                {categories.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
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
            <div className="image-preview-grid" role="list">
              {imagePreviews.map((preview) => (
                <figure key={preview.name} className="image-preview-item" role="listitem">
                  <img src={preview.url} alt={preview.name} loading="lazy" />
                  <figcaption>{preview.name}</figcaption>
                  <button
                    type="button"
                    className="icon-button image-preview-remove"
                    onClick={() => handleRemoveImage(preview.name)}
                    aria-label={`Hapus gambar ${preview.name}`}
                  >
                    <PiTrash size={16} />
                  </button>
                </figure>
              ))}
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

          <label className="form-label" htmlFor="demoLink">
            Link Demo / Repository
          </label>
          <div className="input-with-icon">
            <span className="icon-only" aria-hidden>
              <PiLinkSimple size={18} />
            </span>
            <input
              id="demoLink"
              className="form-input"
              placeholder="https://"
              value={formData.demoLink}
              onChange={(event) => handleInputChange('demoLink', event.target.value)}
            />
          </div>

          <div className="form-actions">
            <button
              type="button"
              className="button button-ghost"
              onClick={() => handleSubmit(false)}
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
                      {imagePreviews.map((preview) => (
                        <img key={preview.name} src={preview.url} alt={preview.name} loading="lazy" />
                      ))}
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

