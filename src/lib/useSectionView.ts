import { useEffect, useRef, type RefObject } from 'react'
import { track } from './analytics.ts'

/**
 * Fires `section_viewed` once when the section is meaningfully on screen.
 * Uses viewport coverage (not element ratio) so tall sections like How it Works
 * still count — a 300vh section can never be 50% visible in a 100vh window.
 */
export function useSectionView(
  sectionId: string,
  existingRef?: RefObject<HTMLElement | null>,
): RefObject<HTMLElement | null> {
  const localRef = useRef<HTMLElement | null>(null)
  const ref = existingRef ?? localRef
  const fired = useRef(false)

  useEffect(() => {
    const element = ref.current
    if (!element || fired.current) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry?.isIntersecting || fired.current) return

        const rootHeight = entry.rootBounds?.height ?? window.innerHeight
        const visibleInViewport =
          rootHeight > 0 ? entry.intersectionRect.height / rootHeight : 0
        // Count when ≥25% of the viewport is covered by this section,
        // or ≥25% of a short section is visible.
        if (visibleInViewport < 0.25 && entry.intersectionRatio < 0.25) return

        fired.current = true
        track('section_viewed', { section: sectionId })
        observer.disconnect()
      },
      { threshold: [0, 0.1, 0.25, 0.5, 0.75, 1] },
    )

    observer.observe(element)
    return () => observer.disconnect()
  }, [ref, sectionId])

  return ref
}
