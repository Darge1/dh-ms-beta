# Miner-Steuerung · D.H. Edition

**Originalcode für Mining und Steuerung – eigener Auftritt.**

## Originalstand
Basis: [tntvlad/hass-miner](https://github.com/tntvlad/hass-miner), Commit
`0c582d9fa25a078f20b1d9e7d5dfecba3caba0ca` (2026-08-21). Alle Python-Dateien unter
`custom_components/miner` entsprechen bytegenau diesem Stand. Die Datei
`UPSTREAM_BASELINE.json` und GitHub Actions überprüfen das bei jedem Update.

Anpassungen: Name `Miner-Steuerung`, eigenes D.H.-Icon und Logo,
Übersetzungen, Links und zusätzliche Dashboard-Dateien. Der technische
Installations-/Erkennungsvorgang, die pyasic-Bibliotheksbehandlung, Sensoren,
Services und alle Steuerungen wurden **nicht modifiziert**.

## Dashboard
Eine optionale Übersicht mit bis zu fünf ausgewählten Entitäten entsteht
separat im Home-Assistant-Dashboard. Das ändert keinen Python-Code.

## HACS
Repository: `https://github.com/Darge1/dh-ms-beta` (Typ: Integration).
Aktualisieren und Home Assistant neu starten. Bestehende Geräte nicht löschen.

## Grenzen
Identischer Originalcode ist kein Nachweis einer fehlerfreien Installation:
auch das Original kann mit bestimmten Home-Assistant-/pyasic-Versionen oder
mit einer zweiten Integration kollidieren, die pyasic während des Betriebs
ersetzt. Den vollständigen Core-Traceback prüfen.

## Urheberrecht
Auf Basis von https://github.com/tntvlad/hass-miner und
https://github.com/Schnitzel/hass-miner.
Original-Lizenzhinweise bleiben erhalten. Die D.H.-Edition erhebt keinen
Anspruch, den technischen Originalcode neu entwickelt zu haben.
