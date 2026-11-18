import { useLiveQuery } from 'dexie-react-hooks'
import { ArrowRight, Camera, CheckCircle2, Globe, MapPin, Navigation, Phone, Plus } from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'
import { useState } from 'react'
import { db } from '../db'
import { addDays, dateLong, jobStatus, mapsUrl, money, relTime, today, weekday } from '../format'
import { docGross, effectiveStatus, useCustomerMap } from '../hooks'
import { isOffice, useMe, useUserMap } from '../session'
import { Avatar, AvatarStack, Button, Card, Chip, Empty, PhotoImg, SectionTitle } from '../ui'
import NewJobModal from './NewJobModal'

function greeting() {
  const h = new Date().getHours()
  return h < 11 ? 'Guten Morgen' : h < 18 ? 'Hallo' : 'Guten Abend'
}

export default function Dashboard() {
  const me = useMe()
  const users = useUserMap()
  const customers = useCustomerMap()
  const nav = useNavigate()
  const [newOpen, setNewOpen] = useState(false)
  const t = today()
  const office = isOffice(me)

  const data = useLiveQuery(async () => {
    const [jobs, docs, visits, acts, tasks] = await Promise.all([
      db.jobs.toArray(),
      db.docs.toArray(),
      db.visits.where('date').between(t, addDays(t, 1), true, true).toArray(),
      db.activities.orderBy('createdAt').reverse().limit(12).toArray(),
      db.tasks.toArray(),
    ])
    return { jobs, docs, visits, acts, tasks }
  }, [t])

  if (!data) return null
  const { jobs, docs, visits, acts, tasks } = data
  const jobMap = Object.fromEntries(jobs.map((j) => [j.id, j]))

  const mine = (uids: string[]) => office || uids.includes(me.id)
  const todayVisits = visits.filter((v) => v.date === t && mine(v.userIds))
  const tomorrowVisits = visits.filter((v) => v.date === addDays(t, 1) && mine(v.userIds))

  const inquiries = jobs.filter((j) => j.status === 'anfrage').sort((a, b) => b.createdAt - a.createdAt)
  const openOffers = docs.filter((d) => d.kind === 'angebot' && d.status === 'versendet')
  const openInvoices = docs.filter((d) => d.kind === 'rechnung' && (d.status === 'versendet'))
  const overdue = openInvoices.filter((d) => effectiveStatus(d) === 'ueberfaellig')
  const running = jobs.filter((j) => j.status === 'in_arbeit')

  const firstName = me.name.split(' ')[0]

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm text-stone-500">
            {new Date().toLocaleDateString('de-DE', { weekday: 'long', day: 'numeric', month: 'long' })}
          </p>
          <h1 className="mt-0.5 text-[26px] font-semibold tracking-tight sm:text-3xl">
            {greeting()}, {me.role === 'buero' ? 'Büro' : firstName}.
          </h1>
        </div>
        {office && (
          <Button variant="primary" icon={<Plus size={17} />} onClick={() => setNewOpen(true)}>
            Neuer Auftrag
          </Button>
        )}
      </div>

      {office && (
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          <Kpi label="Neue Anfragen" value={String(inquiries.length)} sub={inquiries.length ? `zuletzt ${relTime(inquiries[0].createdAt)}` : 'alles bearbeitet'} accent={inquiries.length > 0} to="/app/auftraege?status=anfrage" />
          <Kpi label="Laufende Baustellen" value={String(running.length)} sub={`${todayVisits.length} Einsätze heute`} to="/app/auftraege?status=in_arbeit" />
          {me.canSeePrices && (
            <>
              <Kpi label="Offene Angebote" value={money(openOffers.reduce((s, d) => s + docGross(d), 0))} sub={`${openOffers.length} beim Kunden`} to="/app/auftraege?status=angebot" />
              <Kpi label="Offene Rechnungen" value={money(openInvoices.reduce((s, d) => s + docGross(d), 0))} sub={overdue.length ? `${overdue.length} überfällig` : 'nichts überfällig'} warn={overdue.length > 0} />
            </>
          )}
        </div>
      )}

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1.6fr_1fr]">
        <div className="min-w-0 space-y-8">
          <section>
            <SectionTitle action={<Link to="/app/plan" className="text-[13px] font-medium text-moss-700 hover:underline">Einsatzplan</Link>}>
              {office ? 'Heute im Einsatz' : 'Deine Baustelle heute'}
            </SectionTitle>
            {todayVisits.length === 0 ? (
              <Card>
                <Empty icon={<CheckCircle2 size={22} />} title="Heute keine Einsätze geplant" text="Neue Einsätze legst du im Auftrag oder im Einsatzplan an." />
              </Card>
            ) : (
              <div className="space-y-3">
                {todayVisits.map((v) => {
                  const j = jobMap[v.jobId]
                  if (!j) return null
                  const c = customers[j.customerId]
                  const open = tasks.filter((x) => x.jobId === j.id && !x.done)
                  return (
                    <Card key={v.id} className="overflow-hidden">
                      <div className="flex flex-col sm:flex-row">
                        <Link to={`/app/auftraege/${j.id}`} className="relative block h-36 shrink-0 sm:h-auto sm:w-48">
                          <PhotoImg src={j.cover} small className="absolute inset-0 size-full" />
                        </Link>
                        <div className="flex-1 p-4">
                          <div className="flex items-start justify-between gap-3">
                            <div>
                              <Link to={`/app/auftraege/${j.id}`} className="font-semibold hover:underline">{j.title}</Link>
                              <p className="mt-0.5 text-sm text-stone-500">{c?.name} · {j.street}, {j.city}</p>
                            </div>
                            <AvatarStack users={v.userIds.map((id) => users[id])} />
                          </div>
                          {v.note && <p className="mt-2 text-sm font-medium text-clay-700">{v.note}</p>}
                          {open.length > 0 && (
                            <p className="mt-2 text-[13px] text-stone-600">
                              Als Nächstes: <span className="font-medium text-stone-800">{open[0].text}</span>
                              {open.length > 1 && <span className="text-stone-400"> (+{open.length - 1})</span>}
                            </p>
                          )}
                          <div className="mt-3 flex flex-wrap gap-2">
                            <a href={mapsUrl(j.street, j.zip, j.city)} target="_blank" rel="noreferrer">
                              <Button size="sm" icon={<Navigation size={14} />}>Route</Button>
                            </a>
                            {c?.phone && (
                              <a href={`tel:${c.phone.replace(/\s/g, '')}`}>
                                <Button size="sm" icon={<Phone size={14} />}>Kunde</Button>
                              </a>
                            )}
                            <Button size="sm" icon={<Camera size={14} />} onClick={() => nav(`/app/auftraege/${j.id}?tab=fotos`)}>Foto</Button>
                          </div>
                        </div>
                      </div>
                    </Card>
                  )
                })}
              </div>
            )}
          </section>

          {tomorrowVisits.length > 0 && (
            <section>
              <SectionTitle>Morgen, {weekday(addDays(t, 1))}</SectionTitle>
              <Card className="divide-y divide-stone-100">
                {tomorrowVisits.map((v) => {
                  const j = jobMap[v.jobId]
                  if (!j) return null
                  return (
                    <Link key={v.id} to={`/app/auftraege/${j.id}`} className="flex items-center gap-3 px-4 py-3 hover:bg-stone-50">
                      <MapPin size={16} className="shrink-0 text-stone-400" />
                      <div className="min-w-0 flex-1">
                        <div className="truncate text-[14px] font-medium">{j.title}</div>
                        <div className="truncate text-[13px] text-stone-500">{v.note ?? `${j.street}, ${j.city}`}</div>
                      </div>
                      <AvatarStack users={v.userIds.map((id) => users[id])} size={24} />
                    </Link>
                  )
                })}
              </Card>
            </section>
          )}

          {office && (
            <section>
              <SectionTitle action={<Link to="/app/auftraege?status=anfrage" className="text-[13px] font-medium text-moss-700 hover:underline">Alle</Link>}>Neue Anfragen</SectionTitle>
              <Card className="divide-y divide-stone-100">
                {inquiries.length === 0 && <p className="px-4 py-6 text-center text-sm text-stone-500">Keine offenen Anfragen.</p>}
                {inquiries.map((j) => (
                  <Link key={j.id} to={`/app/auftraege/${j.id}`} className="flex items-center gap-3 px-4 py-3.5 hover:bg-stone-50">
                    <span className="grid size-9 shrink-0 place-items-center rounded-full bg-sky-50 text-sky-700">
                      {j.source === 'website' ? <Globe size={17} /> : <Phone size={16} />}
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="truncate text-[14px] font-medium">{j.title}</div>
                      <div className="truncate text-[13px] text-stone-500">
                        {customers[j.customerId]?.name} · {j.city} · {j.source === 'website' ? 'über Website' : 'Telefon'}
                      </div>
                    </div>
                    <span className="shrink-0 text-xs text-stone-400">{relTime(j.createdAt)}</span>
                    <ArrowRight size={15} className="shrink-0 text-stone-300" />
                  </Link>
                ))}
              </Card>
            </section>
          )}

          {office && me.canSeePrices && overdue.length > 0 && (
            <section>
              <SectionTitle>Überfällige Rechnungen</SectionTitle>
              <Card className="divide-y divide-stone-100">
                {overdue.map((d) => {
                  const j = jobMap[d.jobId]
                  return (
                    <Link key={d.id} to={`/app/auftraege/${d.jobId}/dokument/${d.id}`} className="flex items-center gap-3 px-4 py-3.5 hover:bg-stone-50">
                      <div className="min-w-0 flex-1">
                        <div className="text-[14px] font-medium">{d.number} · {customers[j?.customerId ?? '']?.name}</div>
                        <div className="text-[13px] text-rose-700">fällig seit {dateLong(d.dueDate)}</div>
                      </div>
                      <span className="tabular font-semibold">{money(docGross(d))}</span>
                    </Link>
                  )
                })}
              </Card>
            </section>
          )}
        </div>

        <section>
          <SectionTitle>Zuletzt passiert</SectionTitle>
          <Card className="p-1">
            <ol className="relative">
              {acts.map((a) => {
                const j = a.jobId ? jobMap[a.jobId] : undefined
                return (
                  <li key={a.id}>
                    <Link to={j ? `/app/auftraege/${j.id}` : '#'} className="flex gap-3 rounded-lg px-3 py-2.5 hover:bg-stone-50">
                      <Avatar user={users[a.userId]} size={26} />
                      <div className="min-w-0 flex-1 text-[13px] leading-snug">
                        <span className="font-medium">{users[a.userId]?.name.split(' ')[0]}</span> <span className="text-stone-600">{a.text}</span>
                        {j && <div className="truncate text-stone-400">{j.title}</div>}
                      </div>
                      <span className="shrink-0 text-[11px] text-stone-400">{relTime(a.createdAt)}</span>
                    </Link>
                  </li>
                )
              })}
            </ol>
          </Card>

          {!office && (
            <div className="mt-8">
              <SectionTitle>Deine Aufträge</SectionTitle>
              <Card className="divide-y divide-stone-100">
                {jobs
                  .filter((j) => j.assignees.includes(me.id) && j.status !== 'abgeschlossen')
                  .map((j) => (
                    <Link key={j.id} to={`/app/auftraege/${j.id}`} className="flex items-center justify-between gap-3 px-4 py-3 hover:bg-stone-50">
                      <span className="min-w-0 truncate text-[14px] font-medium">{j.title}</span>
                      <Chip className={jobStatus(j.status).chip} dot={jobStatus(j.status).dot}>{jobStatus(j.status).label}</Chip>
                    </Link>
                  ))}
              </Card>
            </div>
          )}
        </section>
      </div>

      <NewJobModal open={newOpen} onClose={() => setNewOpen(false)} />
    </div>
  )
}

function Kpi({ label, value, sub, to, accent, warn }: { label: string; value: string; sub: string; to?: string; accent?: boolean; warn?: boolean }) {
  const inner = (
    <Card className="h-full p-4 transition hover:ring-stone-300">
      <div className="flex items-center gap-2 text-[13px] text-stone-500">
        {accent && <span className="size-2 rounded-full bg-clay-500" />}
        {label}
      </div>
      <div className="tabular mt-1.5 text-2xl font-semibold tracking-tight">{value}</div>
      <div className={warn ? 'mt-0.5 text-[13px] font-medium text-rose-700' : 'mt-0.5 text-[13px] text-stone-500'}>{sub}</div>
    </Card>
  )
  return to ? <Link to={to}>{inner}</Link> : inner
}
