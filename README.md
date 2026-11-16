# Miner-Steuerung

Customized by D.H.

Private/lightly customized Home Assistant miner integration for a small circle of users.

Based on:
- https://github.com/tntvlad/hass-miner
- https://github.com/Schnitzel/hass-miner

Original copyright and MIT license notices remain intact. This customization does not claim authorship of the underlying miner integration.

## Version 1.0.0-beta.2 (Home Assistant compatibility)

- Preload sensor, switch, number, select, light and button modules with Home
  Assistant's import executor to avoid event-loop import warnings.
- Stop installing/reinstalling pyasic or deleting it from sys.modules at
  runtime. HA resolves the shared pyasic dependency from the manifest.
- Support pyasic 0.78.8 through 0.78.x, keeping the existing Vnish/ASIC patches
  and platform entities intact. The preferred development version is 0.78.12.

**Coexistence with OpenKairo Mining:** OpenKairo Mining 1.4.18 itself can
force-install pyasic 0.78.8 and remove imported modules from sys.modules. This
release removes that dangerous behavior from *Miner-Steuerung*, but cannot fix
another integration's runtime installer. If both are installed and OpenKairo
still reports "Cannot be called from within the event loop", disable OpenKairo
temporarily and report that failure to its maintainer.

**Installation:** Update the custom HACS repository
`https://github.com/Darge1/dh-ms-beta` and restart Home Assistant.
