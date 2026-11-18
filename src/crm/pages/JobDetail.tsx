import clsx from 'clsx'
import { useLiveQuery } from 'dexie-react-hooks'
import { ArrowLeft, CalendarPlus, Check, ChevronDown, Mail, MapPin, Navigation, Pencil, Phone, Plus, Trash2, X } from 'lucide-react'
import { useState } from 'react'
import { Link, useParams, useSearchParams } from 'react-router-dom'
import { db, log, touchJob, uid, type Job, type JobStatus } from '../db'
import { addDays, dateLong, JOB_STATUS, jobStatus, mapsUrl, money0, relTime, SERVICES, today, weekday } from '../format'
import { isOffice, useMe, useUserMap, useUsers } from '../session'
import { Avatar, AvatarStack, Button, Card, Chip, Field, Input, Modal, PhotoImg, SectionTitle, Textarea } from '../ui'
import JobPhotos from './JobPhotos'
import JobDocs from './JobDocs'
import JobNotes from './JobNotes'

const TABS = [
  { id: 'uebersicht', label: 'Übersicht' },
  { id: 'fotos', label: 'Fotos' },
  { id: 'dokumente', label: 'Dokumente' },
  { id: 'notizen', label: 'Notizen' },
  { id: 'verlauf', label: 'Verlauf' },
] as const
type Tab = (typeof TABS)[number]['id']

export default function JobDetail() {
  const { id = '' } = useParams()
  const me = useMe()
  const office = isOffice(me)
  const [params, setParams] = useSearchParams()
  const tab = (params.get('tab') as Tab) || 'uebersicht'
  const job = useLiveQuery(() => db.jobs.get(id), [id])
  const customer = useLiveQuery(async () => (job ? db.customers.get(job.customerId) : undefined), [job?.customerId])
  const counts = useLiveQuery(async () => ({
    fotos: await db.photos.where('jobId').equals(id).count(),
    dokumente: await db.docs.where('jobId').equals(id).count(),
    notizen: await db.notes.where('jobId').equals(id).count(),
  }), [id])
  const [statusOpen, setStatusOpen] = useState(false)

  if (job === undefined) return null
  if (job === null || !job) return <p className="text-stone-500">Auftrag nicht gefunden. <Link to="/app/auftraege" className="underline">Zur Übersicht</Link></p>

  const st = jobStatus(job.status)

  async function setStatus(s: JobStatus) {
    setStatusOpen(false)
    if (!job || s === job.status) return
    await db.jobs.update(job.id, { status: s, updatedAt: Date.now() })
    await log(me.id, `Status geändert: ${jobStatus(job.status).label} → ${jobStatus(s).label}`, job.id)
  }

  return (
    <div>
      <Link to="/app/auftraege" className="inline-flex items-center gap-1 text-sm text-stone-500 hover:text-stone-800">
        <ArrowLeft size={15} /> Aufträge
      </Link>

      <div className="mt-3 flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[13px] font-medium tracking-wide text-stone-400">{job.number}</span>
            <div className="relative">
              <button
                disabled={!office}
                onClick={() => setStatusOpen(!statusOpen)}
                className={clsx('inline-flex h-7 items-center gap-1.5 rounded-full px-3 text-[13px] font-medium ring-1 ring-inset', st.chip)}
              >
                <span className={clsx('size-1.5 rounded-full', st.dot)} />
                {st.label}
                {office && <ChevronDown size={14} />}
              </button>
              {statusOpen && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setStatusOpen(false)} />
                  <div className="absolute top-9 left-0 z-20 w-52 rounded-xl bg-white p-1 shadow-pop ring-1 ring-stone-200">
                    {JOB_STATUS.map((s) => (
                      <button key={s.id} onClick={() => setStatus(s.id)} className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-left text-sm hover:bg-stone-100">
                        <span className={clsx('size-2 rounded-full', s.dot)} />
                        <span className="flex-1">{s.label}</span>
                        {s.id === job.status && <Check size={15} className="text-moss-600" />}
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>
            {job.source === 'website' && <Chip className="bg-sky-50 text-sky-800 ring-sky-200">über Website</Chip>}
          </div>
          <h1 className="mt-2 text-[24px] leading-tight font-semibold tracking-tight text-balance sm:text-[28px]">{job.title}</h1>
          <p className="mt-1.5 text-[15px] text-stone-600">
            {customer && (
              <Link to={`/app/kunden/${customer.id}`} className="font-medium text-stone-800 hover:underline">{customer.name}</Link>
            )}
            <span className="text-stone-400"> · </span>
            {job.street}, {job.zip} {job.city}
          </p>
        </div>
        <div className="flex shrink-0 flex-wrap gap-2">
          <a href={mapsUrl(job.street, job.zip, job.city)} target="_blank" rel="noreferrer">
            <Button icon={<Navigation size={15} />}>Route</Button>
          </a>
          {customer?.phone && (
            <a href={`tel:${customer.phone.replace(/\s/g, '')}`}>
              <Button icon={<Phone size={15} />}>Anrufen</Button>
            </a>
          )}
          {customer?.email && office && (
            <a href={`mailto:${customer.email}?subject=${encodeURIComponent(job.title)}`}>
              <Button icon={<Mail size={15} />} className="hidden sm:inline-flex">E-Mail</Button>
            </a>
          )}
        </div>
      </div>

      <div className="sticky top-14 z-20 -mx-4 mt-6 border-b border-stone-200 bg-stone-50/95 px-4 backdrop-blur sm:-mx-6 sm:px-6 lg:top-0 lg:mx-0 lg:bg-transparent lg:px-0 lg:backdrop-blur-none">
        <div className="-mb-px flex gap-1 overflow-x-auto">
          {TABS.map((t) => {
            const n = counts?.[t.id as keyof typeof counts]
            return (
              <button
                key={t.id}
                onClick={() => setParams(t.id === 'uebersicht' ? {} : { tab: t.id }, { replace: true })}
                className={clsx(
                  'flex h-11 shrink-0 items-center gap-1.5 border-b-2 px-3 text-[14px] font-medium transition',
                  tab === t.id ? 'border-moss-700 text-stone-900' : 'border-transparent text-stone-500 hover:text-stone-800',
                )}
              >
                {t.label}
                {n !== undefined && n > 0 && <span className="rounded-full bg-stone-200 px-1.5 text-[11px] text-stone-600">{n}</span>}
              </button>
            )
          })}
        </div>
      </div>

      <div className="pt-6">
        {tab === 'uebersicht' && <Overview job={job} />}
        {tab === 'fotos' && <JobPhotos job={job} />}
        {tab === 'dokumente' && <JobDocs job={job} />}
        {tab === 'notizen' && <JobNotes job={job} />}
        {tab === 'verlauf' && <History jobId={job.id} />}
      </div>
    </div>
  )
}

function Overview({ job }: { job: Job }) {
  const me = useMe()
  const office = isOffice(me)
  const users = useUserMap()
  const allUsers = useUsers()
  const [edit, setEdit] = useState(false)
  const [draft, setDraft] = useState(job)
  const [teamOpen, setTeamOpen] = useState(false)
  const [visitOpen, setVisitOpen] = useState(false)
  const tasks = useLiveQuery(() => db.tasks.where('jobId').equals(job.id).sortBy('createdAt'), [job.id]) ?? []
  const visits = useLiveQuery(() => db.visits.where('jobId').equals(job.id).sortBy('date'), [job.id]) ?? []
  const photos = useLiveQuery(() => db.photos.where('jobId').equals(job.id).reverse().sortBy('createdAt'), [job.id]) ?? []
  const pinned = useLiveQuery(() => db.notes.where('jobId').equals(job.id).filter((n) => !!n.pinned).toArray(), [job.id]) ?? []
  const [newTask, setNewTask] = useState('')

  async function saveEdit() {
    await db.jobs.update(job.id, { title: draft.title, description: draft.description, services: draft.services, startDate: draft.startDate, endDate: draft.endDate, street: draft.street, zip: draft.zip, city: draft.city, estimate: draft.estimate, updatedAt: Date.now() })
    await log(me.id, 'Auftragsdaten bearbeitet', job.id)
    setEdit(false)
  }

  async function toggleTask(id: string, done: boolean) {
    const t = tasks.find((x) => x.id === id)
    await db.tasks.update(id, { done, doneBy: done ? me.id : undefined })
    if (done && t) await log(me.id, `Aufgabe erledigt: ${t.text}`, job.id)
    await touchJob(job.id)
  }
  async function addTask() {
    if (!newTask.trim()) return
    await db.tasks.add({ id: uid(), jobId: job.id, text: newTask.trim(), done: false, createdAt: Date.now() })
    setNewTask('')
  }

  const doneCount = tasks.filter((t) => t.done).length
  const t0 = today()
  const upcoming = visits.filter((v) => v.date >= t0)
  const past = visits.filter((v) => v.date < t0)

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1.5fr_1fr]">
      <div className="space-y-6">
        {pinned.length > 0 && (
          <div className="space-y-2">
            {pinned.map((n) => (
              <div key={n.id} className="flex gap-3 rounded-xl bg-amber-50 p-4 ring-1 ring-amber-200">
                <Avatar user={users[n.userId]} size={28} />
                <div className="text-[14px] leading-relaxed text-amber-950">
                  <div className="mb-0.5 text-[12px] font-semibold tracking-wide text-amber-700 uppercase">Wichtig</div>
                  {n.text}
                </div>
              </div>
            ))}
          </div>
        )}

        <Card className="p-5">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="font-semibold">Beschreibung</h2>
            {office && (
              <Button size="sm" variant="ghost" icon={<Pencil size={14} />} onClick={() => (setDraft(job), setEdit(true))}>Bearbeiten</Button>
            )}
          </div>
          <p className="text-[15px] leading-relaxed whitespace-pre-line text-stone-700">{job.description || <span className="text-stone-400">Noch keine Beschreibung.</span>}</p>
          {job.services.length > 0 && (
            <div className="mt-4 flex flex-wrap gap-1.5">
              {job.services.map((s) => (
                <span key={s} className="rounded-full bg-stone-100 px-2.5 py-1 text-[12.5px] text-stone-700">{s}</span>
              ))}
            </div>
          )}
          <dl className="mt-5 grid grid-cols-2 gap-4 border-t border-stone-100 pt-4 text-sm sm:grid-cols-3">
            <div>
              <dt className="text-stone-500">Zeitraum</dt>
              <dd className="mt-0.5 font-medium">{job.startDate ? `${dateLong(job.startDate)}${job.endDate && job.endDate !== job.startDate ? ` – ${dateLong(job.endDate)}` : ''}` : 'offen'}</dd>
            </div>
            {me.canSeePrices && (
              <div>
                <dt className="text-stone-500">Auftragswert (netto)</dt>
                <dd className="tabular mt-0.5 font-medium">{job.estimate ? money0(job.estimate) : '–'}</dd>
              </div>
            )}
            <div>
              <dt className="text-stone-500">Angelegt</dt>
              <dd className="mt-0.5 font-medium">{relTime(job.createdAt)}</dd>
            </div>
          </dl>
        </Card>

        <Card className="p-5">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="font-semibold">Aufgaben</h2>
            {tasks.length > 0 && <span className="text-[13px] text-stone-500">{doneCount} von {tasks.length} erledigt</span>}
          </div>
          {tasks.length > 0 && (
            <div className="mb-3 h-1.5 overflow-hidden rounded-full bg-stone-100">
              <div className="h-full rounded-full bg-moss-500 transition-all" style={{ width: `${(doneCount / tasks.length) * 100}%` }} />
            </div>
          )}
          <ul className="-mx-2">
            {tasks.map((t) => (
              <li key={t.id} className="group flex items-center gap-3 rounded-lg px-2 py-2 hover:bg-stone-50">
                <button
                  onClick={() => toggleTask(t.id, !t.done)}
                  className={clsx('grid size-[22px] shrink-0 place-items-center rounded-md ring-1 transition', t.done ? 'bg-moss-600 text-white ring-moss-600' : 'bg-white ring-stone-300 hover:ring-moss-500')}
                  aria-label={t.done ? 'Als offen markieren' : 'Erledigt'}
                >
                  {t.done && <Check size={14} strokeWidth={3} />}
                </button>
                <span className={clsx('flex-1 text-[14.5px]', t.done && 'text-stone-400 line-through')}>{t.text}</span>
                {t.done && t.doneBy && <Avatar user={users[t.doneBy]} size={20} />}
                {office && (
                  <button onClick={() => db.tasks.delete(t.id)} className="text-stone-300 opacity-0 transition group-hover:opacity-100 hover:text-rose-600" aria-label="Löschen">
                    <X size={15} />
                  </button>
                )}
              </li>
            ))}
          </ul>
          <form onSubmit={(e) => (e.preventDefault(), addTask())} className="mt-2 flex gap-2">
            <Input placeholder="Neue Aufgabe …" value={newTask} onChange={(e) => setNewTask(e.target.value)} />
            <Button type="submit" disabled={!newTask.trim()} icon={<Plus size={16} />} />
          </form>
        </Card>

        {photos.length > 0 && (
          <div>
            <SectionTitle action={<Link to="?tab=fotos" className="text-[13px] font-medium text-moss-700 hover:underline">Alle {photos.length} Fotos</Link>}>Neueste Fotos</SectionTitle>
            <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
              {photos.slice(0, 4).map((p, i) => (
                <Link key={p.id} to="?tab=fotos" className={clsx('overflow-hidden rounded-lg', i === 3 && 'hidden sm:block')}>
                  <PhotoImg src={p.src} blob={p.blob} small className="aspect-square w-full transition hover:scale-[1.03]" />
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="space-y-6">
        <Card className="p-5">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="font-semibold">Team</h2>
            {office && <Button size="sm" variant="ghost" onClick={() => setTeamOpen(true)}>Ändern</Button>}
          </div>
          {job.assignees.length === 0 ? (
            <p className="text-sm text-stone-500">Noch niemand eingeteilt.</p>
          ) : (
            <ul className="space-y-2.5">
              {job.assignees.map((id) => users[id]).filter(Boolean).map((u) => (
                <li key={u.id} className="flex items-center gap-3">
                  <Avatar user={u} size={32} />
                  <div className="flex-1 leading-tight">
                    <div className="text-[14px] font-medium">{u.name}</div>
                    <div className="text-[12.5px] text-stone-500">{u.title}</div>
                  </div>
                  {u.phone && (
                    <a href={`tel:${u.phone.replace(/\s/g, '')}`} className="grid size-8 place-items-center rounded-lg text-stone-500 hover:bg-stone-100"><Phone size={15} /></a>
                  )}
                </li>
              ))}
            </ul>
          )}
        </Card>

        <Card className="p-5">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="font-semibold">Einsätze</h2>
            {office && <Button size="sm" variant="ghost" icon={<CalendarPlus size={14} />} onClick={() => setVisitOpen(true)}>Planen</Button>}
          </div>
          {visits.length === 0 && <p className="text-sm text-stone-500">Noch keine Einsätze geplant.</p>}
          <ul className="space-y-1.5">
            {upcoming.map((v) => (
              <li key={v.id} className={clsx('flex items-center gap-3 rounded-lg px-2.5 py-2', v.date === t0 ? 'bg-moss-100' : 'bg-stone-50')}>
                <div className="w-12 text-center leading-tight">
                  <div className="text-[11px] text-stone-500 uppercase">{weekday(v.date)}</div>
                  <div className="text-[15px] font-semibold">{new Date(v.date + 'T12:00').getDate()}.</div>
                </div>
                <div className="flex-1 text-[13px] text-stone-600">{v.date === t0 ? 'Heute' : v.note ?? dateLong(v.date)}</div>
                <AvatarStack users={v.userIds.map((id) => users[id])} size={22} />
                {office && (
                  <button onClick={() => db.visits.delete(v.id)} className="text-stone-300 hover:text-rose-600" aria-label="Einsatz löschen"><Trash2 size={14} /></button>
                )}
              </li>
            ))}
          </ul>
          {past.length > 0 && <p className="mt-3 text-[12.5px] text-stone-400">{past.length} Einsatztage bereits erledigt</p>}
        </Card>

        <Card className="p-5">
          <h2 className="mb-3 font-semibold">Baustelle</h2>
          <div className="flex items-start gap-2.5 text-[14px]">
            <MapPin size={16} className="mt-0.5 shrink-0 text-stone-400" />
            <div>{job.street}<br />{job.zip} {job.city}</div>
          </div>
          <a href={mapsUrl(job.street, job.zip, job.city)} target="_blank" rel="noreferrer" className="mt-3 block overflow-hidden rounded-lg ring-1 ring-stone-200">
            <iframe
              title="Karte"
              className="pointer-events-none h-40 w-full grayscale-[30%]"
              loading="lazy"
              src={`https://maps.google.com/maps?q=${encodeURIComponent(`${job.street}, ${job.zip} ${job.city}`)}&z=15&output=embed`}
            />
          </a>
        </Card>
      </div>

      <Modal
        open={edit}
        onClose={() => setEdit(false)}
        title="Auftrag bearbeiten"
        wide
        footer={<><Button variant="ghost" onClick={() => setEdit(false)}>Abbrechen</Button><Button variant="primary" onClick={saveEdit}>Speichern</Button></>}
      >
        <div className="grid gap-4 sm:grid-cols-6">
          <Field label="Titel" className="sm:col-span-6"><Input value={draft.title} onChange={(e) => setDraft({ ...draft, title: e.target.value })} /></Field>
          <Field label="Straße" className="sm:col-span-6"><Input value={draft.street} onChange={(e) => setDraft({ ...draft, street: e.target.value })} /></Field>
          <Field label="PLZ" className="sm:col-span-2"><Input value={draft.zip} onChange={(e) => setDraft({ ...draft, zip: e.target.value })} /></Field>
          <Field label="Ort" className="sm:col-span-4"><Input value={draft.city} onChange={(e) => setDraft({ ...draft, city: e.target.value })} /></Field>
          <Field label="Beginn" className="sm:col-span-2"><Input type="date" value={draft.startDate ?? ''} onChange={(e) => setDraft({ ...draft, startDate: e.target.value || undefined })} /></Field>
          <Field label="Ende" className="sm:col-span-2"><Input type="date" value={draft.endDate ?? ''} onChange={(e) => setDraft({ ...draft, endDate: e.target.value || undefined })} /></Field>
          <Field label="Wert netto (€)" className="sm:col-span-2"><Input type="number" value={draft.estimate ?? ''} onChange={(e) => setDraft({ ...draft, estimate: e.target.value ? Number(e.target.value) : undefined })} /></Field>
          <Field label="Beschreibung" className="sm:col-span-6"><Textarea rows={5} value={draft.description} onChange={(e) => setDraft({ ...draft, description: e.target.value })} /></Field>
          <div className="sm:col-span-6">
            <span className="mb-1.5 block text-[13px] font-medium text-stone-700">Leistungen</span>
            <div className="flex flex-wrap gap-1.5">
              {SERVICES.map((s) => {
                const on = draft.services.includes(s)
                return (
                  <button key={s} onClick={() => setDraft({ ...draft, services: on ? draft.services.filter((x) => x !== s) : [...draft.services, s] })} className={clsx('h-8 rounded-full px-3 text-[13px] ring-1', on ? 'bg-moss-100 text-moss-800 ring-moss-300' : 'bg-white text-stone-600 ring-stone-300')}>
                    {s}
                  </button>
                )
              })}
            </div>
          </div>
        </div>
      </Modal>

      <TeamModal open={teamOpen} onClose={() => setTeamOpen(false)} job={job} users={allUsers} />
      <VisitModal open={visitOpen} onClose={() => setVisitOpen(false)} job={job} users={allUsers} />
    </div>
  )
}

function TeamModal({ open, onClose, job, users }: { open: boolean; onClose: () => void; job: Job; users: ReturnType<typeof useUsers> }) {
  const me = useMe()
  const [sel, setSel] = useState(job.assignees)
  async function save() {
    await db.jobs.update(job.id, { assignees: sel, updatedAt: Date.now() })
    await log(me.id, 'Team geändert', job.id)
    onClose()
  }
  return (
    <Modal open={open} onClose={onClose} title="Team einteilen" footer={<><Button variant="ghost" onClick={onClose}>Abbrechen</Button><Button variant="primary" onClick={save}>Speichern</Button></>}>
      <ul className="space-y-1">
        {users.map((u) => {
          const on = sel.includes(u.id)
          return (
            <li key={u.id}>
              <button onClick={() => setSel(on ? sel.filter((x) => x !== u.id) : [...sel, u.id])} className="flex w-full items-center gap-3 rounded-lg px-2 py-2 text-left hover:bg-stone-50">
                <Avatar user={u} size={32} />
                <span className="flex-1"><span className="block text-[14px] font-medium">{u.name}</span><span className="text-[12.5px] text-stone-500">{u.title}</span></span>
                <span className={clsx('grid size-[22px] place-items-center rounded-md ring-1', on ? 'bg-moss-600 text-white ring-moss-600' : 'ring-stone-300')}>{on && <Check size={14} strokeWidth={3} />}</span>
              </button>
            </li>
          )
        })}
      </ul>
    </Modal>
  )
}

function VisitModal({ open, onClose, job, users }: { open: boolean; onClose: () => void; job: Job; users: ReturnType<typeof useUsers> }) {
  const me = useMe()
  const [from, setFrom] = useState(job.startDate && job.startDate >= today() ? job.startDate : addDays(today(), 1))
  const [to, setTo] = useState(from)
  const [sel, setSel] = useState(job.assignees)
  const [note, setNote] = useState('')
  async function save() {
    const list = []
    for (let d = from; d <= (to < from ? from : to); d = addDays(d, 1)) {
      const wd = new Date(d + 'T12:00').getDay()
      if (wd === 0 || (wd === 6 && from !== to)) continue
      list.push({ id: uid(), jobId: job.id, date: d, userIds: sel, note: note || undefined })
    }
    await db.visits.bulkAdd(list)
    await log(me.id, `${list.length} Einsatztag${list.length === 1 ? '' : 'e'} geplant`, job.id)
    onClose()
  }
  return (
    <Modal open={open} onClose={onClose} title="Einsatz planen" footer={<><Button variant="ghost" onClick={onClose}>Abbrechen</Button><Button variant="primary" disabled={!sel.length} onClick={save}>Einplanen</Button></>}>
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <Field label="Von"><Input type="date" value={from} onChange={(e) => (setFrom(e.target.value), e.target.value > to && setTo(e.target.value))} /></Field>
          <Field label="Bis"><Input type="date" value={to} onChange={(e) => setTo(e.target.value)} /></Field>
        </div>
        <p className="-mt-2 text-xs text-stone-500">Sonntage werden übersprungen, Samstage nur bei Einzeltag.</p>
        <div>
          <span className="mb-1.5 block text-[13px] font-medium text-stone-700">Wer?</span>
          <div className="flex flex-wrap gap-1.5">
            {users.map((u) => (
              <button key={u.id} onClick={() => setSel(sel.includes(u.id) ? sel.filter((x) => x !== u.id) : [...sel, u.id])} className={clsx('flex items-center gap-1.5 rounded-full py-1 pr-3 pl-1 text-[13px] ring-1', sel.includes(u.id) ? 'bg-moss-800 text-white ring-moss-800' : 'bg-white ring-stone-300')}>
                <Avatar user={u} size={22} /> {u.name.split(' ')[0]}
              </button>
            ))}
          </div>
        </div>
        <Field label="Hinweis (optional)"><Input placeholder="z. B. 7:00 Uhr Treffpunkt Hof" value={note} onChange={(e) => setNote(e.target.value)} /></Field>
      </div>
    </Modal>
  )
}

function History({ jobId }: { jobId: string }) {
  const users = useUserMap()
  const acts = useLiveQuery(() => db.activities.where('jobId').equals(jobId).reverse().sortBy('createdAt'), [jobId]) ?? []
  return (
    <Card className="max-w-2xl p-2">
      {acts.length === 0 && <p className="p-6 text-center text-sm text-stone-500">Noch nichts passiert.</p>}
      <ol>
        {acts.map((a) => (
          <li key={a.id} className="flex items-start gap-3 px-3 py-2.5">
            <Avatar user={users[a.userId]} size={26} />
            <div className="flex-1 text-[14px]"><span className="font-medium">{users[a.userId]?.name}</span> <span className="text-stone-600">{a.text}</span></div>
            <span className="text-xs text-stone-400">{relTime(a.createdAt)}</span>
          </li>
        ))}
      </ol>
    </Card>
  )
}
