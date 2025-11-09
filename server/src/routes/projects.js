const express = require('express')
const { withSession, requireAuth } = require('../middleware/authMiddleware')
const { listProjects, createProject } = require('../repositories/projectRepository')

const router = express.Router()

router.use(withSession)

router.get('/', (_req, res, next) => {
  try {
    const projects = listProjects()
    res.json({ items: projects })
  } catch (error) {
    next(error)
  }
})

router.post('/', requireAuth(), (req, res, next) => {
  try {
    const {
      title,
      summary,
      department,
      category,
      status,
      completionDate,
      year,
      tags,
      thumbnail,
    } = req.body ?? {}
    if (!title || !summary || !department || !category) {
      res.status(400).json({ message: 'Data proyek tidak lengkap.' })
      return
    }
    const project = createProject({
      ownerId: req.session.profile.id,
      title,
      summary,
      department,
      category,
      status: status ?? 'Sedang Berjalan',
      completionDate,
      year,
      tags,
      thumbnail,
    })
    res.status(201).json(project)
  } catch (error) {
    next(error)
  }
})

module.exports = router

