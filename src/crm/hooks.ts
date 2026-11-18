import { useLiveQuery } from 'dexie-react-hooks'
import { db, type Customer, type Doc, type DocStatus } from './db'
import { today, totals } from './format'

export function useCustomerMap() {
  const list = useLiveQuery(() => db.customers.toArray(), []) ?? []
  return Object.fromEntries(list.map((c) => [c.id, c])) as Record<string, Customer>
}

export function effectiveStatus(d: Doc): DocStatus | undefined {
  if (d.kind === 'rechnung' && d.status === 'versendet' && d.dueDate && d.dueDate < today()) return 'ueberfaellig'
  return d.status
}

export const docGross = (d: Doc) => totals(d.items).gross
