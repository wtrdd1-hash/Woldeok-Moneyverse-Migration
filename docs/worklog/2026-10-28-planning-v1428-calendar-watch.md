# v1428 — Member calendar watchlist planning (2026-10-28)

- **START 22:12 KST** — Previous Cycle: Feature Improvement v1426; Current Cycle: Feature Addition v1428; Next Cycle: Feature Improvement v1430 (provisional). Authoritative `origin/main=35971c600f25869c96f1c666d4b9f58927202730`; read AGENTS.md, README.md, PROJECT_PLAN EN/KO, integrated master EN/KO. Superpowers connector `skills__list` returned zero URIs (BLOCKED); installed miniPC using-superpowers, brainstorming, writing-plans, using-git-worktrees, verification-before-completion read. Isolated worktree and branch created from main. No runtime writes.
- **Source-backed opportunity** — `/calendar` currently combines `/api/v1/seasons/events`, `/api/v1/early-game/today`, `/api/v1/engagement/early-game` and `/api/v1/shop/catalog`, but offers no owner-persisted watch/unwatch flow. Season events have UUID `virtual_consumption_events.id` and `virtual_seasons.ends_at`; shop deadline items have UUID `shop_catalog.id` and `shop_inventory.ends_at`. Daily event and weekly reset lack an appropriate durable event key in this view and are excluded from v1 watch eligibility. Existing source may change before implementation; re-verify exact SHA.
- **Planned design** — F675-163 member-only saved calendar events; no scheduled push/email, auto-enrolment, WLD, purchase, or reward. Owner-scoped typed source IDs, atomic watch/unwatch, verified live schedule and unavailable redaction, cap, idempotency, mobile parity, admin aggregates, noindex/no-store, accessible states, real PostgreSQL regression, exact-SHA Test/rollback.
- **P0** — disk/backup/restore; 18,000 WLD historical ledger mismatch; DB ownership/privileges and stale-event visibility; exact-SHA Test/release gate. **P1** — schema/read model, concurrency/receipt, API, UI/a11y, admin/privacy/KPI, regression/rollback.
- **MID** — pending main/QA/PR refresh and draft design.
- **END** — pending verification, commit, remote SHA, Draft PR and issue links.

**External evidence gate:** 10,000 independent deduplicated, evidence-classified records required. Newly accepted 0; cumulative verified UNKNOWN/10,000; BLOCKED / IN PROGRESS. Do not equate publisher families or references reviewed with accepted records.

**Deployment:** DOCUMENTATION ONLY / DRAFT / RELEASE HOLD. No Test/Production/runtime/database/WLD/ledger changes authorized.
