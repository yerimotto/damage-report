import { href } from '../lib/router'

export function NotFound() {
  return (
    <main className="flex min-h-dvh flex-col items-center justify-center gap-6 px-5 text-center">
      <p className="serif-display text-[56px]">Not in the suitcase</p>
      <a href={href({ name: 'fits' })} className="btn btn-secondary">
        Back to fits
      </a>
    </main>
  )
}
