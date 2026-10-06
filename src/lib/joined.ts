import { useCallback, useEffect, useState } from 'react'
import type { WaitlistList } from './waitlist.ts'

const STORAGE_PREFIX = 'mend:joined:'
const JOINED_EVENT = 'mend:joined-change'

function storageKey(list: WaitlistList): string {
  return `${STORAGE_PREFIX}${list}`
}

export function markJoined(list: WaitlistList): void {
  try {
    localStorage.setItem(storageKey(list), '1')
  } catch {
    // storage may be unavailable
  }
  window.dispatchEvent(new CustomEvent(JOINED_EVENT, { detail: { list } }))
}

export function hasJoined(list: WaitlistList): boolean {
  try {
    return localStorage.getItem(storageKey(list)) === '1'
  } catch {
    return false
  }
}

export function useJoined(list: WaitlistList): boolean {
  const [joined, setJoined] = useState(() => hasJoined(list))

  const refresh = useCallback(() => {
    setJoined(hasJoined(list))
  }, [list])

  useEffect(() => {
    refresh()

    const onCustom = (event: Event) => {
      const detail = (event as CustomEvent<{ list?: WaitlistList }>).detail
      if (!detail?.list || detail.list === list) refresh()
    }
    const onStorage = (event: StorageEvent) => {
      if (event.key === storageKey(list) || event.key === null) refresh()
    }

    window.addEventListener(JOINED_EVENT, onCustom)
    window.addEventListener('storage', onStorage)
    return () => {
      window.removeEventListener(JOINED_EVENT, onCustom)
      window.removeEventListener('storage', onStorage)
    }
  }, [list, refresh])

  return joined
}
