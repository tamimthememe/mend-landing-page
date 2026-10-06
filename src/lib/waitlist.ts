import { supabase } from './supabase.ts'

export type WaitlistList = 'main' | 'mendboards'
export type WaitlistSource = 'hero' | 'mendboards' | 'final-cta'

export type JoinResult =
  | { ok: true; status: 'joined' | 'already'; position: number | null }
  | { ok: false; error: 'invalid_email' | 'network' | 'unknown' }

type UtmBag = {
  utm_source: string | null
  utm_medium: string | null
  utm_campaign: string | null
}

const UTM_STORAGE_KEY = 'mend:utm'

let cachedUtm: UtmBag | null = null

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, ms)
  })
}

function isValidEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)
}

function readUtmFromUrl(): UtmBag {
  try {
    const params = new URLSearchParams(window.location.search)
    return {
      utm_source: params.get('utm_source'),
      utm_medium: params.get('utm_medium'),
      utm_campaign: params.get('utm_campaign'),
    }
  } catch {
    return { utm_source: null, utm_medium: null, utm_campaign: null }
  }
}

function hasAnyUtm(utm: UtmBag): boolean {
  return Boolean(utm.utm_source || utm.utm_medium || utm.utm_campaign)
}

function loadStoredUtm(): UtmBag | null {
  try {
    const raw = sessionStorage.getItem(UTM_STORAGE_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw) as Partial<UtmBag>
    return {
      utm_source: typeof parsed.utm_source === 'string' ? parsed.utm_source : null,
      utm_medium: typeof parsed.utm_medium === 'string' ? parsed.utm_medium : null,
      utm_campaign: typeof parsed.utm_campaign === 'string' ? parsed.utm_campaign : null,
    }
  } catch {
    return null
  }
}

function storeUtm(utm: UtmBag): void {
  try {
    sessionStorage.setItem(UTM_STORAGE_KEY, JSON.stringify(utm))
  } catch {
    // sessionStorage may be unavailable
  }
}

/** Capture UTM params once on first load; reuse for the session. */
export function getUtm(): UtmBag {
  if (cachedUtm) return cachedUtm

  const fromUrl = readUtmFromUrl()
  if (hasAnyUtm(fromUrl)) {
    cachedUtm = fromUrl
    storeUtm(fromUrl)
    return cachedUtm
  }

  const stored = loadStoredUtm()
  cachedUtm = stored ?? { utm_source: null, utm_medium: null, utm_campaign: null }
  return cachedUtm
}

/** Call once from main so UTMs are captured before in-page navigation. */
export function captureUtmOnLoad(): void {
  getUtm()
}

type RpcPayload = {
  status: 'joined' | 'already'
  position: number | null
}

function parseRpcPayload(data: unknown): RpcPayload | null {
  if (!data || typeof data !== 'object') return null
  const record = data as Record<string, unknown>
  const status = record.status
  if (status !== 'joined' && status !== 'already') return null
  const position = typeof record.position === 'number' ? record.position : null
  return { status, position }
}

export async function joinWaitlist(input: {
  email: string
  list: WaitlistList
  source: WaitlistSource
}): Promise<JoinResult> {
  const email = input.email.trim().toLowerCase()
  if (!isValidEmail(email)) {
    return { ok: false, error: 'invalid_email' }
  }

  if (!supabase) {
    console.warn('Supabase client unavailable — resolving joinWaitlist with the dev stub.')
    await delay(600)
    return { ok: true, status: 'joined', position: null }
  }

  const utm = getUtm()
  const referrer = typeof document !== 'undefined' && document.referrer ? document.referrer : null

  try {
    const { data, error } = await supabase.rpc('join_waitlist', {
      p_email: email,
      p_list: input.list,
      p_source: input.source,
      p_utm_source: utm.utm_source,
      p_utm_medium: utm.utm_medium,
      p_utm_campaign: utm.utm_campaign,
      p_referrer: referrer,
    })

    if (error) {
      console.warn('join_waitlist failed', error.message)
      return { ok: false, error: 'unknown' }
    }

    const payload = parseRpcPayload(data)
    if (!payload) {
      console.warn('join_waitlist returned an unexpected payload')
      return { ok: false, error: 'unknown' }
    }

    return { ok: true, status: payload.status, position: payload.position }
  } catch (err) {
    const isNetwork =
      err instanceof TypeError ||
      (err instanceof Error && /network|fetch|failed to fetch/i.test(err.message))
    console.warn('join_waitlist error', err)
    return { ok: false, error: isNetwork ? 'network' : 'unknown' }
  }
}
