import clsx from 'clsx'
import { ArrowLeft, Delete, Lock } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Wordmark } from '../Logo'
import type { User } from './db'
import { img, ROLE_LABEL } from './format'
import { useSession, useUsers } from './session'
import { Avatar } from './ui'

export default function Login() {
  const users = useUsers().filter((u) => u.active)
  const { login } = useSession()
  const [sel, setSel] = useState<User | null>(null)
  const [pin, setPin] = useState('')
  const [err, setErr] = useState(false)

  useEffect(() => {
    if (!sel || pin.length < 4) return
    if (pin === sel.pin) login(sel.id)
    else {
      setErr(true)
      const t = setTimeout(() => {
        setPin('')
        setErr(false)
      }, 650)
      return () => clearTimeout(t)
    }
  }, [pin, sel, login])

  useEffect(() => {
    if (!sel) return
    const k = (e: KeyboardEvent) => {
      if (/^\d$/.test(e.key)) setPin((p) => (p.length < 4 ? p + e.key : p))
      if (e.key === 'Backspace') setPin((p) => p.slice(0, -1))
      if (e.key === 'Escape') setSel(null)
    }
    window.addEventListener('keydown', k)
    return () => window.removeEventListener('keydown', k)
  }, [sel])

  return (
    <div className="grid min-h-dvh lg:grid-cols-[1.1fr_1fr]">
      <div className="relative hidden overflow-hidden lg:block">
        <img src={img('pflaster-sandstein-detail')} alt="" className="absolute inset-0 size-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-moss-950/90 via-moss-950/30 to-moss-950/60" />
        <div className="absolute inset-x-0 top-0 p-10">
          <Wordmark light />
        </div>
        <div className="absolute inset-x-0 bottom-0 p-10 text-white">
          <p className="font-display text-4xl leading-tight font-medium text-balance">Alle Baustellen.<br />Ein Ort.</p>
          <p className="mt-3 max-w-md text-[15px] text-white/75">Aufträge, Fotos, Angebote, Rechnungen und Notizen – fürs Büro und für die Kolonne draußen auf dem Handy.</p>
        </div>
      </div>

      <div className="flex flex-col bg-stone-50 px-6 py-8 sm:px-12">
        <div className="flex items-center justify-between">
          <span className="lg:hidden">
            <Wordmark />
          </span>
          <Link to="/" className="ml-auto inline-flex items-center gap-1.5 text-sm text-stone-500 hover:text-stone-800">
            <ArrowLeft size={15} /> Zur Website
          </Link>
        </div>

        <div className="mx-auto my-auto w-full max-w-sm py-10">
          {!sel ? (
            <>
              <h1 className="text-2xl font-semibold tracking-tight">Anmelden</h1>
              <p className="mt-1 text-sm text-stone-500">Wer bist du?</p>
              <div className="mt-6 space-y-2">
                {users.map((u) => (
                  <button
                    key={u.id}
                    onClick={() => setSel(u)}
                    className="flex w-full items-center gap-3 rounded-xl bg-white p-3 text-left shadow-card ring-1 ring-stone-200 transition hover:ring-moss-400 active:scale-[0.99]"
                  >
                    <Avatar user={u} size={40} />
                    <span className="min-w-0 flex-1">
                      <span className="block font-medium">{u.name}</span>
                      <span className="block text-[13px] text-stone-500">{u.title}</span>
                    </span>
                    <span className="text-xs text-stone-400">{ROLE_LABEL[u.role]}</span>
                  </button>
                ))}
              </div>
              <p className="mt-6 rounded-lg bg-clay-100/70 px-3 py-2.5 text-[13px] leading-relaxed text-clay-700">
                <strong>Demo-Zugang:</strong> PIN für Inhaber &amp; Büro <span className="font-mono">1234</span>, Mitarbeiter <span className="font-mono">1111</span> / <span className="font-mono">2222</span> / <span className="font-mono">3333</span>.
              </p>
            </>
          ) : (
            <div className="text-center">
              <button onClick={() => (setSel(null), setPin(''))} className="mb-6 inline-flex items-center gap-1 text-sm text-stone-500 hover:text-stone-800">
                <ArrowLeft size={15} /> Andere Person
              </button>
              <div className="flex justify-center">
                <Avatar user={sel} size={64} />
              </div>
              <p className="mt-3 text-lg font-semibold">{sel.name}</p>
              <p className="flex items-center justify-center gap-1 text-sm text-stone-500">
                <Lock size={13} /> PIN eingeben
              </p>
              <div className={clsx('my-6 flex justify-center gap-3', err && 'animate-[shake_0.4s]')}>
                {[0, 1, 2, 3].map((i) => (
                  <span key={i} className={clsx('size-3.5 rounded-full transition', err ? 'bg-rose-500' : i < pin.length ? 'bg-moss-700' : 'bg-stone-300')} />
                ))}
              </div>
              <div className="mx-auto grid max-w-[260px] grid-cols-3 gap-2.5">
                {['1', '2', '3', '4', '5', '6', '7', '8', '9', '', '0', 'del'].map((k) =>
                  k === '' ? (
                    <span key="e" />
                  ) : (
                    <button
                      key={k}
                      onClick={() => setPin((p) => (k === 'del' ? p.slice(0, -1) : p.length < 4 ? p + k : p))}
                      className="grid h-14 place-items-center rounded-xl bg-white text-xl font-medium shadow-card ring-1 ring-stone-200 active:bg-stone-100"
                      aria-label={k === 'del' ? 'Löschen' : k}
                    >
                      {k === 'del' ? <Delete size={20} className="text-stone-500" /> : k}
                    </button>
                  ),
                )}
              </div>
            </div>
          )}
        </div>
        <style>{`@keyframes shake{0%,100%{transform:translateX(0)}25%{transform:translateX(-8px)}75%{transform:translateX(8px)}}`}</style>
      </div>
    </div>
  )
}
