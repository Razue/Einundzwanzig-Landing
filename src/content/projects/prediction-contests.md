---
name: Prediction-Contests-Spezifikation
kurz: Ein Nostr-Standard für Tippspiele aller Art. Spiel, Tipp und Ergebnis als Events, von Fußball bis Schach.
status: beta
themen: [nostr, spezifikation, spiele]
---

Kickstr braucht ein Datenformat, und statt es nur für Fußball zu bauen, ist daraus eine allgemeine Spezifikation geworden: Wie sieht ein Tippspiel auf Nostr aus, unabhängig vom Sport?

Der Entwurf reserviert die Kinds 30210 bis 30219. Kern sind drei Events: ein Spiel (30210), ein Tipp (30211) und ein Ergebnis (30212). Dazu kommen reservierte Kinds für Spielpläne, Ranglisten, Orakel-Bestätigungen, Auszahlungsquittungen und Ligen.

## Stand

Entwurf in Version 0.1. Kickstr ist die erste Implementierung. Bevor der Vorschlag offiziell bei den Nostr-NIPs eingereicht wird, soll es eine zweite, unabhängige Implementierung und ein Relay geben, das die Kinds kennt. Wer ein Tippspiel für eine andere Sportart baut, kann das Format direkt übernehmen.
