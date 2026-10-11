import type { Fit, Trip } from '../types'

/** "−7° / 2°" → "−7° to 2°C" */
export function tempLabel(trip: Trip): string {
  return `${trip.tempRange.split('/').map((s) => s.trim()).join(' to ')}C`
}

export const plural = (n: number, word: string) => `${n} ${word}${n === 1 ? '' : 's'}`

/**
 * "Also worn in Fit 1 · 4" when every other fit is a numbered "Fit N",
 * otherwise the names joined with " · ". Returns "Only here" when unshared.
 */
export function alsoWornIn(pieceId: string, current: Fit, fits: Fit[]): string {
  const others = fits.filter((f) => f.id !== current.id && f.pieceIds.includes(pieceId))
  if (others.length === 0) return 'Only here'
  const numbers = others.map((f) => /^Fit (\d+)$/.exec(f.name)?.[1])
  if (numbers.every(Boolean)) return `Also worn in Fit ${numbers.join(' · ')}`
  return `Also worn in ${others.map((f) => f.name).join(' · ')}`
}
