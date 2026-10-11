import { useSyncExternalStore } from 'react'
import { starterData } from '../data/starter'
import type { AppData, Fit } from '../types'

const KEY = 'seoul-edit:v1'

function load(): AppData {
  try {
    const raw = localStorage.getItem(KEY)
    if (raw) {
      const parsed = JSON.parse(raw) as AppData
      if (parsed?.version === 1 && Array.isArray(parsed.fits) && Array.isArray(parsed.pieces)) return parsed
    }
  } catch {
    // Private mode or corrupt JSON: fall through to the starter closet.
  }
  return structuredClone(starterData)
}

let state: AppData = load()
const listeners = new Set<() => void>()

function commit(next: AppData) {
  state = next
  try {
    localStorage.setItem(KEY, JSON.stringify(state))
  } catch {
    // Storage full or blocked; keep working in memory.
  }
  listeners.forEach((l) => l())
}

function subscribe(listener: () => void) {
  listeners.add(listener)
  return () => listeners.delete(listener)
}

export function useAppData(): AppData {
  return useSyncExternalStore(subscribe, () => state)
}

/** Next "Fit N" name, one past the highest number in use. */
export function nextFitName(fits: Fit[]): string {
  const max = fits.reduce((m, f) => Math.max(m, Number(/^Fit (\d+)$/.exec(f.name)?.[1] ?? 0)), 0)
  return `Fit ${max + 1}`
}

export const actions = {
  createFit(input: Pick<Fit, 'pieceIds' | 'note'>): Fit {
    const fit: Fit = {
      id: `fit-${Date.now().toString(36)}`,
      name: nextFitName(state.fits),
      pieceIds: input.pieceIds,
      note: input.note,
      dates: [],
    }
    commit({ ...state, fits: [...state.fits, fit] })
    return fit
  },
  updateFit(id: string, patch: Partial<Omit<Fit, 'id'>>) {
    commit({ ...state, fits: state.fits.map((f) => (f.id === id ? { ...f, ...patch } : f)) })
  },
  deleteFit(id: string) {
    commit({ ...state, fits: state.fits.filter((f) => f.id !== id) })
  },
  reset() {
    commit(structuredClone(starterData))
  },
}
