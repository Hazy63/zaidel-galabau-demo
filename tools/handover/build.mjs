// Baut das Übergabe-PDF für Zaidel GaLaBau.
// Aufruf: node tools/handover/build.mjs [ausgabe.pdf]
// Vorher: node tools/shots.mjs … && python tools/handover/prep-images.py shots tools/handover/img
import QRCode from 'qrcode'
import puppeteer from 'puppeteer-core'
import { writeFileSync } from 'node:fs'
import { fileURLToPath, pathToFileURL } from 'node:url'
import { dirname, resolve } from 'node:path'

const here = dirname(fileURLToPath(import.meta.url))
const root = resolve(here, '../..')
const out = resolve(process.argv[2] ?? resolve(here, 'Zaidel-Uebergabe.pdf'))
const SITE = 'https://hazy63.github.io/zaidel-galabau-demo/'
const APP = SITE + '#/app'
const DATE = new Date().toLocaleDateString('de-DE', { day: 'numeric', month: 'long', year: 'numeric' })

const qr = (url) => QRCode.toString(url, { type: 'svg', margin: 0, errorCorrectionLevel: 'M', color: { dark: '#16281e', light: '#0000' } })
const [qrSite, qrApp] = await Promise.all([qr(SITE), qr(APP)])
const f = (p) => pathToFileURL(resolve(root, p)).href
const img = (n) => f(`tools/handover/img/${n}.jpg`)

const mark = (size, stroke = '#3a6549', dot = '#a64b2a') => {
  const c = Array.from({ length: 8 }, (_, i) => {
    const a = (i * Math.PI) / 4 - Math.PI / 2
    return `<circle cx="${32 + Math.cos(a) * 11.5}" cy="${32 + Math.sin(a) * 11.5}" r="11"/>`
  }).join('')
  return `<svg viewBox="0 0 64 64" width="${size}" height="${size}"><g fill="none" stroke="${stroke}" stroke-width="2">${c}</g><circle cx="32" cy="32" r="3.4" fill="${dot}"/></svg>`
}

const footer = (n) => `<div class="foot"><span>${mark(14)} Zaidel Garten- und Landschaftsbau · Übergabe Website und Auftragsbuch</span><span>${n}</span></div>`

const html = /* html */ `<!doctype html><html lang="de"><head><meta charset="utf-8"><title>Übergabe Zaidel</title>
<style>
@font-face{font-family:Fraunces;src:url(${f('node_modules/@fontsource-variable/fraunces/files/fraunces-latin-wght-normal.woff2')}) format('woff2');font-weight:100 900}
@font-face{font-family:Figtree;src:url(${f('node_modules/@fontsource-variable/figtree/files/figtree-latin-wght-normal.woff2')}) format('woff2');font-weight:300 900}
@page{size:A4;margin:0}
*{box-sizing:border-box}
body{margin:0;font:10.5pt/1.5 Figtree,sans-serif;color:#2c2924;-webkit-print-color-adjust:exact;print-color-adjust:exact}
.page{width:210mm;height:297mm;padding:18mm 18mm 16mm;position:relative;page-break-after:always;overflow:hidden;background:#faf8f4}
.page:last-child{page-break-after:auto}
h1,h2,h3{font-family:Fraunces,serif;font-weight:500;color:#16281e;margin:0;letter-spacing:-.01em}
h2{font-size:24pt;line-height:1.1;margin-bottom:3mm}
h3{font-size:13pt;margin:0 0 1.5mm}
.eyebrow{font-size:8pt;font-weight:600;letter-spacing:.18em;text-transform:uppercase;color:#a64b2a;margin-bottom:3mm}
p{margin:0 0 3mm}
.lead{font-size:11.5pt;color:#5f584d;max-width:150mm}
.foot{position:absolute;left:18mm;right:18mm;bottom:9mm;display:flex;justify-content:space-between;align-items:center;font-size:7.5pt;color:#aaa190;border-top:1px solid #e7e1d4;padding-top:2.5mm}
.foot span:first-child{display:flex;align-items:center;gap:2mm}
.shot{border-radius:3mm;overflow:hidden;box-shadow:0 6px 18px -6px rgb(27 26 23/.35),0 0 0 1px rgb(27 26 23/.08);background:#fff}
.shot img{display:block;width:100%}
.phone{border-radius:6mm;border:2.2mm solid #1b1a17;overflow:hidden;box-shadow:0 8px 20px -8px rgb(0 0 0/.45);background:#1b1a17}
.phone img{display:block;width:100%}
.grid2{display:grid;grid-template-columns:1fr 1fr;gap:7mm}
.card{background:#fff;border:1px solid #e7e1d4;border-radius:3mm;padding:5mm}
.steps{counter-reset:s;display:grid;gap:3.5mm;margin:0;padding:0;list-style:none}
.steps li{counter-increment:s;display:grid;grid-template-columns:8mm 1fr;gap:3mm;align-items:start}
.steps li:before{content:counter(s);width:7mm;height:7mm;border-radius:50%;background:#1f3a2b;color:#fff;font:600 9pt Fraunces,serif;display:grid;place-items:center;margin-top:.3mm}
.steps b{color:#16281e}
table{border-collapse:collapse;width:100%;font-size:9.5pt}
th{text-align:left;font-weight:600;color:#7f776a;font-size:8pt;letter-spacing:.06em;text-transform:uppercase;padding:2mm 3mm;border-bottom:1.5px solid #1f3a2b}
td{padding:2.3mm 3mm;border-bottom:1px solid #e7e1d4;vertical-align:top}
.y{color:#3a6549;font-weight:600}.n{color:#d4ccbb}
.pin{font-family:ui-monospace,Consolas,monospace;font-weight:600;background:#e4ede0;color:#16281e;padding:.3mm 1.8mm;border-radius:1mm}
.note{background:#f8e7dc;border-left:3px solid #c25e37;padding:3.5mm 4.5mm;border-radius:0 2mm 2mm 0;font-size:9.5pt;color:#5c2a17}
.check{list-style:none;padding:0;margin:0;display:grid;gap:2.2mm}
.check li{display:grid;grid-template-columns:5mm 1fr;gap:2.5mm}
.check li:before{content:'';width:3.6mm;height:3.6mm;border:1.3px solid #74a07a;border-radius:.8mm;margin-top:.9mm}
.list{list-style:none;padding:0;margin:0;display:grid;gap:2.2mm}
.list li{display:grid;grid-template-columns:5mm 1fr;gap:2.5mm}
.list li:before{content:'';width:3mm;height:1.3px;background:#c25e37;margin-top:2.6mm}
.muted{color:#7f776a}
a{color:#2b4d39;text-decoration:none;font-weight:600}
/* Deckblatt */
.cover{padding:0;background:#16281e;color:#fff}
.cover .bg{position:absolute;inset:0;background:url(${img('cover')}) center/cover;opacity:.75}
.cover .grad{position:absolute;inset:0;background:linear-gradient(180deg,rgb(16 29 22/.55),rgb(16 29 22/.2) 35%,rgb(16 29 22/.96) 72%)}
.cover .in{position:absolute;inset:0;padding:20mm 20mm 18mm;display:flex;flex-direction:column}
.cover h1{color:#fff;font-size:40pt;line-height:1.02;margin-top:auto}
.cover h1 em{font-style:italic;color:#9cc28a;font-weight:400}
.qrbox{display:flex;gap:7mm;margin-top:10mm}
.qr{background:#faf8f4;border-radius:3mm;padding:4mm;width:60mm;color:#16281e;display:grid;grid-template-columns:22mm 1fr;gap:3.5mm;align-items:center}
.qr svg{width:22mm;height:22mm}
.qr b{display:block;font-size:10pt}
.qr span{font-size:7.5pt;color:#5f584d;word-break:break-all;line-height:1.35}
</style></head><body>

<section class="page cover">
  <div class="bg"></div><div class="grad"></div>
  <div class="in">
    <div style="display:flex;align-items:center;gap:3mm">${mark(40, '#9cc28a', '#f3efe6')}
      <div><div style="font:600 19pt Fraunces,serif">Zaidel</div><div style="font-size:7.5pt;letter-spacing:.2em;text-transform:uppercase;color:#c9dcc0">Garten- und Landschaftsbau</div></div>
    </div>
    <div class="eyebrow" style="color:#9cc28a;margin-top:auto">Übergabe · ${DATE}</div>
    <h1 style="margin-top:0">Ihre neue Website<br>und das <em>Auftragsbuch.</em></h1>
    <p style="margin-top:6mm;font-size:12pt;color:rgb(255 255 255/.8);max-width:140mm">Alle Baustellen an einem Ort: Aufträge, Fotos, Angebote, Rechnungen und Notizen. Für das Büro am PC und für die Kolonne draußen auf dem Handy.</p>
    <div class="qrbox">
      <div class="qr">${qrSite}<div><b>Website</b><span>hazy63.github.io/<br>zaidel-galabau-demo</span></div></div>
      <div class="qr">${qrApp}<div><b>Auftragsbuch</b><span>führt direkt<br>zur Anmeldung</span></div></div>
    </div>
    <p style="margin:7mm 0 0;font-size:8.5pt;color:rgb(255 255 255/.55)">Mit dem Handy die Kamera auf den Code halten. Vorführversion, erstellt von Dennis.</p>
  </div>
</section>

<section class="page">
  <div class="eyebrow">Auf einen Blick</div>
  <h2>Was Sie bekommen</h2>
  <p class="lead">Zwei Teile, die zusammenarbeiten: eine neue Website für Ihre Kunden und ein Auftragsbuch für Sie und Ihr Team. Wenn ein Kunde auf der Website eine Anfrage schickt, liegt sie sofort im Auftragsbuch.</p>
  <div class="grid2" style="margin-top:7mm">
    <div class="card"><h3>Die Website</h3><p class="muted">Für Ihre Kunden. Zeigt Leistungen, Ihre Arbeiten und Bewertungen. Kunden können anrufen oder eine Anfrage mit Fotos schicken.</p><a>${SITE.replace('https://', '')}</a></div>
    <div class="card"><h3>Das Auftragsbuch</h3><p class="muted">Für Sie und Ihr Team. Jeder Auftrag hat seine Fotos, Angebote, Rechnungen, Notizen und Aufgaben. Läuft im Browser, auf PC und Handy.</p><a>Website unten „Team-Login“</a></div>
  </div>

  <h3 style="margin-top:10mm">Zugänge in der Vorführversion</h3>
  <table style="margin-top:2mm">
    <tr><th>Person</th><th>Rolle</th><th>PIN</th></tr>
    <tr><td>Dimitri Zaidel</td><td>Inhaber, sieht alles</td><td><span class="pin">1234</span></td></tr>
    <tr><td>Büro Zaidel</td><td>Büro und Bauleitung</td><td><span class="pin">1234</span></td></tr>
    <tr><td>Andrej K.</td><td>Mitarbeiter (Beispiel)</td><td><span class="pin">1111</span></td></tr>
    <tr><td>Paul M.</td><td>Mitarbeiter (Beispiel)</td><td><span class="pin">2222</span></td></tr>
    <tr><td>Tim R.</td><td>Azubi (Beispiel)</td><td><span class="pin">3333</span></td></tr>
  </table>
  <p class="muted" style="font-size:9pt;margin-top:2.5mm">Mitarbeiter, Kunden und Aufträge sind ausgedachte Beispiele. Die Fotos stammen von Ihrer bisherigen Website.</p>

  <div class="note" style="margin-top:8mm"><b>Wichtig zur Vorführversion:</b> Alles, was Sie eintragen, wird nur auf dem Gerät gespeichert, auf dem Sie es eintragen. Das Handy sieht also nicht, was am PC angelegt wurde. Probieren Sie ruhig alles aus, unter „Team“ setzt „Demo zurücksetzen“ alles auf den Anfang. In der echten Version liegen die Daten auf einem Server in Deutschland bzw. der EU, und jeder im Team sieht sofort dasselbe.</div>
  ${footer(2)}
</section>

<section class="page">
  <div class="eyebrow">Teil 1</div>
  <h2>Die Website</h2>
  <p class="lead">Ihre eigenen Baustellenfotos stehen im Mittelpunkt, gleich ab dem ersten Bild. Auf dem Handy gibt es unten einen festen „Jetzt anrufen“-Knopf.</p>
  <div class="shot" style="margin-top:5mm"><img src="${img('site-hero')}"></div>
  <div class="grid2" style="margin-top:7mm;gap:8mm">
    <div>
      <h3>Was drauf ist</h3>
      <ul class="list">
        <li>Leistungen: Pflaster, Mauern und Naturstein, Treppen, Terrassen, Zäune, Gartengestaltung</li>
        <li>Startbild wechselt zwischen vier Ihrer schönsten Baustellen</li>
        <li>20 Referenzen mit Filter, Fotos groß ansehen und durchblättern</li>
        <li>Laufband „Auf der Baustelle“: Ihre Kolonne bei der Arbeit</li>
        <li>Vorher und Nachher an einem echten Garten</li>
        <li>Ablauf vom Anruf bis zur Übergabe</li>
        <li>Ihre Google-Bewertungen (5,0)</li>
        <li>Kontakt, Einsatzgebiet und Anfrageformular</li>
      </ul>
    </div>
    <div>
      <h3>Technik</h3>
      <ul class="list">
        <li>Sichere Verbindung (https), kein „Nicht sicher“ im Browser</li>
        <li>Schnell auf dem Handy, Bilder automatisch verkleinert</li>
        <li>Schriften liegen auf dem eigenen Server, keine Daten an Google</li>
        <li>Kein WordPress, also keine Plugins, die veralten</li>
        <li>Die Vorführversion ist für Suchmaschinen gesperrt, damit Google sie nicht neben Ihrer jetzigen Seite zeigt</li>
      </ul>
    </div>
  </div>
  ${footer(3)}
</section>

<section class="page">
  <div class="eyebrow">Teil 1 · Website</div>
  <h2>Ihre Fotos im Mittelpunkt</h2>
  <p class="lead">Alle Bilder stammen von Ihrer bisherigen Website, in voller Auflösung. Auf der alten Seite waren die Galerien kaputt, hier sind sie wieder zu sehen.</p>
  <div style="display:grid;grid-template-columns:1fr 50mm;gap:7mm;margin-top:5mm;align-items:start">
    <div>
      <div class="shot"><img src="${img('site-referenzen')}"></div>
      <h3 style="margin-top:3.5mm">Referenzen</h3><p class="muted">Ein großes Bild, vier kleine, ohne Lücken. Filter nach Pflaster, Naturstein, Treppen, Terrassen, Zäunen und Garten. Ein Klick öffnet das Foto groß, mit Pfeilen oder Wischen blättern.</p>
      <div class="shot" style="margin-top:4mm"><img src="${img('site-baustelle')}"></div>
      <h3 style="margin-top:3.5mm">Auf der Baustelle</h3><p class="muted">Laufband mit Fotos von der Arbeit selbst. Zeigt, dass hier selbst gebaut wird. Neue Baustellenfotos lassen sich jederzeit dazunehmen.</p>
    </div>
    <figure style="margin:0"><div class="phone"><img src="${img('mob-site-hero')}"></div><figcaption style="margin-top:2.5mm;font-size:9pt"><b>Am Handy:</b> Startbild wechselt alle paar Sekunden. Anrufen und Anfrage sind mit dem Daumen erreichbar.</figcaption></figure>
  </div>
  ${footer(4)}
</section>

<section class="page">
  <div class="eyebrow">Teil 2 · Büro</div>
  <h2>Von der Anfrage zur Rechnung</h2>
  <p class="lead">So läuft ein Auftrag im Auftragsbuch. Anmelden als „Büro Zaidel“ oder „Dimitri Zaidel“ mit PIN <span class="pin">1234</span>.</p>
  <div class="shot" style="margin-top:4mm"><img src="${img('dash')}"></div>
  <ol class="steps" style="margin-top:6mm">
    <li><div><b>Anfrage kommt rein.</b> Über die Website automatisch, per Telefon mit „Neuer Auftrag“. Auf der Startseite „Heute“ sehen Sie neue Anfragen, laufende Baustellen, offene Angebote und überfällige Rechnungen.</div></li>
    <li><div><b>Besichtigung planen.</b> Im Auftrag unter „Einsätze“ einen Termin anlegen und eintragen, wer hinfährt.</div></li>
    <li><div><b>Angebot schreiben.</b> „Dokumente“ → „Angebot erstellen“. Positionen aus dem Leistungskatalog übernehmen, Mengen und Preise anpassen. Wird automatisch gespeichert. „PDF / Drucken“ erzeugt den fertigen Briefbogen.</div></li>
    <li><div><b>Angebot angenommen.</b> Status auf „Angenommen“ stellen, der Auftrag springt auf „Beauftragt“. Team und Einsatztage festlegen.</div></li>
    <li><div><b>Rechnung.</b> Im Angebot „In Rechnung umwandeln“: alle Positionen werden übernommen, Nummer und Fälligkeit automatisch. Bezahlt? Status auf „Bezahlt“.</div></li>
  </ol>
  ${footer(5)}
</section>

<section class="page">
  <div class="eyebrow">Teil 2 · Büro</div>
  <h2>Alles im Blick</h2>
  <div class="grid2" style="margin-top:5mm;gap:6mm">
    <div><div class="shot"><img src="${img('jobs')}"></div><h3 style="margin-top:3.5mm">Aufträge als Tafel</h3><p class="muted">Jede Spalte ist ein Schritt. Karten mit der Maus in die nächste Spalte ziehen. Alternativ als Liste mit Suche nach Kunde, Ort oder Leistung.</p></div>
    <div><div class="shot"><img src="${img('plan')}"></div><h3 style="margin-top:3.5mm">Einsatzplan</h3><p class="muted">Die Woche auf einen Blick: wer ist an welchem Tag auf welcher Baustelle.</p></div>
  </div>
  <div style="display:grid;grid-template-columns:1fr 62mm;gap:7mm;margin-top:6mm">
    <div><div class="shot"><img src="${img('job')}"></div><h3 style="margin-top:3.5mm">Ein Auftrag</h3><p class="muted">Oben Route, Anrufen und E-Mail. Darunter Beschreibung, Aufgaben zum Abhaken, Team, Einsatztage und Karte. Wichtige Hinweise (z. B. Leitungen im Boden) stehen gelb ganz oben.</p></div>
    <div><div class="shot"><img src="${img('doc')}"></div><h3 style="margin-top:3.5mm">Angebot als PDF</h3><p class="muted">Mit Ihrem Briefkopf, Positionen und Mehrwertsteuer.</p></div>
  </div>
  ${footer(6)}
</section>

<section class="page">
  <div class="eyebrow">Teil 3 · Baustelle</div>
  <h2>Auf dem Handy</h2>
  <p class="lead">Für die Mitarbeiter draußen. Große Knöpfe, auch mit Handschuhen zu treffen. Zum Ausprobieren als „Paul M.“ mit PIN <span class="pin">2222</span> anmelden.</p>
  <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:5mm;margin-top:6mm">
    <figure style="margin:0"><div class="phone"><img src="${img('mob-dash')}"></div><figcaption style="margin-top:2.5mm;font-size:9pt"><b>Heute:</b> eigene Baustelle, Route, Kunde anrufen.</figcaption></figure>
    <figure style="margin:0"><div class="phone"><img src="${img('mob-fotos')}"></div><figcaption style="margin-top:2.5mm;font-size:9pt"><b>Fotos:</b> „Foto aufnehmen“ öffnet die Kamera.</figcaption></figure>
    <figure style="margin:0"><div class="phone"><img src="${img('mob-notes')}"></div><figcaption style="margin-top:2.5mm;font-size:9pt"><b>Notizen:</b> statt WhatsApp, alles beim Auftrag.</figcaption></figure>
    <figure style="margin:0"><div class="phone"><img src="${img('mob-doc')}"></div><figcaption style="margin-top:2.5mm;font-size:9pt"><b>Angebot:</b> Mengen sichtbar, Preise nicht.</figcaption></figure>
  </div>
  <div class="grid2" style="margin-top:8mm">
    <div class="card"><h3>Was Mitarbeiter tun</h3><ul class="list" style="margin-top:2mm"><li>Fotos vorher, während, nachher hochladen</li><li>Notizen schreiben, Fragen ans Büro</li><li>Aufgaben abhaken</li><li>Lieferscheine fotografieren oder hochladen</li></ul></div>
    <div class="card"><h3>Als App aufs Handy</h3><p class="muted" style="margin-bottom:2mm">Einmal einrichten, dann startet es wie eine App:</p><ul class="list"><li><span><b>iPhone:</b> in Safari öffnen, Teilen-Symbol, „Zum Home-Bildschirm“</span></li><li><span><b>Android:</b> in Chrome öffnen, Menü ⋮, „Zum Startbildschirm hinzufügen“</span></li></ul></div>
  </div>
  ${footer(7)}
</section>

<section class="page">
  <div class="eyebrow">Rechte</div>
  <h2>Wer darf was?</h2>
  <p class="lead">Jeder meldet sich mit seinem eigenen Namen an. So sieht man bei jedem Foto und jeder Notiz, von wem sie ist.</p>
  <table style="margin-top:5mm">
    <tr><th></th><th>Inhaber</th><th>Büro</th><th>Mitarbeiter</th></tr>
    <tr><td>Aufträge, Fotos und Notizen sehen</td><td class="y">ja</td><td class="y">ja</td><td class="y">ja</td></tr>
    <tr><td>Fotos hochladen, Notizen schreiben, Aufgaben abhaken</td><td class="y">ja</td><td class="y">ja</td><td class="y">ja</td></tr>
    <tr><td>Angebote und Rechnungen ansehen</td><td class="y">ja</td><td class="y">ja</td><td>Mengen ohne Preise*</td></tr>
    <tr><td>Angebote und Rechnungen schreiben</td><td class="y">ja</td><td class="y">ja</td><td class="n">nein</td></tr>
    <tr><td>Aufträge anlegen, Team und Einsätze planen</td><td class="y">ja</td><td class="y">ja</td><td class="n">nein</td></tr>
    <tr><td>Umsätze und offene Rechnungen</td><td class="y">ja</td><td class="y">ja</td><td class="n">nein</td></tr>
    <tr><td>Mitarbeiter anlegen und sperren</td><td class="y">ja</td><td class="n">nein</td><td class="n">nein</td></tr>
  </table>
  <p class="muted" style="font-size:9pt;margin-top:2.5mm">* Pro Person umschaltbar unter „Team“ → „Darf Preise sehen“. Verlässt jemand die Firma, wird er unter „Team“ gesperrt und kommt nicht mehr hinein.</p>

  <h3 style="margin-top:9mm">Schon eingebaut</h3>
  <div class="grid2" style="margin-top:2mm">
    <ul class="list"><li>Fortlaufende Nummern für Aufträge, Angebote, Rechnungen</li><li>Leistungskatalog mit Richtpreisen, frei anpassbar</li><li>Überfällige Rechnungen werden rot markiert</li></ul>
    <ul class="list"><li>Verlauf: wer hat wann was geändert</li><li>Kundenkartei mit allen Aufträgen und Umsatz</li><li>Dateien wie Pläne oder Lieferscheine je Auftrag</li></ul>
  </div>
  ${footer(8)}
</section>

<section class="page">
  <div class="eyebrow">Nächste Schritte</div>
  <h2>Für die echte Version</h2>
  <p class="lead">Die Vorführversion zeigt, wie es aussieht und sich bedient. Für den echten Betrieb brauche ich von Ihnen ein paar Dinge.</p>
  <div class="grid2" style="margin-top:6mm;gap:6mm">
    <div class="card">
      <h3>Firmendaten</h3>
      <ul class="check" style="margin-top:2mm">
        <li>Richtige Anschrift für das Impressum (auf der jetzigen Seite steht Freudenberg, bei Google Kleinheubach)</li>
        <li>Bankverbindung für Rechnungen</li>
        <li>Steuernummer bzw. USt-IdNr.</li>
        <li>Logo als Originaldatei, falls vorhanden</li>
      </ul>
    </div>
    <div class="card">
      <h3>Inhalte</h3>
      <ul class="check" style="margin-top:2mm">
        <li>Texte der Website gegenlesen: stimmen Leistungen und Einsatzgebiet?</li>
        <li>Eigene Preise für den Leistungskatalog</li>
        <li>Neuere Fotos von aktuellen Baustellen</li>
        <li>Namen der Mitarbeiter, die Zugang bekommen</li>
      </ul>
    </div>
    <div class="card">
      <h3>Zugänge</h3>
      <ul class="check" style="margin-top:2mm">
        <li>Zugang zur Domain zaidel.de (wer hat sie registriert?)</li>
        <li>Zugang zum Google-Unternehmensprofil, um Öffnungszeiten und Website-Link zu pflegen</li>
      </ul>
    </div>
    <div class="card">
      <h3>Ihr Feedback</h3>
      <ul class="check" style="margin-top:2mm">
        <li>Was fehlt im Alltag? Was ist überflüssig?</li>
        <li>Wie laufen heute Angebote und Rechnungen (Programm, Steuerberater)?</li>
        <li>Brauchen Sie Zugriff ohne Netz auf der Baustelle?</li>
      </ul>
    </div>
  </div>
  <h3 style="margin-top:8mm">Aufgefallen an der jetzigen Website zaidel.de</h3>
  <ul class="list" style="margin-top:2mm">
    <li>Keine sichere Verbindung: Browser zeigen „Nicht sicher“</li>
    <li>Die Galerieseiten (Carports, Sichtschutz, Steingarten, Verblender) zeigen keine Bilder, nur Platzhalter-Code wie [foogallery id="605"]</li>
    <li>WordPress-Version von 2019 ohne Updates, das ist ein Sicherheitsrisiko</li>
  </ul>
  <div class="card" style="margin-top:8mm;display:flex;justify-content:space-between;align-items:center;background:#1f3a2b;border:0;color:#fff">
    <div><div style="font:500 14pt Fraunces,serif">Fragen oder Wünsche?</div><div style="color:#c9dcc0;font-size:9.5pt">Einfach bei Dennis melden. Am besten nach dem ersten Ausprobieren.</div></div>
    <div style="width:20mm;height:20mm;background:#faf8f4;border-radius:2mm;padding:2mm">${qrSite}</div>
  </div>
  ${footer(9)}
</section>

</body></html>`

const htmlPath = resolve(here, 'handover.html')
writeFileSync(htmlPath, html)
const b = await puppeteer.launch({ executablePath: process.env.CHROME ?? 'C:/Program Files/Google/Chrome/Application/chrome.exe', headless: true, args: ['--allow-file-access-from-files'] })
const p = await b.newPage()
await p.goto(pathToFileURL(htmlPath).href, { waitUntil: 'networkidle0' })
await p.evaluateHandle('document.fonts.ready')
await p.pdf({ path: out, format: 'A4', printBackground: true, preferCSSPageSize: true })
await p.setViewport({ width: 794, height: 1123 * 9 })
await p.screenshot({ path: resolve(here, 'preview.png'), fullPage: true })
await b.close()
console.log('PDF:', out)
