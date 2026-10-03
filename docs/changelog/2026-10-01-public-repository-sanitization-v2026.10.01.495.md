# v2026.10.01.495 — Public Repository Sanitization

**English canonical** | [한국어](2026-10-01-public-repository-sanitization-v2026.10.01.495.ko.md)

- Removed tracked internal update records from the public server repository.
- Added ignore rules preventing internal update records from being re-added.
- Corrected public-repository assumptions in contributor guidance.
- Replaced non-authoritative root scratch/runtime memory with public-safe compatibility pointers.
- Removed unnecessary private operations-gateway references from public app guides.
- Restored the required non-secret DB initialization source removed by an earlier blanket script purge.
- Strengthened security/documentation planning with public data-minimization and history-aware secret-scan requirements.
- Coordinated Android v1.3.5 signing hardening in the app repository.

Verification: full server tests PASS; typecheck PASS; database tests 7/7 PASS; lint remains RED only on existing main-tree lint debt. No Production change.
