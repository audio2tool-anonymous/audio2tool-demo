import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// For GitHub Pages: set base to your repo name (e.g. '/audio2tool-demo/').
// Local dev uses '/' so assets load correctly.
export default defineConfig({
  plugins: [react()],
  base: '/',
})
