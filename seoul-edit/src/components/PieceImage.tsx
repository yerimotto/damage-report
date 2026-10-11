import { useState } from 'react'
import type { Piece } from '../types'

/**
 * A clothing cutout. Tries the real PNG first; until it's dropped into
 * /public/pieces, falls back to the bundled placeholder illustration.
 */
export function PieceImage({ piece, className = '' }: { piece: Piece; className?: string }) {
  const placeholder = `/pieces/placeholders/${piece.id}.svg`
  const [src, setSrc] = useState(piece.image)
  const [failed, setFailed] = useState(false)

  if (failed) return <div className={className} aria-label={piece.name} role="img" />

  return (
    <img
      src={src}
      alt={piece.name}
      draggable={false}
      className={`object-contain select-none ${className}`}
      onError={() => (src !== placeholder ? setSrc(placeholder) : setFailed(true))}
    />
  )
}
