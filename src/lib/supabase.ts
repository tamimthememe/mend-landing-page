import { createClient, type SupabaseClient } from '@supabase/supabase-js'

const url = import.meta.env.VITE_SUPABASE_URL
const publishableKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY

let warned = false

/**
 * Shared browser client. Null when env is missing so local/dev never crashes.
 */
export const supabase: SupabaseClient | null = (() => {
  if (!url || !publishableKey) {
    if (!warned) {
      warned = true
      console.warn(
        'VITE_SUPABASE_URL / VITE_SUPABASE_PUBLISHABLE_KEY missing — waitlist will use the local stub.',
      )
    }
    return null
  }
  return createClient(url, publishableKey)
})()
