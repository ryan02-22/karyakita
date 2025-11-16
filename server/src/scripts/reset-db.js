const fs = require('fs')
const path = require('path')
const { DB_PATH } = require('../config/env')

console.log('🗑️  Mengosongkan database...')

// Hapus file database dan file terkait
const dbFiles = [
  DB_PATH,
  `${DB_PATH}-shm`,
  `${DB_PATH}-wal`,
]

let deletedCount = 0
dbFiles.forEach((filePath) => {
  try {
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath)
      console.log(`✅ Dihapus: ${path.basename(filePath)}`)
      deletedCount++
    }
  } catch (error) {
    console.error(`❌ Gagal menghapus ${filePath}:`, error.message)
    console.error(`   Pastikan tidak ada aplikasi yang sedang menggunakan database ini.`)
  }
})

if (deletedCount > 0) {
  console.log(`\n✅ ${deletedCount} file database berhasil dihapus.`)
} else {
  console.log('\n⚠️  Tidak ada file database yang ditemukan.')
}

console.log('\n📝 Langkah selanjutnya:')
console.log('   1. Jalankan "npm run migrate" untuk membuat struktur tabel')
console.log('   2. Jalankan "npm run seed" untuk mengisi data awal')

