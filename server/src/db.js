/**
 * Database Connection Module
 * 
 * Mengatur koneksi ke database SQLite menggunakan better-sqlite3.
 * Mengaktifkan WAL mode untuk performa lebih baik dan foreign keys untuk data integrity.
 * 
 * @module db
 */

const Database = require('better-sqlite3')
const { DB_PATH } = require('./config/env')

// Membuat koneksi ke database SQLite
// DB_PATH biasanya: server/data/app.db
const db = new Database(DB_PATH)

// Aktifkan WAL (Write-Ahead Logging) mode
// Mode ini memungkinkan multiple readers dan single writer secara bersamaan
// Meningkatkan performa untuk aplikasi dengan banyak read operations
db.pragma('journal_mode = WAL')

// Aktifkan foreign key constraints
// Memastikan referential integrity antar tabel
db.pragma('foreign_keys = ON')

// Export database instance untuk digunakan di seluruh aplikasi
module.exports = db

