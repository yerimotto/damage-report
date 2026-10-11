import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  // Relative asset URLs so the build runs from any folder (or an embedded preview).
  base: './',
  plugins: [react(), tailwindcss()],
})
