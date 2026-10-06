/**
 * Cloudflare Worker — pass-through to static assets.
 *
 * Clean URLs and SPA fallback are owned entirely by [assets] in wrangler.toml:
 *   html_handling = "auto-trailing-slash"  → /privacy serves privacy.html;
 *                                            /privacy.html 307 → /privacy
 *   not_found_handling = "single-page-application" → unmatched HTML → index.html
 *
 * Do NOT rewrite /privacy ↔ /privacy.html here (that causes redirect loops).
 */

/** Minimal type for the Workers static-assets binding (avoids @cloudflare/workers-types). */
type AssetsFetcher = {
  fetch(input: RequestInfo | URL, init?: RequestInit): Promise<Response>
}

export interface Env {
  ASSETS: AssetsFetcher
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    return env.ASSETS.fetch(request)
  },
}
