import clsx from 'clsx'
import { useLiveQuery } from 'dexie-react-hooks'
import { Camera, ChevronLeft, ChevronRight, ImagePlus, ImageIcon, Star, Trash2, X } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { db, log, touchJob, uid, type Job, type Photo, type PhotoPhase } from '../db'
import { img, PHASES, relTime } from '../format'
import { isOffice, useMe, useUserMap } from '../session'
import { Avatar, Button, Card, Empty, PhotoImg, Segmented, shrinkImage, useObjectUrl } from '../ui'

export default function JobPhotos({ job }: { job: Job }) {
  const me = useMe()
  const users = useUserMap()
  const photos = useLiveQuery(() => db.photos.where('jobId').equals(job.id).sortBy('createdAt'), [job.id]) ?? []
  const defaultPhase: PhotoPhase = job.status === 'abgeschlossen' ? 'nachher' : job.status === 'in_arbeit' ? 'waehrend' : 'vorher'
  const [phase, setPhase] = useState<PhotoPhase>(defaultPhase)
  const [filter, setFilter] = useState<'alle' | PhotoPhase>('alle')
  const [open, setOpen] = useState<number | null>(null)
  const [busy, setBusy] = useState(0)
  const cam = useRef<HTMLInputElement>(null)
  const gal = useRef<HTMLInputElement>(null)

  const shown = photos.filter((p) => filter === 'alle' || p.phase === filter)

  async function upload(files: FileList | null) {
    if (!files?.length) return
    const list = Array.from(files)
    setBusy(list.length)
    for (const f of list) {
      const blob = await shrinkImage(f)
      await db.photos.add({ id: uid(), jobId: job.id, phase, blob, userId: me.id, createdAt: Date.now() })
      setBusy((b) => b - 1)
    }
    await log(me.id, `${list.length} Foto${list.length > 1 ? 's' : ''} hochgeladen`, job.id)
    await touchJob(job.id)
    setFilter('alle')
  }

  return (
    <div>
      <Card className="mb-6 p-4">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="mb-2 text-[13px] font-medium text-stone-600">Neue Fotos gehören zu:</div>
            <Segmented value={phase} onChange={setPhase} options={PHASES.map((p) => ({ id: p.id, label: p.label }))} />
          </div>
          <div className="flex gap-2">
            <Button variant="primary" size="lg" icon={<Camera size={18} />} onClick={() => cam.current?.click()} className="flex-1 sm:flex-none">Foto aufnehmen</Button>
            <Button size="lg" icon={<ImagePlus size={18} />} onClick={() => gal.current?.click()} className="flex-1 sm:flex-none">Aus Galerie</Button>
          </div>
        </div>
        <input ref={cam} type="file" accept="image/*" capture="environment" hidden onChange={(e) => (upload(e.target.files), (e.target.value = ''))} />
        <input ref={gal} type="file" accept="image/*" multiple hidden onChange={(e) => (upload(e.target.files), (e.target.value = ''))} />
        {busy > 0 && <p className="mt-3 text-sm text-moss-700">Lade {busy} Foto{busy > 1 ? 's' : ''} hoch …</p>}
      </Card>

      {photos.length > 0 && (
        <div className="mb-4 flex gap-1.5 overflow-x-auto">
          {[{ id: 'alle' as const, label: 'Alle' }, ...PHASES].map((p) => {
            const n = p.id === 'alle' ? photos.length : photos.filter((x) => x.phase === p.id).length
            return (
              <button
                key={p.id}
                onClick={() => setFilter(p.id)}
                className={clsx('flex h-8 shrink-0 items-center gap-1.5 rounded-full px-3 text-[13px] font-medium ring-1', filter === p.id ? 'bg-stone-900 text-white ring-stone-900' : 'bg-white text-stone-700 ring-stone-300')}
              >
                {p.label} <span className="opacity-60">{n}</span>
              </button>
            )
          })}
        </div>
      )}

      {photos.length === 0 ? (
        <Card>
          <Empty icon={<ImageIcon size={22} />} title="Noch keine Fotos" text="Vorher-Fotos helfen beim Angebot, Nachher-Fotos landen später auf der Website." />
        </Card>
      ) : (
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4">
          {shown.map((p, i) => (
            <button key={p.id} onClick={() => setOpen(i)} className="group relative overflow-hidden rounded-xl bg-stone-200 text-left">
              <PhotoImg src={p.src} blob={p.blob} small className="aspect-[4/3] w-full transition duration-300 group-hover:scale-[1.03]" />
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent p-2.5 pt-8">
                <div className="flex items-center gap-1.5">
                  <Avatar user={users[p.userId]} size={18} />
                  <span className="text-[11.5px] text-white/85">{relTime(p.createdAt)}</span>
                </div>
                {p.caption && <div className="mt-1 line-clamp-1 text-[12.5px] font-medium text-white">{p.caption}</div>}
              </div>
              <span className="absolute top-2 left-2 rounded-md bg-black/45 px-1.5 py-0.5 text-[10.5px] font-semibold tracking-wide text-white uppercase backdrop-blur">
                {PHASES.find((x) => x.id === p.phase)?.label}
              </span>
              {job.cover && p.src === job.cover && <Star size={16} className="absolute top-2 right-2 fill-amber-300 text-amber-300" />}
            </button>
          ))}
        </div>
      )}

      {open !== null && shown[open] && (
        <Lightbox
          photo={shown[open]}
          index={open}
          total={shown.length}
          onClose={() => setOpen(null)}
          onNav={(d) => setOpen((i) => (i === null ? null : (i + d + shown.length) % shown.length))}
          job={job}
          canDelete={isOffice(me) || shown[open].userId === me.id}
        />
      )}
    </div>
  )
}

function Lightbox({ photo, index, total, onClose, onNav, job, canDelete }: { photo: Photo; index: number; total: number; onClose: () => void; onNav: (d: number) => void; job: Job; canDelete: boolean }) {
  const me = useMe()
  const users = useUserMap()
  const blobUrl = useObjectUrl(photo.blob)
  const src = photo.blob ? blobUrl : photo.src ? img(photo.src) : undefined
  const [caption, setCaption] = useState(photo.caption ?? '')

  useEffect(() => {
    setCaption(photo.caption ?? '')
  }, [photo.id, photo.caption])
  useEffect(() => {
    const k = (e: KeyboardEvent) => {
      if ((e.target as HTMLElement).tagName === 'INPUT') return
      if (e.key === 'Escape') onClose()
      if (e.key === 'ArrowRight') onNav(1)
      if (e.key === 'ArrowLeft') onNav(-1)
    }
    window.addEventListener('keydown', k)
    document.body.style.overflow = 'hidden'
    return () => {
      window.removeEventListener('keydown', k)
      document.body.style.overflow = ''
    }
  }, [onClose, onNav])

  async function remove() {
    if (!confirm('Foto wirklich löschen?')) return
    await db.photos.delete(photo.id)
    await log(me.id, 'Foto gelöscht', job.id)
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-stone-950/95">
      <div className="flex items-center justify-between px-4 py-3 text-white/80">
        <span className="text-sm">{index + 1} / {total}</span>
        <button onClick={onClose} className="grid size-10 place-items-center rounded-full hover:bg-white/10" aria-label="Schließen"><X size={22} /></button>
      </div>
      <div className="relative flex min-h-0 flex-1 items-center justify-center px-2">
        {src && <img src={src} alt={photo.caption ?? ''} className="max-h-full max-w-full rounded-lg object-contain" />}
        {total > 1 && (
          <>
            <button onClick={() => onNav(-1)} className="absolute left-3 grid size-11 place-items-center rounded-full bg-black/40 text-white hover:bg-black/60" aria-label="Zurück"><ChevronLeft size={22} /></button>
            <button onClick={() => onNav(1)} className="absolute right-3 grid size-11 place-items-center rounded-full bg-black/40 text-white hover:bg-black/60" aria-label="Weiter"><ChevronRight size={22} /></button>
          </>
        )}
      </div>
      <div className="safe-bottom mx-auto w-full max-w-3xl px-4 py-4">
        <div className="flex items-center gap-2 text-[13px] text-white/70">
          <Avatar user={users[photo.userId]} size={22} />
          {users[photo.userId]?.name} · {new Date(photo.createdAt).toLocaleString('de-DE', { dateStyle: 'medium', timeStyle: 'short' })}
        </div>
        <div className="mt-3 flex gap-2">
          <input
            value={caption}
            onChange={(e) => setCaption(e.target.value)}
            onBlur={() => caption !== (photo.caption ?? '') && db.photos.update(photo.id, { caption })}
            placeholder="Beschreibung hinzufügen …"
            className="h-10 min-w-0 flex-1 rounded-lg bg-white/10 px-3 text-[14px] text-white placeholder:text-white/40 focus:bg-white/15 focus:outline-none"
          />
          {isOffice(me) && photo.src && (
            <button onClick={() => db.jobs.update(job.id, { cover: photo.src })} title="Als Titelbild" className={clsx('grid size-10 place-items-center rounded-lg bg-white/10 hover:bg-white/20', job.cover === photo.src ? 'text-amber-300' : 'text-white')}>
              <Star size={17} className={job.cover === photo.src ? 'fill-amber-300' : ''} />
            </button>
          )}
          {canDelete && (
            <button onClick={remove} title="Löschen" className="grid size-10 place-items-center rounded-lg bg-white/10 text-white hover:bg-rose-600"><Trash2 size={17} /></button>
          )}
        </div>
      </div>
    </div>
  )
}
