import clsx from 'clsx'
import { Plus, RotateCcw, ShieldCheck } from 'lucide-react'
import { useState } from 'react'
import { db, log, uid, type Role } from '../db'
import { ROLE_LABEL } from '../format'
import { ensureSeed } from '../seed'
import { useMe, useUsers } from '../session'
import { Avatar, Button, Card, Field, Input, Modal, Select, SectionTitle } from '../ui'

const PALETTE = ['#3a6549', '#6b5b3e', '#4b6a88', '#7a4e6b', '#8a6a2b', '#2f6f6a']

export default function Team() {
  const me = useMe()
  const users = useUsers()
  const boss = me.role === 'inhaber'
  const [open, setOpen] = useState(false)
  const [n, setN] = useState({ name: '', title: 'Landschaftsgärtner', role: 'mitarbeiter' as Role, pin: '' })

  async function add() {
    const short = n.name.split(/\s+/).map((x) => x[0]).join('').slice(0, 2).toUpperCase()
    await db.users.add({ id: uid(), name: n.name, short, role: n.role, title: n.title, color: PALETTE[users.length % PALETTE.length], pin: n.pin, canSeePrices: n.role !== 'mitarbeiter', active: true })
    await log(me.id, `${n.name} zum Team hinzugefügt`)
    setOpen(false)
    setN({ name: '', title: 'Landschaftsgärtner', role: 'mitarbeiter', pin: '' })
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-[26px] font-semibold tracking-tight">Team</h1>
        {boss && <Button variant="primary" icon={<Plus size={17} />} onClick={() => setOpen(true)}>Mitarbeiter</Button>}
      </div>

      <Card className="divide-y divide-stone-100">
        {users.map((u) => (
          <div key={u.id} className={clsx('flex flex-wrap items-center gap-3 px-4 py-3.5', !u.active && 'opacity-50')}>
            <Avatar user={u} size={38} />
            <div className="min-w-0 flex-1">
              <div className="text-[14.5px] font-medium">{u.name}</div>
              <div className="text-[13px] text-stone-500">{u.title} · {ROLE_LABEL[u.role]}</div>
            </div>
            {boss && u.role === 'mitarbeiter' ? (
              <label className="flex cursor-pointer items-center gap-2 text-[13px] text-stone-600">
                <span>Darf Preise sehen</span>
                <button
                  role="switch"
                  aria-checked={u.canSeePrices}
                  onClick={() => db.users.update(u.id, { canSeePrices: !u.canSeePrices })}
                  className={clsx('relative h-6 w-10 rounded-full transition', u.canSeePrices ? 'bg-moss-600' : 'bg-stone-300')}
                >
                  <span className={clsx('absolute top-0.5 size-5 rounded-full bg-white shadow transition', u.canSeePrices ? 'left-[18px]' : 'left-0.5')} />
                </button>
              </label>
            ) : (
              <span className="text-[13px] text-stone-500">{u.canSeePrices ? 'sieht Preise' : 'ohne Preise'}</span>
            )}
            {boss && u.id !== me.id && (
              <Button size="sm" variant="ghost" onClick={() => db.users.update(u.id, { active: !u.active })}>{u.active ? 'Sperren' : 'Freischalten'}</Button>
            )}
          </div>
        ))}
      </Card>

      <section>
        <SectionTitle>Wer darf was?</SectionTitle>
        <Card className="overflow-x-auto">
          <table className="w-full text-[13.5px]">
            <thead>
              <tr className="border-b border-stone-200 text-left text-stone-500">
                <th className="px-4 py-2.5 font-medium" />
                <th className="px-4 py-2.5 font-medium">Inhaber</th>
                <th className="px-4 py-2.5 font-medium">Büro</th>
                <th className="px-4 py-2.5 font-medium">Mitarbeiter</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {[
                ['Aufträge, Fotos, Notizen sehen', '✓', '✓', '✓'],
                ['Fotos hochladen, Notizen schreiben, Aufgaben abhaken', '✓', '✓', '✓'],
                ['Angebote & Rechnungen ansehen', '✓', '✓', 'Mengen ohne Preise*'],
                ['Angebote & Rechnungen erstellen', '✓', '✓', '–'],
                ['Aufträge anlegen, Team & Einsätze planen', '✓', '✓', '–'],
                ['Umsätze und offene Posten', '✓', '✓', '–'],
                ['Mitarbeiter verwalten', '✓', '–', '–'],
              ].map((r) => (
                <tr key={r[0]}>
                  {r.map((c, i) => <td key={i} className={clsx('px-4 py-2.5', i === 0 ? 'text-stone-800' : c === '–' ? 'text-stone-300' : 'text-moss-700')}>{c}</td>)}
                </tr>
              ))}
            </tbody>
          </table>
          <p className="border-t border-stone-100 px-4 py-2.5 text-[12.5px] text-stone-500">* pro Person umschaltbar („Darf Preise sehen")</p>
        </Card>
      </section>

      <section>
        <SectionTitle>Demo</SectionTitle>
        <Card className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center">
          <ShieldCheck size={22} className="shrink-0 text-moss-600" />
          <p className="flex-1 text-[14px] text-stone-600">Diese Vorführversion speichert alles nur in diesem Browser. Die echte Version läuft auf einem Server in Deutschland – dann sieht jeder im Team sofort dasselbe, auf Handy und PC.</p>
          <Button icon={<RotateCcw size={15} />} onClick={async () => { if (confirm('Alle Demo-Daten zurücksetzen?')) { await ensureSeed(true); location.reload() } }}>Demo zurücksetzen</Button>
        </Card>
      </section>

      <Modal open={open} onClose={() => setOpen(false)} title="Mitarbeiter hinzufügen" footer={<><Button variant="ghost" onClick={() => setOpen(false)}>Abbrechen</Button><Button variant="primary" disabled={!n.name || n.pin.length !== 4} onClick={add}>Hinzufügen</Button></>}>
        <div className="space-y-4">
          <Field label="Name"><Input value={n.name} onChange={(e) => setN({ ...n, name: e.target.value })} /></Field>
          <Field label="Tätigkeit"><Input value={n.title} onChange={(e) => setN({ ...n, title: e.target.value })} /></Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Rolle"><Select value={n.role} onChange={(e) => setN({ ...n, role: e.target.value as Role })}><option value="mitarbeiter">Mitarbeiter</option><option value="buero">Büro & Bauleitung</option></Select></Field>
            <Field label="PIN (4 Ziffern)"><Input inputMode="numeric" maxLength={4} value={n.pin} onChange={(e) => setN({ ...n, pin: e.target.value.replace(/\D/g, '') })} /></Field>
          </div>
        </div>
      </Modal>
    </div>
  )
}
