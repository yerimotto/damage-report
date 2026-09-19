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

**Day detail** — click any day and a till receipt slides up from the bottom
edge. Torn paper edges, dashed rules, line items grouped by category with
subtotals, a printed total, rubber stamps (💀 most expensive day, weekend
behaviour, a gentle one), a handwritten note and a barcode seeded from the
date. Swipe or flick it down to dismiss, or use Esc, the backdrop, or the grab
handle. Arrow keys and ← → print the next day.

**Recap** — the month summed up: where it went, and four pieces of evidence
(most expensive day, no-spend days, repeat offender, most dangerous weekday).
The *Share my month* button is a prototype — nothing leaves the page.

**The five-part recap** — the recap page leads with a launch card that opens a
full-screen story: the damage, the weekend pattern, your spending DNA, three
badges unlocked one at a time, and a Tamagotchi-ish creature generated from the
month. Tap right to advance, left to go back; swipe, arrow keys, the progress
dots and Esc all work. The stage is deliberately dark in both themes.

## Files

| File | What's in it |
| --- | --- |
| `index.html` | Markup for all three screens |
| `assets/styles.css` | Design tokens, light + dark themes, calendar and sheet |
| `assets/app.js` | Rendering, tiers, filters, insights — all derived from the data |
| `assets/recap.css` | The full-screen recap stage |
| `assets/recap.js` | The five-part story, badges and the creature |
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
The recap story reads the same facts through `window.MC`, so it can never
disagree with the receipts. A *little treat* is defined as a Food, Fun or Gifts
transaction of $15 or less; creature rarity is derived from how hard the month
skews to the weekend.

## Design notes

The look is a risograph zine rather than a bank app: warm blush paper, a single
pink ink ramp for spend intensity, and a marigold accent for the quirky bits.
Heavy days print a second, deliberately misregistered pass in `mix-blend-mode:
multiply` — the way riso never quite lines up. Type is Fraunces (display),
Instrument Sans (UI) and DM Mono (figures), each with a real fallback stack.

Blob shapes are seeded per day, so a day keeps its silhouette between renders.
Dark theme is a full palette swap, and everything honours
`prefers-reduced-motion`.
