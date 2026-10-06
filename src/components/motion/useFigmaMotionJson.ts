import { useEffect, type RefObject } from 'react'
import { applyMotionPose, motionDuration, sampleMotion, type FigmaMotionFile } from './figmaMotionJson.ts'
import { useReducedMotion } from './useReducedMotion.ts'

function paint(root: HTMLElement, file: FigmaMotionFile, timeMs: number) {
  const poses = sampleMotion(file, timeMs)
  for (const [nodeId, pose] of poses) {
    const element = root.querySelector(`[data-node-id="${nodeId}"]`)
    if (element instanceof HTMLElement) applyMotionPose(element, pose)
  }
}

export function useFigmaMotionJson(rootRef: RefObject<HTMLElement | null>, src: string) {
  const reducedMotion = useReducedMotion()

  useEffect(() => {
    const root = rootRef.current
    if (!root) return

    const controller = new AbortController()
    let frame = 0

    fetch(src, { signal: controller.signal })
      .then((response) => {
        if (!response.ok) throw new Error(`Failed to load ${src}`)
        return response.json() as Promise<FigmaMotionFile>
      })
      .then((file) => {
        if (controller.signal.aborted || !rootRef.current) return
        const duration = motionDuration(file)
        if (reducedMotion) {
          paint(rootRef.current, file, duration)
          return
        }
        const started = performance.now()
        const tick = (now: number) => {
          const current = rootRef.current
          if (!current) return
          const elapsed = now - started
          paint(current, file, Math.min(elapsed, duration))
          if (elapsed < duration) frame = requestAnimationFrame(tick)
        }
        frame = requestAnimationFrame(tick)
      })
      .catch((error: unknown) => {
        if (error instanceof DOMException && error.name === 'AbortError') return
        console.warn(`Hero motion JSON did not load from ${src}.`, error)
      })

    return () => {
      controller.abort()
      cancelAnimationFrame(frame)
    }
  }, [reducedMotion, rootRef, src])
}
