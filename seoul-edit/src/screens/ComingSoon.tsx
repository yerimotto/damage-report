const COPY = {
  closet: { title: 'Closet', line: 'Upload your own pieces, backgrounds removed for you.' },
  days: { title: 'Days', line: 'A fit for every day of the trip, no back-to-back repeats.' },
  pack: { title: 'Pack', line: 'A packing list built from every fit, ticked off as you go.' },
} as const

export function ComingSoon({ tab }: { tab: keyof typeof COPY }) {
  const { title, line } = COPY[tab]
  return (
    <main className="px-5 pt-[max(env(safe-area-inset-top),20px)] pb-32">
      <header className="label py-3">The Seoul Edit</header>
      <h1 className="serif-display mt-8 text-[76px]">{title}</h1>
      <p className="label mt-6 text-muted">Coming soon</p>
      <p className="mt-3 max-w-[300px] text-[15px] text-ink-2">{line}</p>
    </main>
  )
}
