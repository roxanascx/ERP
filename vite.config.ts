import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        target: 'http://127.0.0.1:8000',
        changeOrigin: true,
        secure: false
      }
    }
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: (id) => {
          // React core
          if (id.includes('node_modules/react') || id.includes('node_modules/react-dom')) {
            return 'react';
          }
          // Router
          if (id.includes('node_modules/react-router')) {
            return 'router';
          }
          // Clerk auth
          if (id.includes('node_modules/@clerk')) {
            return 'auth';
          }
          // SIRE modules
          if (id.includes('/sire/')) {
            return 'sire';
          }
          // Empresa modules
          if (id.includes('/empresa/')) {
            return 'empresa';
          }
          // Common utilities
          if (id.includes('node_modules/axios') || id.includes('node_modules/date-fns')) {
            return 'utils';
          }
          // Large libraries
          if (id.includes('node_modules/')) {
            return 'vendor';
          }
        }
      }
    },
    cssMinify: false, // Deshabilitar minificado CSS para eliminar advertencias
    chunkSizeWarningLimit: 1000 // Aumentar el límite a 1MB
  }
})
