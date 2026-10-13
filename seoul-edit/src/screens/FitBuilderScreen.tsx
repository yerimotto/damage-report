import { useMemo, useState } from 'react'
import { Check, Trash2, X } from 'lucide-react'
import { BottomBar } from '../components/BottomBar'
import { FlatLay } from '../components/FlatLay'
import { PieceImage } from '../components/PieceImage'
import { plural } from '../lib/format'
import { navigate } from '../lib/router'
import { actions, nextFitName, useAppData } from '../lib/store'
import { CATEGORIES } from '../types'
import { NotFound } from './NotFound'

const FILTERS = ['All', ...CATEGORIES] as const
type Filter = (typeof FILTERS)[number]

const MIN_PIECES = 2

export function FitBuilderScreen({ id }: { id?: string }) {
  const { fits, pieces } = useAppData()
  const existing = id ? fits.find((f) => f.id === id) : undefined

  const [selected, setSelected] = useState<string[]>(existing?.pieceIds ?? [])
  const [note, setNote] = useState(existing?.note ?? '')
  const [filter, setFilter] = useState<Filter>('All')
  const [confirmingDelete, setConfirmingDelete] = useState(false)

  const byId = useMemo(() => new Map(pieces.map((p) => [p.id, p])), [pieces])
  const selectedPieces = selected.flatMap((pid) => byId.get(pid) ?? [])
  const visible = filter === 'All' ? pieces : pieces.filter((p) => p.category === filter)

  if (id && !existing) return <NotFound />

  const title = existing?.name ?? nextFitName(fits)
  const canSave = selected.length >= MIN_PIECES

  const toggle = (pid: string) =>
    setSelected((s) => (s.includes(pid) ? s.filter((x) => x !== pid) : [...s, pid]))

  const close = () => navigate(existing ? { name: 'fit', id: existing.id } : { name: 'fits' }, { replace: true })

  const save = () => {
    if (!canSave) return
    if (existing) {
      actions.updateFit(existing.id, { pieceIds: selected, note: note.trim() })
      navigate({ name: 'fit', id: existing.id }, { replace: true })
    } else {
      const fit = actions.createFit({ pieceIds: selected, note: note.trim() })
      navigate({ name: 'fit', id: fit.id }, { replace: true })
    }
  }

  const remove = () => {
    if (!existing) return
    // First tap arms the button, second tap deletes (no native confirm dialog).
    if (!confirmingDelete) return setConfirmingDelete(true)
    actions.deleteFit(existing.id)
    navigate({ name: 'fits' }, { replace: true })
  }

  return (
    <main className="pt-[max(env(safe-area-inset-top),12px)] pb-36">
      <header className="flex items-center justify-between px-5 py-2">
        <button
          type="button"
          onClick={close}
          aria-label="Close"
          className="-ml-2 flex h-11 w-11 items-center justify-center rounded-full active:bg-hairline/60"
        >
          <X size={22} strokeWidth={1.5} />
        </button>
        <span className="label text-muted">{existing ? 'Edit fit' : 'New fit'}</span>
        {existing ? (
          <button
            type="button"
            onClick={remove}
            onBlur={() => setConfirmingDelete(false)}
            aria-label={confirmingDelete ? `Tap again to delete ${existing.name}` : `Delete ${existing.name}`}
            className={`-mr-2 flex h-11 items-center justify-center gap-1.5 rounded-full transition-colors ${
              confirmingDelete ? 'bg-ink px-4 text-cream' : 'w-11 text-ink-2 active:bg-hairline/60'
            }`}
          >
            <Trash2 size={confirmingDelete ? 15 : 19} strokeWidth={1.5} />
            {confirmingDelete && <span className="label">Delete</span>}
          </button>
        ) : (
          <span className="w-11" />
        )}
      </header>

      {/* Live preview */}
      <section className="px-5">
        <div className="flex items-end justify-between">
          <h1 className="serif-display text-[56px]">{title}</h1>
          <span className="label pb-2 text-muted">{plural(selected.length, 'piece')}</span>
        </div>
        <div className="mt-4 rounded-[26px] border border-hairline bg-white/40 p-4">
          <FlatLay
            pieces={selectedPieces}
            empty={
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 text-center">
                <p className="text-[14px] text-ink-2">Tap a piece below to build your outfit</p>
              </div>
            }
          />
        </div>
        <input
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="The vibe, in one line"
          maxLength={80}
          className="mt-4 w-full border-b border-hairline bg-transparent py-3 font-serif text-[20px] italic text-ink outline-none placeholder:text-muted focus:border-ink"
        />
      </section>

      {/* Filters */}
      <div className="no-scrollbar mt-6 flex gap-2 overflow-x-auto px-5 pb-1">
        {FILTERS.map((f) => (
          <button
            key={f}
            type="button"
            onClick={() => setFilter(f)}
            aria-pressed={filter === f}
            className={`label h-9 shrink-0 rounded-full border px-4 transition-colors ${
              filter === f ? 'border-ink bg-ink text-cream' : 'border-hairline text-ink-2'
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      {/* Closet grid */}
      <ul className="mt-5 grid grid-cols-3 gap-3 px-5">
        {visible.map((piece) => {
          const on = selected.includes(piece.id)
          return (
            <li key={piece.id}>
              <button
                type="button"
                onClick={() => toggle(piece.id)}
                aria-pressed={on}
                className={`relative flex w-full flex-col items-center rounded-[18px] border p-2 pb-3 transition-colors ${
                  on ? 'border-ink' : 'border-transparent'
                }`}
              >
                <PieceImage piece={piece} className="aspect-square w-full" />
                <span className="mt-2 line-clamp-1 text-[12px] text-ink-2">{piece.name}</span>
                {on && (
                  <span className="absolute top-2 right-2 flex h-6 w-6 items-center justify-center rounded-full bg-ink text-cream">
                    <Check size={14} strokeWidth={2} />
                  </span>
                )}
              </button>
            </li>
          )
        })}
      </ul>

      <BottomBar>
        <button type="button" onClick={save} disabled={!canSave} className="btn btn-primary flex-1">
          Save fit · {plural(selected.length, 'piece')}
        </button>
      </BottomBar>
    </main>
  )
}
