# Current-week verified quest progress CSV — implementation plan (release HOLD)

Scope: a read-only, owner-session-bound current-week progress export, **not** historical archive or settlement proof. Four existing `early_game_weekly_goals` rows, including one explicitly self-reported NPC metric, are authoritative. No new schema or financial writes. Main source is `1c5b84a1c45baafcca83f375a6f99698121e9bb5`; earlier planning Drafts are not integrated.

1. RED: Add backend Nest route smoke and frontend CSV validation tests (empty, hostile text, large integer, inconsistent week, invalid schema), private HTTP route guest/failure tests and Android gateway no-store test. Execute focused RED.
2. GREEN: Expose guarded `GET /api/v1/engagement/early-game/weekly-snapshot` using existing owner-scoped `EarlyGameRepository.weeklyGoals(requireUserId(request))`, cap 12; add validated private CSV renderer, session-gated download route and `/quests` accessible CTA.
3. Integrate: add app-api private cache/noindex response override; verify actual PG 17 function owner isolation, app least privilege and rollback in isolated `wdmv_v761_test_acl` only; run focus/full tests, typecheck, lint, build, contract, security.
4. Check latest main and editable integrated EN/KO planning at start, mid and pre-merge; record exact SHA/CI and all release holds; do not merge or deploy without full PASS.

Security: fail closed, no user-id query parameter, no raw table SELECT, no CSV formulas, no token leakage, no cookies or private caching, no WLD or migration change. Android response must preserve private/no-store/noindex. Historical archive and verification of self-reported NPC actions explicitly excluded.
