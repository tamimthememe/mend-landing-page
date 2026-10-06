import { useEffect, useState, type RefObject } from 'react'

/** Share of the element that must be visible before a slot counts as in view. */
export const inViewThreshold = 0.4

type InViewOptions = {
  threshold?: number
  enabled?: boolean
}

export function useInView(
  ref: RefObject<Element | null>,
  { threshold = inViewThreshold, enabled = true }: InViewOptions = {},
): boolean {
  const [inView, setInView] = useState(false)

  useEffect(() => {
    const element = ref.current
    if (!enabled || !element) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        setInView(Boolean(entry?.isIntersecting))
      },
      { threshold },
    )

    observer.observe(element)
    return () => {
      observer.disconnect()
    }
  }, [ref, threshold, enabled])

  return inView
}

export function useInViewOnce(
  ref: RefObject<Element | null>,
  { threshold = inViewThreshold, enabled = true }: InViewOptions = {},
): boolean {
  const [seen, setSeen] = useState(false)

  useEffect(() => {
    const element = ref.current
    if (!enabled || !element || seen) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry?.isIntersecting) return
        setSeen(true)
        observer.disconnect()
      },
      { threshold },
    )

    observer.observe(element)
    return () => {
      observer.disconnect()
    }
  }, [ref, threshold, enabled, seen])

  return seen
}
