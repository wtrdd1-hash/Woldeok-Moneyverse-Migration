# Stock comparison deep-link v2026.09.14.77

- Stock detail links such as `/stocks/compare?symbols=AAA` now preselect the referenced virtual stock.
- Multiple comma-separated symbols are resolved against the authoritative market list, deduplicated, and capped at three selections.
- Unknown symbols are ignored; no client-provided price or economy value is trusted.
- Added regression coverage for default, single-symbol, duplicate, unknown, ordering, and selection-limit behavior.
