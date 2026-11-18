import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import { useLiveQuery } from 'dexie-react-hooks'
import { db, type User } from './db'
import { ensureSeed } from './seed'

const KEY = 'zaidel-session'

interface Ctx {
  me: User | null
  ready: boolean
  login: (id: string) => void
  logout: () => void
}

const SessionCtx = createContext<Ctx>({ me: null, ready: false, login: () => {}, logout: () => {} })

export function SessionProvider({ children }: { children: ReactNode }) {
  const [seeded, setSeeded] = useState(false)
  const [uid, setUid] = useState<string | null>(() => localStorage.getItem(KEY))

  useEffect(() => {
    ensureSeed().then(() => setSeeded(true))
  }, [])

  const me = useLiveQuery(async () => (seeded && uid ? ((await db.users.get(uid)) ?? null) : null), [seeded, uid])

  const login = (id: string) => {
    localStorage.setItem(KEY, id)
    setUid(id)
  }
  const logout = () => {
    localStorage.removeItem(KEY)
    setUid(null)
  }

  return (
    <SessionCtx.Provider value={{ me: me ?? null, ready: seeded && me !== undefined, login, logout }}>
      {children}
    </SessionCtx.Provider>
  )
}

export const useSession = () => useContext(SessionCtx)

export function useMe(): User {
  const { me } = useSession()
  if (!me) throw new Error('not logged in')
  return me
}

export function useUsers() {
  const order = { inhaber: 0, buero: 1, mitarbeiter: 2 }
  return (useLiveQuery(() => db.users.toArray(), []) ?? []).sort((a, b) => order[a.role] - order[b.role])
}

export function useUserMap() {
  const users = useUsers()
  return Object.fromEntries(users.map((u) => [u.id, u])) as Record<string, User>
}

export const isOffice = (u: User) => u.role !== 'mitarbeiter'
