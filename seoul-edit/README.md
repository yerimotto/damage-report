# The Seoul Edit

A capsule outfit planner for a trip: pack ~14 pieces, style them into a handful of
"fits", and repeat them. First trip: December in Seoul, −7° to 2°C.

React + Vite + TypeScript + Tailwind v4. Mobile-first at 440px, installable as a PWA.
Data lives in `localStorage` under `seoul-edit:v1` (no backend yet).

```bash
npm install
npm run dev        # http://localhost:5173
npm run build      # typecheck + production build into dist/
```

## Screens

- **Fits** (`#/`) — trip title, "+ New fit" card, grid of flat-lay thumbnails
- **Fit detail** (`#/fit/:id`) — big flat lay, piece list with "also worn in…"
- **Fit builder** (`#/new`, `#/fit/:id/edit`) — live flat-lay preview, category
  filters, tap-to-toggle closet grid, save once there are ≥ 2 pieces
- Closet / Days / Pack tabs are placeholders for later phases

## Clothing images

Each starter piece points at `/pieces/<id>.png`. Drop a transparent PNG cutout
with that name into `public/pieces/` and it replaces the bundled placeholder
illustration (`public/pieces/placeholders/<id>.svg`) automatically:

`shearling-jacket` · `leather-coat` · `cream-puffer` · `cream-knit` ·
`black-turtleneck` · `grey-knit` · `black-jeans` · `flared-trousers` ·
`sheepskin-boots` · `western-boots` · `tan-tote` · `wool-scarf` ·
`leather-gloves` · `gold-hoops`

## Where things live

| Path | What |
| --- | --- |
| `src/index.css` | Design tokens (`@theme`) and primitives: `label`, `serif-display`, `btn-*`, `card-new-fit`, `frosted` |
| `src/types.ts` | `Piece`, `Fit`, `Trip` |
| `src/data/starter.ts` | Starter closet, six fits, the trip |
| `src/lib/store.ts` | localStorage-backed store + actions (`createFit`, `updateFit`, `deleteFit`, `reset`) |
| `src/lib/router.ts` | Tiny hash router |
| `src/components/FlatLay.tsx` | The auto collage (384×340 slot layout), reused for thumbnails |

To start over with the starter data, clear the `seoul-edit:v1` key in localStorage.
