# D.H. Miner-Übersicht

Die Dashboard-Karte wird mit **Miner-Steuerung** aus HACS installiert.
Du musst dafür **keine zweite Datei und kein weiteres HACS-Repository**
herunterladen.

Nach dem Update Home Assistant neu starten, anschließend bei einem
gewöhnlichen Home-Assistant-Dashboard **Bearbeiten → Karte hinzufügen →
D.H. Miner-Übersicht** auswählen. Die Karte wird nicht automatisch
auf deinem Dashboard eingeblendet.

Im Karteneditor kannst du bis zu **fünf Entitäten** auswählen – beispielsweise
Hashrate, Stromverbrauch, Temperatur, Effizienz und Best Share. Nicht
ausgewählte Felder werden nicht angezeigt.

### Optik

- **Midnight:** dunkles Petrol
- **Graphite:** Anthrazit
- **Clean:** hell
- **Logo:** Satoshi-Symbol oben rechts (Standard), D.H. oder ausgeblendet.
  Das kleine blaue H bleibt als HACS-Integrationssymbol erhalten.

### Deaktivieren

Entferne die Karte im Dashboard-Editor oder blende sie über die
Dashboard-Sichtbarkeit aus. Die Miner-Steuerung funktioniert weiterhin.

Die Karte greift ausschließlich lesend auf bestehende Home-Assistant-Zustände
zu. Sie ändert keine Miner-Einstellungen.

Die automatische Registrierung funktioniert bei Home Assistants
standardmäßiger Dashboard-Ressourcenverwaltung (Storage-Modus). Bei
abweichendem YAML-Ressourcenmodus kann, je nach Core-Version, eine einmalige
manuelle Ressourcenregistrierung nötig sein. Die Datei liegt dann bereits unter
`/dh-miner/dh-miner-card.js` – keine zweite Installation.

Die Dashboard-Karte erscheint in einem normalen Home-Assistant-Dashboard,
nicht als Ersatz für die eingebaute Geräte-&-Dienste-Seite.
