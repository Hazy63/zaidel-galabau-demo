// Prüft ausklappbare Referenzen: zugeklappt 5, aufgeklappt alle, Filter, Lightbox, Zuklappen
import puppeteer from 'puppeteer-core'
import { mkdirSync } from 'node:fs'
const base = process.argv[2] ?? 'http://localhost:4173/'
const out = 'shots/check'
mkdirSync(out, { recursive: true })
const chrome = process.env.CHROME ?? 'C:/Program Files/Google/Chrome/Application/chrome.exe'
const browser = await puppeteer.launch({ executablePath: chrome, headless: true })
const wait = (ms) => new Promise((r) => setTimeout(r, ms))
let fail = 0
const ok = (c, msg) => { console.log(c ? 'OK  ' : 'FAIL', msg); if (!c) fail++ }
for (const [name, vp] of [['desk', { width: 1440, height: 900 }], ['mob', { width: 390, height: 844, deviceScaleFactor: 2, isMobile: true, hasTouch: true }]]) {
  const p = await browser.newPage()
  await p.setViewport(vp)
  const errs = []
  p.on('pageerror', (e) => errs.push(e.message))
  await p.goto(base, { waitUntil: 'networkidle0' })
  const count = () => p.$$eval('#referenzen-raster > button', (b) => b.length)
  const btn = () => p.$('button[aria-controls="referenzen-raster"]')
  const label = async () => (await btn()) ? p.$eval('button[aria-controls="referenzen-raster"]', (b) => b.textContent + '|' + b.getAttribute('aria-expanded')) : null
  ok((await count()) === 5, `${name}: zugeklappt 5 Bilder (${await count()})`)
  ok((await label()) === 'Alle 20 Referenzen ansehen|false', `${name}: Knopf ${await label()}`)
  await p.evaluate(() => document.querySelectorAll('img[loading=lazy]').forEach((im) => (im.loading = 'eager')))
  await p.evaluate(() => document.getElementById('referenzen').scrollIntoView())
  await wait(1200)
  await (await p.$('#referenzen')).screenshot({ path: `${out}/${name}-zu.png` })
  await (await btn()).click(); await wait(400)
  ok((await count()) === 20, `${name}: aufgeklappt 20 Bilder`)
  ok((await label()) === 'Weniger anzeigen|true', `${name}: Knopf ${await label()}`)
  // Lightbox über alle 20
  await p.click('#referenzen-raster > button:nth-child(7)'); await wait(400)
  const z = await p.$eval('[role=dialog] span', (s) => s.textContent)
  ok(z.replace(/\s/g, '') === '7/20', `${name}: Lightbox ${z}`)
  await p.keyboard.press('Escape'); await wait(300)
  await (await btn()).click(); await wait(900)
  ok((await count()) === 5, `${name}: wieder zugeklappt`)
  const top = await p.$eval('#referenzen', (s) => s.getBoundingClientRect().top)
  ok(Math.abs(top) < 120, `${name}: nach Zuklappen am Abschnittsanfang (top ${Math.round(top)})`)
  // Filter Pflaster (7) -> 3 + Knopf; Treppen (2) -> kein Knopf
  const clickCat = (l) => p.evaluate((l) => [...document.querySelectorAll('#referenzen button')].find((b) => b.textContent === l).click(), l)
  await clickCat('Pflaster'); await wait(300)
  ok((await count()) === 3 && (await label())?.startsWith('Alle 6 '), `${name}: Pflaster 3 + ${await label()}`)
  await clickCat('Treppen'); await wait(300)
  ok((await count()) === 2 && (await label()) === null, `${name}: Treppen 2, kein Knopf`)
  const over = await p.evaluate(() => document.documentElement.scrollWidth - window.innerWidth)
  ok(over <= 0, `${name}: kein Überlauf (${over})`)
  ok(errs.length === 0, `${name}: keine JS-Fehler ${errs.join(';')}`)
  await p.close()
}
await browser.close()
console.log(fail ? `${fail} FAIL` : 'alles OK')
process.exit(fail ? 1 : 0)
