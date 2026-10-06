import posthog from 'posthog-js'

export type AnalyticsEvent =
  | 'section_viewed'
  | 'waitlist_field_focused'
  | 'waitlist_submitted'
  | 'waitlist_joined'
  | 'waitlist_error'
  | 'ticket_shared'
  | 'nav_clicked'
  | 'slider_dragged'

let initialized = false

export function initAnalytics(): void {
  const key = import.meta.env.VITE_POSTHOG_KEY
  if (!key || initialized) return

  const apiHost = import.meta.env.VITE_POSTHOG_HOST || 'https://us.i.posthog.com'

  posthog.init(key, {
    api_host: apiHost,
    person_profiles: 'identified_only',
    capture_pageview: true,
    capture_pageleave: true,
    autocapture: true,
    session_recording: { maskAllInputs: true },
  })
  // Expose for console debugging: window.posthog.capture('section_viewed', { section: 'test' })
  window.posthog = posthog
  initialized = true
}

export function track(event: AnalyticsEvent, props?: Record<string, unknown>): void {
  if (!import.meta.env.VITE_POSTHOG_KEY) return
  try {
    posthog.capture(event, props)
  } catch {
    // never break UX for analytics
  }
}
