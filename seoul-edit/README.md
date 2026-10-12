# The Seoul Edit

A capsule outfit planner for a trip: pack ~14 pieces, style them into a handful of
"fits", and repeat them. First trip: December in Seoul, −7° to 2°C.

React + Vite + TypeScript + Tailwind v4. Mobile-first at 440px, installable as a PWA.
Data lives in `localStorage` under `seoul-edit:v2` (no backend yet).

## The prototype

`prototype/` is a clickable prototype in plain HTML, CSS and JavaScript, built the
same way as the Money Calendar: no framework, no build step. Open
`prototype/index.html` in a browser. On a desktop it stands in a phone frame
(the button top right switches to full width).

| File | What's in it |
| --- | --- |
| `prototype/index.html` | The shell and the bottom tab bar |
| `prototype/assets/styles.css` | Design tokens, every screen, the phone frame |
| `prototype/assets/app.js` | Screens, flat-lay collage, builder, saving to localStorage |
| `prototype/assets/data.js` | The trips (Tokyo, Seoul, Paris), the shared closet, and the fits from `closet.json` |
| `prototype/pieces/` | The cutouts, resized to 560px WebP |

`npm run build:prototype` packs it into one self-contained file,
`dist-prototype/the-seoul-edit.html`, with every image embedded. That's the file
published as the shareable link.

## The React app

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

The closet comes from `closet.json`. Each piece points at `public/pieces/<id>.png`
and each fit's styling reference at `public/looks/look-N.png`. Until a PNG is in
place, the piece shows as a dashed tile with its name.

`brown-wool-coat` · `black-wool-coat` · `leather-trench` · `shearling-fur-jacket` ·
`cream-vneck-knit` · `black-turtleneck` · `black-crewneck` · `brown-polo-knit` ·
`mid-wash-wide-jeans` · `raw-denim-wide-jeans` · `black-straight-jeans` ·
`beige-suede-skirt` · `riding-boots` · `pointed-heel-boots` · `brown-suede-loafers` ·
`black-leather-tote` · `brown-suede-hobo` · `two-tone-scarf` · `wool-bucket-hat`

## Where things live

| Path | What |
| --- | --- |
| `src/index.css` | Design tokens (`@theme`) and primitives: `label`, `serif-display`, `btn-*`, `card-new-fit`, `frosted` |
| `src/types.ts` | `Piece`, `Fit`, `Trip` |
| `src/data/starter.ts` | Starter closet (19 pieces), four fits, the trip |
| `src/lib/store.ts` | localStorage-backed store + actions (`createFit`, `updateFit`, `deleteFit`, `reset`) |
| `src/lib/router.ts` | Tiny hash router |
| `src/components/FlatLay.tsx` | The auto collage (384×340 slot layout), reused for thumbnails |

To start over with the starter data, clear the `seoul-edit:v2` key in localStorage.
