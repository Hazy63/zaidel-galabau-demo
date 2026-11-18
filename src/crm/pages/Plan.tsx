import clsx from 'clsx'
import { useLiveQuery } from 'dexie-react-hooks'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { useState } from 'react'
import { Link } from 'react-router-dom'
import { db, type Job } from '../db'
import { addDays, dateShort, today, weekday } from '../format'
import { isOffice, useMe, useUsers } from '../session'
import { Avatar, AvatarStack, Button, Card } from '../ui'
import { useUserMap } from '../session'

const COLORS = ['bg-moss-100 text-moss-900 ring-moss-300', 'bg-clay-100 text-clay-700 ring-clay-200', 'bg-sky-50 text-sky-900 ring-sky-200', 'bg-amber-50 text-amber-900 ring-amber-200', 'bg-violet-50 text-violet-900 ring-violet-200', 'bg-stone-100 text-stone-800 ring-stone-300']

function monday(iso: string) {
  const d = new Date(iso + 'T12:00')
  const wd = (d.getDay() + 6) % 7
  return addDays(iso, -wd)
}

function kw(iso: string) {
  const d = new Date(iso + 'T12:00')
  d.setDate(d.getDate() + 3 - ((d.getDay() + 6) % 7))
  const w1 = new Date(d.getFullYear(), 0, 4)
  return 1 + Math.round(((d.getTime() - w1.getTime()) / 86400000 - 3 + ((w1.getDay() + 6) % 7)) / 7)
}

export default function Plan() {
  const me = useMe()
  const users = useUsers().filter((u) => u.active)
  const userMap = useUserMap()
  const [start, setStart] = useState(monday(today()))
  const days = Array.from({ length: 6 }, (_, i) => addDays(start, i))
  const t = today()

  const data = useLiveQuery(async () => {
    const visits = await db.visits.where('date').between(days[0], days[5], true, true).toArray()
    const jobs = await db.jobs.bulkGet([...new Set(visits.map((v) => v.jobId))])
    return { visits, jobs: Object.fromEntries(jobs.filter(Boolean).map((j) => [j!.id, j!])) as Record<string, Job> }
  }, [start])

  const visits = data?.visits ?? []
  const jobs = data?.jobs ?? {}
  const jobColor = Object.fromEntries(Object.keys(jobs).map((id, i) => [id, COLORS[i % COLORS.length]]))
  const rows = isOffice(me) ? users : users.filter((u) => u.id === me.id)

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-[26px] font-semibold tracking-tight">Einsatzplan</h1>
          <p className="text-sm text-stone-500">KW {kw(start)} · {dateShort(days[0])} – {dateShort(days[5])}</p>
        </div>
        <div className="flex items-center gap-1.5">
          <Button size="sm" icon={<ChevronLeft size={16} />} onClick={() => setStart(addDays(start, -7))} aria-label="Vorherige Woche" />
          <Button size="sm" onClick={() => setStart(monday(today()))}>Diese Woche</Button>
          <Button size="sm" icon={<ChevronRight size={16} />} onClick={() => setStart(addDays(start, 7))} aria-label="Nächste Woche" />
        </div>
      </div>

      {/* Desktop: Raster Person × Tag */}
      <Card className="mt-6 hidden overflow-hidden md:block">
        <div className="grid grid-cols-[180px_repeat(6,1fr)] border-b border-stone-200 bg-stone-50 text-[12.5px]">
          <div className="px-4 py-2.5 font-medium text-stone-500">Team</div>
          {days.map((d) => (
            <div key={d} className={clsx('border-l border-stone-200 px-3 py-2.5', d === t && 'bg-moss-100/60')}>
              <span className="font-semibold text-stone-800">{weekday(d)}</span> <span className="text-stone-500">{dateShort(d)}</span>
            </div>
          ))}
        </div>
        {rows.map((u) => (
          <div key={u.id} className="grid grid-cols-[180px_repeat(6,1fr)] border-b border-stone-100 last:border-0">
            <div className="flex items-center gap-2.5 px-4 py-3">
              <Avatar user={u} size={28} />
              <div className="min-w-0 leading-tight">
                <div className="truncate text-[13.5px] font-medium">{u.name}</div>
                <div className="truncate text-[11.5px] text-stone-500">{u.title}</div>
              </div>
            </div>
            {days.map((d) => {
              const vs = visits.filter((v) => v.date === d && v.userIds.includes(u.id))
              return (
                <div key={d} className={clsx('min-h-[68px] space-y-1 border-l border-stone-100 p-1.5', d === t && 'bg-moss-100/30')}>
                  {vs.map((v) => {
                    const j = jobs[v.jobId]
                    if (!j) return null
                    return (
                      <Link key={v.id} to={`/app/auftraege/${j.id}`} title={j.title} className={clsx('block rounded-md px-2 py-1.5 text-[12px] leading-tight ring-1 ring-inset hover:brightness-95', jobColor[j.id])}>
                        <div className="line-clamp-2 font-medium">{j.title}</div>
                        <div className="mt-0.5 truncate opacity-70">{v.note ?? j.city}</div>
                      </Link>
                    )
                  })}
                </div>
              )
            })}
          </div>
        ))}
      </Card>

      {/* Mobil: Liste je Tag */}
      <div className="mt-6 space-y-5 md:hidden">
        {days.map((d) => {
          const vs = visits.filter((v) => v.date === d && (isOffice(me) || v.userIds.includes(me.id)))
          return (
            <div key={d}>
              <div className={clsx('mb-2 flex items-baseline gap-2 text-[13px]', d === t ? 'text-moss-700' : 'text-stone-500')}>
                <span className="font-semibold">{d === t ? 'Heute' : weekday(d)}</span>
                <span>{dateShort(d)}</span>
              </div>
              {vs.length === 0 ? (
                <div className="rounded-xl border border-dashed border-stone-300 px-4 py-3 text-[13px] text-stone-400">frei</div>
              ) : (
                <Card className="divide-y divide-stone-100">
                  {vs.map((v) => {
                    const j = jobs[v.jobId]
                    if (!j) return null
                    return (
                      <Link key={v.id} to={`/app/auftraege/${j.id}`} className="flex items-center gap-3 px-4 py-3">
                        <span className={clsx('h-9 w-1 shrink-0 rounded-full ring-1', jobColor[j.id])} />
                        <div className="min-w-0 flex-1">
                          <div className="truncate text-[14px] font-medium">{j.title}</div>
                          <div className="truncate text-[12.5px] text-stone-500">{v.note ?? `${j.street}, ${j.city}`}</div>
                        </div>
                        <AvatarStack users={v.userIds.map((id) => userMap[id])} size={22} />
                      </Link>
                    )
                  })}
                </Card>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
