// Turns dist/ into a single self-contained page (CSS + JS inlined) for
// hosts that only accept one HTML file plus static images, e.g. a claude.ai
// Artifact. Run after `vite build`; writes dist-artifact/.
import { cpSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'

const dist = 'dist'
const out = 'dist-artifact'
const html = readFileSync(join(dist, 'index.html'), 'utf8')

const css = [...html.matchAll(/<link rel="stylesheet"[^>]*href="\.\/(assets\/[^"]+\.css)"[^>]*>/g)].map((m) =>
  readFileSync(join(dist, m[1]), 'utf8'),
)
const js = [...html.matchAll(/<script type="module"[^>]*src="\.\/(assets\/[^"]+\.js)"[^>]*><\/script>/g)].map((m) =>
  readFileSync(join(dist, m[1]), 'utf8').replace(/<\/script/gi, '<\\/script'),
)
if (!css.length || !js.length) throw new Error('Could not find the built CSS/JS in dist/index.html')

const fonts = html.match(/<link[^>]*fonts\.googleapis\.com\/css2[^>]*>/)?.[0] ?? ''

const page = `<title>The Seoul Edit</title>
<meta name="theme-color" content="#FBF8F1">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
${fonts}
<style>${css.join('\n')}</style>
<div id="root"></div>
<script type="module">${js.join('\n')}</script>
`

rmSync(out, { recursive: true, force: true })
mkdirSync(out)
writeFileSync(join(out, 'index.html'), page)
cpSync(join(dist, 'pieces'), join(out, 'pieces'), { recursive: true })
console.log(`${out}/index.html  ${(page.length / 1024).toFixed(0)} kB`)
