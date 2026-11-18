import clsx from 'clsx'
import { useLiveQuery } from 'dexie-react-hooks'
import { Camera, Columns3, FileText, Globe, List, MessageSquare, Plus, Search } from 'lucide-react'
import { useMemo, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { db, log, type Job, type JobStatus } from '../db'
import { dateShort, JOB_STATUS, jobStatus, money0 as money } from '../format'
import { useCustomerMap } from '../hooks'
import { isOffice, useMe, useUserMap } from '../session'
import { AvatarStack, Button, Card, Chip, Empty, Input, PhotoImg, Segmented } from '../ui'
import NewJobModal from './NewJobModal'

export default function Jobs() {
  const me = useMe()
  const office = isOffice(me)
  const users = useUserMap()
  const customers = useCustomerMap()
  const [params, setParams] = useSearchParams()
  const statusFilter = params.get('status') as JobStatus | null
  const [view, setView] = useState<'board' | 'list'>(() => (statusFilter || window.innerWidth < 768 ? 'list' : 'board'))
  const [q, setQ] = useState('')
  const [onlyMine, setOnlyMine] = useState(!office)
  const [newOpen, setNewOpen] = useState(false)
  const [dragId, setDragId] = useState<string | null>(null)
  const [over, setOver] = useState<JobStatus | null>(null)

  const jobs = useLiveQuery(() => db.jobs.orderBy('updatedAt').reverse().toArray(), []) ?? []
  const counts = useLiveQuery(async () => {
    const [p, n, d] = await Promise.all([db.photos.toArray(), db.notes.toArray(), db.docs.toArray()])
    const c: Record<string, { p: number; n: number; d: number }> = {}
    const add = (id: string, k: 'p' | 'n' | 'd') => ((c[id] ??= { p: 0, n: 0, d: 0 })[k] += 1)
    p.forEach((x) => add(x.jobId, 'p'))
    n.forEach((x) => add(x.jobId, 'n'))
    d.forEach((x) => add(x.jobId, 'd'))
    return c
  }, []) ?? {}

  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase()
    return jobs.filter((j) => {
      if (onlyMine && !j.assignees.includes(me.id)) return false
      if (view === 'list' && statusFilter && j.status !== statusFilter) return false
      if (!s) return true
      const c = customers[j.customerId]
      return [j.title, j.number, j.city, j.street, c?.name, ...j.services].join(' ').toLowerCase().includes(s)
    })
  }, [jobs, q, onlyMine, me.id, customers, statusFilter, view])

  async function move(id: string, status: JobStatus) {
    const j = jobs.find((x) => x.id === id)
    if (!j || j.status === status) return
    await db.jobs.update(id, { status, updatedAt: Date.now() })
    await log(me.id, `Status geändert: ${jobStatus(j.status).label} → ${jobStatus(status).label}`, id)
  }

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-[26px] font-semibold tracking-tight">Aufträge</h1>
        <div className="flex items-center gap-2">
          <Segmented
            value={view}
            onChange={setView}
            options={[
              { id: 'board', label: <><Columns3 size={15} /> <span className="hidden sm:inline">Tafel</span></> },
              { id: 'list', label: <><List size={15} /> <span className="hidden sm:inline">Liste</span></> },
            ]}
          />
          {office && (
            <Button variant="primary" icon={<Plus size={17} />} onClick={() => setNewOpen(true)}>
              <span className="hidden sm:inline">Neuer Auftrag</span>
            </Button>
          )}
        </div>
      </div>

      <div className="mt-5 flex flex-wrap items-center gap-2">
        <div className="relative min-w-0 flex-1 sm:max-w-xs">
          <Search size={16} className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-stone-400" />
          <Input className="pl-9" placeholder="Suchen: Kunde, Ort, Leistung …" value={q} onChange={(e) => setQ(e.target.value)} />
        </div>
        <button
          onClick={() => setOnlyMine(!onlyMine)}
          className={clsx('h-10 rounded-lg px-3.5 text-[13px] font-medium ring-1 transition', onlyMine ? 'bg-moss-800 text-white ring-moss-800' : 'bg-white text-stone-700 ring-stone-300')}
        >
          Nur meine
        </button>
      </div>

      {view === 'list' && (
        <div className="-mx-4 mt-3 flex gap-1.5 overflow-x-auto px-4 pb-1 sm:mx-0 sm:px-0">
          <FilterPill active={!statusFilter} onClick={() => setParams({})}>Alle</FilterPill>
          {JOB_STATUS.map((s) => (
            <FilterPill key={s.id} active={statusFilter === s.id} onClick={() => setParams({ status: s.id })}>
              <span className={clsx('size-1.5 rounded-full', s.dot)} />
              {s.label}
              <span className="text-stone-400">{jobs.filter((j) => j.status === s.id && (!onlyMine || j.assignees.includes(me.id))).length}</span>
            </FilterPill>
          ))}
        </div>
      )}

      {view === 'board' ? (
        <div className="-mx-4 mt-5 flex snap-x gap-3 overflow-x-auto px-4 pb-4 sm:-mx-6 sm:px-6 lg:-mx-10 lg:px-10">
          {JOB_STATUS.map((s) => {
            const col = filtered.filter((j) => j.status === s.id)
            return (
              <div
                key={s.id}
                onDragOver={(e) => {
                  e.preventDefault()
                  setOver(s.id)
                }}
                onDragLeave={() => setOver(null)}
                onDrop={() => {
                  if (dragId) move(dragId, s.id)
                  setDragId(null)
                  setOver(null)
                }}
                className={clsx('flex w-[280px] shrink-0 snap-start flex-col rounded-xl p-2 transition', over === s.id ? 'bg-moss-100' : 'bg-stone-200/50')}
              >
                <div className="flex items-center gap-2 px-2 pt-1 pb-2.5 text-[13px] font-semibold">
                  <span className={clsx('size-2 rounded-full', s.dot)} />
                  {s.label}
                  <span className="font-normal text-stone-500">{col.length}</span>
                </div>
                <div className="flex flex-col gap-2">
                  {col.map((j) => (
                    <div key={j.id} draggable={office} onDragStart={() => setDragId(j.id)} onDragEnd={() => setDragId(null)} className={clsx(dragId === j.id && 'opacity-40')}>
                      <BoardCard job={j} customer={customers[j.customerId]?.name} users={j.assignees.map((id) => users[id])} counts={counts[j.id]} showPrice={me.canSeePrices} />
                    </div>
                  ))}
                  {col.length === 0 && <div className="rounded-lg border border-dashed border-stone-300 px-3 py-6 text-center text-xs text-stone-400">leer</div>}
                </div>
              </div>
            )
          })}
        </div>
      ) : (
        <Card className="mt-4 divide-y divide-stone-100 overflow-hidden">
          {filtered.length === 0 && <Empty icon={<Search size={20} />} title="Nichts gefunden" text="Suchbegriff oder Filter anpassen." />}
          {filtered.map((j) => {
            const st = jobStatus(j.status)
            const c = counts[j.id]
            return (
              <Link key={j.id} to={`/app/auftraege/${j.id}`} className="flex items-center gap-3 px-3 py-3 hover:bg-stone-50 sm:gap-4 sm:px-4">
                <PhotoImg src={j.cover} small className="size-14 shrink-0 rounded-lg sm:size-12" />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="truncate text-[14.5px] font-medium">{j.title}</span>
                    {j.source === 'website' && <Globe size={13} className="shrink-0 text-sky-600" />}
                  </div>
                  <div className="mt-0.5 truncate text-[13px] text-stone-500">
                    {customers[j.customerId]?.name} · {j.city}
                    {j.startDate && <> · ab {dateShort(j.startDate)}</>}
                  </div>
                  <div className="mt-1.5 flex items-center gap-2 sm:hidden">
                    <Chip className={st.chip} dot={st.dot}>{st.label}</Chip>
                  </div>
                </div>
                <div className="hidden w-32 sm:block">
                  <Chip className={st.chip} dot={st.dot}>{st.label}</Chip>
                </div>
                <div className="hidden w-28 items-center gap-3 text-xs text-stone-400 md:flex">
                  <span className="flex items-center gap-1"><Camera size={13} />{c?.p ?? 0}</span>
                  <span className="flex items-center gap-1"><FileText size={13} />{c?.d ?? 0}</span>
                  <span className="flex items-center gap-1"><MessageSquare size={13} />{c?.n ?? 0}</span>
                </div>
                <div className="hidden w-24 lg:block">
                  <AvatarStack users={j.assignees.map((id) => users[id])} size={24} />
                </div>
                {me.canSeePrices && <div className="tabular hidden w-24 text-right text-[13px] text-stone-600 sm:block">{j.estimate ? money(j.estimate) : '–'}</div>}
              </Link>
            )
          })}
        </Card>
      )}

      <NewJobModal open={newOpen} onClose={() => setNewOpen(false)} />
    </div>
  )
}

function FilterPill({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      className={clsx('flex h-8 shrink-0 items-center gap-1.5 rounded-full px-3 text-[13px] font-medium ring-1 transition', active ? 'bg-stone-900 text-white ring-stone-900' : 'bg-white text-stone-700 ring-stone-300 hover:bg-stone-50')}
    >
      {children}
    </button>
  )
}

function BoardCard({ job, customer, users, counts, showPrice }: { job: Job; customer?: string; users: Parameters<typeof AvatarStack>[0]['users']; counts?: { p: number; n: number; d: number }; showPrice: boolean }) {
  return (
    <Link to={`/app/auftraege/${job.id}`} className="block overflow-hidden rounded-lg bg-white shadow-card ring-1 ring-stone-200 transition hover:ring-stone-300">
      {job.cover && <PhotoImg src={job.cover} small className="h-24 w-full" />}
      <div className="p-3">
        <div className="text-[11px] font-medium tracking-wide text-stone-400">{job.number}</div>
        <div className="mt-0.5 text-[14px] leading-snug font-medium">{job.title}</div>
        <div className="mt-1 flex items-center gap-1 text-[12.5px] text-stone-500">
          {job.source === 'website' && <Globe size={12} className="text-sky-600" />}
          {customer} · {job.city}
        </div>
        <div className="mt-3 flex items-center justify-between">
          <div className="flex items-center gap-2.5 text-[11.5px] text-stone-400">
            <span className="flex items-center gap-1"><Camera size={12} />{counts?.p ?? 0}</span>
            <span className="flex items-center gap-1"><FileText size={12} />{counts?.d ?? 0}</span>
            <span className="flex items-center gap-1"><MessageSquare size={12} />{counts?.n ?? 0}</span>
          </div>
          <div className="flex items-center gap-2">
            {showPrice && job.estimate ? <span className="tabular text-[12px] text-stone-500">{money(job.estimate)}</span> : null}
            {users.length > 0 && <AvatarStack users={users} size={22} />}
          </div>
        </div>
      </div>
    </Link>
  )
}
