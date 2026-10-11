import type { ReactNode } from 'react'

/** Sticky action bar that fades the page out beneath it. */
export function BottomBar({ children }: { children: ReactNode }) {
  return (
    <div className="fixed inset-x-0 bottom-0 z-40 flex justify-center bg-gradient-to-t from-cream from-60% to-cream/0 pb-safe">
      <div className="flex w-full max-w-[440px] gap-3 px-5 pt-6 pb-4">{children}</div>
    </div>
  )
}
