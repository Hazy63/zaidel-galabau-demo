import clsx from 'clsx'
import { useLiveQuery } from 'dexie-react-hooks'
import { Pin, SendHorizontal, Trash2 } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { db, log, touchJob, uid, type Job } from '../db'
import { relTime } from '../format'
import { isOffice, useMe, useUserMap } from '../session'
import { Avatar, Card, Empty } from '../ui'
import { MessageSquare } from 'lucide-react'

export default function JobNotes({ job }: { job: Job }) {
  const me = useMe()
  const users = useUserMap()
  const notes = useLiveQuery(() => db.notes.where('jobId').equals(job.id).sortBy('createdAt'), [job.id]) ?? []
  const [text, setText] = useState('')
  const end = useRef<HTMLDivElement>(null)
  const ta = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    end.current?.scrollIntoView({ block: 'nearest' })
  }, [notes.length])

  async function send() {
    const t = text.trim()
    if (!t) return
    await db.notes.add({ id: uid(), jobId: job.id, userId: me.id, text: t, createdAt: Date.now() })
    await log(me.id, 'Notiz geschrieben', job.id)
    await touchJob(job.id)
    setText('')
    ta.current?.focus()
  }

  return (
    <div className="mx-auto max-w-2xl">
      <Card className="flex flex-col">
        <div className="space-y-4 p-4 sm:p-5">
          {notes.length === 0 && <Empty icon={<MessageSquare size={22} />} title="Noch keine Notizen" text="Absprachen mit dem Kunden, Hinweise für die Kolonne, Material – alles was man sonst per WhatsApp schickt." />}
          {notes.map((n) => {
            const u = users[n.userId]
            const mine = n.userId === me.id
            return (
              <div key={n.id} className={clsx('group flex gap-2.5', mine && 'flex-row-reverse')}>
                <Avatar user={u} size={30} />
                <div className={clsx('max-w-[85%]', mine && 'text-right')}>
                  <div className={clsx('mb-1 flex items-center gap-2 text-[12px] text-stone-500', mine && 'justify-end')}>
                    <span className="font-medium text-stone-700">{u?.name}</span>
                    <span>{relTime(n.createdAt)}</span>
                    {n.pinned && <Pin size={12} className="fill-amber-400 text-amber-500" />}
                  </div>
                  <div
                    className={clsx(
                      'inline-block rounded-2xl px-3.5 py-2.5 text-left text-[14.5px] leading-relaxed whitespace-pre-line',
                      n.pinned ? 'bg-amber-50 text-amber-950 ring-1 ring-amber-200' : mine ? 'rounded-tr-md bg-moss-800 text-white' : 'rounded-tl-md bg-stone-100 text-stone-800',
                    )}
                  >
                    {n.text}
                  </div>
                  {(isOffice(me) || mine) && (
                    <div className={clsx('mt-1 flex gap-3 text-[12px] text-stone-400 opacity-0 transition group-hover:opacity-100', mine && 'justify-end')}>
                      {isOffice(me) && (
                        <button onClick={() => db.notes.update(n.id, { pinned: !n.pinned })} className="hover:text-amber-600">
                          {n.pinned ? 'Lösen' : 'Als wichtig anheften'}
                        </button>
                      )}
                      <button onClick={() => confirm('Notiz löschen?') && db.notes.delete(n.id)} className="flex items-center gap-1 hover:text-rose-600"><Trash2 size={12} /> Löschen</button>
                    </div>
                  )}
                </div>
              </div>
            )
          })}
          <div ref={end} />
        </div>
        <form onSubmit={(e) => (e.preventDefault(), send())} className="sticky bottom-16 flex items-end gap-2 rounded-b-xl border-t border-stone-200 bg-white p-3 lg:bottom-0">
          <textarea
            ref={ta}
            rows={1}
            value={text}
            onChange={(e) => {
              setText(e.target.value)
              e.target.style.height = 'auto'
              e.target.style.height = Math.min(e.target.scrollHeight, 160) + 'px'
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey && window.innerWidth >= 768) {
                e.preventDefault()
                send()
              }
            }}
            placeholder="Notiz schreiben …"
            className="min-h-10 flex-1 resize-none rounded-xl bg-stone-100 px-3.5 py-2.5 text-[15px] leading-snug placeholder:text-stone-400 focus:bg-white focus:ring-2 focus:ring-moss-500 focus:outline-none"
          />
          <button type="submit" disabled={!text.trim()} className="grid size-10 shrink-0 place-items-center rounded-xl bg-moss-800 text-white transition disabled:opacity-40" aria-label="Senden">
            <SendHorizontal size={18} />
          </button>
        </form>
      </Card>
    </div>
  )
}
