export const CONTACT = {
  owner: 'Dimitri Zaidel',
  street: 'Löwengasse 2',
  zip: '63924',
  city: 'Kleinheubach',
  phone: '09375 929 45 37',
  phoneHref: 'tel:+4993759294537',
  mobile: '0170 186 15 74',
  mobileHref: 'tel:+491701861574',
  email: 'dzaidel01@gmail.com',
  maps: 'https://www.google.com/maps/search/?api=1&query=Zaidel+Garten-+und+Landschaftsbau+L%C3%B6wengasse+2+63924+Kleinheubach',
}

export type Cat = 'pflaster' | 'naturstein' | 'treppen' | 'terrassen' | 'zaun' | 'garten'

export const SERVICES: { id: Cat; title: string; text: string; tags: string[]; img: string }[] = [
  { id: 'pflaster', title: 'Pflaster & Wege', text: 'Hofeinfahrten, Garagenvorplätze und Gartenwege – mit sauberem Unterbau, damit nach Jahren nichts absackt.', tags: ['Betonstein', 'Naturstein', 'Rasengitter', 'Entwässerung'], img: 'pflaster-sandstein-einfahrt' },
  { id: 'naturstein', title: 'Mauern & Naturstein', text: 'Hangabfangungen aus Buntsandstein-Blöcken, Trockenmauern, Hochbeete und Gabionen. Gesetzt mit dem Bagger, ausgerichtet von Hand.', tags: ['Buntsandstein', 'Trockenmauer', 'Gabionen', 'Hochbeet'], img: 'sandsteinmauer-lang' },
  { id: 'treppen', title: 'Treppen & Stufen', text: 'Außentreppen und Hauseingänge aus Granit- oder Betonblockstufen, auf Fundament gesetzt – trittsicher und frostfest.', tags: ['Blockstufen', 'Granit', 'Podeste'], img: 'granit-treppe-einfahrt' },
  { id: 'terrassen', title: 'Terrassen', text: 'Terrassen aus Betonplatten, Feinsteinzeug oder Polygonalplatten. Mit Gefälle, das Wasser vom Haus wegführt.', tags: ['Feinsteinzeug', 'Polygonal', 'Betonplatten'], img: 'terrasse-platten' },
  { id: 'zaun', title: 'Zäune & Sichtschutz', text: 'Doppelstabmatten mit Sichtschutzstreifen, Tore und Gabionenzäune – Pfosten einbetoniert, Fluchten gerade.', tags: ['Doppelstabmatte', 'Sichtschutz', 'Tore'], img: 'sichtschutz-anthrazit' },
  { id: 'garten', title: 'Gartengestaltung & Pflege', text: 'Neuanlagen nach dem Hausbau, Rollrasen, Beete, Hecken. Auf Wunsch auch die regelmäßige Pflege danach.', tags: ['Neuanlage', 'Rollrasen', 'Bepflanzung', 'Heckenschnitt'], img: 'sitzplatz-trockenmauer' },
]

/** Hero-Diashow. pos = Bildausschnitt (object-position), damit das Motiv neben dem Text sichtbar bleibt */
export const HERO: { img: string; title: string; pos: string }[] = [
  { img: 'sandstein-treppe-garten', title: 'Sandsteintreppe in der Böschung', pos: '70% 60%' },
  { img: 'pflaster-sandstein-einfahrt', title: 'Hofeinfahrt mit Buntsandstein-Einfassung', pos: '60% 55%' },
  { img: 'sitzplatz-trockenmauer', title: 'Runder Sitzplatz mit Trockenmauer', pos: '65% 60%' },
  { img: 'sandsteinmauer-lang', title: 'Mauer aus Buntsandstein', pos: '50% 60%' },
]

/** Fotos von der Arbeit selbst (Laufband „Auf der Baustelle“) */
export const ONSITE: { img: string; title: string }[] = [
  { img: 'sandstein-setzen-bagger', title: 'Sandsteinblöcke setzen' },
  { img: 'rollrasen-verlegen', title: 'Rollrasen verlegen' },
  { img: 'treppe-bau-mitarbeiter', title: 'Blockstufen setzen' },
  { img: 'erdarbeiten-schubkarre', title: 'Erdarbeiten nach dem Hausbau' },
  { img: 'kiesbeet-anlegen', title: 'Kiesbeet anlegen' },
  { img: 'rollrasen-verlegen-ruettler', title: 'Unterbau verdichten' },
  { img: 'mauer-hang-pflanzen', title: 'Hangmauer mit Bepflanzung' },
  { img: 'carport-weiss', title: 'Carport mit Abstellraum' },
  { img: 'carport-holz', title: 'Carport aus Holz' },
  { img: 'garten-bank-hecke', title: 'Fertiger Garten' },
  { img: 'beet-randstein-strasse', title: 'Beet an der Grundstücksgrenze' },
  { img: 'nachher-rasen-neu', title: 'Neuer Rasen mit Sichtschutz' },
]

/** Referenzen. Jede 5er-Gruppe: erstes Bild groß (2x2), dann 4 klein – Raster ohne Lücken */
export const PROJECTS: { img: string; title: string; cat: Cat; pos?: string }[] = [
  { img: 'sitzplatz-trockenmauer', title: 'Runder Sitzplatz mit Trockenmauer', cat: 'garten' },
  { img: 'sandstein-treppe-garten', title: 'Sandsteintreppe in der Böschung', cat: 'naturstein' },
  { img: 'granit-treppe-einfahrt', title: 'Granit-Blockstufen am Eingang', cat: 'treppen' },
  { img: 'pflasterweg-geschwungen', title: 'Geschwungener Pflasterweg', cat: 'pflaster', pos: '50% 65%' },
  { img: 'polygonalplatten', title: 'Polygonalplatten in Mörtel', cat: 'terrassen' },

  { img: 'pflaster-sandstein-detail', title: 'Hof mit Buntsandstein-Einfassung', cat: 'pflaster' },
  { img: 'terrasse-sichtschutz-lounge', title: 'Terrasse mit Sichtschutz', cat: 'zaun' },
  { img: 'weg-klinker-kiesbeet', title: 'Klinkerweg mit Kiesbeet', cat: 'pflaster' },
  { img: 'sandstein-hochbeet', title: 'Hochbeet aus Sandsteinblöcken', cat: 'naturstein' },
  { img: 'gabionen-zaun', title: 'Gabionenzaun', cat: 'zaun' },

  { img: 'sandsteinmauer-lang', title: 'Mauer aus Buntsandstein', cat: 'naturstein' },
  { img: 'terrasse-platten', title: 'Terrasse aus Großformatplatten', cat: 'terrassen' },
  { img: 'thuja-hecke', title: 'Heckenpflanzung', cat: 'garten' },
  { img: 'pflaster-einfahrt-garage', title: 'Einfahrt und Garagenvorplatz', cat: 'pflaster' },
  { img: 'sandsteinmauer-rasen', title: 'Sandsteinmauer mit neuem Rasen', cat: 'naturstein' },

  { img: 'weg-kies-bepflanzung', title: 'Gartenweg mit Bepflanzung', cat: 'garten' },
  { img: 'weg-treppe-hang', title: 'Weg und Treppe am Hang', cat: 'treppen' },
  { img: 'pflaster-bunt', title: 'Pflaster im Wildverband', cat: 'pflaster' },
  { img: 'verblender-naturstein', title: 'Natursteinverblender', cat: 'naturstein' },
  { img: 'rasengitter', title: 'Stellplätze mit Rasengitter', cat: 'pflaster' },
]

export const CATS: { id: Cat | 'alle'; label: string }[] = [
  { id: 'alle', label: 'Alle' },
  { id: 'pflaster', label: 'Pflaster' },
  { id: 'naturstein', label: 'Naturstein' },
  { id: 'treppen', label: 'Treppen' },
  { id: 'terrassen', label: 'Terrassen' },
  { id: 'zaun', label: 'Zäune' },
  { id: 'garten', label: 'Garten' },
]

/** Echte Google-Rezensionen (Auszug, Stand Nov. 2026) */
export const REVIEWS = [
  { name: 'Kaiser', when: 'vor einem Jahr', text: 'Sehr kompetente Firma. Herr Zaidel ist ein sehr netter Kontakt und auch seine Mitarbeiter waren sehr nett.' },
  { name: 'Dietmar Kraus', when: 'vor 3 Jahren', text: 'Da merkt man, dass ein Profi am Werk ist. Alles bestens!' },
  { name: 'Giovanni Gioggo', when: 'vor 3 Jahren', text: null },
]

export const AREA = ['Kleinheubach', 'Miltenberg', 'Großheubach', 'Laudenbach', 'Bürgstadt', 'Erlenbach a. Main', 'Klingenberg', 'Obernburg', 'Elsenfeld', 'Amorbach', 'Freudenberg', 'Wertheim']
