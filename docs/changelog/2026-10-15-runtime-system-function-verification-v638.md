# 2026-10-15 — v2026.10.15.638 — System/function verification

- Read-only miniPC service, nginx, public GET, backend/auth and DB financial safety smoke; version endpoint unknown, separate canary.
- 145 production GET: 138×200, 1×401, **6×404**; historical Nginx 502/503/500; candle API maps invalid upstream status to 503.
- Exact main isolated retest: frontend 1,206 PASS, backend non-DB 1,185 PASS/29 skipped, build/types/mobile API contract PASS; bot 4 PASS, optional bot QA syntax FAIL.
- Full-route QA command incomplete; scheduled QA checks do not cover user links. No live changes; acceptance BLOCKED.
- [Report EN](../findings/MONEYVERSE_RUNTIME_SYSTEM_FUNCTION_VERIFICATION_v2026.10.15.638.md) · [Report KO](../findings/MONEYVERSE_RUNTIME_SYSTEM_FUNCTION_VERIFICATION_v2026.10.15.638.ko.md).
