import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import tailwindcss from '@tailwindcss/vite'
import path from 'path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
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
        // ------------------------------------------------------------------
        // Solo se agrupan dependencias de node_modules, que son estables y se
        // cachean bien.
        //
        // Las reglas anteriores agrupaban tambien codigo propio por carpeta
        // ('/sire/', '/empresa/'). Eso peleaba contra el code-splitting por
        // ruta: bastaba con que un modulo eager cayera en el chunk 'sire' para
        // que sus 146 kB + 56 kB de CSS se descargaran en el primer paint.
        // Ahora las fronteras de carga las define el lazy() del router.
        // ------------------------------------------------------------------
        manualChunks: (id) => {
          if (!id.includes('node_modules')) return;

          // react-router antes que react: 'node_modules/react' tambien casa
          // con 'node_modules/react-router', por eso el chunk 'router' nunca
          // llegaba a formarse.
          if (id.includes('node_modules/react-router')) return 'router';
          if (id.includes('node_modules/react-dom')) return 'react';
          if (id.includes('node_modules/react')) return 'react';
          // scheduler es una dependencia interna de react-dom, pero es un
          // paquete npm aparte: sin esta regla cae en 'vendor', y como
          // lucide-react (tambien en 'vendor') usa React.forwardRef, se forma
          // un ciclo react<->vendor que rompe el orden de carga en produccion
          // ("Cannot read properties of undefined (reading 'forwardRef')").
          if (id.includes('node_modules/scheduler')) return 'react';
          if (id.includes('node_modules/@clerk')) return 'auth';
          if (id.includes('node_modules/axios')) return 'utils';

          return 'vendor';
        }
      }
    },
    cssMinify: true,
    chunkSizeWarningLimit: 1000
  }
})
