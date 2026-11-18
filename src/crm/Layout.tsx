import clsx from 'clsx'
import { useLiveQuery } from 'dexie-react-hooks'
import { CalendarDays, ClipboardList, ExternalLink, Home, LogOut, Users, Contact } from 'lucide-react'
import { NavLink, Outlet, useLocation } from 'react-router-dom'
import { useEffect } from 'react'
import { Mark } from '../Logo'
import { db } from './db'
import { ROLE_LABEL } from './format'
import { isOffice, useMe, useSession } from './session'
import { Avatar } from './ui'

export default function Layout() {
  const me = useMe()
  const { logout } = useSession()
  const loc = useLocation()
  const newCount = useLiveQuery(() => db.jobs.where('status').equals('anfrage').count(), []) ?? 0

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [loc.pathname])

  const nav = [
    { to: '/app', label: 'Heute', icon: Home, end: true },
    { to: '/app/auftraege', label: 'Aufträge', icon: ClipboardList, badge: isOffice(me) ? newCount : 0 },
    { to: '/app/plan', label: 'Einsatzplan', short: 'Plan', icon: CalendarDays },
    { to: '/app/kunden', label: 'Kunden', icon: Contact },
    { to: '/app/team', label: 'Team', icon: Users },
  ]

  return (
    <div className="min-h-dvh bg-stone-100/60 lg:pl-60">
      {/* Sidebar Desktop */}
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-60 flex-col bg-moss-900 text-moss-100 lg:flex">
        <div className="flex items-center gap-2.5 px-5 pt-6 pb-7">
          <Mark className="size-8 text-moss-300" dot="#f3efe6" />
          <div className="leading-tight">
            <div className="font-display text-lg font-semibold text-white">Zaidel</div>
            <div className="text-[11px] tracking-wide text-moss-300">Auftragsbuch</div>
          </div>
        </div>
        <nav className="flex-1 space-y-0.5 px-3">
          {nav.map((n) => (
            <NavLink
              key={n.to}
              to={n.to}
              end={n.end}
              className={({ isActive }) =>
                clsx(
                  'flex h-10 items-center gap-3 rounded-lg px-3 text-[14px] font-medium transition',
                  isActive ? 'bg-white/10 text-white' : 'text-moss-200/80 hover:bg-white/5 hover:text-white',
                )
              }
            >
              <n.icon size={18} strokeWidth={1.8} />
              <span className="flex-1">{n.label}</span>
              {!!n.badge && <span className="grid h-5 min-w-5 place-items-center rounded-full bg-clay-500 px-1.5 text-[11px] font-semibold text-white">{n.badge}</span>}
            </NavLink>
          ))}
        </nav>
        <div className="px-3 pb-3">
          <a href="#/" className="mb-2 flex h-9 items-center gap-2 rounded-lg px-3 text-[13px] text-moss-300 hover:bg-white/5 hover:text-white">
            <ExternalLink size={15} /> Website ansehen
          </a>
          <div className="flex items-center gap-3 rounded-xl bg-white/5 p-3">
            <span className="rounded-full ring-1 ring-white/25"><Avatar user={me} size={34} /></span>
            <div className="min-w-0 flex-1">
              <div className="truncate text-[13px] font-medium text-white">{me.name}</div>
              <div className="truncate text-[11px] text-moss-300">{ROLE_LABEL[me.role]}</div>
            </div>
            <button onClick={logout} title="Abmelden" className="grid size-8 place-items-center rounded-lg text-moss-300 hover:bg-white/10 hover:text-white">
              <LogOut size={16} />
            </button>
          </div>
        </div>
      </aside>

      {/* Topbar Mobil */}
      <header className="sticky top-0 z-30 flex h-14 items-center justify-between border-b border-stone-200 bg-white/90 px-4 backdrop-blur lg:hidden">
        <div className="flex items-center gap-2">
          <Mark className="size-7 text-moss-600" dot="#a64b2a" />
          <span className="font-display text-[17px] font-semibold text-moss-900">Zaidel</span>
        </div>
        <button onClick={logout} className="flex items-center gap-2 rounded-full py-1 pr-1 pl-3 text-[13px] text-stone-600 ring-1 ring-stone-200">
          {me.name.split(' ')[0]}
          <Avatar user={me} size={28} />
        </button>
      </header>

      <main className="mx-auto max-w-6xl px-4 pt-5 pb-28 sm:px-6 lg:px-10 lg:pt-8 lg:pb-12">
        <Outlet />
      </main>

      {/* Tabbar Mobil */}
      <nav className="safe-bottom fixed inset-x-0 bottom-0 z-30 border-t border-stone-200 bg-white/95 backdrop-blur lg:hidden">
        <div className="grid grid-cols-5">
          {nav.map((n) => (
            <NavLink
              key={n.to}
              to={n.to}
              end={n.end}
              className={({ isActive }) => clsx('relative flex h-16 flex-col items-center justify-center gap-1 text-[11px] font-medium', isActive ? 'text-moss-800' : 'text-stone-500')}
            >
              {({ isActive }) => (
                <>
                  <n.icon size={21} strokeWidth={isActive ? 2.2 : 1.8} />
                  {n.short ?? n.label}
                  {!!n.badge && <span className="absolute top-2 left-1/2 ml-2 grid h-4 min-w-4 place-items-center rounded-full bg-clay-500 px-1 text-[10px] font-semibold text-white">{n.badge}</span>}
                </>
              )}
            </NavLink>
          ))}
        </div>
      </nav>
    </div>
  )
}
