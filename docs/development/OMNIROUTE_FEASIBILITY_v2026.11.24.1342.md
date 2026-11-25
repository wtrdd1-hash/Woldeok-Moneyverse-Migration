# OmniRoute feasibility — v2026.11.24.1342

The owner screenshot identifies the second reel tool as OmniRoute: https://www.instagram.com/reel/Dc8MKIBtnI0/. Official upstream: https://github.com/cheaper-inference/OmniRoute (MIT). Registry version checked: 3.8.54. Gateway routes model requests, supports free tiers subject to provider limits, and can launch Claude Code/Codex/Gemini CLI. Free does not mean unlimited. It is not an ordinary SKILL.md.

MiniPC preflight: Debian, Node 24.21.0 compatible; 7.9 GiB RAM total, 1.6 GiB available, 16 G disk available; port 20128 not listening. Upstream Docker sizing recommends 2 GiB minimum for dashboard/light chat, 10 GiB for one coding agent, and 12–16 GiB for concurrent long responses. Source: upstream README Docker section. Existing services share this host. Installation and activation deferred; no code, provider credentials, agent config, schedule or service changes. No claim of free model availability.

Recommended future validation: dedicated host or sufficient extra RAM, pinned release, loopback-only port, separate data directory, strong authentication, explicit approved providers and no automatic paid fallback; use synthetic prompts, redact secrets/member data, verify logging/retention and provider terms. Preserve current Gemini/Codex/Claude routes and release gates.

## Server log
```text
2026-11-24T13:42:52+09:00 START: identify OmniRoute, inspect installation requirements; no provider or service changes
2026-11-24T13:43:13+09:00 CHECKPOINT: official npm registry version 3.8.54; Node 24.21.0 compatible; host RAM 7.9GiB total/1.6GiB available; disk 16G available; port 20128 not listening
2026-11-24T13:43:13+09:00 FINISH: upstream recommends container >=2GiB light use and >=10GiB one coding agent; defer installation and activation to avoid shared host resource pressure. No provider connection, app or service change.
```
