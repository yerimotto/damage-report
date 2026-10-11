import { Calendar, Luggage, Shirt, Sparkles } from 'lucide-react'
import type { Route } from '../lib/router'
import { Link } from './Link'

const TABS = [
  { name: 'fits', label: 'Fits', Icon: Sparkles },
  { name: 'closet', label: 'Closet', Icon: Shirt },
  { name: 'days', label: 'Days', Icon: Calendar },
  { name: 'pack', label: 'Pack', Icon: Luggage },
] as const

export function BottomNav({ active }: { active: Route['name'] }) {
  return (
    <nav className="pointer-events-none fixed inset-x-0 bottom-0 z-40 flex justify-center px-4 pb-safe">
      <div className="frosted pointer-events-auto mb-4 flex w-full max-w-[408px] gap-1 rounded-full border border-white/70 p-1.5 shadow-[0_12px_32px_-12px_rgb(28_26_23/0.25)]">
        {TABS.map(({ name, label, Icon }) => {
          const on = active === name
          return (
            <Link
              key={name}
              to={{ name } as Route}
              aria-current={on ? 'page' : undefined}
              className={`flex h-12 flex-1 items-center justify-center gap-1.5 rounded-full text-[13px] font-semibold transition-colors ${
                on ? 'bg-ink text-cream' : 'text-ink-2'
              }`}
            >
              <Icon size={16} strokeWidth={1.5} />
              {label}
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
