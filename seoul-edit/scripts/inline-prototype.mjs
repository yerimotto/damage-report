// Packs prototype/ into one self-contained page (CSS, JS and every image
// embedded) for hosts that only take a single HTML file, e.g. a claude.ai
// Artifact. Writes dist-prototype/the-seoul-edit.html.
import { mkdirSync, readFileSync, readdirSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'

const dir = 'prototype'
const read = (p) => readFileSync(join(dir, p), 'utf8')
const html = read('index.html')

const images = {}
for (const f of readdirSync(join(dir, 'pieces'))) {
  images[`pieces/${f}`] = `data:image/webp;base64,${readFileSync(join(dir, 'pieces', f)).toString('base64')}`
}

const body = html.slice(html.indexOf('<body>') + 6, html.indexOf('</body>'))
const head = html.slice(html.indexOf('<head>') + 6, html.indexOf('</head>'))
const keep = head
  .split('\n')
  .filter((l) => /<title|theme-color|fonts\.g/.test(l))
  .join('\n')

const page = `${keep}
<style>
${read('assets/styles.css')}
</style>
${body
  .replace('<script src="assets/data.js"></script>', `<script>\n${read('assets/data.js')}\nwindow.SE_IMAGES = ${JSON.stringify(images)};\n</script>`)
  .replace('<script src="assets/app.js"></script>', `<script>\n${read('assets/app.js')}\n</script>`)}`

if (page.includes('src="assets/')) throw new Error('A script was not inlined')
mkdirSync('dist-prototype', { recursive: true })
writeFileSync('dist-prototype/the-seoul-edit.html', page)
console.log(`dist-prototype/the-seoul-edit.html  ${(page.length / 1024).toFixed(0)} kB`)
