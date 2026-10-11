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
 * The current route lives in memory. Standalone, it's mirrored to the URL
 * hash so reloads and the back button work. Embedded in another page (e.g. a
 * claude.ai Artifact) the URL belongs to the host, so it's left alone.
 */
const embedded = (() => {
  try {
    return window.self !== window.top
  } catch {
    return true
  }
})()

let current = embedded ? '#/' : window.location.hash || '#/'
const listeners = new Set<() => void>()
const emit = () => listeners.forEach((l) => l())

export function navigate(route: Route, opts: { replace?: boolean } = {}) {
  current = href(route)
  if (!embedded) {
    try {
      if (opts.replace) history.replaceState(null, '', current)
      else history.pushState(null, '', current)
    } catch {
      // History is unavailable; the in-memory route is enough.
    }
  }
  emit()
}

if (!embedded) {
  const sync = () => {
    current = window.location.hash || '#/'
    emit()
  }
  window.addEventListener('hashchange', sync)
  window.addEventListener('popstate', sync)
}

const subscribe = (cb: () => void) => {
  listeners.add(cb)
  return () => listeners.delete(cb)
}

export function useHash(): string {
  return useSyncExternalStore(subscribe, () => current)
}
