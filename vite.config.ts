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

          // El runtime de React va entero en un chunk, scheduler incluido.
          // Si scheduler cae en 'vendor' se forma un ciclo entre chunks:
          // react-dom (react) importa scheduler (vendor) y lucide-react
          // (vendor) importa react. Con esa circularidad uno de los dos se
          // evalua antes de que el otro publique sus exports y React llega
          // undefined, que es el "Cannot read properties of undefined
          // (reading 'forwardRef')" que rompia la app en produccion.
          // Las barras finales evitan que un futuro react-* entre aqui por
          // coincidencia de prefijo y reintroduzca el ciclo.
          if (id.includes('node_modules/react-dom/')) return 'react';
          if (id.includes('node_modules/react/')) return 'react';
          if (id.includes('node_modules/scheduler/')) return 'react';

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
