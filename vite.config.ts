import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { fileURLToPath } from 'node:url'
import { defineConfig, type Connect, type Plugin } from 'vite'

const cleanHtmlPaths = new Set(['/privacy', '/terms', '/animations'])

function rewriteCleanHtml(url: string | undefined): string | undefined {
  if (!url) return url
  const queryIndex = url.indexOf('?')
  const path = queryIndex === -1 ? url : url.slice(0, queryIndex)
  const query = queryIndex === -1 ? '' : url.slice(queryIndex)
  if (!cleanHtmlPaths.has(path)) return url
  return `${path}.html${query}`
}

function attachCleanHtmlRoutes(middlewares: Connect.Server) {
  middlewares.use((req, _res, next) => {
    req.url = rewriteCleanHtml(req.url)
    next()
  })
}

/** Serves public/privacy.html and public/terms.html at /privacy and /terms. */
function cleanHtmlRoutes(): Plugin {
  return {
    name: 'clean-html-routes',
    configureServer(server) {
      attachCleanHtmlRoutes(server.middlewares)
    },
    configurePreviewServer(server) {
      attachCleanHtmlRoutes(server.middlewares)
    },
  }
}

export default defineConfig({
  plugins: [react(), tailwindcss(), cleanHtmlRoutes()],
  server: {
    host: '127.0.0.1',
    port: 5173,
    strictPort: true,
    hmr: {
      host: '127.0.0.1',
      protocol: 'ws',
    },
  },
  build: {
    rollupOptions: {
      input: {
        main: fileURLToPath(new URL('./index.html', import.meta.url)),
        animations: fileURLToPath(new URL('./animations.html', import.meta.url)),
      },
    },
  },
})
