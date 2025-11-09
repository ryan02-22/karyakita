const db = require('../db')

const runMigrations = () => {
  db.exec(`
    PRAGMA foreign_keys = ON;

    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      email TEXT UNIQUE NOT NULL,
      nim TEXT NOT NULL,
      nim_normalized TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      name TEXT NOT NULL,
      department TEXT NOT NULL,
      role TEXT NOT NULL DEFAULT 'Mahasiswa',
      verified INTEGER NOT NULL DEFAULT 0,
      avatar_color TEXT DEFAULT '#2F80ED',
      total_projects INTEGER NOT NULL DEFAULT 0,
      total_endorsements INTEGER NOT NULL DEFAULT 0,
      popular_project TEXT DEFAULT 'Belum ada proyek',
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS sessions (
      token TEXT PRIMARY KEY,
      user_id TEXT NULL,
      is_guest INTEGER NOT NULL DEFAULT 0,
      issued_at INTEGER NOT NULL,
      expires_at INTEGER NOT NULL,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
    );

    CREATE TABLE IF NOT EXISTS projects (
      id TEXT PRIMARY KEY,
      owner_id TEXT NOT NULL,
      title TEXT NOT NULL,
      summary TEXT NOT NULL,
      department TEXT NOT NULL,
      category TEXT NOT NULL,
      status TEXT NOT NULL,
      completion_date TEXT NULL,
      year INTEGER NULL,
      thumbnail TEXT DEFAULT '#2F80ED',
      demo_link TEXT,
      endorsements INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (owner_id) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS project_tags (
      project_id TEXT NOT NULL,
      tag TEXT NOT NULL,
      PRIMARY KEY (project_id, tag),
      FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS notifications (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      title TEXT NOT NULL,
      message TEXT NOT NULL,
      timestamp TEXT NOT NULL,
      read INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(user_id);
    CREATE INDEX IF NOT EXISTS idx_projects_owner ON projects(owner_id);
  `)
}

runMigrations()
console.log('✅ Migrasi database selesai.')

