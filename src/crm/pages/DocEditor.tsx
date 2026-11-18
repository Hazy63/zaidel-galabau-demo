import clsx from 'clsx'
import { useLiveQuery } from 'dexie-react-hooks'
import { ArrowDown, ArrowLeft, ArrowUp, BookOpen, Eye, Mail, Pencil, Plus, Printer, Receipt, Trash2, X } from 'lucide-react'
import { useEffect, useMemo, useRef, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { Mark } from '../../Logo'
import { CATALOG } from '../catalog'
import { db, log, touchJob, uid, type Customer, type Doc, type DocStatus, type Job, type LineItem } from '../db'
import { dateLong, DOC_STATUS, money, num, totals, UNITS } from '../format'
import { effectiveStatus } from '../hooks'
import { isOffice, useMe } from '../session'
import { Button, Chip, Field, Input, Modal, Select, Textarea } from '../ui'
import { createDoc } from './JobDocs'

export default function DocEditor() {
  const { id = '', docId = '' } = useParams()
  const me = useMe()
  const nav = useNavigate()
  const office = isOffice(me)
  const doc = useLiveQuery(() => db.docs.get(docId), [docId])
  const job = useLiveQuery(() => db.jobs.get(id), [id])
  const customer = useLiveQuery(async () => (job ? db.customers.get(job.customerId) : undefined), [job?.customerId])
  const [draft, setDraft] = useState<Doc | null>(null)
  const [mode, setMode] = useState<'edit' | 'view'>('view')
  const [catalog, setCatalog] = useState(false)
  const dirty = useRef(false)

  useEffect(() => {
    if (doc && (!draft || draft.id !== doc.id)) {
      setDraft(doc)
      setMode(office && doc.status === 'entwurf' ? 'edit' : 'view')
    }
  }, [doc, draft, office])

  // Autosave
  useEffect(() => {
    if (!draft || !dirty.current) return
    const t = setTimeout(() => {
      dirty.current = false
      db.docs.put(draft)
    }, 400)
    return () => clearTimeout(t)
  }, [draft])

  if (!draft || !job) return <div className="p-10 text-sm text-stone-500">Lädt …</div>

  const kindLabel = draft.kind === 'angebot' ? 'Angebot' : 'Rechnung'
  const st = effectiveStatus(draft)
  const set = (p: Partial<Doc>) => {
    dirty.current = true
    setDraft((d) => (d ? { ...d, ...p } : d))
  }
  const setItem = (i: number, p: Partial<LineItem>) => set({ items: draft.items!.map((x, k) => (k === i ? { ...x, ...p } : x)) })
  const move = (i: number, d: number) => {
    const a = [...(draft.items ?? [])]
    const j = i + d
    if (j < 0 || j >= a.length) return
    ;[a[i], a[j]] = [a[j], a[i]]
    set({ items: a })
  }

  async function changeStatus(s: DocStatus) {
    set({ status: s })
    await db.docs.update(draft!.id, { status: s })
    await log(me.id, `${kindLabel} ${draft!.number}: ${DOC_STATUS[s].label}`, job!.id)
    if (s === 'angenommen' && job && ['anfrage', 'besichtigung', 'angebot'].includes(job.status)) {
      await db.jobs.update(job.id, { status: 'beauftragt', estimate: totals(draft!.items).net })
      await log(me.id, 'Status geändert: Angebot raus → Beauftragt', job.id)
    }
    if (s === 'versendet' && draft!.kind === 'angebot' && job && ['anfrage', 'besichtigung'].includes(job.status)) {
      await db.jobs.update(job.id, { status: 'angebot' })
    }
    await touchJob(job!.id)
  }

  async function toInvoice() {
    const d = await createDoc(job!, 'rechnung', me.id, draft!)
    nav(`/app/auftraege/${job!.id}/dokument/${d.id}`, { replace: true })
  }

  async function remove() {
    if (!confirm(`${kindLabel} ${draft!.number} löschen?`)) return
    await db.docs.delete(draft!.id)
    nav(`/app/auftraege/${job!.id}?tab=dokumente`)
  }

  const mailto = customer?.email
    ? `mailto:${customer.email}?subject=${encodeURIComponent(`${kindLabel} ${draft.number} – Zaidel Garten- und Landschaftsbau`)}&body=${encodeURIComponent(`Guten Tag ${customer.name},\n\nanbei erhalten Sie unser ${kindLabel.toLowerCase()} ${draft.number} zum Bauvorhaben „${job.title}“.\n\nMit freundlichen Grüßen\nDimitri Zaidel`)}`
    : undefined

  return (
    <div className="min-h-dvh bg-stone-200/70">
      <div className="no-print sticky top-0 z-30 border-b border-stone-300 bg-white/95 backdrop-blur">
        <div className="mx-auto flex max-w-5xl flex-wrap items-center gap-2 px-4 py-2.5">
          <Link to={`/app/auftraege/${job.id}?tab=dokumente`} className="grid size-9 place-items-center rounded-lg text-stone-600 hover:bg-stone-100" aria-label="Zurück">
            <ArrowLeft size={18} />
          </Link>
          <div className="mr-auto min-w-0 leading-tight">
            <div className="truncate text-[14px] font-semibold">{kindLabel} {draft.number}</div>
            <div className="truncate text-[12px] text-stone-500">{job.title}</div>
          </div>
          {office ? (
            <Select value={draft.status} onChange={(e) => changeStatus(e.target.value as DocStatus)} className="h-9 w-auto! py-1 text-[13px]">
              {(draft.kind === 'angebot' ? ['entwurf', 'versendet', 'angenommen', 'abgelehnt'] : ['entwurf', 'versendet', 'bezahlt']).map((s) => (
                <option key={s} value={s}>{DOC_STATUS[s as DocStatus].label}</option>
              ))}
            </Select>
          ) : (
            st && <Chip className={DOC_STATUS[st].chip}>{DOC_STATUS[st].label}</Chip>
          )}
          {office && (
            <div className="inline-flex rounded-lg bg-stone-100 p-0.5">
              <button onClick={() => setMode('edit')} className={clsx('flex h-8 items-center gap-1.5 rounded-md px-3 text-[13px] font-medium', mode === 'edit' ? 'bg-white shadow-card' : 'text-stone-600')}><Pencil size={14} /> Bearbeiten</button>
              <button onClick={() => setMode('view')} className={clsx('flex h-8 items-center gap-1.5 rounded-md px-3 text-[13px] font-medium', mode === 'view' ? 'bg-white shadow-card' : 'text-stone-600')}><Eye size={14} /> Vorschau</button>
            </div>
          )}
          {me.canSeePrices && <Button size="sm" icon={<Printer size={15} />} onClick={() => (setMode('view'), setTimeout(() => window.print(), 50))}>PDF / Drucken</Button>}
          {office && mailto && <a href={mailto}><Button size="sm" icon={<Mail size={15} />}>Senden</Button></a>}
          {office && draft.kind === 'angebot' && <Button size="sm" variant="clay" icon={<Receipt size={15} />} onClick={toInvoice}>In Rechnung umwandeln</Button>}
          {office && <Button size="sm" variant="danger" icon={<Trash2 size={15} />} onClick={remove} aria-label="Löschen" />}
        </div>
      </div>

      {mode === 'edit' && office ? (
        <div className="mx-auto max-w-5xl px-4 py-6">
          <div className="rounded-2xl bg-white p-5 shadow-card ring-1 ring-stone-200 sm:p-7">
            <div className="grid gap-4 sm:grid-cols-4">
              <Field label="Betreff" className="sm:col-span-2"><Input value={draft.title} onChange={(e) => set({ title: e.target.value })} /></Field>
              <Field label="Datum"><Input type="date" value={draft.date} onChange={(e) => set({ date: e.target.value })} /></Field>
              {draft.kind === 'rechnung' ? (
                <Field label="Fällig am"><Input type="date" value={draft.dueDate ?? ''} onChange={(e) => set({ dueDate: e.target.value })} /></Field>
              ) : <div />}
              <Field label="Einleitung" className="sm:col-span-4"><Textarea rows={2} value={draft.intro ?? ''} onChange={(e) => set({ intro: e.target.value })} /></Field>
            </div>

            <div className="mt-6">
              <div className="mb-2 flex items-center justify-between">
                <h3 className="font-semibold">Positionen</h3>
                <Button size="sm" variant="ghost" icon={<BookOpen size={14} />} onClick={() => setCatalog(true)}>Aus Leistungskatalog</Button>
              </div>
              <div className="hidden grid-cols-[28px_1fr_80px_86px_104px_104px_64px] gap-2 px-1 pb-1.5 text-[12px] font-medium text-stone-500 md:grid">
                <span>Pos</span><span>Leistung</span><span className="text-right">Menge</span><span>Einheit</span><span className="text-right">EP netto</span><span className="text-right">GP netto</span><span />
              </div>
              <div className="space-y-2">
                {draft.items!.map((it, i) => (
                  <div key={it.id} className="grid grid-cols-[1fr_auto] gap-2 rounded-xl bg-stone-50 p-2.5 ring-1 ring-stone-200 md:grid-cols-[28px_1fr_80px_86px_104px_104px_64px] md:items-start md:bg-transparent md:p-1 md:ring-0">
                    <span className="hidden pt-2.5 text-[13px] text-stone-400 md:block">{i + 1}</span>
                    <div className="col-span-2 space-y-1.5 md:col-span-1">
                      <Input placeholder="Leistung" value={it.title} onChange={(e) => setItem(i, { title: e.target.value })} />
                      <Input placeholder="Details (optional)" value={it.detail ?? ''} onChange={(e) => setItem(i, { detail: e.target.value })} className="text-[13px] text-stone-600" />
                    </div>
                    <div className="col-span-2 grid grid-cols-3 gap-2 md:contents">
                      <Input type="number" inputMode="decimal" step="any" className="text-right" value={it.qty} onChange={(e) => setItem(i, { qty: Number(e.target.value) })} />
                      <Select value={it.unit} onChange={(e) => setItem(i, { unit: e.target.value })}>
                        {UNITS.map((u) => <option key={u}>{u}</option>)}
                      </Select>
                      <Input type="number" inputMode="decimal" step="any" className="text-right" value={it.price} onChange={(e) => setItem(i, { price: Number(e.target.value) })} />
                    </div>
                    <div className="tabular pt-2.5 text-right text-[14px] font-medium">{money(it.qty * it.price)}</div>
                    <div className="flex justify-end gap-0.5 pt-1">
                      <button onClick={() => move(i, -1)} className="grid size-8 place-items-center rounded-md text-stone-400 hover:bg-stone-100" aria-label="Hoch"><ArrowUp size={14} /></button>
                      <button onClick={() => move(i, 1)} className="grid size-8 place-items-center rounded-md text-stone-400 hover:bg-stone-100" aria-label="Runter"><ArrowDown size={14} /></button>
                      <button onClick={() => set({ items: draft.items!.filter((_, k) => k !== i) })} className="grid size-8 place-items-center rounded-md text-stone-400 hover:bg-rose-50 hover:text-rose-600" aria-label="Entfernen"><X size={15} /></button>
                    </div>
                  </div>
                ))}
              </div>
              <Button className="mt-3" size="sm" icon={<Plus size={15} />} onClick={() => set({ items: [...draft.items!, { id: uid(), title: '', qty: 1, unit: 'm²', price: 0 }] })}>Position</Button>
              <Totals items={draft.items} className="mt-6 ml-auto max-w-xs" />
            </div>

            <Field label="Schlusstext" className="mt-6"><Textarea rows={2} value={draft.outro ?? ''} onChange={(e) => set({ outro: e.target.value })} /></Field>
            <p className="mt-4 text-xs text-stone-400">Änderungen werden automatisch gespeichert.</p>
          </div>
        </div>
      ) : (
        <FitA4>
          <Sheet doc={draft} job={job} customer={customer} showPrice={me.canSeePrices} />
        </FitA4>
      )}

      <CatalogModal open={catalog} onClose={() => setCatalog(false)} onPick={(c) => set({ items: [...draft.items!.filter((x) => x.title || x.price), { id: uid(), title: c.title, detail: c.detail, qty: 1, unit: c.unit, price: c.price }] })} />
    </div>
  )
}

/** Skaliert das A4-Blatt auf schmalen Bildschirmen, Druck bleibt 1:1 */
function FitA4({ children }: { children: React.ReactNode }) {
  const ref = useRef<HTMLDivElement>(null)
  const [z, setZ] = useState(1)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const ro = new ResizeObserver(([e]) => setZ(Math.min(1, e.contentRect.width / 794)))
    ro.observe(el)
    return () => ro.disconnect()
  }, [])
  return (
    <div className="overflow-hidden px-3 py-6 sm:px-6 print:overflow-visible print:p-0">
      <div ref={ref} className="w-full">
        <div className="fit-a4" style={{ zoom: z }}>{children}</div>
      </div>
    </div>
  )
}

function Totals({ items, className }: { items?: LineItem[]; className?: string }) {
  const t = totals(items)
  return (
    <dl className={clsx('tabular space-y-1 text-[14px]', className)}>
      <div className="flex justify-between"><dt className="text-stone-500">Summe netto</dt><dd>{money(t.net)}</dd></div>
      <div className="flex justify-between"><dt className="text-stone-500">zzgl. 19 % MwSt.</dt><dd>{money(t.vat)}</dd></div>
      <div className="flex justify-between border-t border-stone-300 pt-1.5 text-[15px] font-semibold"><dt>Gesamtbetrag</dt><dd>{money(t.gross)}</dd></div>
    </dl>
  )
}

function Sheet({ doc, job, customer, showPrice }: { doc: Doc; job: Job; customer?: Customer; showPrice: boolean }) {
  const kind = doc.kind === 'angebot' ? 'Angebot' : 'Rechnung'
  return (
    <article className="print-sheet mx-auto flex min-h-[297mm] w-[210mm] flex-col bg-white px-[20mm] pt-[16mm] pb-[12mm] text-[10pt] leading-[1.45] text-stone-900 shadow-pop">
      <header className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <Mark className="size-[15mm] text-moss-600" dot="#a64b2a" />
          <div>
            <div className="font-display text-[20pt] leading-none font-semibold text-moss-900">Zaidel</div>
            <div className="mt-1 text-[7.5pt] font-medium tracking-[0.2em] text-stone-500 uppercase">Garten- und Landschaftsbau</div>
          </div>
        </div>
        <div className="text-right text-[8.5pt] leading-snug text-stone-600">
          Dimitri Zaidel<br />Löwengasse 2 · 63924 Kleinheubach<br />Tel. 09375 929 45 37 · Mobil 0170 186 15 74<br />dzaidel01@gmail.com
        </div>
      </header>

      <div className="mt-[14mm] flex justify-between gap-8">
        <div className="w-[85mm]">
          <div className="mb-1.5 border-b border-stone-300 pb-0.5 text-[7pt] text-stone-500">Zaidel GaLaBau · Löwengasse 2 · 63924 Kleinheubach</div>
          {customer?.company && <div>{customer.company}</div>}
          <div>{customer?.name}</div>
          <div>{customer?.street}</div>
          <div>{customer?.zip} {customer?.city}</div>
        </div>
        <table className="text-[9pt]">
          <tbody>
            <tr><td className="pr-4 text-stone-500">{kind}-Nr.</td><td className="font-medium">{doc.number}</td></tr>
            <tr><td className="pr-4 text-stone-500">Datum</td><td>{dateLong(doc.date)}</td></tr>
            <tr><td className="pr-4 text-stone-500">Auftrag</td><td>{job.number}</td></tr>
            {doc.kind === 'rechnung' && doc.dueDate && <tr><td className="pr-4 text-stone-500">Fällig</td><td>{dateLong(doc.dueDate)}</td></tr>}
          </tbody>
        </table>
      </div>

      <h1 className="mt-[12mm] text-[14pt] font-semibold">{kind} {doc.number}</h1>
      <p className="mt-0.5 text-stone-600">Bauvorhaben: {job.title} · {job.street}, {job.city}</p>
      {doc.intro && <p className="mt-4 whitespace-pre-line">{doc.intro}</p>}

      <table className="mt-5 w-full border-collapse text-[9.5pt]">
        <thead>
          <tr className="border-b-2 border-moss-800 text-left text-[8pt] tracking-wide text-stone-500 uppercase">
            <th className="w-[9mm] py-1.5 font-medium">Pos</th>
            <th className="py-1.5 font-medium">Leistung</th>
            <th className="w-[16mm] py-1.5 text-right font-medium">Menge</th>
            <th className="w-[12mm] py-1.5 pl-2 font-medium">Einh.</th>
            {showPrice && <th className="w-[22mm] py-1.5 text-right font-medium">EP €</th>}
            {showPrice && <th className="w-[24mm] py-1.5 text-right font-medium">GP €</th>}
          </tr>
        </thead>
        <tbody>
          {doc.items?.map((it, i) => (
            <tr key={it.id} className="border-b border-stone-200 align-top">
              <td className="py-2 text-stone-500">{i + 1}</td>
              <td className="py-2 pr-3">
                <div>{it.title || <span className="text-stone-300">–</span>}</div>
                {it.detail && <div className="text-[8.5pt] text-stone-500">{it.detail}</div>}
              </td>
              <td className="tabular py-2 text-right">{num(it.qty)}</td>
              <td className="py-2 pl-2">{it.unit}</td>
              {showPrice && <td className="tabular py-2 text-right">{it.price.toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>}
              {showPrice && <td className="tabular py-2 text-right">{(it.qty * it.price).toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>}
            </tr>
          ))}
        </tbody>
      </table>

      {showPrice ? <Totals items={doc.items} className="mt-4 ml-auto w-[70mm] text-[10pt]" /> : <p className="mt-4 text-right text-[9pt] text-stone-400 italic">Preise ausgeblendet</p>}

      {doc.outro && <p className="mt-8 whitespace-pre-line">{doc.outro}</p>}
      <p className="mt-6">Mit freundlichen Grüßen<br /><span className="font-display text-[13pt] text-moss-900">Dimitri Zaidel</span></p>

      <footer className="mt-auto grid grid-cols-3 gap-4 border-t border-stone-300 pt-3 text-[7.5pt] leading-snug text-stone-500">
        <div>Zaidel Garten- und Landschaftsbau<br />Inh. Dimitri Zaidel<br />Löwengasse 2, 63924 Kleinheubach</div>
        <div>Bankverbindung<br />IBAN DE•• •••• •••• •••• •••• ••<br />(wird bei Einrichtung hinterlegt)</div>
        <div>Steuernummer / USt-IdNr.<br />wird bei Einrichtung hinterlegt<br />dzaidel01@gmail.com</div>
      </footer>
    </article>
  )
}

function CatalogModal({ open, onClose, onPick }: { open: boolean; onClose: () => void; onPick: (c: (typeof CATALOG)[number]) => void }) {
  const [q, setQ] = useState('')
  const groups = useMemo(() => {
    const s = q.toLowerCase()
    const f = CATALOG.filter((c) => !s || c.title.toLowerCase().includes(s) || c.group.toLowerCase().includes(s))
    return [...new Set(f.map((c) => c.group))].map((g) => ({ g, items: f.filter((c) => c.group === g) }))
  }, [q])
  return (
    <Modal open={open} onClose={onClose} title="Leistungskatalog" wide>
      <Input autoFocus placeholder="Suchen …" value={q} onChange={(e) => setQ(e.target.value)} />
      <div className="mt-4 space-y-5">
        {groups.map(({ g, items }) => (
          <div key={g}>
            <div className="mb-1.5 text-[12px] font-semibold tracking-wider text-stone-500 uppercase">{g}</div>
            <div className="divide-y divide-stone-100 rounded-xl ring-1 ring-stone-200">
              {items.map((c) => (
                <button key={c.title} onClick={() => onPick(c)} className="flex w-full items-center gap-3 px-3.5 py-2.5 text-left hover:bg-moss-100/50 active:bg-moss-100">
                  <span className="flex-1 text-[14px]">{c.title}</span>
                  <span className="tabular text-[13px] text-stone-500">{money(c.price)} / {c.unit}</span>
                  <Plus size={15} className="text-moss-600" />
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>
    </Modal>
  )
}
