import clsx from 'clsx'
import { ArrowRight, ArrowUpRight, ChevronLeft, ChevronRight, LockKeyhole, Mail, MapPin, Menu, Phone, Smartphone, Star, X } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Wordmark } from '../Logo'
import { img } from '../crm/format'
import ContactForm from './ContactForm'
import { AREA, CATS, CONTACT, PROJECTS, REVIEWS, SERVICES, type Cat } from './content'
import { scrollToId, useReveal } from './hooks'

const NAV = [
  { id: 'leistungen', label: 'Leistungen' },
  { id: 'referenzen', label: 'Referenzen' },
  { id: 'ablauf', label: 'Ablauf' },
  { id: 'kontakt', label: 'Kontakt' },
]

export default function Site() {
  useReveal()
  const [scrolled, setScrolled] = useState(false)
  const [menu, setMenu] = useState(false)

  useEffect(() => {
    const on = () => setScrolled(window.scrollY > 40)
    on()
    window.addEventListener('scroll', on, { passive: true })
    return () => window.removeEventListener('scroll', on)
  }, [])

  const go = (id: string) => {
    setMenu(false)
    scrollToId(id)
  }

  return (
    <div className="bg-stone-50 text-stone-900">
      {/* Header */}
      <header className={clsx('fixed inset-x-0 top-0 z-40 transition-all duration-300', scrolled ? 'bg-stone-50/92 shadow-[0_1px_0_rgb(0_0_0/0.06)] backdrop-blur-md' : 'bg-transparent')}>
        <div className="mx-auto flex h-[72px] max-w-7xl items-center justify-between px-5 sm:px-8">
          <button onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} aria-label="Nach oben">
            <Wordmark light={!scrolled} />
          </button>
          <nav className="hidden items-center gap-8 md:flex">
            {NAV.map((n) => (
              <button key={n.id} onClick={() => go(n.id)} className={clsx('text-[14.5px] font-medium transition', scrolled ? 'text-stone-700 hover:text-stone-950' : 'text-white/85 hover:text-white')}>
                {n.label}
              </button>
            ))}
            <a href={CONTACT.phoneHref} className={clsx('inline-flex h-10 items-center gap-2 rounded-full px-4 text-[14px] font-semibold transition', scrolled ? 'bg-moss-800 text-white hover:bg-moss-700' : 'bg-white text-moss-900 hover:bg-stone-100')}>
              <Phone size={15} /> {CONTACT.phone}
            </a>
          </nav>
          <button onClick={() => setMenu(true)} className={clsx('grid size-11 place-items-center rounded-full md:hidden', scrolled ? 'text-stone-800' : 'text-white')} aria-label="Menü">
            <Menu size={24} />
          </button>
        </div>
      </header>

      {menu && (
        <div className="fixed inset-0 z-50 flex flex-col bg-moss-900 px-6 pt-5 pb-8 text-white md:hidden">
          <div className="flex items-center justify-between">
            <Wordmark light />
            <button onClick={() => setMenu(false)} className="grid size-11 place-items-center" aria-label="Schließen"><X size={26} /></button>
          </div>
          <nav className="mt-14 flex flex-col gap-1">
            {NAV.map((n) => (
              <button key={n.id} onClick={() => go(n.id)} className="py-2 text-left font-display text-4xl">{n.label}</button>
            ))}
          </nav>
          <div className="mt-auto space-y-3">
            <a href={CONTACT.phoneHref} className="flex h-14 items-center justify-center gap-2 rounded-xl bg-white text-[16px] font-semibold text-moss-900"><Phone size={18} /> {CONTACT.phone}</a>
            <a href={CONTACT.mobileHref} className="flex h-14 items-center justify-center gap-2 rounded-xl ring-1 ring-white/30"><Smartphone size={18} /> {CONTACT.mobile}</a>
          </div>
        </div>
      )}

      {/* Hero */}
      <section className="relative isolate flex min-h-[100svh] items-end overflow-hidden">
        <img src={img('pflaster-sandstein-detail')} alt="Gepflasterter Hof mit Einfassung aus Buntsandstein-Blöcken" className="absolute inset-0 -z-10 size-full scale-105 object-cover" fetchPriority="high" />
        <div className="absolute inset-0 -z-10 bg-gradient-to-t from-moss-950 via-moss-950/55 to-moss-950/20" />
        <div className="absolute inset-0 -z-10 bg-gradient-to-r from-moss-950/60 to-transparent" />
        <div className="mx-auto w-full max-w-7xl px-5 pt-32 pb-14 sm:px-8 sm:pb-20">
          <p className="flex items-center gap-3 text-[13px] font-medium tracking-[0.16em] text-moss-200 uppercase">
            <span className="h-px w-8 bg-moss-300" /> Garten- und Landschaftsbau · Kleinheubach am Main
          </p>
          <h1 className="mt-6 max-w-4xl font-display text-[44px] leading-[1.02] font-medium tracking-[-0.02em] text-white sm:text-[68px] lg:text-[84px]">
            Wege, Mauern und Gärten, die <em className="font-normal text-clay-200 not-italic sm:italic">bleiben.</em>
          </h1>
          <p className="mt-6 max-w-xl text-[17px] leading-relaxed text-white/80 sm:text-lg">
            Wir bauen Außenanlagen im Landkreis Miltenberg – Pflaster, Natursteinmauern aus regionalem Buntsandstein, Treppen, Terrassen und Zäune. Mit eigener Kolonne und dem Chef selbst auf der Baustelle.
          </p>
          <div className="mt-9 flex flex-col gap-3 sm:flex-row">
            <button onClick={() => go('kontakt')} className="inline-flex h-14 items-center justify-center gap-2 rounded-full bg-clay-500 px-7 text-[16px] font-semibold text-white transition hover:bg-clay-600">
              Vor-Ort-Termin anfragen <ArrowRight size={18} />
            </button>
            <button onClick={() => go('referenzen')} className="inline-flex h-14 items-center justify-center gap-2 rounded-full px-7 text-[16px] font-semibold text-white ring-1 ring-white/35 transition hover:bg-white/10">
              Arbeiten ansehen
            </button>
          </div>
          <div className="mt-14 flex flex-wrap items-center gap-x-10 gap-y-4 border-t border-white/15 pt-6 text-white/80">
            <a href={CONTACT.maps} target="_blank" rel="noreferrer" className="flex items-center gap-3 hover:text-white">
              <span className="flex gap-0.5 text-amber-300">{[0, 1, 2, 3, 4].map((i) => <Star key={i} size={15} className="fill-amber-300" />)}</span>
              <span className="text-[14px]"><strong className="text-white">5,0</strong> bei Google</span>
            </a>
            <span className="text-[14px] italic">„Da merkt man, dass ein Profi am Werk ist.“</span>
          </div>
        </div>
      </section>

      {/* Intro */}
      <section className="mx-auto max-w-7xl px-5 py-24 sm:px-8 sm:py-32">
        <div className="grid gap-12 lg:grid-cols-[1fr_1.15fr] lg:gap-20">
          <div className="reveal">
            <p className="text-[13px] font-semibold tracking-[0.16em] text-clay-600 uppercase">Herzlich willkommen</p>
            <h2 className="mt-4 font-display text-[36px] leading-[1.08] font-medium tracking-tight text-balance sm:text-5xl">
              Ein kleiner Betrieb. Mit großen Steinen.
            </h2>
          </div>
          <div className="reveal space-y-5 text-[17px] leading-relaxed text-stone-600">
            <p>
              Zaidel Garten- und Landschaftsbau ist ein Dienstleister rund um Garten und Außenanlage. Wir gestalten neu, bauen um und pflegen – Gärten, Grünanlagen und Freiflächen, genau so, wie Sie sich das vorstellen.
            </p>
            <p>
              Unser Schwerpunkt ist die Arbeit mit <strong className="font-semibold text-stone-800">Natur- und Betonwerkstein</strong>: vom gepflasterten Hof über die Granittreppe bis zur Hangmauer aus tonnenschweren Sandsteinblöcken.
            </p>
            <dl className="grid grid-cols-1 gap-6 border-t border-stone-200 pt-8 sm:grid-cols-3">
              {[
                ['Inhabergeführt', 'Dimitri Zaidel berät, plant und baut selbst mit.'],
                ['Festes Team', 'Herr Zaidel und seine Mitarbeiter – Sie kennen, wer bei Ihnen baut.'],
                ['Aus der Region', 'Kleinheubach, Miltenberg und Umgebung.'],
              ].map(([t, d]) => (
                <div key={t}>
                  <dt className="font-semibold text-stone-900">{t}</dt>
                  <dd className="mt-1 text-[15px] text-stone-500">{d}</dd>
                </div>
              ))}
            </dl>
          </div>
        </div>
      </section>

      {/* Leistungen */}
      <section id="leistungen" className="scroll-mt-16 bg-stone-100 py-24 sm:py-32">
        <div className="mx-auto max-w-7xl px-5 sm:px-8">
          <div className="reveal flex flex-col justify-between gap-6 sm:flex-row sm:items-end">
            <div>
              <p className="text-[13px] font-semibold tracking-[0.16em] text-clay-600 uppercase">Leistungen</p>
              <h2 className="mt-4 max-w-xl font-display text-[36px] leading-[1.08] font-medium tracking-tight sm:text-5xl">Was wir für Sie bauen</h2>
            </div>
            <p className="max-w-sm text-[15px] text-stone-500">Außerdem: Carports und Gartenhäuser, Natursteinverblender im Innenbereich, Erd- und Entwässerungsarbeiten.</p>
          </div>
          <div className="mt-14 grid gap-x-6 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
            {SERVICES.map((s, i) => (
              <article key={s.id} className="reveal group" style={{ transitionDelay: `${(i % 3) * 80}ms` }}>
                <div className="relative overflow-hidden rounded-2xl">
                  <img src={img(s.img, true)} alt={s.title} loading="lazy" className="aspect-[4/3] w-full object-cover transition duration-700 group-hover:scale-[1.04]" />
                  <span className="absolute top-3 left-3 rounded-full bg-moss-950/70 px-2.5 py-1 font-display text-[13px] text-white backdrop-blur">0{i + 1}</span>
                </div>
                <h3 className="mt-5 text-xl font-semibold tracking-tight">{s.title}</h3>
                <p className="mt-2 text-[15.5px] leading-relaxed text-stone-600">{s.text}</p>
                <div className="mt-4 flex flex-wrap gap-1.5">
                  {s.tags.map((t) => <span key={t} className="rounded-full bg-white px-2.5 py-1 text-[12.5px] text-stone-600 ring-1 ring-stone-200">{t}</span>)}
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* Buntsandstein */}
      <section className="relative overflow-hidden bg-moss-900 text-white">
        <div className="grid lg:grid-cols-2">
          <div className="relative min-h-[360px] lg:order-2 lg:min-h-[640px]">
            <img src={img('sandstein-setzen-bagger')} alt="Buntsandstein-Blöcke werden mit dem Bagger gesetzt" loading="lazy" className="absolute inset-0 size-full object-cover" />
          </div>
          <div className="reveal px-5 py-20 sm:px-8 lg:py-28 lg:pr-16 lg:pl-[max(2rem,calc((100vw-80rem)/2+2rem))]">
            <p className="text-[13px] font-semibold tracking-[0.16em] text-clay-200 uppercase">Unser Material</p>
            <h2 className="mt-4 font-display text-[36px] leading-[1.08] font-medium tracking-tight sm:text-5xl">Roter Main-Sandstein.</h2>
            <p className="mt-6 max-w-lg text-[17px] leading-relaxed text-white/75">
              Zwischen Spessart und Odenwald ist der rote Buntsandstein zuhause – er steckt in den Altstädten von Miltenberg und Wertheim. Wir setzen ihn als Blockstein für Hangmauern, Treppen und Beeteinfassungen ein. Jeder Block ist ein Unikat, jeder wird einzeln mit der Steinzange gesetzt.
            </p>
            <ul className="mt-8 space-y-3 text-[15.5px] text-white/85">
              {['Frostfest und über Jahrzehnte haltbar', 'Passt zu Klinker, Granit und modernem Betonstein', 'Kurze Wege aus regionalen Steinbrüchen'].map((t) => (
                <li key={t} className="flex gap-3"><span className="mt-2.5 h-px w-4 shrink-0 bg-clay-400" />{t}</li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* Referenzen */}
      <Gallery />

      {/* Vorher / Nachher */}
      <section className="mx-auto max-w-7xl px-5 pb-24 sm:px-8 sm:pb-32">
        <div className="reveal grid gap-4 md:grid-cols-2">
          {[
            ['vorher-garten-sand', 'Vorher', 'Rohes Planum nach dem Hausbau.'],
            ['nachher-garten-zaun', 'Nachher', 'Mauer, Zaun mit Sichtschutz, Rasengitter und Bepflanzung.'],
          ].map(([src, label, cap]) => (
            <figure key={src} className="relative overflow-hidden rounded-2xl">
              <img src={img(src, true)} alt={cap} loading="lazy" className="aspect-[4/3] w-full object-cover" />
              <span className={clsx('absolute top-4 left-4 rounded-full px-3 py-1 text-[12px] font-semibold tracking-wide uppercase', label === 'Vorher' ? 'bg-white/90 text-stone-800' : 'bg-moss-800 text-white')}>{label}</span>
              <figcaption className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent p-5 pt-12 text-[15px] text-white">{cap}</figcaption>
            </figure>
          ))}
        </div>
        <p className="mt-4 text-center text-[14px] text-stone-500">Derselbe Reihenhausgarten – vor und nach unserer Arbeit.</p>
      </section>

      {/* Ablauf */}
      <section id="ablauf" className="scroll-mt-16 border-y border-stone-200 bg-white py-24 sm:py-32">
        <div className="mx-auto max-w-7xl px-5 sm:px-8">
          <div className="reveal max-w-2xl">
            <p className="text-[13px] font-semibold tracking-[0.16em] text-clay-600 uppercase">So läuft es ab</p>
            <h2 className="mt-4 font-display text-[36px] leading-[1.08] font-medium tracking-tight sm:text-5xl">Vom ersten Anruf bis zur Übergabe</h2>
          </div>
          <ol className="mt-16 grid gap-10 sm:grid-cols-2 lg:grid-cols-4 lg:gap-8">
            {[
              ['Anruf oder Anfrage', 'Sie erzählen kurz, was Sie vorhaben – am Telefon oder über das Formular, gern mit ein paar Fotos.'],
              ['Termin vor Ort', 'Wir schauen uns das Grundstück an, messen auf und besprechen Material, Ablauf und Zeitraum.'],
              ['Schriftliches Angebot', 'Sie bekommen ein Angebot mit allen Positionen und Mengen. Keine Pauschale, die keiner versteht.'],
              ['Bau und Übergabe', 'Unsere Kolonne baut, wir halten Sie auf dem Laufenden und übergeben die Baustelle besenrein.'],
            ].map(([t, d], i) => (
              <li key={t} className="reveal relative" style={{ transitionDelay: `${i * 90}ms` }}>
                <div className="flex items-center gap-4">
                  <span className="grid size-11 shrink-0 place-items-center rounded-full bg-moss-800 font-display text-lg text-white">{i + 1}</span>
                  {i < 3 && <span className="hidden h-px flex-1 bg-stone-200 lg:block" />}
                </div>
                <h3 className="mt-5 text-lg font-semibold">{t}</h3>
                <p className="mt-2 text-[15.5px] leading-relaxed text-stone-600">{d}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* Stimmen */}
      <section className="mx-auto max-w-7xl px-5 py-24 sm:px-8 sm:py-32">
        <div className="grid gap-12 lg:grid-cols-[1fr_1.6fr]">
          <div className="reveal">
            <p className="text-[13px] font-semibold tracking-[0.16em] text-clay-600 uppercase">Kundenstimmen</p>
            <h2 className="mt-4 font-display text-[36px] leading-[1.08] font-medium tracking-tight sm:text-5xl">5,0 von 5</h2>
            <p className="mt-3 text-stone-500">aus allen Bewertungen bei Google.</p>
            <a href={CONTACT.maps} target="_blank" rel="noreferrer" className="mt-6 inline-flex items-center gap-1.5 text-[15px] font-semibold text-moss-700 hover:underline">
              Auf Google ansehen <ArrowUpRight size={16} />
            </a>
          </div>
          <div className="grid gap-5 sm:grid-cols-2">
            {REVIEWS.filter((r) => r.text).map((r) => (
              <figure key={r.name} className="reveal flex flex-col rounded-2xl bg-white p-7 ring-1 ring-stone-200">
                <span className="flex gap-0.5 text-amber-400">{[0, 1, 2, 3, 4].map((i) => <Star key={i} size={16} className="fill-amber-400" />)}</span>
                <blockquote className="mt-5 flex-1 font-display text-[22px] leading-snug text-stone-800">„{r.text}“</blockquote>
                <figcaption className="mt-6 text-[14px] text-stone-500"><span className="font-semibold text-stone-800">{r.name}</span> · Google, {r.when}</figcaption>
              </figure>
            ))}
          </div>
        </div>
      </section>

      {/* Kontakt */}
      <section id="kontakt" className="scroll-mt-16 bg-moss-950 text-white">
        <div className="mx-auto grid max-w-7xl gap-14 px-5 py-24 sm:px-8 sm:py-32 lg:grid-cols-[1fr_1.25fr] lg:gap-20">
          <div className="reveal">
            <p className="text-[13px] font-semibold tracking-[0.16em] text-moss-300 uppercase">Kontakt</p>
            <h2 className="mt-4 font-display text-[36px] leading-[1.08] font-medium tracking-tight sm:text-5xl">Ein Traumgarten gesucht?</h2>
            <p className="mt-5 max-w-md text-[17px] leading-relaxed text-white/70">Rufen Sie an oder schreiben Sie uns. Wir kommen vorbei, schauen es uns an und sagen Ihnen ehrlich, was geht.</p>
            <div className="mt-10 space-y-4">
              <a href={CONTACT.phoneHref} className="flex items-center gap-4 group">
                <span className="grid size-12 place-items-center rounded-full bg-white/10 group-hover:bg-white/15"><Phone size={19} /></span>
                <span><span className="block text-[13px] text-white/50">Büro</span><span className="text-xl font-semibold">{CONTACT.phone}</span></span>
              </a>
              <a href={CONTACT.mobileHref} className="flex items-center gap-4 group">
                <span className="grid size-12 place-items-center rounded-full bg-white/10 group-hover:bg-white/15"><Smartphone size={19} /></span>
                <span><span className="block text-[13px] text-white/50">Mobil</span><span className="text-xl font-semibold">{CONTACT.mobile}</span></span>
              </a>
              <a href={`mailto:${CONTACT.email}`} className="flex items-center gap-4 group">
                <span className="grid size-12 place-items-center rounded-full bg-white/10 group-hover:bg-white/15"><Mail size={19} /></span>
                <span><span className="block text-[13px] text-white/50">E-Mail</span><span className="text-[17px] font-semibold">{CONTACT.email}</span></span>
              </a>
              <a href={CONTACT.maps} target="_blank" rel="noreferrer" className="flex items-center gap-4 group">
                <span className="grid size-12 place-items-center rounded-full bg-white/10 group-hover:bg-white/15"><MapPin size={19} /></span>
                <span><span className="block text-[13px] text-white/50">Adresse</span><span className="text-[17px] font-semibold">{CONTACT.street}, {CONTACT.zip} {CONTACT.city}</span></span>
              </a>
            </div>
            <div className="mt-12">
              <div className="text-[13px] text-white/50">Wir arbeiten unter anderem in</div>
              <p className="mt-2 text-[15px] leading-relaxed text-white/80">{AREA.join(' · ')}</p>
            </div>
          </div>
          <div className="reveal">
            <ContactForm />
          </div>
        </div>
      </section>

      <footer className="bg-moss-950 text-white/60">
        <div className="mx-auto flex max-w-7xl flex-col gap-6 border-t border-white/10 px-5 py-10 text-[14px] sm:flex-row sm:items-center sm:justify-between sm:px-8">
          <Wordmark light />
          <div className="flex flex-wrap gap-x-6 gap-y-2">
            <Link to="/impressum" className="hover:text-white">Impressum</Link>
            <Link to="/datenschutz" className="hover:text-white">Datenschutz</Link>
            <Link to="/app" className="inline-flex items-center gap-1.5 hover:text-white"><LockKeyhole size={14} /> Team-Login</Link>
          </div>
          <span>© {new Date().getFullYear()} Dimitri Zaidel</span>
        </div>
      </footer>

      {/* Mobile Anruf-Leiste */}
      <a href={CONTACT.phoneHref} className={clsx('safe-bottom fixed inset-x-4 bottom-4 z-30 flex h-14 items-center justify-center gap-2 rounded-full bg-clay-500 text-[16px] font-semibold text-white shadow-pop transition duration-300 md:hidden', scrolled ? 'translate-y-0 opacity-100' : 'pointer-events-none translate-y-6 opacity-0')}>
        <Phone size={18} /> Jetzt anrufen
      </a>
    </div>
  )
}

function Gallery() {
  const [cat, setCat] = useState<Cat | 'alle'>('alle')
  const [open, setOpen] = useState<number | null>(null)
  const list = PROJECTS.filter((p) => cat === 'alle' || p.cat === cat)

  useEffect(() => {
    if (open === null) return
    const k = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(null)
      if (e.key === 'ArrowRight') setOpen((i) => (i! + 1) % list.length)
      if (e.key === 'ArrowLeft') setOpen((i) => (i! - 1 + list.length) % list.length)
    }
    window.addEventListener('keydown', k)
    document.body.style.overflow = 'hidden'
    return () => {
      window.removeEventListener('keydown', k)
      document.body.style.overflow = ''
    }
  }, [open, list.length])

  return (
    <section id="referenzen" className="scroll-mt-16 mx-auto max-w-7xl px-5 py-24 sm:px-8 sm:py-32">
      <div className="reveal flex flex-col justify-between gap-6 lg:flex-row lg:items-end">
        <div>
          <p className="text-[13px] font-semibold tracking-[0.16em] text-clay-600 uppercase">Referenzen</p>
          <h2 className="mt-4 font-display text-[36px] leading-[1.08] font-medium tracking-tight sm:text-5xl">Aus unseren Baustellen</h2>
        </div>
        <div className="-mx-5 flex gap-2 overflow-x-auto px-5 pb-1 sm:mx-0 sm:px-0">
          {CATS.map((c) => (
            <button key={c.id} onClick={() => setCat(c.id)} className={clsx('h-10 shrink-0 rounded-full px-4 text-[14px] font-medium ring-1 transition', cat === c.id ? 'bg-moss-800 text-white ring-moss-800' : 'text-stone-700 ring-stone-300 hover:ring-stone-500')}>
              {c.label}
            </button>
          ))}
        </div>
      </div>
      <div className="mt-12 grid grid-flow-dense auto-rows-[220px] grid-cols-2 gap-3 sm:auto-rows-[260px] lg:grid-cols-4">
        {list.map((p, i) => (
          <button
            key={p.img}
            onClick={() => setOpen(i)}
            className={clsx('group relative overflow-hidden rounded-xl bg-stone-200 text-left', p.wide && cat === 'alle' && 'col-span-2', p.tall && cat === 'alle' && 'row-span-2')}
          >
            <img src={img(p.img, true)} alt={p.title} loading="lazy" className="size-full object-cover transition duration-700 group-hover:scale-[1.05]" />
            <span className="absolute inset-x-0 bottom-0 translate-y-1 bg-gradient-to-t from-black/70 to-transparent p-4 pt-10 text-[14px] font-medium text-white opacity-0 transition group-hover:translate-y-0 group-hover:opacity-100">{p.title}</span>
          </button>
        ))}
      </div>

      {open !== null && list[open] && (
        <div className="fixed inset-0 z-50 flex flex-col bg-stone-950/95" onClick={() => setOpen(null)}>
          <div className="flex justify-end p-4">
            <button className="grid size-11 place-items-center rounded-full text-white hover:bg-white/10" aria-label="Schließen"><X size={24} /></button>
          </div>
          <div className="relative flex min-h-0 flex-1 items-center justify-center px-4" onClick={(e) => e.stopPropagation()}>
            <img src={img(list[open].img)} alt={list[open].title} className="max-h-full max-w-full rounded-lg object-contain" />
            <button onClick={() => setOpen((open - 1 + list.length) % list.length)} className="absolute left-4 grid size-12 place-items-center rounded-full bg-black/40 text-white hover:bg-black/60" aria-label="Zurück"><ChevronLeft size={24} /></button>
            <button onClick={() => setOpen((open + 1) % list.length)} className="absolute right-4 grid size-12 place-items-center rounded-full bg-black/40 text-white hover:bg-black/60" aria-label="Weiter"><ChevronRight size={24} /></button>
          </div>
          <p className="p-6 text-center text-white/80">{list[open].title} <span className="text-white/40">· {open + 1} / {list.length}</span></p>
        </div>
      )}
    </section>
  )
}
