import { useSyncExternalStore } from 'react'

export type Route =
  | { name: 'fits' }
  | { name: 'fit'; id: string }
  | { name: 'new' }
  | { name: 'edit'; id: string }
  | { name: 'closet' }
  | { name: 'days' }
  | { name: 'pack' }

export function parse(hash: string): Route {
  const parts = hash.replace(/^#\/?/, '').split('/').filter(Boolean)
  if (parts[0] === 'fit' && parts[1]) return parts[2] === 'edit' ? { name: 'edit', id: parts[1] } : { name: 'fit', id: parts[1] }
  if (parts[0] === 'new') return { name: 'new' }
  if (parts[0] === 'closet' || parts[0] === 'days' || parts[0] === 'pack') return { name: parts[0] }
  return { name: 'fits' }
}

export function href(route: Route): string {
  switch (route.name) {
    case 'fit':
      return `#/fit/${route.id}`
    case 'edit':
      return `#/fit/${route.id}/edit`
    case 'fits':
      return '#/'
    default:
      return `#/${route.name}`
  }
}

/*
 * The current route lives in memory and is mirrored to the URL hash when the
 * host allows it. Sandboxed hosts (like an embedded preview) may refuse
 * history writes; navigation keeps working regardless.
 */
let current = window.location.hash || '#/'
const listeners = new Set<() => void>()
const emit = () => listeners.forEach((l) => l())

export function navigate(route: Route, opts: { replace?: boolean } = {}) {
  current = href(route)
  try {
    if (opts.replace) history.replaceState(null, '', current)
    else history.pushState(null, '', current)
  } catch {
    // History is unavailable; the in-memory route is enough.
  }
  emit()
}

window.addEventListener('hashchange', () => {
  current = window.location.hash || '#/'
  emit()
})
window.addEventListener('popstate', () => {
  current = window.location.hash || '#/'
  emit()
})

const subscribe = (cb: () => void) => {
  listeners.add(cb)
  return () => listeners.delete(cb)
}

export function useHash(): string {
  return useSyncExternalStore(subscribe, () => current)
}
