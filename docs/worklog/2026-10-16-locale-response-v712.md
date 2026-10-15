# v2026.10.16.712 — Locale and response latency worklog

- Start (2026-10-16 KST): isolated `fix/locale-response-v2026.10.16.712` at initial `origin/main` SHA `be0335f3`. Existing worktrees remain untouched.
- Scope: country/browser locale and manual preference correctness, public server response latency, regression tests, isolated Test acceptance, CI-gated merge, zero-downtime Production release.
- Measured baseline: public `/` ~1.2–5.3 s across cold probes; local `/api/health` ~2 ms, backend `/health` ~1 ms and local homepage 30–104 ms (warm). No production DB change.
- Read governance: `AGENTS.md`, `docs/DOCUMENTATION_POLICY.md`, `docs/planning/PROJECT_PLAN.md`, `docs/planning/INTEGRATED_PLANNING_MASTER.md`, `docs/operations/production-deployment.md`; production gates fail closed pending exact SHA Test and session continuity evidence.

## Investigation and checkpoints

- Root cause split: actual public Nginx upstream is v697 `:3213/:3214`, not legacy v600 `:3000/:3001`. Local 3214 SSR first visit correctly uses KR/JP/CN/US, while external Cloudflare total latency is significantly higher. Public HTTP response advertises excessive CJK font preload resources and repeats auto-detected locale Set-Cookie.
- TDD RED: 8 deliberately failing assertions. Fix preserves SSR selection and manual preference, eliminates auto Set-Cookie on read-only visits and removes eager CJK font preload. GREEN: 14 targeted tests.
- Verification: contract build PASS, typecheck PASS, 228 frontend test files / 1,224 tests PASS, production frontend build PASS, backend build PASS, lint 0 errors (1,088 existing warnings).
- Checkpoint: record main drift and exact-SHA Test/CI/Production acceptance after these gates; do not claim rollout from source checks.

## Production integration and outcome

- All PR #880 required checks PASS; squash merge `eb81f9db`, same tree hash as candidate SHA `142e36b5`. GitHub source branch already deleted.
- Immutable SHA-built Test and separate Production canary authenticated public API protection and first-render locale passed; 5/5 public smoke rounds PASS after guarded Nginx reload, old v697 kept live, no DB/session mutation.
- Post-deployment evidence: [release](../releases/v2026.10.16.712.md) and [v713](2026-10-16-production-locale-v713.md). Production session cookie E2E and external network/RUM latency remain not independently measured.
