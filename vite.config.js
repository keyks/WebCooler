import { defineConfig } from 'vite'

export default defineConfig({
  base: './',
  server: {
    port: 5173,
    open: false
  },
  build: {
    outDir: 'dist',
    rollupOptions: {
      input: {
        main: 'index.html',
        categories: 'categories.html',
        detail: 'detail.html',
        workbench: 'workbench.html',
        downloads: 'downloads.html'
      }
    }
  }
})
