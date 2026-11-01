---
name: Kickstr
kurz: Tippspiele für WM, EM und Bundesliga auf Nostr. Einsätze und Gewinne in Sats über Cashu, Tipps für alle prüfbar.
status: live
themen: [spiele, nostr, cashu, lightning]
links:
  web: https://kickstr.einundzwanzig.dev/
karte: 4
---

Kickstr ist ein Tippspiel, bei dem niemand dem Betreiber vertrauen muss. Spiele, Tipps und Ergebnisse liegen als signierte Events auf Nostr-Relays. Jeder kann nachrechnen, wer wann was getippt hat, und die Rangliste selbst prüfen.

Bezahlt wird mit Lightning und Cashu: Einsatz rein, Gewinn raus, ohne Konto beim Betreiber. Angemeldet wird mit dem eigenen Nostr-Schlüssel über eine Browser-Erweiterung oder einen Signer.

## Technik

Elixir und Phoenix LiveView im Hintergrund, Nostr-Events der Kinds 30210 bis 30212 für Spiel, Tipp und Ergebnis. Die zugrunde liegende Spezifikation ist sportunabhängig und steht als eigenes Projekt zur Diskussion.
