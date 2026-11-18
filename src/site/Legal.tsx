import { ArrowLeft } from 'lucide-react'
import { Link } from 'react-router-dom'
import { Wordmark } from '../Logo'
import { CONTACT } from './content'

export default function Legal({ page }: { page: 'impressum' | 'datenschutz' }) {
  return (
    <div className="min-h-dvh bg-stone-50">
      <header className="border-b border-stone-200 bg-white">
        <div className="mx-auto flex h-[72px] max-w-3xl items-center justify-between px-5">
          <Link to="/"><Wordmark /></Link>
          <Link to="/" className="inline-flex items-center gap-1.5 text-sm text-stone-500 hover:text-stone-800"><ArrowLeft size={15} /> Zurück</Link>
        </div>
      </header>
      <main className="mx-auto max-w-3xl px-5 py-16 text-[16px] leading-relaxed text-stone-700 [&_h2]:mt-10 [&_h2]:mb-3 [&_h2]:text-lg [&_h2]:font-semibold [&_h2]:text-stone-900">
        <p className="mb-8 rounded-lg bg-amber-50 px-4 py-3 text-[14px] text-amber-900 ring-1 ring-amber-200">
          Entwurf für die Vorführung. Vor dem Livegang mit dem Inhaber abgleichen – im bisherigen Impressum steht noch eine andere Anschrift (Freudenberg).
        </p>
        {page === 'impressum' ? (
          <>
            <h1 className="font-display text-4xl font-medium text-stone-900">Impressum</h1>
            <h2>Angaben gemäß § 5 DDG</h2>
            <p>Zaidel Garten- und Landschaftsbau<br />Inhaber: {CONTACT.owner}<br />{CONTACT.street}<br />{CONTACT.zip} {CONTACT.city}</p>
            <h2>Kontakt</h2>
            <p>Telefon: {CONTACT.phone}<br />Telefax: 09375 929 56 52<br />Mobil: {CONTACT.mobile}<br />E-Mail: {CONTACT.email}</p>
            <h2>Umsatzsteuer</h2>
            <p>Umsatzsteuer-Identifikationsnummer gemäß § 27a UStG: wird ergänzt.</p>
            <h2>Verbraucherstreitbeilegung</h2>
            <p>Wir sind nicht bereit oder verpflichtet, an Streitbeilegungsverfahren vor einer Verbraucherschlichtungsstelle teilzunehmen.</p>
          </>
        ) : (
          <>
            <h1 className="font-display text-4xl font-medium text-stone-900">Datenschutz</h1>
            <h2>Verantwortlicher</h2>
            <p>{CONTACT.owner}, {CONTACT.street}, {CONTACT.zip} {CONTACT.city}, {CONTACT.email}</p>
            <h2>Hosting und Schriften</h2>
            <p>Diese Website wird bei einem Anbieter mit Servern in der EU betrieben. Schriften werden lokal ausgeliefert, es werden keine Daten an Google Fonts oder andere Dritte übertragen. Es werden keine Tracking- oder Werbe-Cookies gesetzt.</p>
            <h2>Kontaktformular</h2>
            <p>Wenn Sie uns über das Formular schreiben, speichern wir Ihre Angaben (Name, Kontaktdaten, Adresse des Bauvorhabens, Nachricht und ggf. Fotos) zur Bearbeitung Ihrer Anfrage und für ein mögliches Angebot (Art. 6 Abs. 1 lit. b DSGVO). Die Daten werden gelöscht, wenn sie nicht mehr erforderlich sind und keine gesetzlichen Aufbewahrungsfristen bestehen.</p>
            <h2>Ihre Rechte</h2>
            <p>Sie haben das Recht auf Auskunft, Berichtigung, Löschung, Einschränkung der Verarbeitung, Datenübertragbarkeit und Widerspruch sowie das Recht auf Beschwerde bei einer Aufsichtsbehörde (für Bayern: BayLDA, Ansbach).</p>
          </>
        )}
      </main>
    </div>
  )
}
