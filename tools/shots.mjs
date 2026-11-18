// Screenshots aller Hauptansichten (Desktop + Mobil) gegen `vite preview`
// Aufruf: node tools/shots.mjs [baseUrl] [outDir]
import puppeteer from 'puppeteer-core'
import { mkdirSync } from 'node:fs'

const base = process.argv[2] ?? 'http://localhost:4173/'
const out = process.argv[3] ?? 'shots'
mkdirSync(out, { recursive: true })
const chrome = process.env.CHROME ?? 'C:/Program Files/Google/Chrome/Application/chrome.exe'

const browser = await puppeteer.launch({ executablePath: chrome, headless: true, args: ['--no-sandbox'] })
const errors = []

async function page(vp) {
  const p = await browser.newPage()
  await p.setViewport(vp)
  p.on('pageerror', (e) => errors.push(`[pageerror] ${e.message}`))
  p.on('console', (m) => m.type() === 'error' && errors.push(`[console] ${m.text()}`))
  return p
}
const wait = (ms) => new Promise((r) => setTimeout(r, ms))

async function shot(p, name, full = false) {
  if (full) {
    await p.evaluate(async () => {
      for (let y = 0; y < document.body.scrollHeight; y += 500) {
        window.scrollTo(0, y)
        await new Promise((r) => setTimeout(r, 60))
      }
      document.querySelectorAll('img[loading=lazy]').forEach((i) => (i.loading = 'eager'))
      window.scrollTo(0, 0)
    })
    await wait(900)
  }
  await wait(600)
  await p.screenshot({ path: `${out}/${name}.png`, fullPage: full })
}

async function login(p, userId) {
  await p.goto(base + '#/app', { waitUntil: 'networkidle0' })
  await p.evaluate((id) => localStorage.setItem('zaidel-session', id), userId)
  await p.reload({ waitUntil: 'networkidle0' })
}

for (const [tag, vp] of [
  ['desk', { width: 1440, height: 900 }],
  ['mob', { width: 390, height: 844, deviceScaleFactor: 2, isMobile: true, hasTouch: true }],
]) {
  const p = await page(vp)
  await p.goto(base, { waitUntil: 'networkidle0' })
  await p.evaluate(() => document.querySelectorAll('.reveal').forEach((e) => e.classList.add('is-visible')))
  await shot(p, `${tag}-site`, true)

  await p.evaluate(() => localStorage.removeItem('zaidel-session'))
  await p.goto(base + '#/app', { waitUntil: 'networkidle0' })
  await shot(p, `${tag}-login`)

  await login(p, 'u-dz')
  for (const [name, path] of [
    ['dash', '#/app'],
    ['jobs', '#/app/auftraege'],
    ['job', '#/app/auftraege/j1'],
    ['job-fotos', '#/app/auftraege/j1?tab=fotos'],
    ['job-docs', '#/app/auftraege/j1?tab=dokumente'],
    ['job-notes', '#/app/auftraege/j1?tab=notizen'],
    ['doc', '#/app/auftraege/j1/dokument/d1'],
    ['plan', '#/app/plan'],
    ['kunden', '#/app/kunden'],
    ['team', '#/app/team'],
  ]) {
    await p.goto(base + path, { waitUntil: 'networkidle0' })
    await p.reload({ waitUntil: 'networkidle0' })
    await shot(p, `${tag}-${name}`, tag === 'desk' && ['dash', 'job', 'doc'].includes(name))
  }
  await login(p, 'u-paul')
  await p.goto(base + '#/app', { waitUntil: 'networkidle0' })
  await shot(p, `${tag}-mitarbeiter-dash`, true)
  await p.goto(base + '#/app/auftraege/j1/dokument/d1', { waitUntil: 'networkidle0' })
  await shot(p, `${tag}-mitarbeiter-doc`)
  await p.close()
}

await browser.close()
console.log(errors.length ? errors.join('\n') : 'keine Konsolenfehler')
