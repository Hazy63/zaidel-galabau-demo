import clsx from 'clsx'
import { ArrowRight, ArrowUpRight, ChevronLeft, ChevronRight, LockKeyhole, Mail, MapPin, Menu, Phone, Smartphone, Star, X } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Wordmark } from '../Logo'
import { img } from '../crm/format'
import ContactForm from './ContactForm'
import { AREA, CATS, CONTACT, HERO, ONSITE, PROJECTS, REVIEWS, SERVICES, type Cat } from './content'
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
      <section className="relative isolate flex min-h-[100svh] items-end overflow-hidden bg-moss-950">
        <HeroSlides />
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
      <section className="mx-auto max-w-7xl px-5 pt-24 pb-16 sm:px-8 sm:pt-32 sm:pb-20">
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

      <OnSite />

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
                  <img src={img(s.img, true)} alt={s.title} loading="lazy" className="photo aspect-[4/3] w-full object-cover transition duration-700 group-hover:scale-[1.04]" />
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
            <img src={img('sandstein-setzen-bagger')} alt="Buntsandstein-Blöcke werden mit dem Bagger gesetzt" loading="lazy" className="photo absolute inset-0 size-full object-cover" />
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
              <img src={img(src, true)} alt={cap} loading="lazy" className="photo aspect-[4/3] w-full object-cover" />
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

const reducedMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches

/** Hero: Diashow mit langsamem Zoom, Bild rechts frei, Text links auf Verlauf */
function HeroSlides() {
  const [i, setI] = useState(0)
  useEffect(() => {
    if (reducedMotion()) return
    const t = setInterval(() => setI((n) => (n + 1) % HERO.length), 7000)
    return () => clearInterval(t)
  }, [])
  return (
    <>
      {HERO.map((h, n) => (
        <div key={h.img} className={clsx('absolute inset-0 -z-10 transition-opacity duration-[1500ms]', n === i ? 'opacity-100' : 'opacity-0')} aria-hidden={n !== i}>
          <img
            src={img(h.img)}
            alt={h.title}
            className={clsx('photo size-full object-cover', n === i && 'kenburns')}
            style={{ objectPosition: h.pos }}
            fetchPriority={n === 0 ? 'high' : 'low'}
            loading={n === 0 ? 'eager' : 'lazy'}
          />
        </div>
      ))}
      <div className="absolute inset-0 -z-10 bg-gradient-to-t from-moss-950 via-moss-950/70 to-moss-950/30 sm:from-moss-950/95 sm:via-moss-950/35 sm:to-moss-950/10" />
      <div className="absolute inset-0 -z-10 hidden bg-gradient-to-r from-moss-950/75 via-moss-950/25 to-transparent md:block" />
      <div className="absolute inset-x-0 top-0 -z-10 h-32 bg-gradient-to-b from-moss-950/50 to-transparent" />
      <div className="absolute right-8 bottom-20 hidden items-center gap-4 text-[13px] text-white/75 lg:flex">
        <span>{HERO[i].title}</span>
        <span className="flex gap-1.5">
          {HERO.map((h, n) => (
            <button key={h.img} onClick={() => setI(n)} aria-label={`Bild ${n + 1}`} className={clsx('h-1 rounded-full transition-all', n === i ? 'w-8 bg-white' : 'w-4 bg-white/40 hover:bg-white/70')} />
          ))}
        </span>
      </div>
    </>
  )
}

/** Laufband mit Fotos von der Arbeit – zeigt, dass hier wirklich gebaut wird */
function OnSite() {
  const items = [...ONSITE, ...ONSITE]
  return (
    <section className="overflow-hidden pb-24 sm:pb-32" aria-label="Auf der Baustelle">
      <div className="mx-auto mb-8 flex max-w-7xl items-end justify-between gap-6 px-5 sm:px-8">
        <p className="text-[13px] font-semibold tracking-[0.16em] text-clay-600 uppercase">Auf der Baustelle</p>
        <p className="hidden text-[14px] text-stone-500 sm:block">Echte Fotos aus unserer Arbeit – keine Bilder aus dem Katalog.</p>
      </div>
      <div className="relative motion-reduce:overflow-x-auto">
        <ul className="marquee flex w-max gap-3 sm:gap-4">
          {items.map((p, n) => (
            <li key={n} className="relative h-56 w-72 shrink-0 overflow-hidden rounded-xl sm:h-72 sm:w-96" aria-hidden={n >= ONSITE.length}>
              <img src={img(p.img, true)} alt={p.title} loading="lazy" className="photo size-full object-cover" />
              <span className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/65 to-transparent p-4 pt-10 text-[13.5px] font-medium text-white">{p.title}</span>
            </li>
          ))}
        </ul>
        <div className="pointer-events-none absolute inset-y-0 left-0 w-10 bg-gradient-to-r from-stone-50 sm:w-24" />
        <div className="pointer-events-none absolute inset-y-0 right-0 w-10 bg-gradient-to-l from-stone-50 sm:w-24" />
      </div>
    </section>
  )
}

const catLabel = (c: Cat) => CATS.find((x) => x.id === c)?.label ?? ''

function Gallery() {
  const [cat, setCat] = useState<Cat | 'alle'>('alle')
  const [open, setOpen] = useState<number | null>(null)
  const list = PROJECTS.filter((p) => cat === 'alle' || p.cat === cat)
  const bento = cat === 'alle'

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
      <div key={cat} className={clsx('fadein mt-12 grid gap-3', bento ? 'grid-flow-dense auto-rows-[170px] grid-cols-2 sm:auto-rows-[240px] lg:auto-rows-[260px] lg:grid-cols-4' : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3')}>
        {list.map((p, i) => {
          const big = bento && i % 5 === 0
          return (
            <button
              key={p.img}
              onClick={() => setOpen(i)}
              className={clsx(
                'group relative overflow-hidden rounded-xl bg-stone-200 text-left',
                !bento && 'aspect-[4/3]',
                big && 'col-span-2 row-span-2',
                big && (i / 5) % 2 === 1 && 'lg:col-start-3',
              )}
            >
              <img src={img(p.img, !big)} alt={p.title} loading="lazy" className="photo size-full object-cover transition duration-700 group-hover:scale-[1.04]" style={p.pos ? { objectPosition: p.pos } : undefined} />
              <span className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 via-black/25 to-transparent p-3 pt-12 sm:p-4 sm:pt-14">
                <span className={clsx('block font-medium text-white', big ? 'text-[15px] sm:text-[17px]' : 'text-[13px] sm:text-[14.5px]')}>{p.title}</span>
                <span className="mt-0.5 hidden text-[12px] tracking-wide text-white/65 uppercase sm:block">{catLabel(p.cat)}</span>
              </span>
            </button>
          )
        })}
      </div>

      {open !== null && list[open] && <Lightbox list={list} index={open} onChange={setOpen} onClose={() => setOpen(null)} />}
    </section>
  )
}

function Lightbox({ list, index, onChange, onClose }: { list: typeof PROJECTS; index: number; onChange: (i: number) => void; onClose: () => void }) {
  const n = list.length
  const prev = () => onChange((index - 1 + n) % n)
  const next = () => onChange((index + 1) % n)
  const [touchX, setTouchX] = useState<number | null>(null)

  useEffect(() => {
    const k = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
      if (e.key === 'ArrowRight') onChange((index + 1) % n)
      if (e.key === 'ArrowLeft') onChange((index - 1 + n) % n)
    }
    window.addEventListener('keydown', k)
    return () => window.removeEventListener('keydown', k)
  }, [index, n, onChange, onClose])

  useEffect(() => {
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = ''
    }
  }, [])

  // Nachbarbilder vorladen, damit Blättern ohne Wartezeit geht
  useEffect(() => {
    for (const d of [1, -1]) new Image().src = img(list[(index + d + n) % n].img)
  }, [index, n, list])

  const p = list[index]
  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-stone-950/96 backdrop-blur-sm" onClick={onClose} role="dialog" aria-modal="true" aria-label={p.title}>
      <div className="flex items-center justify-between p-4 text-white/70">
        <span className="pl-2 text-[14px]">{index + 1} / {n}</span>
        <button className="grid size-11 place-items-center rounded-full text-white hover:bg-white/10" aria-label="Schließen"><X size={24} /></button>
      </div>
      <div
        className="relative flex min-h-0 flex-1 items-center justify-center px-2 sm:px-20"
        onClick={(e) => e.stopPropagation()}
        onTouchStart={(e) => setTouchX(e.touches[0].clientX)}
        onTouchEnd={(e) => {
          if (touchX === null) return
          const dx = e.changedTouches[0].clientX - touchX
          if (Math.abs(dx) > 50) (dx < 0 ? next : prev)()
          setTouchX(null)
        }}
      >
        <img key={p.img} src={img(p.img)} alt={p.title} className="photo fadein max-h-full max-w-full rounded-lg object-contain shadow-2xl" />
        <button onClick={prev} className="absolute left-3 hidden size-12 place-items-center rounded-full bg-white/10 text-white hover:bg-white/20 sm:grid" aria-label="Zurück"><ChevronLeft size={24} /></button>
        <button onClick={next} className="absolute right-3 hidden size-12 place-items-center rounded-full bg-white/10 text-white hover:bg-white/20 sm:grid" aria-label="Weiter"><ChevronRight size={24} /></button>
      </div>
      <div className="p-5 text-center" onClick={(e) => e.stopPropagation()}>
        <p className="text-white">{p.title} <span className="text-white/45">· {catLabel(p.cat)}</span></p>
        <p className="mt-1 text-[12.5px] text-white/40 sm:hidden">Wischen zum Blättern</p>
        <div className="mx-auto mt-4 hidden w-fit max-w-full gap-2 overflow-x-auto pb-1 sm:flex">
          {list.map((t, i) => (
            <button key={t.img} onClick={() => onChange(i)} className={clsx('h-12 w-16 shrink-0 overflow-hidden rounded-md transition', i === index ? 'ring-2 ring-white' : 'opacity-50 hover:opacity-90')} aria-label={t.title}>
              <img src={img(t.img, true)} alt="" loading="lazy" className="size-full object-cover" />
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
