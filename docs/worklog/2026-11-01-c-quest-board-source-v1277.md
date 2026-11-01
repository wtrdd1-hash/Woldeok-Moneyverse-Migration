# C v1277 — Verified member quest board (English canonical)

**State: DRAFT / RELEASE HOLD.** Baseline `origin/main` `3d5e321c3d1221febff677469fecdfcb3cf42e7d` (start and midpoint verified 2026-11-01 KST). Isolated branch `auto/hourly-c-quest-board-proof-v1277-20261101-2345`; shared main checkout and other workers' changes untouched.

## Source gap and decision

The member-only `/quests` server page typed `GET /api/v1/engagement` as `EngagementBoard` without runtime validation. A malformed `today_tasks` value crashed `.map`/`.length`, while unverified `next_unlock` and `notifications_enabled` could misrepresent member progress and saved preferences. SQL migration 082 defines `member_engagement_dashboard(p_actor)` with three-row bounded daily/weekly catalogues, non-negative integer counts, a nullable unlock and boolean preference. The authenticated NestJS controller calls the owner-scoped repository; no new table grant, write or financial settlement is justified.

A pure parser now verifies the existing wire shape, duplicate goal codes, bounded arrays, non-negative safe integer counts, unlock requirement evidence and explicit boolean preferences. A failed read remains **unknown**, not an empty verified goal list or a saved default. The page uses the existing responsive layout and member-only `noindex` metadata, with a screen-reader status on unavailable daily goals. The Android app-api rejects malformed successful dashboard responses with HTTP 503 and protects every engagement response (including failures) with `private, no-store`, `noindex` and `no-referrer` headers. Existing session/consent guards and PostgreSQL `SECURITY DEFINER` contract are unchanged.

## Red-green and release policy

- RED: 15 new parser cases failed before implementation; 3 Android gateway cases failed before gateway protection.
- GREEN: 44 targeted parser, SSR and gateway tests passed after implementation; additional full gates must be verified against the exact final SHA.
- No migrations, ledger writes, API route additions or fabricated member data.
- Main merge, official Test, Production and rollback are **not authorized** unless the required exact-SHA checks, independent Test, authenticated E2E, security, CI and GitOps gates all pass.
- The current living plan on main and open planning Drafts are different authorities; no planning Draft was merged or edited by this task.
