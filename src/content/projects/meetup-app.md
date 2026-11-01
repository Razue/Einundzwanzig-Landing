---
name: Einundzwanzig Meetup App
kurz: Termine, Anwesenheits-Badges und Nostr-Identität in einer App. Dein Besuch wird prüfbar, ohne dass jemand mitliest.
status: live
themen: [meetups, nostr, flutter]
links:
  zapstore: https://zapstore.dev/apps/space.einundzwanzig.meetup
karte: 3
---

Die App verbindet die Meetup-Termine aus dem Portal mit einer Nostr-Identität auf deinem Gerät. Wer bei einem Treffen war, bekommt ein Badge: Der Organisator zeigt einen rollierenden QR-Code, du scannst ihn, und die signierte Bestätigung landet in deiner App.

Aus den Badges berechnet die App lokal eine Reputation, die du teilen kannst und die andere prüfen können, ohne dass irgendwo eine Liste liegt, wer wann wo war. Die Daten bleiben verschlüsselt auf dem Gerät.

## Stand

Version 1.6 läuft auf Android über Zapstore und auf iOS. Die Badge-Vergabe per QR-Code ist der aktive Weg; die ältere NFC-Variante ist abgeschaltet. In der App steckt außerdem der Prototyp „Deckel“ aus dem Stammtisch-Projekt, mit dem ein Tisch seine Rechnung in Sats teilt.
