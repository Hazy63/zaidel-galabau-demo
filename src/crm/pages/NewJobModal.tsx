import clsx from 'clsx'
import { useLiveQuery } from 'dexie-react-hooks'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { db, log, nextNumber, uid, type Job, type JobStatus } from '../db'
import { JOB_STATUS, SERVICES } from '../format'
import { useMe, useUsers } from '../session'
import { Avatar, Button, Field, Input, Modal, Select, Textarea } from '../ui'

export default function NewJobModal({ open, onClose, customerId }: { open: boolean; onClose: () => void; customerId?: string }) {
  const me = useMe()
  const nav = useNavigate()
  const users = useUsers()
  const customers = useLiveQuery(() => db.customers.orderBy('name').toArray(), []) ?? []
  const [mode, setMode] = useState<'existing' | 'new'>(customerId ? 'existing' : 'new')
  const [cid, setCid] = useState(customerId ?? '')
  const [c, setC] = useState({ name: '', street: '', zip: '', city: '', phone: '', email: '' })
  const [title, setTitle] = useState('')
  const [status, setStatus] = useState<JobStatus>('anfrage')
  const [services, setServices] = useState<string[]>([])
  const [assignees, setAssignees] = useState<string[]>([])
  const [desc, setDesc] = useState('')
  const [busy, setBusy] = useState(false)

  const valid = title.trim() && (mode === 'existing' ? cid : c.name.trim() && c.city.trim())

  async function save() {
    if (!valid) return
    setBusy(true)
    let customerIdFinal = cid
    if (mode === 'new') {
      customerIdFinal = uid()
      await db.customers.add({ id: customerIdFinal, kind: 'privat', ...c, createdAt: Date.now() })
    }
    const cust = await db.customers.get(customerIdFinal)
    const job: Job = {
      id: uid(),
      number: await nextNumber('A'),
      title: title.trim(),
      customerId: customerIdFinal,
      status,
      street: cust?.street ?? '',
      zip: cust?.zip ?? '',
      city: cust?.city ?? '',
      description: desc,
      services,
      assignees,
      source: 'telefon',
      createdAt: Date.now(),
      updatedAt: Date.now(),
    }
    await db.jobs.add(job)
    await log(me.id, 'Auftrag angelegt', job.id)
    setBusy(false)
    onClose()
    nav(`/app/auftraege/${job.id}`)
  }

  const toggle = (arr: string[], v: string, set: (a: string[]) => void) => set(arr.includes(v) ? arr.filter((x) => x !== v) : [...arr, v])

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Neuer Auftrag"
      wide
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>Abbrechen</Button>
          <Button variant="primary" disabled={!valid || busy} onClick={save}>Auftrag anlegen</Button>
        </>
      }
    >
      <div className="space-y-5">
        <Field label="Was soll gemacht werden?">
          <Input autoFocus placeholder="z. B. Terrasse pflastern, 35 m²" value={title} onChange={(e) => setTitle(e.target.value)} />
        </Field>

        <div>
          <div className="mb-2 flex items-center gap-4 text-[13px] font-medium">
            <span className="text-stone-700">Kunde</span>
            <button onClick={() => setMode('new')} className={clsx(mode === 'new' ? 'text-moss-700 underline underline-offset-4' : 'text-stone-500')}>Neuer Kunde</button>
            <button onClick={() => setMode('existing')} className={clsx(mode === 'existing' ? 'text-moss-700 underline underline-offset-4' : 'text-stone-500')}>Bestehender Kunde</button>
          </div>
          {mode === 'existing' ? (
            <Select value={cid} onChange={(e) => setCid(e.target.value)}>
              <option value="">Kunde wählen …</option>
              {customers.map((k) => (
                <option key={k.id} value={k.id}>{k.name} – {k.city}</option>
              ))}
            </Select>
          ) : (
            <div className="grid gap-3 sm:grid-cols-6">
              <Input className="sm:col-span-6" placeholder="Name" value={c.name} onChange={(e) => setC({ ...c, name: e.target.value })} />
              <Input className="sm:col-span-6" placeholder="Straße und Hausnummer" value={c.street} onChange={(e) => setC({ ...c, street: e.target.value })} />
              <Input className="sm:col-span-2" placeholder="PLZ" inputMode="numeric" value={c.zip} onChange={(e) => setC({ ...c, zip: e.target.value })} />
              <Input className="sm:col-span-4" placeholder="Ort" value={c.city} onChange={(e) => setC({ ...c, city: e.target.value })} />
              <Input className="sm:col-span-3" placeholder="Telefon" type="tel" value={c.phone} onChange={(e) => setC({ ...c, phone: e.target.value })} />
              <Input className="sm:col-span-3" placeholder="E-Mail" type="email" value={c.email} onChange={(e) => setC({ ...c, email: e.target.value })} />
            </div>
          )}
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Status">
            <Select value={status} onChange={(e) => setStatus(e.target.value as JobStatus)}>
              {JOB_STATUS.map((s) => (
                <option key={s.id} value={s.id}>{s.label}</option>
              ))}
            </Select>
          </Field>
          <div>
            <span className="mb-1.5 block text-[13px] font-medium text-stone-700">Team</span>
            <div className="flex flex-wrap gap-1.5">
              {users.map((u) => (
                <button
                  key={u.id}
                  onClick={() => toggle(assignees, u.id, setAssignees)}
                  className={clsx('flex items-center gap-1.5 rounded-full py-1 pr-3 pl-1 text-[13px] ring-1 transition', assignees.includes(u.id) ? 'bg-moss-800 text-white ring-moss-800' : 'bg-white ring-stone-300')}
                >
                  <Avatar user={u} size={22} /> {u.name.split(' ')[0]}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div>
          <span className="mb-1.5 block text-[13px] font-medium text-stone-700">Leistungen</span>
          <div className="flex flex-wrap gap-1.5">
            {SERVICES.map((s) => (
              <button
                key={s}
                onClick={() => toggle(services, s, setServices)}
                className={clsx('h-8 rounded-full px-3 text-[13px] ring-1 transition', services.includes(s) ? 'bg-moss-100 text-moss-800 ring-moss-300' : 'bg-white text-stone-600 ring-stone-300 hover:bg-stone-50')}
              >
                {s}
              </button>
            ))}
          </div>
        </div>

        <Field label="Beschreibung">
          <Textarea rows={3} placeholder="Maße, Material, Besonderheiten vor Ort …" value={desc} onChange={(e) => setDesc(e.target.value)} />
        </Field>
      </div>
    </Modal>
  )
}
