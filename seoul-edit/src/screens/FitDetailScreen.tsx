import { ArrowLeft } from 'lucide-react'
import { BottomBar } from '../components/BottomBar'
import { FlatLay } from '../components/FlatLay'
import { PieceImage } from '../components/PieceImage'
import { WeatherChip } from '../components/WeatherChip'
import { alsoWornIn, plural, tempLabel } from '../lib/format'
import { Link } from '../components/Link'
import { navigate } from '../lib/router'
import { useAppData } from '../lib/store'
import { NotFound } from './NotFound'

export function FitDetailScreen({ id }: { id: string }) {
  const { trip, fits, pieces } = useAppData()
  const index = fits.findIndex((f) => f.id === id)
  const fit = fits[index]
  if (!fit) return <NotFound />

  const byId = new Map(pieces.map((p) => [p.id, p]))
  const fitPieces = fit.pieceIds.flatMap((pid) => byId.get(pid) ?? [])

  return (
    <main className="px-5 pt-[max(env(safe-area-inset-top),12px)] pb-36">
      <header className="flex items-center justify-between py-2">
        <button
          type="button"
          onClick={() => navigate({ name: 'fits' })}
          aria-label="Back"
          className="-ml-2 flex h-11 w-11 items-center justify-center rounded-full active:bg-hairline/60"
        >
          <ArrowLeft size={22} strokeWidth={1.5} />
        </button>
        <span className="label text-muted">
          {index + 1} of {fits.length}
        </span>
      </header>

      <h1 className="serif-display mt-4 text-[72px]">{fit.name}</h1>
      <div className="mt-4 flex flex-wrap items-center gap-3">
        <WeatherChip label={tempLabel(trip)} />
      </div>
      {fit.note && <p className="mt-4 font-serif text-[20px] italic leading-snug text-ink-2">{fit.note}</p>}

      <FlatLay pieces={fitPieces} image={fit.flatLayImage} className="mt-8" />

      <section className="mt-10">
        <h2 className="label border-b border-hairline pb-3 text-ink">{plural(fitPieces.length, 'piece')}</h2>
        <ul>
          {fitPieces.map((piece) => (
            <li key={piece.id} className="flex items-center gap-4 border-b border-hairline py-3">
              <PieceImage piece={piece} className="h-16 w-16 shrink-0" />
              <div className="min-w-0">
                <p className="font-serif text-[22px] leading-tight">{piece.name}</p>
                <p className="mt-0.5 text-[13px] text-muted">{alsoWornIn(piece.id, fit, fits)}</p>
              </div>
            </li>
          ))}
        </ul>
      </section>

      <BottomBar>
        <Link to={{ name: 'fits' }} className="btn btn-secondary flex-1">
          All fits
        </Link>
        <Link to={{ name: 'edit', id: fit.id }} className="btn btn-primary flex-1">
          Edit fit
        </Link>
      </BottomBar>
    </main>
  )
}
