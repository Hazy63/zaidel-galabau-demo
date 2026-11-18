import { db, type Customer, type Doc, type Job, type LineItem, type Note, type Photo, type Task, type User, type Visit, type Activity } from './db'
import { addDays, today, totals } from './format'

const SEED_VERSION = 4

const H = 3600_000
const D = 24 * H

export const USERS: User[] = [
  { id: 'u-dz', name: 'Dimitri Zaidel', short: 'DZ', role: 'inhaber', title: 'Inhaber', phone: '0170 1861574', color: '#2b4d39', pin: '1234', canSeePrices: true, active: true },
  { id: 'u-buero', name: 'Büro Zaidel', short: 'BÜ', role: 'buero', title: 'Büro & Bauleitung', phone: '09375 9294537', color: '#a64b2a', pin: '1234', canSeePrices: true, active: true },
  { id: 'u-andrej', name: 'Andrej K.', short: 'AK', role: 'mitarbeiter', title: 'Vorarbeiter', color: '#3a6549', pin: '1111', canSeePrices: false, active: true },
  { id: 'u-paul', name: 'Paul M.', short: 'PM', role: 'mitarbeiter', title: 'Landschaftsgärtner', color: '#6b5b3e', pin: '2222', canSeePrices: false, active: true },
  { id: 'u-tim', name: 'Tim R.', short: 'TR', role: 'mitarbeiter', title: 'Azubi, 2. Lehrjahr', color: '#4b6a88', pin: '3333', canSeePrices: false, active: true },
]

const li = (title: string, qty: number, unit: string, price: number, detail?: string): LineItem => ({
  id: Math.random().toString(36).slice(2, 9),
  title,
  detail,
  qty,
  unit,
  price,
})

export async function ensureSeed(force = false) {
  const v = (await db.meta.get('seed'))?.value
  if (!force && v === SEED_VERSION) return
  await db.transaction('rw', [db.users, db.customers, db.jobs, db.photos, db.docs, db.notes, db.tasks, db.visits, db.activities, db.meta], async () => {
    await Promise.all([db.users.clear(), db.customers.clear(), db.jobs.clear(), db.photos.clear(), db.docs.clear(), db.notes.clear(), db.tasks.clear(), db.visits.clear(), db.activities.clear(), db.meta.clear()])
    const now = Date.now()
    const t = today()

    const customers: Customer[] = [
      { id: 'c1', kind: 'privat', name: 'Familie Becker', street: 'Mainstraße 14', zip: '63897', city: 'Miltenberg', phone: '09371 40 21 88', email: 'becker.familie@web.de', createdAt: now - 40 * D },
      { id: 'c2', kind: 'privat', name: 'Stefan Hofmann', street: 'Am Steinweg 7', zip: '63920', city: 'Großheubach', phone: '0151 2290 4471', email: 's.hofmann@gmx.de', note: 'Hanggrundstück, Zufahrt nur von oben mit Minibagger.', createdAt: now - 55 * D },
      { id: 'c3', kind: 'privat', name: 'Renate Weber', street: 'Lindenweg 3', zip: '63924', city: 'Kleinheubach', phone: '09371 66 31 02', createdAt: now - 21 * D },
      { id: 'c4', kind: 'privat', name: 'Daniel & Julia Schäfer', street: 'Birkenstraße 22', zip: '63925', city: 'Laudenbach', phone: '0176 4410 2398', email: 'julia.schaefer@t-online.de', createdAt: now - 90 * D },
      { id: 'c5', kind: 'privat', name: 'Markus Ziegler', street: 'Weinbergstraße 41', zip: '63906', city: 'Erlenbach a. Main', phone: '0160 9821 5530', email: 'm.ziegler@outlook.de', createdAt: now - 12 * D },
      { id: 'c6', kind: 'privat', name: 'Sabine Krämer', street: 'Odenwaldring 9', zip: '63927', city: 'Bürgstadt', phone: '09371 9 87 11', createdAt: now - 9 * D },
      { id: 'c7', kind: 'privat', name: 'Thomas Wolf', street: 'Bahnhofstraße 5', zip: '63820', city: 'Elsenfeld', phone: '0172 6603 1184', email: 'thomas.wolf@mail.de', createdAt: now - 4 * D },
      { id: 'c8', kind: 'privat', name: 'Katrin Neumann', street: 'Römerstraße 18', zip: '63785', city: 'Obernburg a. Main', phone: '0157 3318 0042', email: 'k.neumann@posteo.de', createdAt: now - 5 * H },
      { id: 'c9', kind: 'gewerbe', name: 'Kfz-Technik Ruppert', company: 'Ruppert GmbH', street: 'Industriestraße 3', zip: '63924', city: 'Kleinheubach', phone: '09371 20 50 0', email: 'info@kfz-ruppert.de', createdAt: now - 1 * D },
      { id: 'c10', kind: 'gewerbe', name: 'Hausverwaltung Sauer', company: 'Sauer Immobilien GbR', street: 'Hauptstraße 60', zip: '63920', city: 'Großheubach', phone: '09371 30 40 20', email: 'verwaltung@sauer-immo.de', note: 'Rahmenvertrag Grünpflege, 3 Wohnanlagen.', createdAt: now - 200 * D },
      { id: 'c11', kind: 'privat', name: 'Peter Lang', street: 'Schlossgasse 2', zip: '63916', city: 'Amorbach', phone: '09373 20 77 4', createdAt: now - 70 * D },
      { id: 'c12', kind: 'privat', name: 'Ingrid Roth', street: 'Engelbergweg 11', zip: '63897', city: 'Miltenberg', phone: '09371 81 12 3', createdAt: now - 60 * D },
    ]

    const J = (j: Partial<Job> & Pick<Job, 'id' | 'number' | 'title' | 'customerId' | 'status'>): Job => {
      const c = customers.find((x) => x.id === j.customerId)!
      return {
        street: c.street,
        zip: c.zip,
        city: c.city,
        description: '',
        services: [],
        assignees: [],
        source: 'telefon',
        createdAt: now - 10 * D,
        updatedAt: now - 2 * D,
        ...j,
      }
    }

    const jobs: Job[] = [
      J({ id: 'j1', number: 'A-2026-031', title: 'Hofeinfahrt & Garagenvorplatz pflastern', customerId: 'c1', status: 'in_arbeit', services: ['Pflasterarbeiten', 'Entwässerung', 'Treppenbau'], startDate: addDays(t, -3), endDate: addDays(t, 4), assignees: ['u-andrej', 'u-paul', 'u-tim'], estimate: 18640, cover: 'pflaster-einfahrt-garage', description: 'Alte Asphaltfläche (ca. 95 m²) aufnehmen, Unterbau neu, Betonsteinpflaster grau-anthrazit im Läuferverband. Entwässerungsrinne vor der Garage, zwei Blockstufen zum Hauseingang.', createdAt: now - 34 * D, updatedAt: now - 2 * H }),
      J({ id: 'j2', number: 'A-2026-029', title: 'Hangabfangung mit Buntsandstein-Blöcken', customerId: 'c2', status: 'in_arbeit', services: ['Natursteinmauer', 'Erdarbeiten', 'Rollrasen'], startDate: addDays(t, -8), endDate: addDays(t, 2), assignees: ['u-dz', 'u-andrej'], estimate: 24300, cover: 'sandstein-setzen-bagger', description: 'Böschung ca. 22 m lang, Höhe bis 1,40 m. Buntsandstein-Findlinge aus dem Steinbruch Mainbullau, trocken gesetzt, dahinter Drainage. Anschließend Rasenfläche neu.', createdAt: now - 50 * D, updatedAt: now - 5 * H }),
      J({ id: 'j3', number: 'A-2026-033', title: 'Granit-Blockstufen am Hauseingang', customerId: 'c3', status: 'beauftragt', services: ['Treppenbau', 'Pflasterarbeiten'], startDate: addDays(t, 6), endDate: addDays(t, 8), assignees: ['u-andrej', 'u-tim'], estimate: 6980, cover: 'granit-treppe-einfahrt', description: 'Bestehende Betontreppe (5 Stufen) abbrechen, neue Blockstufen Granit grau geflammt 150 × 35 × 15 cm auf Betonfundament. Podest mit Granitplatten.', createdAt: now - 18 * D, updatedAt: now - 1 * D }),
      J({ id: 'j4', number: 'A-2026-024', title: 'Neuanlage Reihenhausgarten', customerId: 'c4', status: 'abgeschlossen', services: ['Rollrasen', 'Sichtschutz & Zaun', 'Terrasse', 'Bepflanzung'], startDate: addDays(t, -42), endDate: addDays(t, -33), assignees: ['u-andrej', 'u-paul'], estimate: 14250, cover: 'nachher-garten-zaun', description: 'Garten nach Neubau komplett angelegt: Planum, Rollrasen, Doppelstabmattenzaun mit Sichtschutzstreifen anthrazit, Terrasse aus Betonplatten, Kiesbeete mit Gräsern.', createdAt: now - 85 * D, updatedAt: now - 30 * D }),
      J({ id: 'j5', number: 'A-2026-034', title: 'Terrasse Feinsteinzeug 40 m²', customerId: 'c5', status: 'angebot', services: ['Terrasse', 'Entwässerung'], assignees: [], estimate: 11870, cover: 'terrasse-platten', description: 'Terrasse am Wohnzimmer, Feinsteinzeug 60 × 60 cm auf Stelzlagern bzw. Drainmörtel. Kunde wünscht Muster in Grau und Beige.', createdAt: now - 11 * D, updatedAt: now - 3 * D }),
      J({ id: 'j6', number: 'A-2026-035', title: 'Sichtschutzzaun Grundstücksgrenze', customerId: 'c6', status: 'angebot', services: ['Sichtschutz & Zaun'], assignees: [], estimate: 4820, cover: 'sichtschutz-anthrazit', description: '24 lfm Doppelstabmatte 1,63 m mit Sichtschutzstreifen anthrazit, Pfosten einbetoniert, ein Gartentor 1-flügelig.', createdAt: now - 8 * D, updatedAt: now - 6 * D }),
      J({ id: 'j7', number: 'A-2026-036', title: 'Carport Holz mit Abstellraum', customerId: 'c7', status: 'besichtigung', services: ['Carport', 'Pflasterarbeiten'], startDate: addDays(t, 1), assignees: ['u-dz'], cover: 'carport-holz', description: 'Doppelcarport Leimholz, ca. 6 × 6 m, mit Geräteraum hinten. Stellfläche mit Rasengitter oder Pflaster – vor Ort klären.', source: 'empfehlung', createdAt: now - 4 * D, updatedAt: now - 4 * D }),
      J({ id: 'j8', number: 'A-2026-037', title: 'Vorgarten pflegeleicht umgestalten', customerId: 'c8', status: 'anfrage', services: ['Bepflanzung', 'Pflasterarbeiten'], assignees: [], source: 'website', description: 'Anfrage über die Website:\n„Wir möchten unseren Vorgarten (ca. 30 m²) pflegeleichter gestalten, gerne mit ein paar Natursteinen und Stauden. Kein Schottergarten. Wann hätten Sie Zeit für einen Termin?“', createdAt: now - 5 * H, updatedAt: now - 5 * H }),
      J({ id: 'j9', number: 'A-2026-038', title: 'Kundenparkplätze mit Rasengitter', customerId: 'c9', status: 'anfrage', services: ['Pflasterarbeiten', 'Erdarbeiten'], assignees: [], description: 'Telefonat mit Hr. Ruppert: 8 Stellplätze neben der Werkstatt, Fläche ca. 140 m², versickerungsfähig wegen Auflage der Gemeinde.', createdAt: now - 1 * D, updatedAt: now - 1 * D }),
      J({ id: 'j10', number: 'A-2026-012', title: 'Grünpflege Wohnanlage Am Engelberg', customerId: 'c10', status: 'beauftragt', services: ['Gartenpflege'], startDate: addDays(t, 3), endDate: addDays(t, 3), assignees: ['u-paul', 'u-tim'], estimate: 1450, cover: 'thuja-hecke', source: 'stammkunde', description: 'Herbstschnitt Hecken (ca. 80 lfm Thuja/Liguster), Laub entfernen, Beete winterfest. Grüngut wird mitgenommen.', createdAt: now - 120 * D, updatedAt: now - 2 * D }),
      J({ id: 'j11', number: 'A-2026-019', title: 'Natursteinverblender Wohnzimmerwand', customerId: 'c11', status: 'abgeschlossen', services: ['Verblender'], startDate: addDays(t, -61), endDate: addDays(t, -58), assignees: ['u-dz', 'u-andrej'], estimate: 3960, cover: 'verblender-naturstein', description: 'Wand 4,2 × 2,6 m mit Quarzit-Verblendern (Wildverband) belegen, Steckdosen ausgeschnitten.', source: 'empfehlung', createdAt: now - 68 * D, updatedAt: now - 50 * D }),
      J({ id: 'j12', number: 'A-2026-022', title: 'Gartenweg aus Polygonalplatten', customerId: 'c12', status: 'abgeschlossen', services: ['Pflasterarbeiten'], startDate: addDays(t, -36), endDate: addDays(t, -34), assignees: ['u-andrej', 'u-paul'], estimate: 3420, cover: 'polygonalplatten', description: 'Weg vom Haus zum Gartenhaus, ca. 18 m², Polygonalplatten Quarzit hell in Splitt-Trass-Mörtel.', createdAt: now - 58 * D, updatedAt: now - 20 * D }),
    ]

    let pi = 0
    const P = (jobId: string, phase: Photo['phase'], src: string, caption: string, userId: string, ago: number): Photo => ({
      id: `p${++pi}`,
      jobId,
      phase,
      src,
      caption,
      userId,
      createdAt: now - ago,
    })
    const photos: Photo[] = [
      P('j1', 'vorher', 'beet-randstein-strasse', 'Zustand vor Beginn, Asphalt gerissen', 'u-dz', 30 * D),
      P('j1', 'waehrend', 'erdarbeiten-schubkarre', 'Aushub 35 cm, Boden abgefahren', 'u-andrej', 3 * D),
      P('j1', 'waehrend', 'treppe-bau-mitarbeiter', 'Blockstufen gesetzt', 'u-paul', 1 * D),
      P('j1', 'waehrend', 'pflaster-einfahrt-garage', 'Erste Bahn Pflaster vor der Garage', 'u-andrej', 3 * H),
      P('j2', 'vorher', 'mauer-hang-pflanzen', 'Böschung vorher, rutscht bei Regen nach', 'u-dz', 48 * D),
      P('j2', 'waehrend', 'sandstein-setzen-bagger', 'Untere Lage gesetzt', 'u-andrej', 6 * D),
      P('j2', 'waehrend', 'sandstein-treppe-garten', 'Treppe in der Mauer integriert', 'u-dz', 2 * D),
      P('j2', 'waehrend', 'pflaster-sandstein-detail', 'Übergang Mauer – Hof mit Kiesstreifen', 'u-andrej', 5 * H),
      P('j3', 'vorher', 'weg-treppe-hang', 'Bestehende Treppe, Stufen abgeplatzt', 'u-buero', 17 * D),
      P('j4', 'vorher', 'vorher-garten-sand', 'Nach Planum, vor Zaun und Rasen', 'u-andrej', 41 * D),
      P('j4', 'waehrend', 'kiesbeet-anlegen', 'Kiesbeet mit Vlies', 'u-paul', 37 * D),
      P('j4', 'nachher', 'nachher-garten-zaun', 'Fertig – Zaun mit Sichtschutzstreifen', 'u-andrej', 33 * D),
      P('j4', 'nachher', 'terrasse-sichtschutz-lounge', 'Terrasse mit Lounge-Ecke', 'u-dz', 33 * D),
      P('j4', 'nachher', 'nachher-rasen-neu', 'Rollrasen nach 2 Wochen', 'u-dz', 20 * D),
      P('j5', 'vorher', 'terrasse-platten', 'Referenz: ähnliche Terrasse 2025, Kunde gezeigt', 'u-dz', 9 * D),
      P('j7', 'vorher', 'carport-weiss', 'Kunde wünscht so etwas in Holzoptik', 'u-buero', 3 * D),
      P('j10', 'vorher', 'thuja-hecke', 'Hecke Nordseite, letzter Schnitt', 'u-paul', 90 * D),
      P('j11', 'waehrend', 'verblender-naturstein', 'Wand zu 2/3 fertig', 'u-andrej', 59 * D),
      P('j11', 'nachher', 'verblender-naturstein', 'Abgenommen, Kunde sehr zufrieden', 'u-dz', 58 * D),
      P('j12', 'nachher', 'polygonalplatten', 'Fugen fertig, vor dem Abkehren', 'u-paul', 34 * D),
    ]

    const items1 = [
      li('Baustelleneinrichtung', 1, 'psch', 450, 'An- und Abfahrt Maschinen, Absperrung'),
      li('Asphalt aufnehmen und entsorgen', 95, 'm²', 14.5),
      li('Bodenaushub 35 cm, laden und abfahren', 33, 'm³', 38),
      li('Schottertragschicht 0/32, 25 cm verdichtet', 95, 'm²', 22),
      li('Betonsteinpflaster 20 × 10 × 8 liefern und verlegen', 95, 'm²', 64, 'Farbe grau-anthrazit, Läuferverband'),
      li('Tiefbord 100 × 25 × 8 in Beton', 38, 'lfm', 34),
      li('Entwässerungsrinne Klasse C mit Anschluss', 6, 'lfm', 145),
      li('Blockstufe Beton 100 × 35 × 15', 2, 'Stk', 210),
    ]
    const items2 = [
      li('Baustelleneinrichtung inkl. Minibagger 3,5 t', 1, 'psch', 680),
      li('Böschung profilieren, Aushub seitlich lagern', 1, 'psch', 1850),
      li('Buntsandstein-Blöcke liefern', 46, 't', 118, 'Steinbruch Mainbullau, Kantenlänge 60–120 cm'),
      li('Blöcke mit Bagger trocken setzen', 46, 't', 165),
      li('Drainage DN 100 mit Kiespackung', 24, 'lfm', 42),
      li('Treppe aus Sandsteinstufen', 4, 'Stk', 340),
      li('Rollrasen inkl. Feinplanum', 120, 'm²', 14.5),
    ]
    const items3 = [
      li('Altbestand Betontreppe abbrechen und entsorgen', 1, 'psch', 980),
      li('Fundament Beton C25/30', 1.8, 'm³', 420),
      li('Blockstufe Granit grau, geflammt, 150 × 35 × 15', 5, 'Stk', 395),
      li('Podest Granitplatten 3 cm im Mörtelbett', 3.2, 'm²', 165),
      li('Anschlussarbeiten Pflaster', 1, 'psch', 240),
    ]
    const items4 = [
      li('Feinplanum und Bodenverbesserung', 140, 'm²', 6.5),
      li('Rollrasen Sport & Spiel liefern und verlegen', 110, 'm²', 13.9),
      li('Doppelstabmattenzaun 1,43 m anthrazit', 26, 'lfm', 89),
      li('Sichtschutzstreifen Hart-PVC anthrazit', 26, 'lfm', 24),
      li('Terrasse Betonplatten 60 × 30 auf Splittbett', 22, 'm²', 98),
      li('Kiesbeet mit Unkrautvlies, Kies 16/32', 14, 'm²', 39),
      li('Gräser und Stauden liefern und pflanzen', 1, 'psch', 760),
    ]
    const items5 = [
      li('Aushub und Unterbau Schotter 0/32', 40, 'm²', 34),
      li('Feinsteinzeug 60 × 60 × 2 cm auf Drainmörtel', 40, 'm²', 178, 'Muster in Grau und Beige vorab'),
      li('Randeinfassung Edelstahl', 18, 'lfm', 46),
      li('Schlitzrinne vor Terrassentür', 4, 'lfm', 165),
    ]
    const items6 = [
      li('Doppelstabmatte 1,63 m anthrazit inkl. Pfosten', 24, 'lfm', 112),
      li('Sichtschutzstreifen anthrazit', 24, 'lfm', 26),
      li('Gartentor 1-flügelig 100 × 160 mit Schloss', 1, 'Stk', 980),
      li('Pfosten einbetonieren', 13, 'Stk', 38),
    ]
    const items11 = [
      li('Untergrund vorbereiten, Haftbrücke', 11, 'm²', 18),
      li('Quarzit-Verblender liefern und verkleben', 11, 'm²', 248),
      li('Ecken und Ausschnitte', 1, 'psch', 520),
    ]
    const items12 = [
      li('Aushub, Unterbau Schotter', 18, 'm²', 32),
      li('Polygonalplatten Quarzit hell in Splitt-Trass-Mörtel', 18, 'm²', 129),
      li('Verfugen mit Trassmörtel', 18, 'm²', 14),
    ]

    const intro = 'Sehr geehrte Damen und Herren,\nvielen Dank für Ihre Anfrage. Gerne bieten wir Ihnen folgende Leistungen an:'
    const introR = 'Für die ausgeführten Arbeiten erlauben wir uns, wie folgt abzurechnen:'
    const outro = 'Das Angebot ist 30 Tage gültig. Ausführung nach Absprache. Wir freuen uns auf Ihren Auftrag.'
    const outroR = 'Bitte überweisen Sie den Betrag innerhalb von 14 Tagen ohne Abzug. Vielen Dank für Ihr Vertrauen.'

    const docs: Doc[] = [
      { id: 'd1', jobId: 'j1', kind: 'angebot', number: 'AN-2026-041', title: 'Angebot Hofeinfahrt', status: 'angenommen', date: addDays(t, -30), intro, outro, items: items1, userId: 'u-dz', createdAt: now - 30 * D },
      { id: 'd1r', jobId: 'j1', kind: 'rechnung', number: 'RE-2026-052', title: 'Abschlagsrechnung 1 (40 %)', status: 'versendet', date: addDays(t, -2), dueDate: addDays(t, 12), intro: 'Gemäß Vereinbarung stellen wir Ihnen eine Abschlagszahlung in Rechnung:', outro: outroR, items: [li('Abschlag 40 % auf Angebot AN-2026-041', 1, 'psch', 7456)], userId: 'u-buero', createdAt: now - 2 * D, fromDocId: 'd1' },
      { id: 'd1f', jobId: 'j1', kind: 'datei', title: 'Leitungsplan Stadtwerke', fileName: 'Leitungsplan-Mainstrasse-14.pdf', mime: 'application/pdf', size: 41_200, src: 'docs/leitungsplan.pdf', userId: 'u-buero', date: addDays(t, -20), createdAt: now - 20 * D },
      { id: 'd2', jobId: 'j2', kind: 'angebot', number: 'AN-2026-037', title: 'Angebot Hangabfangung', status: 'angenommen', date: addDays(t, -45), intro, outro, items: items2, userId: 'u-dz', createdAt: now - 45 * D },
      { id: 'd2f', jobId: 'j2', kind: 'datei', title: 'Lieferschein Steinbruch', fileName: 'Lieferschein-Sandstein-46t.pdf', mime: 'application/pdf', size: 38_900, src: 'docs/lieferschein.pdf', userId: 'u-andrej', date: addDays(t, -7), createdAt: now - 7 * D },
      { id: 'd3', jobId: 'j3', kind: 'angebot', number: 'AN-2026-044', title: 'Angebot Granittreppe', status: 'angenommen', date: addDays(t, -15), intro, outro, items: items3, userId: 'u-dz', createdAt: now - 15 * D },
      { id: 'd4', jobId: 'j4', kind: 'angebot', number: 'AN-2026-030', title: 'Angebot Gartenanlage', status: 'angenommen', date: addDays(t, -80), intro, outro, items: items4, userId: 'u-dz', createdAt: now - 80 * D },
      { id: 'd4r', jobId: 'j4', kind: 'rechnung', number: 'RE-2026-044', title: 'Schlussrechnung', status: 'bezahlt', date: addDays(t, -32), dueDate: addDays(t, -18), intro: introR, outro: outroR, items: items4, userId: 'u-buero', createdAt: now - 32 * D, fromDocId: 'd4' },
      { id: 'd5', jobId: 'j5', kind: 'angebot', number: 'AN-2026-046', title: 'Angebot Terrasse', status: 'versendet', date: addDays(t, -3), intro, outro, items: items5, userId: 'u-dz', createdAt: now - 3 * D },
      { id: 'd6', jobId: 'j6', kind: 'angebot', number: 'AN-2026-047', title: 'Angebot Sichtschutz', status: 'entwurf', date: addDays(t, -1), intro, outro, items: items6, userId: 'u-buero', createdAt: now - 1 * D },
      { id: 'd11', jobId: 'j11', kind: 'angebot', number: 'AN-2026-022', title: 'Angebot Verblender', status: 'angenommen', date: addDays(t, -66), intro, outro, items: items11, userId: 'u-dz', createdAt: now - 66 * D },
      { id: 'd11r', jobId: 'j11', kind: 'rechnung', number: 'RE-2026-031', title: 'Rechnung', status: 'bezahlt', date: addDays(t, -57), dueDate: addDays(t, -43), intro: introR, outro: outroR, items: items11, userId: 'u-buero', createdAt: now - 57 * D, fromDocId: 'd11' },
      { id: 'd12', jobId: 'j12', kind: 'angebot', number: 'AN-2026-027', title: 'Angebot Gartenweg', status: 'angenommen', date: addDays(t, -55), intro, outro, items: items12, userId: 'u-dz', createdAt: now - 55 * D },
      { id: 'd12r', jobId: 'j12', kind: 'rechnung', number: 'RE-2026-047', title: 'Rechnung', status: 'versendet', date: addDays(t, -33), dueDate: addDays(t, -19), intro: introR, outro: outroR, items: items12, userId: 'u-buero', createdAt: now - 33 * D, fromDocId: 'd12' },
    ]

    for (const j of jobs) {
      const offer = docs.find((d) => d.jobId === j.id && d.kind === 'angebot')
      if (offer) j.estimate = Math.round(totals(offer.items).net)
    }

    let ni = 0
    const N = (jobId: string, userId: string, text: string, ago: number, pinned = false): Note => ({ id: `n${++ni}`, jobId, userId, text, createdAt: now - ago, pinned })
    const notes: Note[] = [
      N('j1', 'u-dz', 'Achtung: Wasserleitung läuft ca. 40 cm tief entlang der Garage – Leitungsplan liegt unter Dokumente. Dort nur von Hand schachten!', 20 * D, true),
      N('j1', 'u-buero', 'Pflaster ist beim Händler bestellt, Lieferung Donnerstag 7:30 Uhr. Kunde stellt die Einfahrt frei.', 5 * D),
      N('j1', 'u-andrej', 'Aushub fertig. Unterbau morgen, Rüttelplatte ist im Hänger.', 2 * D),
      N('j1', 'u-paul', 'Frau Becker fragt, ob die Rinne auch vor der Haustür geht. Hab gesagt, der Chef ruft an.', 4 * H),
      N('j2', 'u-dz', 'Zufahrt nur über das Nachbargrundstück (Fam. Kunkel), Erlaubnis ist da. Bitte Rasen dort schonen, Platten auslegen.', 40 * D, true),
      N('j2', 'u-andrej', 'Zweite Ladung Steine kommt Freitag. Untere Lage steht, sieht gut aus.', 6 * D),
      N('j3', 'u-buero', 'Kundin ist 80 und schlecht zu Fuß – bitte während der Bauzeit Behelfstreppe oder Rampe stellen.', 10 * D, true),
      N('j4', 'u-dz', 'Kunde hat 5-Sterne-Bewertung bei Google versprochen. Nach 4 Wochen nochmal wegen Rasen nachschauen.', 31 * D),
      N('j5', 'u-dz', 'Kunde vergleicht noch mit einem zweiten Angebot. Nächste Woche nachfassen.', 2 * D),
      N('j7', 'u-buero', 'Termin mit Hr. Wolf morgen 16:30 vor Ort. Baugenehmigung fürs Carport klärt er selbst mit der Gemeinde.', 3 * D),
      N('j8', 'u-buero', 'Kam über das Kontaktformular der Website. Rückruf heute noch.', 4 * H),
      N('j10', 'u-paul', 'Hecke Nordseite letzte Mal stark zurückgeschnitten, diesmal nur Formschnitt.', 80 * D),
      N('j12', 'u-buero', 'Rechnung seit 19 Tagen fällig. Freundliche Zahlungserinnerung rausschicken?', 1 * D),
    ]

    let ti = 0
    const T = (jobId: string, text: string, done: boolean, doneBy?: string): Task => ({ id: `t${++ti}`, jobId, text, done, doneBy, createdAt: now - 10 * D + ti })
    const tasks: Task[] = [
      T('j1', 'Asphalt aufnehmen + Container', true, 'u-andrej'),
      T('j1', 'Aushub und Abfuhr', true, 'u-andrej'),
      T('j1', 'Tragschicht einbauen und verdichten', true, 'u-paul'),
      T('j1', 'Tiefborde setzen', false),
      T('j1', 'Rinne vor Garage setzen', false),
      T('j1', 'Pflastern + abrütteln', false),
      T('j1', 'Fugen einkehren, Baustelle räumen', false),
      T('j2', 'Steine abrufen (2. Ladung)', true, 'u-dz'),
      T('j2', 'Obere Lage setzen', false),
      T('j2', 'Drainage anschließen', false),
      T('j2', 'Rollrasen bestellen (120 m²)', false),
      T('j3', 'Granitstufen beim Händler reservieren', true, 'u-buero'),
      T('j3', 'Behelfstreppe mitnehmen', false),
      T('j7', 'Aufmaß vor Ort', false),
      T('j7', 'Fotos von Zufahrt und Untergrund', false),
      T('j10', 'Grüngut-Container anmelden', false),
    ]

    const visits: Visit[] = []
    let vi = 0
    const addVisits = (jobId: string, from: string, to: string, userIds: string[]) => {
      for (let d = from; d <= to; d = addDays(d, 1)) {
        const wd = new Date(d + 'T12:00:00').getDay()
        if (wd === 0) continue
        if (wd === 6) continue
        visits.push({ id: `v${++vi}`, jobId, date: d, userIds })
      }
    }
    addVisits('j1', addDays(t, -3), addDays(t, 4), ['u-andrej', 'u-paul', 'u-tim'])
    addVisits('j2', addDays(t, -8), addDays(t, 2), ['u-dz', 'u-andrej'])
    addVisits('j3', addDays(t, 6), addDays(t, 8), ['u-andrej', 'u-tim'])
    visits.push({ id: `v${++vi}`, jobId: 'j7', date: addDays(t, 1), userIds: ['u-dz'], note: 'Besichtigung 16:30' })
    visits.push({ id: `v${++vi}`, jobId: 'j10', date: addDays(t, 3), userIds: ['u-paul', 'u-tim'] })
    visits.push({ id: `v${++vi}`, jobId: 'j8', date: addDays(t, 2), userIds: ['u-dz'], note: 'Beratung vor Ort 10:00 (vorgeschlagen)' })

    const A = (userId: string, text: string, ago: number, jobId?: string): Activity => ({ id: Math.random().toString(36).slice(2, 10), userId, text, jobId, createdAt: now - ago })
    const activities: Activity[] = [
      A('u-buero', 'Neue Anfrage über die Website', 5 * H, 'j8'),
      A('u-andrej', '1 Foto hochgeladen', 5 * H, 'j2'),
      A('u-paul', 'Notiz geschrieben', 4 * H, 'j1'),
      A('u-andrej', '1 Foto hochgeladen', 3 * H, 'j1'),
      A('u-paul', 'Aufgabe erledigt: Tragschicht einbauen und verdichten', 26 * H, 'j1'),
      A('u-buero', 'Abschlagsrechnung RE-2026-052 erstellt', 2 * D, 'j1'),
      A('u-dz', 'Angebot AN-2026-046 versendet', 3 * D, 'j5'),
      A('u-buero', 'Auftrag angelegt', 1 * D, 'j9'),
    ]

    await db.users.bulkAdd(USERS)
    await db.customers.bulkAdd(customers)
    await db.jobs.bulkAdd(jobs)
    await db.photos.bulkAdd(photos)
    await db.docs.bulkAdd(docs)
    await db.notes.bulkAdd(notes)
    await db.tasks.bulkAdd(tasks)
    await db.visits.bulkAdd(visits)
    await db.activities.bulkAdd(activities)
    await db.meta.bulkPut([
      { key: 'seed', value: SEED_VERSION },
      { key: 'seq-A-' + new Date().getFullYear(), value: 38 },
      { key: 'seq-AN-' + new Date().getFullYear(), value: 47 },
      { key: 'seq-RE-' + new Date().getFullYear(), value: 52 },
    ])
  })
}
