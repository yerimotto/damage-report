import { useState } from 'react'
import type { Piece } from '../types'

/**
 * A clothing cutout. Until its PNG is dropped into /public/pieces, shows a
 * quiet hairline tile with the piece's name so layouts stay readable.
 */
export function PieceImage({ piece, className = '' }: { piece: Piece; className?: string }) {
  const [failed, setFailed] = useState(false)

  if (failed) {
    return (
      <div
        role="img"
        aria-label={piece.name}
        className={`flex items-center justify-center overflow-hidden rounded-[10px] border border-dashed border-hairline p-1 text-center font-serif text-[clamp(8px,2.5cqw,15px)] leading-tight text-muted [container-type:inline-size] ${className}`}
      >
        <span className="line-clamp-3">{piece.name}</span>
      </div>
    )
  }

  return (
    <img
      src={piece.image}
      alt={piece.name}
      draggable={false}
      className={`object-contain select-none ${className}`}
      onError={() => setFailed(true)}
    />
  )
}
