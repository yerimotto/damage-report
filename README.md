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
edge. It opens with the verdict: the day's three biggest buys as stacked 3D
stickers, the stamps it earned (💀 most expensive day, weekend behaviour, a
gentle one) and a handwritten note. Below that, the itemisation — dashed
rules, line items grouped by category with subtotals, a printed total, and a
barcode seeded from the date. Swipe or flick it down to dismiss, or use Esc, the backdrop, or the grab
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

- **$2,026.79** across 55 transactions, to **21 September** — the month is
  still running, so the 22nd onwards is deliberately empty
- Down 12% on August at the same point ($2,303), and pacing toward roughly
  $2,900 by the 30th
- **Saturday 12 September — $486.00**, the single most expensive day, at 4.3×
  an ordinary one
- **3 no-spend days so far**, and Uber as the repeat offender at **7 rides**
- Saturday is the most dangerous weekday, and 73% of the month so far landed
  between Friday and Sunday

`TODAY` in the data marks how far the month has got. A day after it has not
happened yet: it draws as blank paper with a faded date, cannot be opened, and
counts for nothing — not the no-spend tally, not the averages, not the weekday
totals. That is the difference between "nothing happened" and "not yet".

Nothing is hardcoded in the UI: tiers, badges, insights and every recap figure
are computed from `TRANSACTIONS`, so editing the ledger changes the whole app.
The recap story reads the same facts through `window.MC`, so it can never
disagree with the receipts. A *little treat* is defined as a Food, Fun or Gifts
transaction of $15 or less; creature rarity is derived from how hard the month
skews to the weekend.

## Design notes

The look is a bullet journal rather than a bank app: dot-grid paper, a navy
felt tip for ordinary days and a red one for the days that hurt, highlighter
on the worst. Each day is a hand-drawn ring with what it cost written inside
it. Type is **Reenie Beanie** for anything you'd have written yourself and
**DM Mono** for everything the page prints — the hand is light-stroked and
small in the x-height, so it carries a `--hand-scale` multiplier rather than
being set at the same size as a normal display face.

The one thing on the page that isn't paper is the sticker layer, and that's
the point: every "oh dear" day wears one stuck over its corner (💀 for the
worst day in the current view, 💸 for the rest), and selected filters, badges,
the recap findings and the creature are
die-cut stickers with a hard black keyline and an offset shadow. Every emoji
that carries meaning — the calendar markers, the receipt's biggest buys, the
recap's category icons and evidence marks, the badge medals and the creature's
traits — gets the same CSS treatment: a white edge traced round the glyph, a
hard lip, then a cast shadow, so it reads as puffy vinyl sitting on the page
rather than a character typed into it. The day
receipt is taped into the journal at both corners.

Ring wobble is seeded per day, so a day keeps its silhouette between renders.
Dark theme is a full palette swap to a night-desk navy, and everything honours
`prefers-reduced-motion`.
