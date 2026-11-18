import { useLiveQuery } from 'dexie-react-hooks'
import { Building2, Plus, Search, User as UserIcon } from 'lucide-react'
import { useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { db, log, uid } from '../db'
import { isOffice, useMe } from '../session'
import { Button, Card, Field, Input, Modal, Select } from '../ui'

export default function Customers() {
  const me = useMe()
  const nav = useNavigate()
  const [q, setQ] = useState('')
  const [open, setOpen] = useState(false)
  const customers = useLiveQuery(() => db.customers.orderBy('name').toArray(), []) ?? []
  const jobs = useLiveQuery(() => db.jobs.toArray(), []) ?? []
  const [c, setC] = useState({ kind: 'privat' as 'privat' | 'gewerbe' | 'kommune', name: '', company: '', street: '', zip: '', city: '', phone: '', email: '' })

  const list = useMemo(() => {
    const s = q.toLowerCase()
    return customers.filter((x) => !s || [x.name, x.company, x.city, x.street, x.phone, x.email].join(' ').toLowerCase().includes(s))
  }, [customers, q])

  async function save() {
    const id = uid()
    await db.customers.add({ id, ...c, createdAt: Date.now() })
    await log(me.id, `Kunde angelegt: ${c.name}`)
    setOpen(false)
    nav(`/app/kunden/${id}`)
  }

  return (
    <div>
      <div className="flex items-center justify-between gap-3">
        <h1 className="text-[26px] font-semibold tracking-tight">Kunden</h1>
        {isOffice(me) && <Button variant="primary" icon={<Plus size={17} />} onClick={() => setOpen(true)}><span className="hidden sm:inline">Neuer Kunde</span></Button>}
      </div>
      <div className="relative mt-5 sm:max-w-xs">
        <Search size={16} className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-stone-400" />
        <Input className="pl-9" placeholder="Name, Ort, Telefon …" value={q} onChange={(e) => setQ(e.target.value)} />
      </div>
      <Card className="mt-4 divide-y divide-stone-100">
        {list.map((x) => {
          const js = jobs.filter((j) => j.customerId === x.id)
          const active = js.filter((j) => j.status !== 'abgeschlossen').length
          return (
            <Link key={x.id} to={`/app/kunden/${x.id}`} className="flex items-center gap-3 px-4 py-3 hover:bg-stone-50">
              <span className="grid size-10 shrink-0 place-items-center rounded-full bg-stone-100 text-stone-500">
                {x.kind === 'privat' ? <UserIcon size={17} /> : <Building2 size={17} />}
              </span>
              <div className="min-w-0 flex-1">
                <div className="truncate text-[14.5px] font-medium">{x.name}</div>
                <div className="truncate text-[13px] text-stone-500">{x.street}, {x.zip} {x.city}</div>
              </div>
              <div className="hidden text-right text-[13px] text-stone-500 sm:block">{x.phone}</div>
              <div className="w-24 text-right text-[12.5px] text-stone-500">
                {js.length} Auftr{js.length === 1 ? 'ag' : 'äge'}
                {active > 0 && <div className="font-medium text-moss-700">{active} aktiv</div>}
              </div>
            </Link>
          )
        })}
      </Card>

      <Modal open={open} onClose={() => setOpen(false)} title="Neuer Kunde" footer={<><Button variant="ghost" onClick={() => setOpen(false)}>Abbrechen</Button><Button variant="primary" disabled={!c.name || !c.city} onClick={save}>Anlegen</Button></>}>
        <div className="grid gap-3 sm:grid-cols-6">
          <Field label="Art" className="sm:col-span-2">
            <Select value={c.kind} onChange={(e) => setC({ ...c, kind: e.target.value as typeof c.kind })}>
              <option value="privat">Privat</option><option value="gewerbe">Gewerbe</option><option value="kommune">Kommune</option>
            </Select>
          </Field>
          <Field label="Name" className="sm:col-span-4"><Input value={c.name} onChange={(e) => setC({ ...c, name: e.target.value })} /></Field>
          {c.kind !== 'privat' && <Field label="Firma" className="sm:col-span-6"><Input value={c.company} onChange={(e) => setC({ ...c, company: e.target.value })} /></Field>}
          <Field label="Straße" className="sm:col-span-6"><Input value={c.street} onChange={(e) => setC({ ...c, street: e.target.value })} /></Field>
          <Field label="PLZ" className="sm:col-span-2"><Input value={c.zip} onChange={(e) => setC({ ...c, zip: e.target.value })} /></Field>
          <Field label="Ort" className="sm:col-span-4"><Input value={c.city} onChange={(e) => setC({ ...c, city: e.target.value })} /></Field>
          <Field label="Telefon" className="sm:col-span-3"><Input type="tel" value={c.phone} onChange={(e) => setC({ ...c, phone: e.target.value })} /></Field>
          <Field label="E-Mail" className="sm:col-span-3"><Input type="email" value={c.email} onChange={(e) => setC({ ...c, email: e.target.value })} /></Field>
        </div>
      </Modal>
    </div>
  )
}
