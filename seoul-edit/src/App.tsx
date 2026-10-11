import { useEffect, useMemo } from 'react'
import { BottomNav } from './components/BottomNav'
import { ErrorBoundary } from './components/ErrorBoundary'
import { parse, useHash } from './lib/router'
import { ComingSoon } from './screens/ComingSoon'
import { FitBuilderScreen } from './screens/FitBuilderScreen'
import { FitDetailScreen } from './screens/FitDetailScreen'
import { FitsScreen } from './screens/FitsScreen'

export default function App() {
  const hash = useHash()
  const route = useMemo(() => parse(hash), [hash])

  useEffect(() => window.scrollTo(0, 0), [hash])

  let screen
  switch (route.name) {
    case 'fit':
      screen = <FitDetailScreen key={route.id} id={route.id} />
      break
    case 'new':
      screen = <FitBuilderScreen key="new" />
      break
    case 'edit':
      screen = <FitBuilderScreen key={route.id} id={route.id} />
      break
    case 'closet':
    case 'days':
    case 'pack':
      screen = <ComingSoon tab={route.name} />
      break
    default:
      screen = <FitsScreen />
  }

  const isTab = ['fits', 'closet', 'days', 'pack'].includes(route.name)

  return (
    <div className="mx-auto min-h-dvh w-full max-w-[440px]">
      <ErrorBoundary resetKey={hash}>{screen}</ErrorBoundary>
      {isTab && <BottomNav active={route.name} />}
    </div>
  )
}
