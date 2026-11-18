import { useLiveQuery } from 'dexie-react-hooks'
import { ArrowLeft, Mail, MapPin, Phone, Plus } from 'lucide-react'
import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { db } from '../db'
import { jobStatus, mapsUrl, money, relTime } from '../format'
import { docGross } from '../hooks'
import { isOffice, useMe } from '../session'
import { Button, Card, Chip, PhotoImg, SectionTitle, Textarea } from '../ui'
import NewJobModal from './NewJobModal'

export default function CustomerDetail() {
  const { id = '' } = useParams()
  const me = useMe()
  const c = useLiveQuery(() => db.customers.get(id), [id])
  const jobs = useLiveQuery(() => db.jobs.where('customerId').equals(id).reverse().sortBy('createdAt'), [id]) ?? []
  const revenue = useLiveQuery(async () => {
    const ids = (await db.jobs.where('customerId').equals(id).toArray()).map((j) => j.id)
    const docs = await db.docs.where('jobId').anyOf(ids).toArray()
    return docs.filter((d) => d.kind === 'rechnung' && d.status === 'bezahlt').reduce((s, d) => s + docGross(d), 0)
  }, [id])
  const [open, setOpen] = useState(false)
  if (!c) return null

  return (
    <div>
      <Link to="/app/kunden" className="inline-flex items-center gap-1 text-sm text-stone-500 hover:text-stone-800"><ArrowLeft size={15} /> Kunden</Link>
      <div className="mt-3 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-[26px] font-semibold tracking-tight">{c.name}</h1>
          {c.company && <p className="text-stone-600">{c.company}</p>}
          <p className="mt-0.5 text-sm text-stone-500">Kunde seit {relTime(c.createdAt)}</p>
        </div>
        {isOffice(me) && <Button variant="primary" icon={<Plus size={17} />} onClick={() => setOpen(true)}>Auftrag für Kunde</Button>}
      </div>

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-[1fr_1.6fr]">
        <div className="space-y-6">
          <Card className="divide-y divide-stone-100">
            <a href={mapsUrl(c.street, c.zip, c.city)} target="_blank" rel="noreferrer" className="flex items-start gap-3 px-4 py-3 hover:bg-stone-50">
              <MapPin size={17} className="mt-0.5 text-stone-400" /><span className="text-[14px]">{c.street}<br />{c.zip} {c.city}</span>
            </a>
            {c.phone && <a href={`tel:${c.phone.replace(/\s/g, '')}`} className="flex items-center gap-3 px-4 py-3 hover:bg-stone-50"><Phone size={17} className="text-stone-400" /><span className="text-[14px]">{c.phone}</span></a>}
            {c.email && <a href={`mailto:${c.email}`} className="flex items-center gap-3 px-4 py-3 hover:bg-stone-50"><Mail size={17} className="text-stone-400" /><span className="truncate text-[14px]">{c.email}</span></a>}
          </Card>
          {me.canSeePrices && (
            <Card className="p-4">
              <div className="text-[13px] text-stone-500">Umsatz bezahlt (brutto)</div>
              <div className="tabular mt-1 text-2xl font-semibold">{money(revenue ?? 0)}</div>
            </Card>
          )}
          <div>
            <SectionTitle>Interne Notiz</SectionTitle>
            <Textarea rows={4} defaultValue={c.note} placeholder="z. B. Zufahrt, Hund, bevorzugte Zeiten …" onBlur={(e) => db.customers.update(c.id, { note: e.target.value })} disabled={!isOffice(me)} />
          </div>
        </div>
        <div>
          <SectionTitle>Aufträge</SectionTitle>
          <Card className="divide-y divide-stone-100">
            {jobs.length === 0 && <p className="px-4 py-6 text-center text-sm text-stone-500">Noch keine Aufträge.</p>}
            {jobs.map((j) => {
              const st = jobStatus(j.status)
              return (
                <Link key={j.id} to={`/app/auftraege/${j.id}`} className="flex items-center gap-3 px-4 py-3 hover:bg-stone-50">
                  <PhotoImg src={j.cover} small className="size-12 shrink-0 rounded-lg" />
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-[14px] font-medium">{j.title}</div>
                    <div className="text-[12.5px] text-stone-500">{j.number}</div>
                  </div>
                  <Chip className={st.chip} dot={st.dot}>{st.label}</Chip>
                </Link>
              )
            })}
          </Card>
        </div>
      </div>
      <NewJobModal open={open} onClose={() => setOpen(false)} customerId={c.id} />
    </div>
  )
}
