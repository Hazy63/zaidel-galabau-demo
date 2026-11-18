import clsx from 'clsx'
import { useLiveQuery } from 'dexie-react-hooks'
import { FilePlus2, FileText, FileUp, Paperclip, Receipt, Trash2 } from 'lucide-react'
import { useRef } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { db, log, nextNumber, touchJob, uid, type Doc, type Job } from '../db'
import { addDays, bytes, dateLong, DOC_STATUS, money, today } from '../format'
import { docGross, effectiveStatus } from '../hooks'
import { isOffice, useMe, useUserMap } from '../session'
import { Avatar, Button, Card, Chip, SectionTitle } from '../ui'

export async function createDoc(job: Job, kind: 'angebot' | 'rechnung', userId: string, from?: Doc) {
  const number = await nextNumber(kind === 'angebot' ? 'AN' : 'RE')
  const d: Doc = {
    id: uid(),
    jobId: job.id,
    kind,
    number,
    title: kind === 'angebot' ? `Angebot ${job.title}` : 'Rechnung',
    status: 'entwurf',
    date: today(),
    dueDate: kind === 'rechnung' ? addDays(today(), 14) : undefined,
    intro: kind === 'angebot' ? 'Sehr geehrte Damen und Herren,\nvielen Dank für Ihre Anfrage. Gerne bieten wir Ihnen folgende Leistungen an:' : 'Für die ausgeführten Arbeiten erlauben wir uns, wie folgt abzurechnen:',
    outro: kind === 'angebot' ? 'Das Angebot ist 30 Tage gültig. Ausführung nach Absprache. Wir freuen uns auf Ihren Auftrag.' : 'Bitte überweisen Sie den Betrag innerhalb von 14 Tagen ohne Abzug. Vielen Dank für Ihr Vertrauen.',
    items: from?.items?.map((i) => ({ ...i, id: uid() })) ?? [{ id: uid(), title: '', qty: 1, unit: 'm²', price: 0 }],
    userId,
    createdAt: Date.now(),
    fromDocId: from?.id,
  }
  await db.docs.add(d)
  await log(userId, `${kind === 'angebot' ? 'Angebot' : 'Rechnung'} ${number} erstellt`, job.id)
  await touchJob(job.id)
  return d
}

export default function JobDocs({ job }: { job: Job }) {
  const me = useMe()
  const office = isOffice(me)
  const users = useUserMap()
  const nav = useNavigate()
  const file = useRef<HTMLInputElement>(null)
  const docs = useLiveQuery(() => db.docs.where('jobId').equals(job.id).reverse().sortBy('createdAt'), [job.id]) ?? []

  const offers = docs.filter((d) => d.kind === 'angebot')
  const invoices = docs.filter((d) => d.kind === 'rechnung')
  const files = docs.filter((d) => d.kind === 'datei')
  const accepted = offers.find((o) => o.status === 'angenommen')

  async function upload(list: FileList | null) {
    if (!list?.length) return
    for (const f of Array.from(list)) {
      await db.docs.add({ id: uid(), jobId: job.id, kind: 'datei', title: f.name.replace(/\.[^.]+$/, ''), fileName: f.name, mime: f.type, size: f.size, blob: f, date: today(), userId: me.id, createdAt: Date.now() })
    }
    await log(me.id, `${list.length} Datei${list.length > 1 ? 'en' : ''} hochgeladen`, job.id)
    await touchJob(job.id)
  }

  function openFile(d: Doc) {
    const url = d.blob ? URL.createObjectURL(d.blob) : d.src ? `${import.meta.env.BASE_URL}${d.src}` : undefined
    if (url) window.open(url, '_blank')
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap gap-2">
        {office && (
          <>
            <Button variant="primary" icon={<FilePlus2 size={16} />} onClick={async () => nav(`/app/auftraege/${job.id}/dokument/${(await createDoc(job, 'angebot', me.id)).id}`)}>Angebot erstellen</Button>
            <Button icon={<Receipt size={16} />} onClick={async () => nav(`/app/auftraege/${job.id}/dokument/${(await createDoc(job, 'rechnung', me.id, accepted)).id}`)}>
              {accepted ? 'Rechnung aus Angebot' : 'Rechnung erstellen'}
            </Button>
          </>
        )}
        <Button icon={<FileUp size={16} />} onClick={() => file.current?.click()}>Datei hochladen</Button>
        <input ref={file} type="file" multiple hidden accept="application/pdf,image/*,.doc,.docx,.xls,.xlsx" onChange={(e) => (upload(e.target.files), (e.target.value = ''))} />
      </div>

      {!me.canSeePrices && (offers.length > 0 || invoices.length > 0) && (
        <p className="rounded-lg bg-stone-100 px-4 py-3 text-[13px] text-stone-600">
          Du siehst Angebote und Rechnungen als Leistungsverzeichnis – mit Mengen, ohne Preise.
        </p>
      )}

      <DocGroup title="Angebote" icon={<FileText size={18} />} docs={offers} showPrice={me.canSeePrices} jobId={job.id} />
      <DocGroup title="Rechnungen" icon={<Receipt size={18} />} docs={invoices} showPrice={me.canSeePrices} jobId={job.id} />

      <section>
        <SectionTitle>Dateien &amp; Pläne</SectionTitle>
        <Card className="divide-y divide-stone-100">
          {files.length === 0 && <p className="px-4 py-6 text-center text-sm text-stone-500">Lieferscheine, Pläne, Skizzen – alles hier rein.</p>}
          {files.map((d) => (
            <div key={d.id} className="flex items-center gap-3 px-4 py-3">
              <button onClick={() => openFile(d)} className="flex min-w-0 flex-1 items-center gap-3 text-left">
                <span className={clsx('grid size-10 shrink-0 place-items-center rounded-lg text-[10px] font-bold uppercase', d.mime?.includes('pdf') ? 'bg-rose-50 text-rose-700' : 'bg-stone-100 text-stone-600')}>
                  {d.mime?.includes('pdf') ? 'PDF' : <Paperclip size={16} />}
                </span>
                <span className="min-w-0">
                  <span className="block truncate text-[14px] font-medium hover:underline">{d.title}</span>
                  <span className="block truncate text-[12.5px] text-stone-500">{d.fileName} · {bytes(d.size)} · {dateLong(d.date)}</span>
                </span>
              </button>
              <Avatar user={users[d.userId]} size={22} />
              {(office || d.userId === me.id) && (
                <button onClick={() => confirm('Datei löschen?') && db.docs.delete(d.id)} className="text-stone-300 hover:text-rose-600" aria-label="Löschen"><Trash2 size={15} /></button>
              )}
            </div>
          ))}
        </Card>
      </section>
    </div>
  )
}

function DocGroup({ title, icon, docs, showPrice, jobId }: { title: string; icon: React.ReactNode; docs: Doc[]; showPrice: boolean; jobId: string }) {
  if (!docs.length) return null
  return (
    <section>
      <SectionTitle>{title}</SectionTitle>
      <Card className="divide-y divide-stone-100">
        {docs.map((d) => {
          const s = effectiveStatus(d)
          return (
            <Link key={d.id} to={`/app/auftraege/${jobId}/dokument/${d.id}`} className="flex items-center gap-3 px-4 py-3.5 hover:bg-stone-50">
              <span className="grid size-10 shrink-0 place-items-center rounded-lg bg-moss-100 text-moss-700">{icon}</span>
              <div className="min-w-0 flex-1">
                <div className="truncate text-[14px] font-medium">{d.number} · {d.title}</div>
                <div className="text-[12.5px] text-stone-500">
                  {dateLong(d.date)}
                  {d.kind === 'rechnung' && d.dueDate && <> · fällig {dateLong(d.dueDate)}</>}
                  {' · '}{d.items?.length ?? 0} Positionen
                </div>
              </div>
              {s && <Chip className={DOC_STATUS[s].chip}>{DOC_STATUS[s].label}</Chip>}
              {showPrice && <span className="tabular hidden w-28 text-right text-[14px] font-semibold sm:block">{money(docGross(d))}</span>}
            </Link>
          )
        })}
      </Card>
    </section>
  )
}
