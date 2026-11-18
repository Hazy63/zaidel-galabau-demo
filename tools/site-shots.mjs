// Viewport-Screenshots der Website in Abschnitten (Desktop + Mobil)
// Aufruf: node tools/site-shots.mjs [baseUrl] [outDir]
import puppeteer from 'puppeteer-core'
import { mkdirSync } from 'node:fs'
const base = process.argv[2] ?? 'http://localhost:4173/'
const out = process.argv[3] ?? 'shots/site'
mkdirSync(out, { recursive: true })
const chrome = process.env.CHROME ?? 'C:/Program Files/Google/Chrome/Application/chrome.exe'
const browser = await puppeteer.launch({ executablePath: chrome, headless: true })
const wait = (ms) => new Promise((r) => setTimeout(r, ms))
for (const [name, vp] of [['desk', { width: 1440, height: 900 }], ['mob', { width: 390, height: 844, deviceScaleFactor: 2, isMobile: true, hasTouch: true }]]) {
  const p = await browser.newPage()
  await p.setViewport(vp)
  p.on('pageerror', (e) => console.log('[pageerror]', e.message))
  await p.goto(base, { waitUntil: 'networkidle0' })
  const h = await p.evaluate(() => document.body.scrollHeight)
  let i = 0
  for (let y = 0; y < h; y += vp.height) {
    await p.evaluate((y) => window.scrollTo(0, y), y)
    await wait(900)
    await p.screenshot({ path: `${out}/${name}-${String(i++).padStart(2, '0')}.png` })
  }
  // Referenzen als ein Bild (für das Übergabe-PDF)
  await p.evaluate(() => document.querySelectorAll('img[loading=lazy]').forEach((im) => (im.loading = 'eager')))
  await p.evaluate(() => document.getElementById('referenzen').scrollIntoView())
  await wait(1500)
  await (await p.$('#referenzen')).screenshot({ path: `${out}/${name}-referenzen.png` })
  console.log(name, i, 'shots')
}
await browser.close()
