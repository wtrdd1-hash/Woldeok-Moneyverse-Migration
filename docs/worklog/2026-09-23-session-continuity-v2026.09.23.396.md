# Worklog — v2026.09.23.396 session continuity planning

## Baseline
- Remote main fetched before edit: `5762e7bc685dc8d75ce6e672a6cef1dcc9b03ee4`.
- Latest merged update/release record on main: v393.
- Authoritative `PROJECT_PLAN` / integrated ledger before edit: v388.
- Dedicated work branch: `docs/v2026.09.23.396-session-continuity`.

## Planning decision
The release contract now treats deployment-caused logout as a P0 release failure. Authentication continuity must survive routine update/restart/cutover through deployment-independent session storage, compatible cookie/session schema, stable or overlap-rotated cryptographic keys, and pre/post authenticated-session evidence.

## Evidence boundary
No runtime code, Test server, Production server, session store, or signing-key configuration was changed by this documentation-only work.
