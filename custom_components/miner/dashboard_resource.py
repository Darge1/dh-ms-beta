"""Register an optional HACS-bundled Lovelace card independently of miners.

This module intentionally never imports pyasic, modifies config entries or
touches miner sensors. Registration errors are caught by async_setup().
"""

from __future__ import annotations

import logging
from pathlib import Path

from homeassistant.components.http import StaticPathConfig
from homeassistant.core import HomeAssistant

_LOGGER = logging.getLogger(__name__)

_RESOURCE_PATH = "/dh-miner/dh-miner-card.js"
_RESOURCE_BASE = "/dh-miner"
_RESOURCE_VERSION = "1.0.0-beta.5"


async def async_register_dashboard(hass: HomeAssistant) -> None:
    """Serve static frontend assets and register the card in Lovelace."""
    frontend_dir = Path(__file__).parent / "frontend"
    if not frontend_dir.joinpath("dh-miner-card.js").is_file():
        _LOGGER.warning("Optional miner dashboard file is missing")
        return

    # Register once per Home Assistant process. HACS replaces the files on
    # disk; after a HA restart the new versioned URL is registered again.
    try:
        await hass.http.async_register_static_paths(
            [StaticPathConfig(_RESOURCE_BASE, str(frontend_dir), False)]
        )
    except RuntimeError:
        _LOGGER.debug("D.H. miner static frontend path already registered")

    url = f"{_RESOURCE_PATH}?v={_RESOURCE_VERSION}"
    lovelace = hass.data.get("lovelace")
    resources = getattr(lovelace, "resources", None)
    mode = getattr(lovelace, "mode", None)

    if mode == "storage" and resources is not None:
        # Home Assistant versions may not yet have loaded the resource
        # collection when startup listeners run. Always load before editing
        # to avoid overwriting the user's existing card resources.
        if not resources.loaded:
            await resources.async_load()
        existing = [
            item for item in resources.async_items()
            if item.get("url", "").split("?", 1)[0] == _RESOURCE_PATH
        ]
        if existing:
            if existing[0]["url"] != url or existing[0].get("res_type") != "module":
                await resources.async_update_item(
                    existing[0]["id"], {"url": url, "res_type": "module"}
                )
                _LOGGER.info("Updated D.H. miner dashboard resource")
        else:
            await resources.async_create_item({"url": url, "res_type": "module"})
            _LOGGER.info("Registered optional D.H. miner dashboard card")
        return

    # YAML resource mode has no writable resources collection; this supported
    # frontend API keeps the one-package experience when available.
    from homeassistant.components import frontend

    add_extra_js_url = getattr(frontend, "add_extra_js_url", None)
    if add_extra_js_url is not None:
        add_extra_js_url(hass, url)
        _LOGGER.info(
            "Loaded D.H. miner dashboard via frontend fallback "
            "(Lovelace resource mode: %s)",
            mode,
        )
    else:
        _LOGGER.warning(
            "Dashboard file available at %s, but the frontend resource could "
            "not be registered automatically (Lovelace mode: %s)",
            url,
            mode,
        )
