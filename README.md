# Zaidel Garten- und Landschaftsbau – Website + Auftragsbuch (Demo)

Vorführversion für Zaidel GaLaBau, Kleinheubach.

- **Website** (`#/`): Leistungen, Referenzen (echte Fotos von zaidel.de), Ablauf, Google-Bewertungen, Kontaktformular.
- **Auftragsbuch / CRM** (`#/app`): Aufträge (Tafel + Liste), Fotos (Vorher/Während/Nachher, Kamera-Upload), Angebote & Rechnungen (Leistungskatalog, A4-PDF, Angebot → Rechnung), Dateien, Notizen, Aufgaben, Einsatzplan, Kunden, Team mit Rollen (Mitarbeiter sehen Mengen ohne Preise).
- Kontaktformular der Website legt direkt eine Anfrage im Auftragsbuch an.

Demo-Logins: Inhaber/Büro PIN `1234`, Mitarbeiter `1111` / `2222` / `3333`.
Daten liegen in der Demo nur im Browser (IndexedDB). Produktiv: Backend mit Login, DB und Dateispeicher in der EU.

## Entwicklung

    npm install
    npm run dev                                   # http://localhost:5173
    npm run build && npx vite preview             # http://localhost:4173
    node tools/e2e.mjs http://localhost:4173/     # Ablauf-Test (13 Prüfungen)
    node tools/shots.mjs http://localhost:4173/   # Screenshots nach shots/

Stack: Vite, React 19, TypeScript, Tailwind CSS 4, Dexie (IndexedDB), lucide-react. Schriften lokal (Fraunces, Figtree), kein Google-Fonts-Abruf.
