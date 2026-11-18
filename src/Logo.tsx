import clsx from 'clsx'

/** Rosette aus dem bestehenden Zaidel-Logo, als Vektor nachgezeichnet */
export function Mark({ className, stroke = 'currentColor', dot }: { className?: string; stroke?: string; dot?: string }) {
  const r = 11
  const pts = Array.from({ length: 8 }, (_, i) => {
    const a = (i * Math.PI) / 4 - Math.PI / 2
    return [32 + Math.cos(a) * 11.5, 32 + Math.sin(a) * 11.5]
  })
  return (
    <svg viewBox="0 0 64 64" className={className} aria-hidden>
      <g fill="none" stroke={stroke} strokeWidth="2">
        {pts.map(([x, y], i) => (
          <circle key={i} cx={x} cy={y} r={r} />
        ))}
      </g>
      <circle cx="32" cy="32" r="3.4" fill={dot ?? stroke} />
    </svg>
  )
}

export function Wordmark({ className, light }: { className?: string; light?: boolean }) {
  return (
    <span className={clsx('flex items-center gap-2.5', className)}>
      <Mark className={clsx('size-9', light ? 'text-moss-300' : 'text-moss-600')} dot={light ? '#f3efe6' : '#a64b2a'} />
      <span className="text-left leading-none">
        <span className={clsx('block font-display text-[22px] font-semibold tracking-tight', light ? 'text-white' : 'text-moss-900')}>Zaidel</span>
        <span className={clsx('mt-0.5 block text-[10.5px] font-medium uppercase tracking-[0.18em]', light ? 'text-moss-200' : 'text-stone-500')}>
          Garten- &amp; Landschaftsbau
        </span>
      </span>
    </span>
  )
}
