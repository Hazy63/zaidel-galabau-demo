// Bereitet Screenshots aus shots/ für das Übergabe-PDF auf (zuschneiden, JPEG).
// Node-Variante von prep-images.py, braucht kein Python/PIL, nur Chrome.
// Aufruf: node tools/handover/prep-images.mjs shots tools/handover/img
import puppeteer from 'puppeteer-core'
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { extname, resolve } from 'node:path'

const [src = 'shots', dst = 'tools/handover/img'] = process.argv.slice(2)
mkdirSync(dst, { recursive: true })

// Ausschnitt [x, y, x2, y2] wird auf die Bildgröße begrenzt
const jobs = {
  'site-hero': ['site/desk-00', [0, 0, 1440, 860]],
  'site-referenzen': ['site/desk-referenzen', [0, 60, 1280, 1460]],
  'site-baustelle': ['site/desk-01', [0, 530, 1440, 900]],
  'mob-site-hero': ['site/mob-00', null],
  dash: ['desk-dash', [0, 0, 1440, 900]],
  jobs: ['desk-jobs', null],
  job: ['desk-job', [0, 0, 1440, 900]],
  doc: ['desk-doc', [200, 0, 1240, 1268]],
  plan: ['desk-plan', null],
  'mob-dash': ['mob-dash', null],
  'mob-fotos': ['mob-job-fotos', null],
  'mob-notes': ['mob-job-notes', null],
  'mob-doc': ['mob-mitarbeiter-doc', null],
}

const chrome = process.env.CHROME ?? 'C:/Program Files/Google/Chrome/Application/chrome.exe'
const browser = await puppeteer.launch({ executablePath: chrome, headless: true })
const page = await browser.newPage()

const mime = { '.png': 'image/png', '.webp': 'image/webp', '.jpg': 'image/jpeg' }
async function convert(file, box, max, quality, out) {
  const data = `data:${mime[extname(file)]};base64,${readFileSync(file).toString('base64')}`
  const res = await page.evaluate(
    async (data, box, max, quality) => {
      const im = new Image()
      im.src = data
      await im.decode()
      let [x, y, x2, y2] = box ?? [0, 0, im.naturalWidth, im.naturalHeight]
      x2 = Math.min(x2, im.naturalWidth)
      y2 = Math.min(y2, im.naturalHeight)
      const w = x2 - x, h = y2 - y
      const s = Math.min(1, max / Math.max(w, h))
      const c = document.createElement('canvas')
      c.width = Math.round(w * s)
      c.height = Math.round(h * s)
      const ctx = c.getContext('2d')
      ctx.imageSmoothingQuality = 'high'
      ctx.drawImage(im, x, y, w, h, 0, 0, c.width, c.height)
      return { url: c.toDataURL('image/jpeg', quality), size: [c.width, c.height] }
    },
    data, box, max, quality,
  )
  writeFileSync(out, Buffer.from(res.url.split(',')[1], 'base64'))
  return res.size
}

for (const [out, [name, box]] of Object.entries(jobs)) {
  console.log(out, await convert(resolve(src, `${name}.png`), box, 1400, 0.84, resolve(dst, `${out}.jpg`)))
}
// Deckblatt-Foto (JPEG hält das PDF klein)
console.log('cover', await convert('public/img/garten-bank-hecke.webp', null, 1500, 0.78, resolve(dst, 'cover.jpg')))
await browser.close()
