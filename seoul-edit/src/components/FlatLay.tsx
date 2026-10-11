import type { ReactNode } from 'react'
import type { Category, Piece } from '../types'
import { PieceImage } from './PieceImage'

const BOX = { w: 384, h: 340 }

type Slot = { x: number; y: number; w: number; h: number; z: number }

/** Pinterest-style flat-lay slots inside a 384×340 box. */
const SLOTS: Record<Exclude<Category, 'Extras'>, Slot> = {
  Outer: { x: 0, y: 0, w: 185, h: 215, z: 2 },
  Bags: { x: 0, y: 205, w: 140, h: 130, z: 3 },
  Shoes: { x: 140, y: 262, w: 95, h: 72, z: 4 },
  Tops: { x: 188, y: 0, w: 135, h: 128, z: 3 },
  Bottoms: { x: 205, y: 118, w: 100, h: 222, z: 1 },
}
const DUPLICATE_OFFSET = 22

export function layoutFlatLay(pieces: Piece[]): { piece: Piece; slot: Slot }[] {
  const seen: Partial<Record<Category, number>> = {}
  return pieces.map((piece) => {
    const i = seen[piece.category] ?? 0
    seen[piece.category] = i + 1
    if (piece.category === 'Extras') {
      return { piece, slot: { x: 326, y: 6 + i * 92, w: 56, h: 84, z: 5 } }
    }
    const base = SLOTS[piece.category]
    const d = i * DUPLICATE_OFFSET
    return { piece, slot: { ...base, x: base.x + d, y: base.y + d, z: base.z + i } }
  })
}

const pct = (n: number, of: number) => `${(n / of) * 100}%`

interface FlatLayProps {
  pieces: Piece[]
  image?: string
  className?: string
  empty?: ReactNode
}

/** The auto collage, scaled to whatever width it's given (thumbnails reuse it). */
export function FlatLay({ pieces, image, className = '', empty }: FlatLayProps) {
  return (
    <div className={`relative w-full ${className}`} style={{ aspectRatio: `${BOX.w} / ${BOX.h}` }}>
      {image ? (
        <img src={image} alt="" className="absolute inset-0 h-full w-full object-contain" />
      ) : pieces.length === 0 ? (
        empty
      ) : (
        layoutFlatLay(pieces).map(({ piece, slot }) => (
          <div
            key={piece.id}
            className="absolute transition-all duration-300 ease-out"
            style={{
              left: pct(slot.x, BOX.w),
              top: pct(slot.y, BOX.h),
              width: pct(slot.w, BOX.w),
              height: pct(slot.h, BOX.h),
              zIndex: slot.z,
            }}
          >
            <PieceImage piece={piece} className="h-full w-full" />
          </div>
        ))
      )}
    </div>
  )
}
