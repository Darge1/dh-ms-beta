"""The Miner integration."""

from __future__ import annotations

import asyncio
import logging
from importlib.metadata import PackageNotFoundError, version
from typing import TYPE_CHECKING

from homeassistant.config_entries import ConfigEntry
from homeassistant.const import Platform
from homeassistant.core import HomeAssistant
from homeassistant.exceptions import ConfigEntryNotReady
from homeassistant.helpers.importlib import async_import_module

if TYPE_CHECKING:
    from homeassistant.helpers import device_registry as dr

from .const import (
    CONF_CACHED_PROFILE,
    CONF_IP,
    DOMAIN,
    MINER_DETECTION_TIMEOUT,
    PYASIC_VERSION,
)

_LOGGER = logging.getLogger(__name__)

PLATFORMS: list[Platform] = [
    Platform.SENSOR,
    Platform.SWITCH,
    Platform.NUMBER,
    Platform.SELECT,
    Platform.LIGHT,
    Platform.BUTTON,
]


def _ensure_pyasic():
    """Load and patch pyasic without changing shared packages at runtime.

    Home Assistant manages dependencies from manifest.json.  Installing a
    different version or clearing sys.modules while another integration uses
    pyasic can corrupt both integrations (e.g. OpenKairo Mining).
    """
    # The pydantic fix must run before pyasic is imported on Python 3.14.
    from .patch import apply_pydantic_property_patch

    apply_pydantic_property_patch()

    import pyasic

    if not hasattr(pyasic, "get_miner"):
        raise ImportError("pyasic module incomplete")

    try:
        installed_version = version("pyasic")
    except PackageNotFoundError:
        installed_version = "unknown"

    if installed_version != PYASIC_VERSION:
        _LOGGER.warning(
            "Miner-Steuerung was developed with pyasic %s, but %s is "
            "installed. Using the shared version without reinstalling it; "
            "other integrations must not replace pyasic at runtime.",
            PYASIC_VERSION,
            installed_version,
        )

    from .patch import (
        apply_avalonminer_web_patch,
        apply_vnish_get_config_patch,
        apply_whatsminer_power_limit_patch,
    )

    apply_whatsminer_power_limit_patch()
    apply_avalonminer_web_patch()
    apply_vnish_get_config_patch()
    return pyasic

async def async_setup_entry(hass: HomeAssistant, config_entry: ConfigEntry) -> bool:
    """Set up Miner from a config entry."""
    # Import and patch pyasic in the executor; NEVER reinstall or evict a
    # dependency that is also used by another Home Assistant integration.
    try:
        pyasic = await hass.async_add_executor_job(_ensure_pyasic)
    except Exception as err:
        raise ConfigEntryNotReady(f"pyasic import failed: {err}") from err

    # These modules were previously imported inside the event loop, triggering
    # Home Assistant's "blocking call to import_module" warning.  Import them
    # through Home Assistant's dedicated import executor *before* forwarding.
    # Do this sequentially because light.py also imports select.py.
    coordinator_module = await async_import_module(hass, f"{__package__}.coordinator")
    services_module = await async_import_module(hass, f"{__package__}.services")
    for platform in PLATFORMS:
        await async_import_module(hass, f"{__package__}.{platform.value}")

    miner_ip = config_entry.data[CONF_IP]
    try:
        # See MINER_DETECTION_TIMEOUT in const.py for why this isn't tiny.
        miner = await asyncio.wait_for(
            pyasic.get_miner(miner_ip), timeout=MINER_DETECTION_TIMEOUT
        )
    except (TimeoutError, asyncio.TimeoutError):
        miner = None

    if miner is None and not config_entry.data.get(CONF_CACHED_PROFILE):
        # Never seen this miner successfully -> nothing to build entities
        # from; keep the classic retry behaviour.
        raise ConfigEntryNotReady("Miner could not be found.")

    m_coordinator = coordinator_module.MinerCoordinator(hass, config_entry)
    hass.data.setdefault(DOMAIN, {})[config_entry.entry_id] = m_coordinator

    if miner is None:
        # Miner is unreachable (typically powered off to save energy) but we
        # have a cached device profile from an earlier successful update: set
        # up from that instead of failing with ConfigEntryNotReady, which
        # showed the integration as broken ("retrying setup") for as long as
        # the miner stayed off. Entities are created unavailable and recover
        # automatically once the miner is powered on again.
        _LOGGER.info(
            "Miner %s is unreachable; setting up from the cached device "
            "profile - entities stay unavailable until the miner returns",
            miner_ip,
        )
        m_coordinator.prime_from_cached_profile()
    # Always start the polling loop — when offline, _async_update_data returns
    # the primed data without raising UpdateFailed, so this completes normally
    # and schedules the background refresh that will detect the miner once it
    # comes back online.
    await m_coordinator.async_config_entry_first_refresh()

    await hass.config_entries.async_forward_entry_setups(config_entry, PLATFORMS)

    await services_module.async_setup_services(hass)

    return True


async def async_unload_entry(hass: HomeAssistant, config_entry: ConfigEntry) -> bool:
    """Unload a config entry."""
    unload_ok = await hass.config_entries.async_unload_platforms(
        config_entry, PLATFORMS
    )
    if unload_ok:
        hass.data[DOMAIN].pop(config_entry.entry_id)

    return unload_ok


async def async_remove_config_entry_device(
    hass: HomeAssistant,
    config_entry: ConfigEntry,
    device_entry: dr.DeviceEntry,
) -> bool:
    """Remove a device from the config entry."""
    return True
