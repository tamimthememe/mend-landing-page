import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type ReactNode,
  type RefObject,
} from 'react'
import { heroDimOpacity, motionEase } from './heroSequencer.ts'
import { useInView } from './useInViewOnce.ts'
import { useReducedMotion } from './useReducedMotion.ts'

export const heroLottieOrder = [
  'top-left',
  'top-right',
  'center-left',
  'bottom-right',
  'bottom-left',
] as const

export type HeroLottieId = (typeof heroLottieOrder)[number]

const breakMs = 1000
const restartDelayMs = 2000
const fadeMs = 500
const playTimeoutMs = 12_000
const activeOpacity = 1

type SlotControls = {
  play: () => void
  reset: () => void
}

type HeroLottieSequenceValue = {
  sequenced: boolean
  activeId: HeroLottieId | null
  register: (id: HeroLottieId, controls: SlotControls) => () => void
  markReady: (id: HeroLottieId) => void
  notifyComplete: (id: HeroLottieId) => void
}

const HeroLottieSequenceContext = createContext<HeroLottieSequenceValue | null>(null)

function wait(ms: number, signal: AbortSignal) {
  return new Promise<void>((resolve, reject) => {
    if (signal.aborted) {
      reject(new DOMException('Aborted', 'AbortError'))
      return
    }
    const timer = window.setTimeout(() => {
      signal.removeEventListener('abort', onAbort)
      resolve()
    }, ms)
    const onAbort = () => {
      window.clearTimeout(timer)
      reject(new DOMException('Aborted', 'AbortError'))
    }
    signal.addEventListener('abort', onAbort, { once: true })
  })
}

export function HeroLottieSequenceProvider({
  layerRef,
  children,
}: {
  layerRef: RefObject<HTMLElement | null>
  children: ReactNode
}) {
  const reducedMotion = useReducedMotion()
  const inView = useInView(layerRef, { enabled: !reducedMotion, threshold: 0.2 })
  const [activeId, setActiveId] = useState<HeroLottieId | null>(null)
  const slots = useRef(new Map<HeroLottieId, Set<SlotControls>>())
  const completeWaiters = useRef(new Map<HeroLottieId, Set<() => void>>())
  const readyIds = useRef(new Set<HeroLottieId>())
  const [allReady, setAllReady] = useState(false)

  const register = useCallback((id: HeroLottieId, controls: SlotControls) => {
    let bucket = slots.current.get(id)
    if (!bucket) {
      bucket = new Set()
      slots.current.set(id, bucket)
    }
    bucket.add(controls)
    return () => {
      bucket?.delete(controls)
      if (bucket && bucket.size === 0) {
        slots.current.delete(id)
      }
    }
  }, [])

  const markReady = useCallback((id: HeroLottieId) => {
    if (readyIds.current.has(id)) return
    readyIds.current.add(id)
    if (heroLottieOrder.every((slotId) => readyIds.current.has(slotId))) {
      setAllReady(true)
    }
  }, [])

  const notifyComplete = useCallback((id: HeroLottieId) => {
    const waiters = completeWaiters.current.get(id)
    if (!waiters) return
    for (const waiter of [...waiters]) waiter()
    waiters.clear()
  }, [])

  useEffect(() => {
    if (reducedMotion || !inView || !allReady) return

    const controller = new AbortController()
    const { signal } = controller

    const resetAll = () => {
      for (const id of heroLottieOrder) {
        for (const controls of slots.current.get(id) ?? []) controls.reset()
      }
    }

    const playSlot = (id: HeroLottieId) =>
      new Promise<void>((resolve, reject) => {
        if (signal.aborted) {
          reject(new DOMException('Aborted', 'AbortError'))
          return
        }
        let settled = false
        let timeout = 0
        const finish = () => {
          if (settled) return
          settled = true
          window.clearTimeout(timeout)
          signal.removeEventListener('abort', onAbort)
          resolve()
        }
        const onAbort = () => {
          if (settled) return
          settled = true
          window.clearTimeout(timeout)
          reject(new DOMException('Aborted', 'AbortError'))
        }
        signal.addEventListener('abort', onAbort, { once: true })

        let waiters = completeWaiters.current.get(id)
        if (!waiters) {
          waiters = new Set()
          completeWaiters.current.set(id, waiters)
        }
        waiters.add(finish)

        const players = slots.current.get(id)
        if (!players || players.size === 0) {
          finish()
          return
        }
        for (const controls of players) controls.play()

        // Missed complete events must not freeze the whole loop.
        timeout = window.setTimeout(finish, playTimeoutMs)
      })

    const run = async () => {
      try {
        while (!signal.aborted) {
          setActiveId(null)
          resetAll()
          // Let reset settle on frame 0 before the next play().
          await wait(32, signal)

          for (let index = 0; index < heroLottieOrder.length; index += 1) {
            const id = heroLottieOrder[index]
            if (!id) continue
            setActiveId(id)
            // Cross-fade in before playback so the highlight is visible first.
            await wait(fadeMs, signal)
            await playSlot(id)
            setActiveId(null)
            if (index < heroLottieOrder.length - 1) await wait(breakMs, signal)
          }

          await wait(restartDelayMs, signal)
          resetAll()
          await wait(32, signal)
        }
      } catch (error) {
        if (error instanceof DOMException && error.name === 'AbortError') return
        console.warn('Hero Lottie sequence stopped unexpectedly.', error)
      }
    }

    void run()
    return () => {
      controller.abort()
      setActiveId(null)
    }
  }, [allReady, inView, reducedMotion])

  const sequenceValue = useMemo<HeroLottieSequenceValue>(
    () => ({
      sequenced: true,
      activeId,
      register,
      markReady,
      notifyComplete,
    }),
    [activeId, markReady, notifyComplete, register],
  )

  return (
    <HeroLottieSequenceContext.Provider value={sequenceValue}>
      {children}
    </HeroLottieSequenceContext.Provider>
  )
}

export function useHeroLottieSequence() {
  return useContext(HeroLottieSequenceContext)
}

/** Per-widget opacity: idle 70%, full on its sequence turn. */
export function useHeroLottieSlotStyle(id: HeroLottieId): CSSProperties {
  const sequence = useHeroLottieSequence()
  const reducedMotion = useReducedMotion()
  const active = sequence?.activeId === id
  const opacity = reducedMotion || !sequence ? activeOpacity : active ? activeOpacity : heroDimOpacity

  return {
    opacity,
    transition: `opacity ${fadeMs}ms cubic-bezier(${motionEase.join(',')})`,
    // Lift the active widget above siblings (helps top-right clear neighbors).
    zIndex: active ? 2 : 1,
  }
}

/** @deprecated Whole-layer fade removed — slots handle their own opacity. */
export function useHeroLottieLayerStyle(): CSSProperties | undefined {
  return undefined
}
