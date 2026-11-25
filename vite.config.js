import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// GitHub Pages serves the site at /study-together/
export default defineConfig({
  base: process.env.BASE ?? '/study-together/',
  plugins: [react()],
  define: { 'process.env.IS_PREACT': JSON.stringify('false') },
})
