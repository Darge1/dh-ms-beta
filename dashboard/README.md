# D.H. Miner-Übersicht – optionales Dashboard

Eine **separate** Dashboard-Karte, unabhängig vom Miner-Backend. Sie zeigt
0 bis 5 beliebige bestehende Home-Assistant-Entitäten mit Name und Livewert
an. Änderungen an Leistung, Vnish oder pyasic führt die Karte **nicht** aus.

## Installation

1. [dh-miner-card.js](dh-miner-card.js) herunterladen.
2. Auf Home Assistant unter `/config/www/dh-miner-card.js` speichern.
3. In Home Assistant: Dashboard bearbeiten > Drei-Punkte-Menü >
   Ressourcen > Neue Ressource mit URL `/local/dh-miner-card.js`,
   Ressourcentyp **JavaScript-Modul** hinzufügen.
4. Dashboard bearbeiten > Karte hinzufügen > **D.H. Miner-Übersicht**.
   Alternativ den Karten-Codeeditor verwenden:
   
   ```yaml
   type: custom:dh-miner-card
   title: Miner-Steuerung
   theme: midnight
   entities: []
   ```

5. Im visuellen Karteneditor bis zu fünf Entitäten auswählen.
   Freie Positionen bleiben leer. Design: **Midnight**, **Graphite** oder
   **Clean**. Karte ganz oben auf deinem Dashboard platzieren.

Die Bezeichnungen der Werte stammen von den Home-Assistant-Entitäten und
können dort wie gewohnt bearbeitet werden.

### Warum in einem Dashboard statt über den Geräten?

Home Assistant erlaubt einer Custom Integration nicht, das obere Layout
der Standardseite *Einstellungen → Geräte & Dienste* beliebig zu ersetzen.
Eine separate Dashboard-Karte ist der risikoarme Weg zur eigenen Oberfläche.

Die Karte wird nicht automatisch durch HACS als Integrations-Ressource
geladen; diese bewusste Trennung schützt die unveränderten Python-Dateien.
