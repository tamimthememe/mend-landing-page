import { useEffect, useRef, useState } from 'react'
import { copy } from '../content/copy.ts'
import logo from '../assets/icons/logo.svg'
import { Button } from '../components/ui/Button.tsx'
import { TicketModal } from '../components/ui/TicketModal.tsx'
import { track } from '../lib/analytics.ts'
import { useJoined } from '../lib/joined.ts'

const mobileNavQuery = '(max-width: 767px)'
const topBgOpacity = 0.4
const scrolledBgOpacity = 1
/** Scroll distance over which the nav bg eases from 40% → 100%. */
const fadeRangePx = 80

function scrollToWaitlist() {
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  document.getElementById('waitlist')?.scrollIntoView({
    behavior: reduced ? 'auto' : 'smooth',
  })
}

function focusHeroEmail() {
  const field = document.getElementById('hero-email')
  if (!(field instanceof HTMLInputElement)) {
    scrollToWaitlist()
    return
  }
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  field.focus({ preventScroll: true })
  field.scrollIntoView({
    block: 'center',
    behavior: reduced ? 'auto' : 'smooth',
  })
}

function navBgOpacityForScroll(scrollY: number) {
  const t = Math.min(1, Math.max(0, scrollY / fadeRangePx))
  return topBgOpacity + (scrolledBgOpacity - topBgOpacity) * t
}

export function Nav() {
  const [bgOpacity, setBgOpacity] = useState(topBgOpacity)
  const [ticketOpen, setTicketOpen] = useState(false)
  const viewPassRef = useRef<HTMLButtonElement>(null)
  const joined = useJoined('main')

  useEffect(() => {
    const update = () => setBgOpacity(navBgOpacityForScroll(window.scrollY))
    update()
    window.addEventListener('scroll', update, { passive: true })
    return () => window.removeEventListener('scroll', update)
  }, [])

  return (
    <>
      <header className="fixed inset-x-0 top-0 z-50">
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-black transition-opacity duration-300 ease-out motion-reduce:transition-none"
          style={{ opacity: bgOpacity }}
        />
        <nav
          aria-label="Primary"
          className="relative mx-auto w-full max-w-[1920px] px-4 md:px-12 xl:px-page"
        >
          <div className="flex h-16 items-center justify-between md:h-[72px]">
            <a
              href="#top"
              className="relative z-10 shrink-0"
              onClick={() => track('nav_clicked', { target: '#top' })}
            >
              <img src={logo} alt={copy.nav.wordmark} width={84} height={24} />
            </a>
            {joined ? (
              <Button
                ref={viewPassRef}
                type="button"
                className="relative z-10 inline-flex h-8 shrink-0 items-center rounded-pill bg-fixed px-3 font-heading text-[14px] font-normal leading-5 text-text [font-weight:400] transition-[filter,transform] hover:brightness-110 active:scale-[0.98] active:brightness-95 focus-visible:ring-2 focus-visible:ring-fixed focus-visible:outline-none md:h-10 md:px-[15px] md:text-[16px]"
                onClick={() => {
                  track('nav_clicked', { target: 'view-pass' })
                  setTicketOpen(true)
                }}
              >
                {copy.emailCapture.viewPass}
              </Button>
            ) : (
              <Button
                type="button"
                className="relative z-10 inline-flex h-8 shrink-0 items-center rounded-pill bg-frame px-3 font-heading text-[14px] font-normal leading-5 text-text [font-weight:400] transition-[filter,transform] hover:brightness-110 active:scale-[0.98] active:brightness-95 focus-visible:ring-2 focus-visible:ring-frame focus-visible:outline-none md:h-10 md:px-[15px] md:text-[16px]"
                onClick={() => {
                  if (window.matchMedia(mobileNavQuery).matches) {
                    scrollToWaitlist()
                    return
                  }
                  focusHeroEmail()
                }}
              >
                {copy.nav.button}
              </Button>
            )}
          </div>
          <ul className="hidden items-center justify-center gap-6 pb-3 lg:absolute lg:top-1/2 lg:left-1/2 lg:flex lg:-translate-x-1/2 lg:-translate-y-1/2 lg:gap-[30px] lg:pb-0">
            {copy.nav.links.map((link) => (
              <li key={link.href}>
                <a
                  href={link.href}
                  className="font-heading text-[16px] font-normal leading-6 text-text-nav opacity-80 hover:opacity-100"
                  onClick={() => track('nav_clicked', { target: link.href })}
                >
                  {link.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>
      </header>
      <TicketModal
        open={ticketOpen}
        list="main"
        status="already"
        onClose={() => setTicketOpen(false)}
        returnFocusRef={viewPassRef}
      />
    </>
  )
}
