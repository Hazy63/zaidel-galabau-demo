import Dexie, { type EntityTable } from 'dexie'

export type Role = 'inhaber' | 'buero' | 'mitarbeiter'

export interface User {
  id: string
  name: string
  short: string
  role: Role
  title: string
  phone?: string
  color: string
  pin: string
  canSeePrices: boolean
  active: boolean
}

export interface Customer {
  id: string
  kind: 'privat' | 'gewerbe' | 'kommune'
  name: string
  company?: string
  street: string
  zip: string
  city: string
  phone?: string
  email?: string
  note?: string
  createdAt: number
}

export type JobStatus = 'anfrage' | 'besichtigung' | 'angebot' | 'beauftragt' | 'in_arbeit' | 'abgeschlossen'

export interface Job {
  id: string
  number: string
  title: string
  customerId: string
  status: JobStatus
  street: string
  zip: string
  city: string
  description: string
  services: string[]
  startDate?: string
  endDate?: string
  assignees: string[]
  estimate?: number
  source: 'website' | 'telefon' | 'empfehlung' | 'stammkunde'
  cover?: string
  createdAt: number
  updatedAt: number
}

export type PhotoPhase = 'vorher' | 'waehrend' | 'nachher'

export interface Photo {
  id: string
  jobId: string
  phase: PhotoPhase
  caption?: string
  src?: string
  blob?: Blob
  userId: string
  createdAt: number
}

export interface LineItem {
  id: string
  title: string
  detail?: string
  qty: number
  unit: string
  price: number
}

export type DocKind = 'angebot' | 'rechnung' | 'datei'
export type DocStatus = 'entwurf' | 'versendet' | 'angenommen' | 'abgelehnt' | 'bezahlt' | 'ueberfaellig'

export interface Doc {
  id: string
  jobId: string
  kind: DocKind
  number?: string
  title: string
  status?: DocStatus
  date: string
  dueDate?: string
  intro?: string
  outro?: string
  items?: LineItem[]
  fileName?: string
  mime?: string
  size?: number
  blob?: Blob
  src?: string
  userId: string
  createdAt: number
  fromDocId?: string
}

export interface Note {
  id: string
  jobId: string
  userId: string
  text: string
  pinned?: boolean
  createdAt: number
}

export interface Task {
  id: string
  jobId: string
  text: string
  done: boolean
  doneBy?: string
  createdAt: number
}

export interface Visit {
  id: string
  jobId: string
  date: string
  userIds: string[]
  note?: string
}

export interface Activity {
  id: string
  jobId?: string
  userId: string
  text: string
  createdAt: number
}

export interface Meta {
  key: string
  value: string | number
}

export const db = new Dexie('zaidel-auftragsbuch') as Dexie & {
  users: EntityTable<User, 'id'>
  customers: EntityTable<Customer, 'id'>
  jobs: EntityTable<Job, 'id'>
  photos: EntityTable<Photo, 'id'>
  docs: EntityTable<Doc, 'id'>
  notes: EntityTable<Note, 'id'>
  tasks: EntityTable<Task, 'id'>
  visits: EntityTable<Visit, 'id'>
  activities: EntityTable<Activity, 'id'>
  meta: EntityTable<Meta, 'key'>
}

db.version(1).stores({
  users: 'id, role',
  customers: 'id, name, city, createdAt',
  jobs: 'id, number, customerId, status, startDate, updatedAt, *assignees',
  photos: 'id, jobId, phase, createdAt',
  docs: 'id, jobId, kind, status, date',
  notes: 'id, jobId, createdAt',
  tasks: 'id, jobId',
  visits: 'id, jobId, date, *userIds',
  activities: 'id, jobId, createdAt',
  meta: 'key',
})

export const uid = () =>
  (crypto.randomUUID?.() ?? Math.random().toString(36).slice(2) + Date.now().toString(36)).slice(0, 12)

export async function log(userId: string, text: string, jobId?: string) {
  await db.activities.add({ id: uid(), jobId, userId, text, createdAt: Date.now() })
}

export async function nextNumber(prefix: 'A' | 'AN' | 'RE'): Promise<string> {
  const year = new Date().getFullYear()
  const key = `seq-${prefix}-${year}`
  return db.transaction('rw', db.meta, async () => {
    const cur = (await db.meta.get(key))?.value as number | undefined
    const next = (cur ?? 0) + 1
    await db.meta.put({ key, value: next })
    return `${prefix}-${year}-${String(next).padStart(3, '0')}`
  })
}

export async function touchJob(jobId: string) {
  await db.jobs.update(jobId, { updatedAt: Date.now() })
}
