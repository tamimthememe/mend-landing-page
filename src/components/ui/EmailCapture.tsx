import { useId, useRef, useState, type FormEvent } from 'react'
import { copy } from '../../content/copy.ts'
import { track } from '../../lib/analytics.ts'
import { markJoined, useJoined } from '../../lib/joined.ts'
import { joinWaitlist, type WaitlistList, type WaitlistSource } from '../../lib/waitlist.ts'
import { Button } from './Button.tsx'
import { TicketModal } from './TicketModal.tsx'

type CaptureStatus = 'idle' | 'submitting' | 'error'

export type EmailCaptureProps = {
  list: WaitlistList
  source: WaitlistSource
  placeholder: string
  buttonLabel: string
  id?: string
  className?: string
  variant?: 'default' | 'compact'
}

const errorCopy = {
  invalid_email: copy.emailCapture.invalidEmail,
  network: copy.emailCapture.networkError,
  unknown: copy.emailCapture.unknownError,
} as const

function Arrow() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" aria-hidden="true" className="shrink-0">
      <path
        d="M2.5 8h10M8.5 4.5 12.5 8l-4 3.5"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

const focusedSources = new Set<WaitlistSource>()

export function EmailCapture({
  list,
  source,
  placeholder,
  buttonLabel,
  id,
  className = '',
}: EmailCaptureProps) {
  const generatedId = useId()
  const inputId = id ?? generatedId
  const errorId = `${inputId}-error`
  const inputRef = useRef<HTMLInputElement>(null)
  const viewPassRef = useRef<HTMLButtonElement>(null)
  const [email, setEmail] = useState('')
  const [honeypot, setHoneypot] = useState('')
  const [status, setStatus] = useState<CaptureStatus>('idle')
  const [error, setError] = useState<keyof typeof errorCopy | null>(null)
  const [ticketOpen, setTicketOpen] = useState(false)
  const [ticketStatus, setTicketStatus] = useState<'joined' | 'already'>('joined')
  const submittingRef = useRef(false)
  const joined = useJoined(list)

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (submittingRef.current) return

    if (honeypot.trim()) {
      setTicketStatus('joined')
      setTicketOpen(true)
      markJoined(list)
      return
    }

    const nextEmail = email.trim()
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(nextEmail)) {
      setError('invalid_email')
      setStatus('error')
      track('waitlist_error', { source, error: 'invalid_email' })
      return
    }

    submittingRef.current = true
    setStatus('submitting')
    setError(null)
    track('waitlist_submitted', { source, list })

    const result = await joinWaitlist({ email: nextEmail, list, source })

    if (!result.ok) {
      submittingRef.current = false
      setError(result.error)
      setStatus('error')
      track('waitlist_error', { source, error: result.error })
      return
    }

    markJoined(list)
    setTicketStatus(result.status)
    setTicketOpen(true)
    setStatus('idle')
    submittingRef.current = false
    track('waitlist_joined', { source, list, status: result.status })
  }

  const modal = (
    <TicketModal
      open={ticketOpen}
      list={list}
      status={ticketStatus}
      onClose={() => setTicketOpen(false)}
      returnFocusRef={joined ? viewPassRef : inputRef}
    />
  )

  if (joined) {
    return (
      <div className={`flex flex-col items-center gap-2 ${className}`}>
        <div className="inline-flex items-center gap-3 rounded-pill border border-border bg-surface/50 px-4 py-2.5">
          <p role="status" className="font-heading text-small text-text">
            {copy.emailCapture.success}
          </p>
          <button
            ref={viewPassRef}
            type="button"
            className="font-heading text-small text-fixed underline-offset-2 hover:underline focus-visible:ring-2 focus-visible:ring-frame focus-visible:outline-none"
            onClick={() => {
              setTicketStatus('already')
              setTicketOpen(true)
            }}
          >
            {copy.emailCapture.viewPass}
          </button>
        </div>
        {modal}
      </div>
    )
  }

  const submitting = status === 'submitting'

  return (
    <>
      <form onSubmit={onSubmit} noValidate className={`flex w-full flex-col items-center gap-2.5 ${className}`}>
        <div className="relative flex w-full items-center gap-2 rounded-pill border border-border-secondary bg-surface/50 py-2 pr-2 pl-4 transition-[border-color,box-shadow] focus-within:border-frame focus-within:ring-2 focus-within:ring-frame/40 sm:gap-3 sm:py-3 sm:pr-3 sm:pl-6">
          <input
            ref={inputRef}
            id={inputId}
            name="email"
            type="email"
            inputMode="email"
            autoComplete="email"
            placeholder={placeholder}
            value={email}
            disabled={submitting}
            aria-invalid={status === 'error' ? true : undefined}
            aria-describedby={status === 'error' ? errorId : undefined}
            aria-label="Email address"
            className="min-w-0 flex-1 bg-transparent font-sans text-[16px] font-light text-text outline-none focus:outline-none focus-visible:outline-none placeholder:text-text-tertiary disabled:opacity-60 sm:text-body"
            onFocus={() => {
              if (focusedSources.has(source)) return
              focusedSources.add(source)
              track('waitlist_field_focused', { source })
            }}
            onChange={(event) => {
              setEmail(event.target.value)
              if (status === 'error') {
                setStatus('idle')
                setError(null)
              }
            }}
          />
          <input
            type="text"
            name="company"
            value={honeypot}
            tabIndex={-1}
            autoComplete="off"
            aria-hidden="true"
            className="pointer-events-none absolute top-0 left-0 h-px w-px -translate-x-[9999px] overflow-hidden opacity-0"
            onChange={(event) => setHoneypot(event.target.value)}
          />
          <Button
            type="submit"
            disabled={submitting}
            aria-busy={submitting || undefined}
            className="inline-flex h-8 shrink-0 items-center gap-1.5 rounded-pill bg-frame px-3 font-sans text-[14px] font-normal text-text disabled:opacity-70 sm:h-9 sm:gap-2 sm:px-4 sm:text-small"
          >
            {buttonLabel}
            {submitting ? (
              <progress aria-hidden="true" className="h-4 w-4" />
            ) : (
              <span className="hidden sm:inline">
                <Arrow />
              </span>
            )}
          </Button>
        </div>
        {status === 'error' && error ? (
          <p id={errorId} role="alert" className="text-center font-heading text-small text-issue">
            {errorCopy[error]}
          </p>
        ) : null}
      </form>
      {modal}
    </>
  )
}
