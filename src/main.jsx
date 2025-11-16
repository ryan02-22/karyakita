/**
 * Entry point aplikasi KaryaKita
 * 
 * File ini adalah titik masuk utama aplikasi React.
 * Menginisialisasi React root dan me-render komponen App.
 * 
 * @module main
 */

import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

// Mencari elemen root di HTML (biasanya <div id="root"></div>)
// Kemudian membuat React root dan me-render aplikasi
// StrictMode membantu menemukan masalah potensial dalam development
createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
