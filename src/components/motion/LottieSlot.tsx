import { Lottie, type LottieHandle } from 'lottie-react'
import { useEffect, useImperativeHandle, useMemo, useRef, type Ref } from 'react'
import { useInViewOnce } from './useInViewOnce.ts'
import { useReducedMotion } from './useReducedMotion.ts'

export type LottieSlotHandle = {
  play: () => void
  reset: () => void
}

type LottieSlotProps = {
  ref?: Ref<LottieSlotHandle>
  animationData: object
  playOnView?: boolean
  loop?: boolean
  /** Fill the parent box instead of using the animation's intrinsic aspect ratio. */
  fill?: boolean
  onComplete?: () => void
  onPlayStart?: () => void
  onReady?: () => void
  ariaLabel: string
}

function frameAspectRatio(animationData: object): string | undefined {
  const frame = animationData as { w?: unknown; h?: unknown }
  if (typeof frame.w !== 'number' || typeof frame.h !== 'number') return undefined
  if (frame.w <= 0 || frame.h <= 0) return undefined
  return `${frame.w} / ${frame.h}`
}

function restOnFirstFrame(handle: LottieHandle | null) {
  handle?.stop()
}

function restOnLastFrame(handle: LottieHandle | null) {
  handle?.pause()
  handle?.seek({ percent: 100 })
}

function requestPlay(
  handle: LottieHandle | null,
  reduced: boolean,
  pendingPlay: { current: boolean },
  onPlayStart: { current?: () => void },
  onComplete: { current?: () => void },
) {
  if (reduced) {
    pendingPlay.current = false
    restOnLastFrame(handle)
    onPlayStart.current?.()
    onComplete.current?.()
    return
  }
  if (!handle?.animationItem) {
    pendingPlay.current = true
    return
  }
  pendingPlay.current = false
  // Force a clean restart so looped sequences always get a fresh complete event.
  handle.stop()
  handle.play()
  onPlayStart.current?.()
}

export function LottieSlot({
  ref,
  animationData,
  playOnView = true,
  loop = false,
  fill = false,
  onComplete,
  onPlayStart,
  onReady,
  ariaLabel,
}: LottieSlotProps) {
  const lottieRef = useRef<LottieHandle>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const reducedMotion = useReducedMotion()
  const inView = useInViewOnce(containerRef, { enabled: playOnView && !reducedMotion })
  const reducedRef = useRef(reducedMotion)
  const loopRef = useRef(loop)
  const onCompleteRef = useRef(onComplete)
  const onPlayStartRef = useRef(onPlayStart)
  const onReadyRef = useRef(onReady)
  const pendingPlayRef = useRef(false)
  const aspectRatio = fill ? undefined : frameAspectRatio(animationData)

  useEffect(() => {
    reducedRef.current = reducedMotion
    loopRef.current = loop
    onCompleteRef.current = onComplete
    onPlayStartRef.current = onPlayStart
    onReadyRef.current = onReady
  }, [reducedMotion, loop, onComplete, onPlayStart, onReady])

  useImperativeHandle(ref, () => ({
    play() {
      requestPlay(
        lottieRef.current,
        reducedRef.current,
        pendingPlayRef,
        onPlayStartRef,
        onCompleteRef,
      )
    },
    reset() {
      pendingPlayRef.current = false
      if (reducedRef.current) {
        restOnLastFrame(lottieRef.current)
        return
      }
      restOnFirstFrame(lottieRef.current)
    },
  }))

  const subscriptions = useMemo(
    () => ({
      ready() {
        const handle = lottieRef.current
        if (reducedRef.current) {
          pendingPlayRef.current = false
          restOnLastFrame(handle)
          onReadyRef.current?.()
          return
        }
        if (pendingPlayRef.current) {
          pendingPlayRef.current = false
          handle?.play()
          onPlayStartRef.current?.()
        } else {
          restOnFirstFrame(handle)
        }
        onReadyRef.current?.()
      },
      complete() {
        if (!loopRef.current) restOnLastFrame(lottieRef.current)
        onCompleteRef.current?.()
      },
    }),
    [],
  )

  useEffect(() => {
    if (!playOnView || !inView) return
    requestPlay(
      lottieRef.current,
      reducedRef.current,
      pendingPlayRef,
      onPlayStartRef,
      onCompleteRef,
    )
  }, [playOnView, inView])

  useEffect(() => {
    if (!reducedMotion) return
    const handle = lottieRef.current
    handle?.pause()
    restOnLastFrame(handle)
  }, [reducedMotion])

  return (
    <div
      ref={containerRef}
      role="img"
      aria-label={ariaLabel}
      className={fill ? 'relative h-full w-full' : 'relative w-full'}
      style={aspectRatio ? { aspectRatio } : undefined}
    >
      <Lottie
        lottieRef={lottieRef}
        src={animationData}
        loop={loop}
        autoplay={false}
        aria-hidden="true"
        className="absolute inset-0 h-full w-full"
        subscriptions={subscriptions}
      />
    </div>
  )
}
