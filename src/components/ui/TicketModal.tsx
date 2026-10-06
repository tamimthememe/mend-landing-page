import { useEffect, useId, useRef, useState, type MouseEvent, type RefObject } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import confetti from 'canvas-confetti'
import { copy } from '../../content/copy.ts'
import { track } from '../../lib/analytics.ts'
import type { WaitlistList } from '../../lib/waitlist.ts'
import { useReducedMotion } from '../motion/useReducedMotion.ts'
import { AdmitOneTicket, TICKET_GEOMETRY } from './admit-one-ticket.tsx'

const SHARE_SITE = 'https://mendit.net'
const LINKEDIN_SHARE_URL = `${SHARE_SITE}/?utm_source=linkedin&utm_medium=ticket_share`
const COPY_LINK_URL = `${SHARE_SITE}/?utm_source=share&utm_medium=ticket_copy`
const REF_WIDTH = 741

const spring = { type: 'spring' as const, stiffness: 400, damping: 28 }
const ease = [0.22, 1, 0.36, 1] as const

function useTicketWidth(): number {
  const [width, setWidth] = useState(() =>
    typeof window === 'undefined' ? REF_WIDTH : Math.min(REF_WIDTH, window.innerWidth - 80),
  )

  useEffect(() => {
    const update = () => setWidth(Math.min(REF_WIDTH, window.innerWidth - 80))
    update()
    window.addEventListener('resize', update)
    return () => window.removeEventListener('resize', update)
  }, [])

  return width
}

function fireWaitlistConfetti() {
  const colors = ['#024868', '#046c94', '#3a8fad', '#6eb0c8', '#8fc5d6', '#ffffff']
  void confetti({
    particleCount: 100,
    spread: 70,
    origin: { y: 0.55 },
    colors,
    disableForReducedMotion: true,
  })
  window.setTimeout(() => {
    void confetti({
      particleCount: 60,
      angle: 60,
      spread: 55,
      origin: { x: 0, y: 0.65 },
      colors,
      disableForReducedMotion: true,
    })
  }, 180)
  window.setTimeout(() => {
    void confetti({
      particleCount: 60,
      angle: 120,
      spread: 55,
      origin: { x: 1, y: 0.65 },
      colors,
      disableForReducedMotion: true,
    })
  }, 280)
}

export type TicketModalProps = {
  open: boolean
  list: WaitlistList
  status: 'joined' | 'already'
  onClose: () => void
  returnFocusRef?: RefObject<HTMLElement | null>
}

export function TicketModal({ open, status, onClose, returnFocusRef }: TicketModalProps) {
  const titleId = useId()
  const dialogRef = useRef<HTMLDialogElement>(null)
  const closeRef = useRef<HTMLButtonElement>(null)
  const reduced = useReducedMotion()
  const [copied, setCopied] = useState(false)
  const width = useTicketWidth()
  const height = width / TICKET_GEOMETRY.aspect
  const ticketCopy = copy.ticket.main

  useEffect(() => {
    const dialog = dialogRef.current
    if (!dialog) return

    if (open) {
      if (!dialog.open) dialog.showModal()
      document.body.style.overflow = 'hidden'
      // Focus the dialog shell — not Done — so a focus ring isn't stuck on one button.
      dialog.focus()
      if (!reduced) fireWaitlistConfetti()
    } else if (dialog.open) {
      dialog.close()
    }

    return () => {
      document.body.style.overflow = ''
    }
  }, [open, reduced])

  useEffect(() => {
    if (!open) return
    const dialog = dialogRef.current
    if (!dialog) return

    const onDialogClose = () => {
      document.body.style.overflow = ''
      returnFocusRef?.current?.focus()
    }
    dialog.addEventListener('close', onDialogClose)
    return () => dialog.removeEventListener('close', onDialogClose)
  }, [open, returnFocusRef])

  useEffect(() => {
    if (!copied) return
    const id = window.setTimeout(() => setCopied(false), 2000)
    return () => window.clearTimeout(id)
  }, [copied])

  function handleDialogClick(event: MouseEvent<HTMLDialogElement>) {
    if (event.target === dialogRef.current) onClose()
  }

  function shareLinkedIn() {
    track('ticket_shared', { method: 'linkedin' })
    const url = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(LINKEDIN_SHARE_URL)}`
    window.open(url, '_blank', 'noopener,noreferrer')
  }

  async function copyLink() {
    track('ticket_shared', { method: 'copy' })
    try {
      await navigator.clipboard.writeText(COPY_LINK_URL)
      setCopied(true)
    } catch {
      setCopied(false)
    }
  }

  return (
    <dialog
      ref={dialogRef}
      aria-labelledby={titleId}
      tabIndex={-1}
      className="ticket-dialog fixed inset-0 z-[100] open:flex open:items-center open:justify-center"
      onClick={handleDialogClick}
      onCancel={(event) => {
        event.preventDefault()
        onClose()
      }}
    >
      <AnimatePresence>
        {open ? (
          <motion.div
            className="pointer-events-none absolute inset-0 bg-black/70 backdrop-blur-xl"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: reduced ? 0.15 : 0.2, ease }}
            aria-hidden="true"
          />
        ) : null}
      </AnimatePresence>

      <AnimatePresence>
        {open ? (
          <motion.div
            className="relative z-10 flex max-h-[min(100dvh,900px)] w-full max-w-[780px] flex-col items-center gap-5 overflow-x-hidden overflow-y-auto px-4 py-8"
            initial={reduced ? { opacity: 0 } : { opacity: 0, y: 24, scale: 0.96 }}
            animate={reduced ? { opacity: 1 } : { opacity: 1, y: 0, scale: 1 }}
            exit={reduced ? { opacity: 0 } : { opacity: 0, y: 12, scale: 0.98 }}
            transition={reduced ? { duration: 0.15, ease } : spring}
            onClick={(event) => event.stopPropagation()}
          >
            <h2 id={titleId} className="sr-only">
              {copy.ticket.dialogLabel}
            </h2>

            {status === 'already' ? (
              <p className="text-center font-heading text-small text-text-muted">
                {copy.ticket.alreadyLine}
              </p>
            ) : null}

            <div className="max-w-full overflow-hidden" style={{ width, height }}>
              <AdmitOneTicket
                name={ticketCopy.hero}
                presenter={copy.ticket.eyebrow}
                event=""
                footerLines={[...ticketCopy.bottomLines]}
                stubText={copy.ticket.stub}
                watermark="2026"
                width={width}
                tilt={reduced ? false : { scale: 1 }}
              />
            </div>

            <div className="flex flex-wrap items-center justify-center gap-3">
              <button
                type="button"
                onClick={shareLinkedIn}
                className="rounded-pill border border-border-secondary bg-surface px-4 py-2 font-heading text-small text-text outline-none transition-[background-color,border-color,transform] hover:border-text-muted hover:bg-white/10 active:scale-[0.98] active:bg-white/15 focus-visible:ring-2 focus-visible:ring-text/50"
              >
                {copy.ticket.shareLinkedIn}
              </button>
              <button
                type="button"
                onClick={() => void copyLink()}
                className="rounded-pill border border-border-secondary bg-surface px-4 py-2 font-heading text-small text-text outline-none transition-[background-color,border-color,transform] hover:border-text-muted hover:bg-white/10 active:scale-[0.98] active:bg-white/15 focus-visible:ring-2 focus-visible:ring-text/50"
              >
                {copied ? copy.ticket.linkCopied : copy.ticket.copyLink}
              </button>
              <button
                ref={closeRef}
                type="button"
                onClick={onClose}
                className="rounded-pill bg-frame px-4 py-2 font-heading text-small text-text outline-none transition-[filter,transform] hover:brightness-125 active:scale-[0.98] active:brightness-90 focus-visible:ring-2 focus-visible:ring-text/50"
              >
                {copy.ticket.done}
              </button>
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </dialog>
  )
}
