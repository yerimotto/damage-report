import { Plus } from 'lucide-react'
import { FlatLay } from '../components/FlatLay'
import { Link } from '../components/Link'
import { plural, tempLabel } from '../lib/format'
import { useAppData } from '../lib/store'

export function FitsScreen() {
  const { trip, fits, pieces } = useAppData()
  const byId = new Map(pieces.map((p) => [p.id, p]))
  const packed = new Set(fits.flatMap((f) => f.pieceIds)).size
  const [titleHead, titleTail] = splitTitle(trip.title)

  return (
    <main className="px-5 pt-[max(env(safe-area-inset-top),20px)] pb-32">
      <header className="label flex items-center justify-between py-3 text-ink">
        <span>The Seoul Edit</span>
        <span className="text-ink-2">{tempLabel(trip)}</span>
      </header>

      <h1 className="serif-display mt-8 text-ink pb-2 text-[76px]">
        {titleHead}
        <br />
        {titleTail}
      </h1>
      <p className="mt-3 text-[15px] text-ink-2">
        {plural(fits.length, 'fit')} · {plural(packed, 'piece')} in the suitcase
      </p>

      <ul className="mt-9 grid grid-cols-3 gap-x-3 gap-y-6">
        <li>
          <Link
            to={{ name: 'new' }}
            className="card-new-fit flex aspect-[384/340] w-full flex-col items-center justify-center gap-2 text-ink"
          >
            <Plus size={22} strokeWidth={1.25} />
            <span className="label">New fit</span>
          </Link>
        </li>
        {fits.map((fit) => (
          <li key={fit.id}>
            <Link to={{ name: 'fit', id: fit.id }} className="block w-full text-left active:opacity-70">
              <FlatLay
                pieces={fit.pieceIds.flatMap((id) => byId.get(id) ?? [])}
                image={fit.flatLayImage}
              />
              <p className="serif-display mt-3 text-[24px]">{fit.name}</p>
              <p className="mt-1 text-[12px] text-muted">{plural(fit.pieceIds.length, 'piece')}</p>
            </Link>
          </li>
        ))}
      </ul>
    </main>
  )
}

/** "December in Seoul" → ["December in", "Seoul"]: the last word gets its own line. */
function splitTitle(title: string): [string, string] {
  const i = title.lastIndexOf(' ')
  return i === -1 ? [title, ''] : [title.slice(0, i), title.slice(i + 1)]
}
