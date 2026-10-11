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

export function navigate(route: Route, opts: { replace?: boolean } = {}) {
  if (opts.replace) history.replaceState(null, '', href(route))
  else history.pushState(null, '', href(route))
  window.dispatchEvent(new HashChangeEvent('hashchange'))
}

const subscribe = (cb: () => void) => {
  window.addEventListener('hashchange', cb)
  return () => window.removeEventListener('hashchange', cb)
}

export function useHash(): string {
  return useSyncExternalStore(subscribe, () => window.location.hash)
}
