import type { DocStatus, JobStatus, LineItem, PhotoPhase, Role } from './db'

export const VAT = 0.19

export const JOB_STATUS: { id: JobStatus; label: string; dot: string; chip: string }[] = [
  { id: 'anfrage', label: 'Anfrage', dot: 'bg-sky-500', chip: 'bg-sky-50 text-sky-800 ring-sky-200' },
  { id: 'besichtigung', label: 'Besichtigung', dot: 'bg-violet-500', chip: 'bg-violet-50 text-violet-800 ring-violet-200' },
  { id: 'angebot', label: 'Angebot raus', dot: 'bg-amber-500', chip: 'bg-amber-50 text-amber-800 ring-amber-200' },
  { id: 'beauftragt', label: 'Beauftragt', dot: 'bg-clay-500', chip: 'bg-clay-100 text-clay-700 ring-clay-200' },
  { id: 'in_arbeit', label: 'In Arbeit', dot: 'bg-moss-500', chip: 'bg-moss-100 text-moss-800 ring-moss-200' },
  { id: 'abgeschlossen', label: 'Abgeschlossen', dot: 'bg-stone-400', chip: 'bg-stone-100 text-stone-600 ring-stone-200' },
]

export const jobStatus = (s: JobStatus) => JOB_STATUS.find((x) => x.id === s)!

export const DOC_STATUS: Record<DocStatus, { label: string; chip: string }> = {
  entwurf: { label: 'Entwurf', chip: 'bg-stone-100 text-stone-600 ring-stone-200' },
  versendet: { label: 'Versendet', chip: 'bg-sky-50 text-sky-800 ring-sky-200' },
  angenommen: { label: 'Angenommen', chip: 'bg-moss-100 text-moss-800 ring-moss-200' },
  abgelehnt: { label: 'Abgelehnt', chip: 'bg-rose-50 text-rose-700 ring-rose-200' },
  bezahlt: { label: 'Bezahlt', chip: 'bg-moss-100 text-moss-800 ring-moss-200' },
  ueberfaellig: { label: 'Überfällig', chip: 'bg-rose-50 text-rose-700 ring-rose-200' },
}

export const PHASES: { id: PhotoPhase; label: string }[] = [
  { id: 'vorher', label: 'Vorher' },
  { id: 'waehrend', label: 'Während' },
  { id: 'nachher', label: 'Nachher' },
]

export const ROLE_LABEL: Record<Role, string> = {
  inhaber: 'Inhaber',
  buero: 'Büro & Bauleitung',
  mitarbeiter: 'Mitarbeiter',
}

export const SERVICES = [
  'Pflasterarbeiten',
  'Natursteinmauer',
  'Treppenbau',
  'Terrasse',
  'Sichtschutz & Zaun',
  'Carport',
  'Rollrasen',
  'Bepflanzung',
  'Erdarbeiten',
  'Gartenpflege',
  'Verblender',
  'Entwässerung',
]

export const UNITS = ['m²', 'm', 'lfm', 'Stk', 'Std', 'psch', 't', 'm³']

const eur = new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR' })
export const money = (n: number) => eur.format(n)
const eur0 = new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 })
export const money0 = (n: number) => eur0.format(n)
export const moneyShort = (n: number) =>
  n >= 10000 ? `${(n / 1000).toLocaleString('de-DE', { maximumFractionDigits: 1 })} T€` : eur.format(n)

export const num = (n: number) => n.toLocaleString('de-DE', { maximumFractionDigits: 2 })

export function totals(items: LineItem[] = []) {
  const net = items.reduce((s, i) => s + i.qty * i.price, 0)
  const vat = Math.round(net * VAT * 100) / 100
  return { net, vat, gross: net + vat }
}

export const toISO = (d: Date) => {
  const z = new Date(d.getTime() - d.getTimezoneOffset() * 60000)
  return z.toISOString().slice(0, 10)
}
export const today = () => toISO(new Date())
export const addDays = (iso: string, n: number) => {
  const d = new Date(iso + 'T12:00:00')
  d.setDate(d.getDate() + n)
  return toISO(d)
}

export const dateLong = (iso?: string) =>
  iso ? new Date(iso + 'T12:00:00').toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit', year: 'numeric' }) : '–'
export const dateShort = (iso?: string) =>
  iso ? new Date(iso + 'T12:00:00').toLocaleDateString('de-DE', { day: 'numeric', month: 'short' }) : '–'
export const weekday = (iso: string) => new Date(iso + 'T12:00:00').toLocaleDateString('de-DE', { weekday: 'short' })

export function relTime(ts: number) {
  const diff = (Date.now() - ts) / 1000
  if (diff < 60) return 'gerade eben'
  if (diff < 3600) return `vor ${Math.floor(diff / 60)} Min.`
  if (diff < 86400) return `vor ${Math.floor(diff / 3600)} Std.`
  if (diff < 86400 * 2) return 'gestern'
  if (diff < 86400 * 7) return `vor ${Math.floor(diff / 86400)} Tagen`
  return new Date(ts).toLocaleDateString('de-DE', { day: 'numeric', month: 'short' })
}

export const bytes = (n?: number) =>
  !n ? '' : n > 1e6 ? `${(n / 1e6).toLocaleString('de-DE', { maximumFractionDigits: 1 })} MB` : `${Math.round(n / 1000)} KB`

export const mapsUrl = (street: string, zip: string, city: string) =>
  `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${street}, ${zip} ${city}`)}`

export const img = (name: string, small = false) => `${import.meta.env.BASE_URL}img/${name}${small ? '-sm' : ''}.webp`
