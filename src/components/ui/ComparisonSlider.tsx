import {
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
  type KeyboardEvent,
  type PointerEvent as ReactPointerEvent,
} from 'react'
import { motion, useReducedMotion as useMotionReducedMotion } from 'motion/react'
import { motionEase } from '../motion/heroSequencer.ts'
import { useInViewOnce } from '../motion/useInViewOnce.ts'
import { track } from '../../lib/analytics.ts'

type ComparisonSliderProps = {
  designSrc: string
  buildSrc: string
  designAlt: string
  buildAlt: string
  /** Intrinsic image size — locks aspect ratio + img width/height. */
  width: number
  height: number
  className?: string
}

const INITIAL = 50
const STEP = 5

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value))
}

function Chevrons() {
  return (
    <span className="flex items-center gap-0.5 text-bg" aria-hidden="true">
      <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
        <path
          d="M8.5 3.5 5 7l3.5 3.5"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
      <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
        <path
          d="M5.5 3.5 9 7l-3.5 3.5"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </span>
  )
}

export function ComparisonSlider({
  designSrc,
  buildSrc,
  designAlt,
  buildAlt,
  width,
  height,
  className = '',
}: ComparisonSliderProps) {
  const labelId = useId()
  const rootRef = useRef<HTMLDivElement>(null)
  const draggingRef = useRef(false)
  const dragStartPositionRef = useRef(INITIAL)
  const draggedTrackedRef = useRef(false)
  const [position, setPosition] = useState(INITIAL)
  const [shouldNudge, setShouldNudge] = useState(false)
  const reducedMotion = useMotionReducedMotion()
  const inView = useInViewOnce(rootRef, { threshold: 0.35, enabled: !reducedMotion })

  const markDragged = useCallback((next: number, from: number) => {
    if (draggedTrackedRef.current) return
    if (Math.abs(next - from) < 1) return
    draggedTrackedRef.current = true
    track('slider_dragged')
  }, [])

  const setFromClientX = useCallback(
    (clientX: number) => {
      const root = rootRef.current
      if (!root) return
      const rect = root.getBoundingClientRect()
      if (rect.width <= 0) return
      const next = clamp(((clientX - rect.left) / rect.width) * 100, 0, 100)
      setPosition(next)
      markDragged(next, dragStartPositionRef.current)
    },
    [markDragged],
  )

  const onPointerDown = (event: ReactPointerEvent<HTMLElement>) => {
    event.preventDefault()
    draggingRef.current = true
    dragStartPositionRef.current = position
    event.currentTarget.setPointerCapture(event.pointerId)
    setFromClientX(event.clientX)
  }

  const onPointerMove = (event: ReactPointerEvent<HTMLElement>) => {
    if (!draggingRef.current) return
    setFromClientX(event.clientX)
  }

  const onPointerUp = (event: ReactPointerEvent<HTMLElement>) => {
    draggingRef.current = false
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId)
    }
  }

  const onKeyDown = (event: KeyboardEvent<HTMLButtonElement>) => {
    let next: number | null = null
    switch (event.key) {
      case 'ArrowLeft':
      case 'ArrowDown':
        next = position - STEP
        break
      case 'ArrowRight':
      case 'ArrowUp':
        next = position + STEP
        break
      case 'Home':
        next = 0
        break
      case 'End':
        next = 100
        break
      default:
        return
    }
    event.preventDefault()
    const clamped = clamp(next, 0, 100)
    setPosition(clamped)
    markDragged(clamped, position)
  }

  useEffect(() => {
    if (!inView || shouldNudge || reducedMotion) return
    setShouldNudge(true)
  }, [inView, shouldNudge, reducedMotion])

  const rounded = Math.round(position)

  return (
    <div
      ref={rootRef}
      className={`relative w-full overflow-hidden rounded-[20px] bg-frame touch-none select-none xl:rounded-frame ${className}`}
      style={{ aspectRatio: `${width} / ${height}` }}
    >
      <p id={labelId} className="sr-only">
        Drag to compare the Figma design on the left with the live build on the right.
      </p>

      {/* Reality / build — full frame */}
      <img
        src={buildSrc}
        alt={buildAlt}
        width={width}
        height={height}
        draggable={false}
        className="absolute inset-0 h-full w-full object-cover object-left"
      />

      {/* Figma / design — clipped from the right by the divider */}
      <img
        src={designSrc}
        alt={designAlt}
        width={width}
        height={height}
        draggable={false}
        className="absolute inset-0 h-full w-full object-cover object-left"
        style={{ clipPath: `inset(0 ${100 - position}% 0 0)` }}
      />

      <motion.div
        className="pointer-events-none absolute inset-y-0 z-10"
        style={{ left: `${position}%` }}
        initial={false}
        animate={shouldNudge && !reducedMotion ? { x: [0, 16, -10, 6, 0] } : { x: 0 }}
        transition={{
          duration: 1.05,
          ease: motionEase,
          times: [0, 0.3, 0.55, 0.78, 1],
        }}
      >
        <div className="absolute inset-y-0 left-1/2 w-px -translate-x-1/2 bg-text" aria-hidden="true" />
        <button
          type="button"
          role="slider"
          aria-labelledby={labelId}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={rounded}
          aria-valuetext={`${rounded}% Figma design, ${100 - rounded}% live build`}
          className="pointer-events-auto absolute top-1/2 left-1/2 flex size-[41px] -translate-x-1/2 -translate-y-1/2 cursor-ew-resize items-center justify-center rounded-pill bg-text focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-text"
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onPointerCancel={onPointerUp}
          onKeyDown={onKeyDown}
        >
          <Chevrons />
        </button>
      </motion.div>

      {/* Drag anywhere on the frame */}
      <div
        className="absolute inset-0 z-[5] cursor-ew-resize"
        aria-hidden="true"
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
      />
    </div>
  )
}
