import { useEffect, useRef, useState } from 'react'
import { loadDotLottie } from './dotLottie.ts'
import { useHeroLottieSequence, type HeroLottieId } from './HeroLottieSequence.tsx'
import { LottieSlot, type LottieSlotHandle } from './LottieSlot.tsx'

type HeroLottieProps = {
  id?: HeroLottieId
  src: string
  ariaLabel: string
  playOnView?: boolean
}

type LottieOpacity = { a?: number; k?: unknown; x?: string }
type LottieLayer = {
  nm?: string
  ks?: { o?: LottieOpacity }
}

/**
 * top-right-only: button content is invisible on frame 0 because
 * 1) Null 1 fades 60→100 (other hero Lotties keep Null at 100)
 * 2) every content layer opacity is an expression linked to missing "Null 2"
 *    which evaluates to 0 in the player
 * Strip the broken expressions and hold Null at 100. Cursor Frame fade stays.
 */
function showTopRightIdleButton(animationData: object): object {
  const data = animationData as { layers?: LottieLayer[] }
  for (const layer of data.layers ?? []) {
    if (!layer.ks?.o) continue
    if (layer.nm === 'Null 1') {
      layer.ks.o = { a: 0, k: 100 }
      continue
    }
    // Content layers (not the cursor Frame precomp): drop Null 2 expression.
    if (layer.nm?.startsWith('Frame 2147224559')) continue
    if (typeof layer.ks.o.x === 'string') {
      delete layer.ks.o.x
      layer.ks.o.a = 0
      layer.ks.o.k = 100
    }
  }
  return animationData
}

export function HeroLottie({ id, src, ariaLabel, playOnView }: HeroLottieProps) {
  const sequence = useHeroLottieSequence()
  const lottieRef = useRef<LottieSlotHandle>(null)
  const [animationData, setAnimationData] = useState<object | null>(null)
  const sequenced = Boolean(sequence && id)
  const shouldPlayOnView = playOnView ?? !sequenced

  useEffect(() => {
    const controller = new AbortController()
    loadDotLottie(src, controller.signal)
      .then((data) => {
        if (controller.signal.aborted) return
        setAnimationData(id === 'top-right' ? showTopRightIdleButton(data) : data)
      })
      .catch((error: unknown) => {
        if (error instanceof DOMException && error.name === 'AbortError') return
        console.warn(`Hero Lottie did not load from ${src}.`, error)
      })
    return () => controller.abort()
  }, [id, src])

  const register = sequence?.register
  const markReady = sequence?.markReady
  const notifyComplete = sequence?.notifyComplete

  useEffect(() => {
    if (!register || !id) return
    return register(id, {
      play: () => lottieRef.current?.play(),
      reset: () => lottieRef.current?.reset(),
    })
  }, [id, register])

  return (
    <div className="h-full w-full">
      {animationData ? (
        <LottieSlot
          ref={lottieRef}
          animationData={animationData}
          ariaLabel={ariaLabel}
          playOnView={shouldPlayOnView}
          fill
          onReady={() => {
            if (markReady && id) markReady(id)
          }}
          onComplete={() => {
            if (notifyComplete && id) notifyComplete(id)
          }}
        />
      ) : null}
    </div>
  )
}
