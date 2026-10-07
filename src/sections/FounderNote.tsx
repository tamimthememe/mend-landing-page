import {
  useEffect,
  useId,
  useRef,
  useState,
  type KeyboardEvent,
} from 'react'
import { animate, motion, useMotionValue } from 'motion/react'
import { copy } from '../content/copy.ts'
import { Container } from '../components/ui/Container.tsx'
import { useReducedMotion } from '../components/motion/useReducedMotion.ts'
import { useSectionView } from '../lib/useSectionView.ts'
import founderPhoto from '../assets/images/founder.png'
import cofounderPhoto from '../assets/images/cofounder-ss.jpeg'

const EASE = [0.22, 1, 0.36, 1] as const
const TRANSITION_MS = 300
const DRAG_THRESHOLD = 48
const PEEK = 0
const GAP = 16

const arrowBtnClass =
  'mt-1 flex size-10 shrink-0 cursor-pointer items-center justify-center self-center rounded-pill border border-border-secondary bg-surface-2 text-text-muted outline-none transition-[background-color,border-color,color,transform,opacity] duration-200 hover:border-text-muted hover:bg-white/10 hover:text-text active:scale-[0.96] active:bg-white/15 active:text-text focus-visible:ring-2 focus-visible:ring-text-accent focus-visible:ring-offset-2 focus-visible:ring-offset-surface disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-35 disabled:hover:border-border-secondary disabled:hover:bg-surface-2 disabled:hover:text-text-muted'

type Note = (typeof copy.founder.notes)[number]

const slides: Array<Note & { photo: string }> = [
  { ...copy.founder.notes[0], photo: founderPhoto },
  { ...copy.founder.notes[1], photo: cofounderPhoto },
]

function ChevronLeft({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      width="20"
      height="20"
      viewBox="0 0 20 20"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M12.5 4.5 7 10l5.5 5.5"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function ChevronRight({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      width="20"
      height="20"
      viewBox="0 0 20 20"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M7.5 4.5 13 10l-5.5 5.5"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function FounderSlide({
  note,
  labelledBy,
  active,
}: {
  note: Note & { photo: string }
  labelledBy: string
  active: boolean
}) {
  return (
    <article
      aria-labelledby={labelledBy}
      aria-hidden={!active}
      className="flex h-full flex-col items-center gap-6 text-center xl:gap-8"
    >
      <blockquote className="w-full">
        <p className="font-heading text-[18px] leading-snug font-light tracking-[-0.48px] text-text sm:text-[22px] md:text-[32px] md:leading-[1.35]">
          “{note.quote}”
        </p>
      </blockquote>
      <div className="flex items-center gap-3 text-left sm:gap-4">
        <img
          src={note.photo}
          alt={`${note.name}, ${note.title}`}
          width={72}
          height={72}
          loading="lazy"
          className="size-16 rounded-pill border-[1.8px] border-border object-cover sm:size-20"
        />
        <div>
          <p
            id={labelledBy}
            className="font-heading text-[18px] tracking-[-0.48px] text-text sm:text-[28px]"
          >
            {note.name}
          </p>
          <p className="font-heading text-[14px] tracking-[-0.48px] text-text-muted sm:text-body">
            {note.title}
          </p>
        </div>
      </div>
    </article>
  )
}

export function FounderNote() {
  const sectionRef = useSectionView('why-mend')
  const reduced = useReducedMotion()
  const labelId = useId()
  const viewportRef = useRef<HTMLDivElement>(null)
  const [index, setIndex] = useState(0)
  const [viewportWidth, setViewportWidth] = useState(0)
  const x = useMotionValue(0)
  const dragging = useRef(false)

  const slideWidth =
    viewportWidth > 0 ? Math.max(viewportWidth - PEEK, viewportWidth * 0.88) : 0
  const stride = slideWidth + GAP

  useEffect(() => {
    const el = viewportRef.current
    if (!el) return

    const update = () => {
      setViewportWidth(el.clientWidth)
    }
    update()
    const observer = new ResizeObserver(update)
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    if (dragging.current || slideWidth === 0) return
    const target = -index * stride
    if (reduced) {
      x.set(target)
      return
    }
    const controls = animate(x, target, {
      duration: TRANSITION_MS / 1000,
      ease: EASE,
    })
    return () => controls.stop()
  }, [index, reduced, slideWidth, stride, x])

  const goTo = (nextIndex: number) => {
    setIndex(Math.max(0, Math.min(slides.length - 1, nextIndex)))
  }

  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key === 'ArrowLeft') {
      event.preventDefault()
      goTo(index - 1)
    } else if (event.key === 'ArrowRight') {
      event.preventDefault()
      goTo(index + 1)
    } else if (event.key === 'Home') {
      event.preventDefault()
      goTo(0)
    } else if (event.key === 'End') {
      event.preventDefault()
      goTo(slides.length - 1)
    }
  }

  return (
    <section
      id="why-mend"
      ref={sectionRef}
      aria-labelledby="why-mend-heading"
      className="bg-surface py-10 xl:py-16"
    >
      <Container className="flex flex-col items-center gap-6 text-center xl:gap-16">
        <h2
          id="why-mend-heading"
          className="max-w-[591px] font-heading text-[28px] leading-[1.15] tracking-[-0.48px] text-text sm:text-[32px] md:text-heading"
        >
          {copy.founder.heading}
        </h2>

        <div
          role="region"
          aria-roledescription="carousel"
          aria-label="Founder notes"
          tabIndex={0}
          onKeyDown={onKeyDown}
          className="flex w-full max-w-[960px] flex-col items-center gap-6 outline-none focus-visible:ring-2 focus-visible:ring-text-accent focus-visible:ring-offset-2 focus-visible:ring-offset-surface xl:max-w-[1100px] xl:gap-8"
        >
          <div className="flex w-full items-stretch gap-2 sm:gap-3">
            <button
              type="button"
              aria-label="Previous founder note"
              disabled={index === 0}
              onClick={() => goTo(index - 1)}
              className={arrowBtnClass}
            >
              <ChevronLeft />
            </button>

            <div ref={viewportRef} className="relative min-w-0 flex-1 overflow-hidden">
              <motion.div
                className="flex items-start"
                style={{ x, gap: GAP, touchAction: 'pan-y' }}
                drag={reduced || slideWidth === 0 ? false : 'x'}
                dragConstraints={{
                  left: -((slides.length - 1) * stride),
                  right: 0,
                }}
                dragElastic={0.12}
                onDragStart={() => {
                  dragging.current = true
                }}
                onDragEnd={(_, info) => {
                  dragging.current = false
                  const offset = info.offset.x
                  const velocity = info.velocity.x
                  if (offset < -DRAG_THRESHOLD || velocity < -400) {
                    goTo(index + 1)
                  } else if (offset > DRAG_THRESHOLD || velocity > 400) {
                    goTo(index - 1)
                  } else {
                    goTo(index)
                  }
                }}
              >
                {slides.map((note, i) => (
                  <div
                    key={note.name}
                    className="shrink-0"
                    style={{
                      width: slideWidth > 0 ? slideWidth : '100%',
                    }}
                  >
                    <FounderSlide
                      note={note}
                      labelledBy={`${labelId}-slide-${i}`}
                      active={i === index}
                    />
                  </div>
                ))}
              </motion.div>
            </div>

            <button
              type="button"
              aria-label="Next founder note"
              disabled={index === slides.length - 1}
              onClick={() => goTo(index + 1)}
              className={arrowBtnClass}
            >
              <ChevronRight />
            </button>
          </div>

          <div
            role="tablist"
            aria-label="Founder note slides"
            className="flex items-center gap-2"
          >
            {slides.map((note, i) => {
              const selected = i === index
              return (
                <button
                  key={note.name}
                  type="button"
                  role="tab"
                  aria-label={`Show note from ${note.name}`}
                  aria-selected={selected}
                  aria-controls={`${labelId}-slide-${i}`}
                  onClick={() => goTo(i)}
                  className={`h-2.5 cursor-pointer rounded-pill transition-[width,background-color] duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-text-accent focus-visible:ring-offset-2 focus-visible:ring-offset-surface ${
                    selected
                      ? 'w-6 bg-text'
                      : 'w-2.5 bg-border-secondary hover:bg-text-tertiary'
                  }`}
                />
              )
            })}
          </div>

          <p className="sr-only" aria-live="polite">
            Note {index + 1} of {slides.length}: {slides[index].name}
          </p>
        </div>
      </Container>
    </section>
  )
}
