import clsx from 'clsx'
import { X } from 'lucide-react'
import { useEffect, useState, type ButtonHTMLAttributes, type InputHTMLAttributes, type ReactNode, type SelectHTMLAttributes, type TextareaHTMLAttributes } from 'react'
import type { User } from './db'
import { img } from './format'

type BtnVariant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'clay'

export function Button({
  variant = 'secondary',
  size = 'md',
  className,
  icon,
  children,
  ...rest
}: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: BtnVariant; size?: 'sm' | 'md' | 'lg'; icon?: ReactNode }) {
  return (
    <button
      {...rest}
      className={clsx(
        'inline-flex select-none items-center justify-center gap-2 rounded-lg font-medium transition active:scale-[0.98] disabled:pointer-events-none disabled:opacity-50',
        size === 'sm' && 'h-8 px-3 text-[13px]',
        size === 'md' && 'h-10 px-4 text-sm',
        size === 'lg' && 'h-12 px-5 text-[15px]',
        variant === 'primary' && 'bg-moss-800 text-white shadow-sm hover:bg-moss-700',
        variant === 'clay' && 'bg-clay-600 text-white shadow-sm hover:bg-clay-700',
        variant === 'secondary' && 'bg-white text-stone-800 shadow-card ring-1 ring-stone-200 hover:bg-stone-100',
        variant === 'ghost' && 'text-stone-700 hover:bg-stone-200/60',
        variant === 'danger' && 'text-rose-700 hover:bg-rose-50',
        className,
      )}
    >
      {icon}
      {children}
    </button>
  )
}

export function Chip({ className, children, dot }: { className?: string; children: ReactNode; dot?: string }) {
  return (
    <span className={clsx('inline-flex h-6 items-center gap-1.5 whitespace-nowrap rounded-full px-2.5 text-xs font-medium ring-1 ring-inset', className)}>
      {dot && <span className={clsx('size-1.5 rounded-full', dot)} />}
      {children}
    </span>
  )
}

export function Avatar({ user, size = 28, ring }: { user?: User; size?: number; ring?: boolean }) {
  if (!user) return null
  return (
    <span
      title={user.name}
      className={clsx('inline-grid shrink-0 place-items-center rounded-full font-semibold text-white', ring && 'ring-2 ring-white')}
      style={{ width: size, height: size, background: user.color, fontSize: size * 0.38 }}
    >
      {user.short}
    </span>
  )
}

export function AvatarStack({ users, size = 26 }: { users: (User | undefined)[]; size?: number }) {
  const list = users.filter(Boolean) as User[]
  if (!list.length) return <span className="text-xs text-stone-400">niemand</span>
  return (
    <span className="flex -space-x-1.5">
      {list.map((u) => (
        <Avatar key={u.id} user={u} size={size} ring />
      ))}
    </span>
  )
}

export function Card({ className, children }: { className?: string; children: ReactNode }) {
  return <div className={clsx('rounded-xl bg-white shadow-card ring-1 ring-stone-200/80', className)}>{children}</div>
}

export function SectionTitle({ children, action }: { children: ReactNode; action?: ReactNode }) {
  return (
    <div className="mb-3 flex items-center justify-between gap-3">
      <h2 className="text-[13px] font-semibold uppercase tracking-wider text-stone-500">{children}</h2>
      {action}
    </div>
  )
}

export function Modal({ open, onClose, title, children, footer, wide }: { open: boolean; onClose: () => void; title: string; children: ReactNode; footer?: ReactNode; wide?: boolean }) {
  useEffect(() => {
    if (!open) return
    const k = (e: KeyboardEvent) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', k)
    document.body.style.overflow = 'hidden'
    return () => {
      window.removeEventListener('keydown', k)
      document.body.style.overflow = ''
    }
  }, [open, onClose])
  if (!open) return null
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center sm:p-6">
      <div className="absolute inset-0 bg-stone-900/40 backdrop-blur-[2px]" onClick={onClose} />
      <div
        role="dialog"
        aria-label={title}
        className={clsx(
          'relative flex max-h-[92dvh] w-full flex-col rounded-t-2xl bg-white shadow-pop sm:rounded-2xl',
          wide ? 'sm:max-w-3xl' : 'sm:max-w-lg',
        )}
      >
        <div className="flex items-center justify-between border-b border-stone-200 px-5 py-4">
          <h3 className="text-base font-semibold">{title}</h3>
          <button onClick={onClose} className="-mr-2 grid size-9 place-items-center rounded-lg text-stone-500 hover:bg-stone-100" aria-label="Schließen">
            <X size={18} />
          </button>
        </div>
        <div className="overflow-y-auto px-5 py-4">{children}</div>
        {footer && <div className="safe-bottom flex justify-end gap-2 border-t border-stone-200 px-5 py-3">{footer}</div>}
      </div>
    </div>
  )
}

export function Field({ label, children, hint, className }: { label: string; children: ReactNode; hint?: string; className?: string }) {
  return (
    <label className={clsx('block', className)}>
      <span className="mb-1.5 block text-[13px] font-medium text-stone-700">{label}</span>
      {children}
      {hint && <span className="mt-1 block text-xs text-stone-500">{hint}</span>}
    </label>
  )
}

const inputCls =
  'w-full rounded-lg border-0 bg-white px-3 py-2.5 text-[15px] text-stone-900 shadow-card ring-1 ring-stone-300 placeholder:text-stone-400 focus:ring-2 focus:ring-moss-500 focus:outline-none sm:text-sm'

export const Input = (p: InputHTMLAttributes<HTMLInputElement>) => <input {...p} className={clsx(inputCls, p.className)} />
export const Textarea = (p: TextareaHTMLAttributes<HTMLTextAreaElement>) => <textarea {...p} className={clsx(inputCls, 'leading-relaxed', p.className)} />
export const Select = (p: SelectHTMLAttributes<HTMLSelectElement>) => <select {...p} className={clsx(inputCls, 'pr-8', p.className)} />

export function Empty({ icon, title, text, action }: { icon: ReactNode; title: string; text?: string; action?: ReactNode }) {
  return (
    <div className="flex flex-col items-center px-6 py-12 text-center">
      <div className="mb-3 grid size-12 place-items-center rounded-full bg-stone-100 text-stone-500">{icon}</div>
      <p className="font-medium text-stone-800">{title}</p>
      {text && <p className="mt-1 max-w-sm text-sm text-stone-500">{text}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  )
}

export function useObjectUrl(blob?: Blob) {
  const [url, setUrl] = useState<string>()
  useEffect(() => {
    if (!blob) return setUrl(undefined)
    const u = URL.createObjectURL(blob)
    setUrl(u)
    return () => URL.revokeObjectURL(u)
  }, [blob])
  return url
}

export function PhotoImg({ src, blob, small, className, alt = '' }: { src?: string; blob?: Blob; small?: boolean; className?: string; alt?: string }) {
  const u = useObjectUrl(blob)
  const s = blob ? u : src ? img(src, small) : undefined
  if (!s) return <div className={clsx('bg-stone-200', className)} />
  return <img src={s} alt={alt} loading="lazy" decoding="async" className={clsx('object-cover', className)} />
}

export function Segmented<T extends string>({ value, onChange, options }: { value: T; onChange: (v: T) => void; options: { id: T; label: ReactNode }[] }) {
  return (
    <div className="inline-flex rounded-lg bg-stone-200/70 p-0.5">
      {options.map((o) => (
        <button
          key={o.id}
          onClick={() => onChange(o.id)}
          className={clsx(
            'flex h-8 items-center gap-1.5 rounded-md px-3 text-[13px] font-medium transition',
            value === o.id ? 'bg-white text-stone-900 shadow-card' : 'text-stone-600 hover:text-stone-900',
          )}
        >
          {o.label}
        </button>
      ))}
    </div>
  )
}

/** Bild vor dem Speichern verkleinern (Handyfotos sind 4–8 MB) */
export async function shrinkImage(file: File, max = 1800, quality = 0.82): Promise<Blob> {
  if (!file.type.startsWith('image/')) return file
  try {
    const bmp = await createImageBitmap(file)
    const scale = Math.min(1, max / Math.max(bmp.width, bmp.height))
    const c = document.createElement('canvas')
    c.width = Math.round(bmp.width * scale)
    c.height = Math.round(bmp.height * scale)
    c.getContext('2d')!.drawImage(bmp, 0, 0, c.width, c.height)
    return await new Promise((res) => c.toBlob((b) => res(b ?? file), 'image/jpeg', quality))
  } catch {
    return file
  }
}
