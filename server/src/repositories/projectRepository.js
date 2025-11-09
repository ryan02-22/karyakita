const { nanoid } = require('nanoid')
const db = require('../db')

const mapProjectRow = (row) => ({
  id: row.id,
  title: row.title,
  summary: row.summary,
  department: row.department,
  category: row.category,
  status: row.status,
  completionDate: row.completion_date,
  year: row.year,
  ownerId: row.owner_id,
  createdAt: row.created_at,
  updatedAt: row.updated_at,
  tags: row.tags ? row.tags.split('|').filter(Boolean) : [],
  endorsements: row.endorsements ?? 0,
  thumbnail: row.thumbnail ?? '#2F80ED',
  demoLink: row.demo_link ?? '',
  owner: row.owner_name
    ? {
        name: row.owner_name,
        role: row.owner_role,
        verified: Boolean(row.owner_verified),
      }
    : null,
})

const listProjects = () => {
  const stmt = db.prepare(`
    SELECT
      p.id,
      p.title,
      p.summary,
      p.department,
      p.category,
      p.status,
      p.completion_date,
      p.year,
      p.owner_id,
      p.created_at,
      p.updated_at,
      p.endorsements,
      p.thumbnail,
      u.name as owner_name,
      u.role as owner_role,
      u.verified as owner_verified,
      GROUP_CONCAT(pt.tag, '|') as tags
    FROM projects p
    LEFT JOIN users u ON u.id = p.owner_id
    LEFT JOIN project_tags pt ON pt.project_id = p.id
    GROUP BY p.id
    ORDER BY p.created_at DESC
  `)
  return stmt.all().map(mapProjectRow)
}

const createProject = ({
  ownerId,
  title,
  summary,
  department,
  category,
  status,
  completionDate,
  year,
  tags = [],
  thumbnail,
  demoLink,
}) => {
  const id = `p-${nanoid(10)}`
  const now = new Date().toISOString()
  const stmt = db.prepare(`
    INSERT INTO projects (
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
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0, ?, ?)
  `)
  stmt.run(
    id,
    ownerId,
    title,
    summary,
    department,
    category,
    status,
    completionDate ?? null,
    year ?? null,
    thumbnail ?? '#2F80ED',
    demoLink ?? '',
    now,
    now,
  )
  if (tags?.length) {
    const tagStmt = db.prepare(`
      INSERT INTO project_tags (project_id, tag)
      VALUES (?, ?)
    `)
    const insertMany = db.transaction((rows) => {
      rows.forEach((tag) => tagStmt.run(id, tag))
    })
    insertMany(tags)
  }
  return mapProjectRow(
    db
      .prepare(
        `
      SELECT
        p.*,
        u.name as owner_name,
        u.role as owner_role,
        u.verified as owner_verified,
        GROUP_CONCAT(pt.tag, '|') as tags
      FROM projects p
      LEFT JOIN users u ON u.id = p.owner_id
      LEFT JOIN project_tags pt ON pt.project_id = p.id
      WHERE p.id = ?
      GROUP BY p.id
    `,
      )
      .get(id),
  )
}

module.exports = {
  listProjects,
  createProject,
}

