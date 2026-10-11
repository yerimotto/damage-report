export const CATEGORIES = ['Outer', 'Tops', 'Bottoms', 'Shoes', 'Bags', 'Extras'] as const
export type Category = (typeof CATEGORIES)[number]

export interface Piece {
  id: string
  name: string
  category: Category
  /** Path to a transparent PNG cutout, e.g. /pieces/cream-knit.png */
  image: string
}

export interface Fit {
  id: string
  name: string
  pieceIds: string[]
  note: string
  /** Optional custom flat-lay photo; otherwise the collage is generated. */
  flatLayImage?: string
  /** ISO dates (YYYY-MM-DD) this fit is planned for. */
  dates: string[]
}

export interface Trip {
  title: string
  tempRange: string
  startDate: string
  endDate: string
}

export interface AppData {
  version: 1
  trip: Trip
  pieces: Piece[]
  fits: Fit[]
}
