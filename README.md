# Money Calendar

A playful spending diary for September 2026. Instead of a budgeting dashboard,
the month is a calendar you can read at a glance: every day is an ink blob that
grows with the damage, and the expensive days are impossible to miss.

Frontend only — no build step, no framework, no backend. Open `index.html` in a
browser and it runs.

## The three screens

**Calendar** — the hero. The month as a grid, each day sized and inked by what
it cost, with the month total, the change against last month, and category
filters (All · Food · Shopping · Transport · Fun · Wellness) that re-ink the
whole calendar.

**Day detail** — click any day. The total, a badge or two (💀 most expensive day
of the month, classic weekend behaviour, a gentle one), every transaction
grouped by category with a subtotal, and one playful line about how the day
actually went. Arrow keys or ← → flick between days.

**Recap** — the month summed up: where it went, and four pieces of evidence
(most expensive day, no-spend days, repeat offender, most dangerous weekday).
The *Share my month* button is a prototype — nothing leaves the page.

## Files

| File | What's in it |
| --- | --- |
| `index.html` | Markup for all three screens |
| `assets/styles.css` | Design tokens, light + dark themes, calendar and sheet |
| `assets/app.js` | Rendering, tiers, filters, insights — all derived from the data |
| `assets/data.js` | The mock ledger |

## The data

`assets/data.js` is fabricated, and tuned so the recap always reconciles with
the calendar:

- **$4,821.00** across 126 transactions, down 12% on August's $5,478
- **Saturday 12 September — $486.00**, the single most expensive day
- **6 no-spend days**, and Uber as the repeat offender at **21 rides**
- Saturday is the most dangerous weekday at $1,520

Nothing is hardcoded in the UI: tiers, badges, insights and every recap figure
are computed from `TRANSACTIONS`, so editing the ledger changes the whole app.

## Design notes

The look is a risograph zine rather than a bank app: warm blush paper, a single
pink ink ramp for spend intensity, and a marigold accent for the quirky bits.
Heavy days print a second, deliberately misregistered pass in `mix-blend-mode:
multiply` — the way riso never quite lines up. Type is Fraunces (display),
Instrument Sans (UI) and DM Mono (figures), each with a real fallback stack.

Blob shapes are seeded per day, so a day keeps its silhouette between renders.
Dark theme is a full palette swap, and everything honours
`prefers-reduced-motion`.
