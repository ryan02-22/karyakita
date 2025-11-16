/**
 * Konfigurasi Vite untuk build tool
 * 
 * Vite adalah build tool modern yang cepat untuk development dan production.
 * File ini mengkonfigurasi plugin React untuk mendukung JSX dan hot module replacement.
 * 
 * @module vite.config
 */

import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

/**
 * Konfigurasi Vite
 * @see https://vite.dev/config/
 */
export default defineConfig({
  // Plugin React untuk mendukung JSX dan Fast Refresh
  plugins: [react()],
})
