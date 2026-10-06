import { useEffect, useRef } from 'react'
import { inViewThreshold, useInView } from './useInViewOnce.ts'
import { useReducedMotion } from './useReducedMotion.ts'

type VideoSlotProps = {
  src: string
  webmSrc?: string
  poster?: string
  finalPoster?: string
  width: number
  height: number
  loop?: boolean
  /**
   * When set, overrides intersection-based autoplay.
   * Used by sticky How-it-Works panels that switch on scroll.
   */
  active?: boolean
  ariaLabel: string
  loading?: 'eager' | 'lazy'
  className?: string
}

export function VideoSlot({
  src,
  webmSrc,
  poster,
  finalPoster,
  width,
  height,
  loop = false,
  active,
  ariaLabel,
  loading = 'lazy',
  className,
}: VideoSlotProps) {
  const reducedMotion = useReducedMotion()
  const rootRef = useRef<HTMLDivElement>(null)
  const videoRef = useRef<HTMLVideoElement>(null)
  const inView = useInView(rootRef, {
    threshold: inViewThreshold,
    enabled: !reducedMotion && active === undefined,
  })
  const shouldPlay = active === undefined ? inView : active
  const still = finalPoster ?? poster

  useEffect(() => {
    const video = videoRef.current
    if (!video || reducedMotion) return

    if (!shouldPlay) {
      video.pause()
      return
    }

    const tryPlay = () => {
      video.play().catch(() => {
        // pause() can reject an in-flight play(), and some browsers block autoplay.
      })
    }

    // Fresh start whenever this slot becomes the active step.
    video.currentTime = 0

    if (video.readyState >= 2) {
      tryPlay()
      return
    }

    video.addEventListener('canplay', tryPlay, { once: true })
    video.load()
    return () => {
      video.removeEventListener('canplay', tryPlay)
    }
  }, [shouldPlay, reducedMotion])

  if (reducedMotion && still) {
    return (
      <img
        src={still}
        alt={ariaLabel}
        width={width}
        height={height}
        loading={loading}
        className={className}
      />
    )
  }

  return (
    <div ref={rootRef} className={className}>
      <video
        ref={videoRef}
        muted
        playsInline
        preload="auto"
        poster={poster}
        width={width}
        height={height}
        loop={loop}
        aria-label={ariaLabel}
        className="h-full w-full object-cover"
      >
        {webmSrc ? <source src={webmSrc} type="video/webm" /> : null}
        <source src={src} type="video/mp4" />
      </video>
    </div>
  )
}
