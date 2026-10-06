/**
 * Cloudflare Worker — asset-first static hosting for the Mend landing.
 *
 * Serves real files from dist/ (privacy.html, terms.html, assets, …).
 * Only falls back to index.html when no matching asset exists.
 * Clean URLs (/privacy, /terms) map to their .html files.
 */
export interface Env {
  ASSETS: Fetcher
}

/** Paths without .html → static HTML files in dist/ */
const CLEAN_HTML: Record<string, string> = {
  '/privacy': '/privacy.html',
  '/terms': '/terms.html',
  '/animations': '/animations.html',
}

function normalizePath(pathname: string): string {
  if (pathname.length > 1 && pathname.endsWith('/')) {
    return pathname.slice(0, -1)
  }
  return pathname
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url)
    const pathname = normalizePath(url.pathname)

    const cleanTarget = CLEAN_HTML[pathname]
    if (cleanTarget) {
      url.pathname = cleanTarget
      return env.ASSETS.fetch(new Request(url.toString(), request))
    }

    // Asset-first: existing files (privacy.html, og-image.png, …) win.
    const assetResponse = await env.ASSETS.fetch(request)
    if (assetResponse.status !== 404) {
      return assetResponse
    }

    // SPA fallback only for HTML navigations with no matching file.
    const accept = request.headers.get('Accept') ?? ''
    if (request.method === 'GET' && accept.includes('text/html')) {
      return env.ASSETS.fetch(new URL('/index.html', url.origin))
    }

    return assetResponse
  },
}
