# v1446 — Glossary self-check and daily-quest isolation hardening (DRAFT / RELEASE HOLD)

Cycle: Previous Feature Addition v1444 -> Current Feature Improvement v1446 -> Next Feature Addition v1448 (provisional).

## Checklist
- [x] Read installed Superpowers skills and authoritative main AGENTS.md/README/EN plan/KO cross-check.
- [x] Verify QA v1358, actual glossary/engagement backend, frontend, API and existing GitHub issue #1321.
- [x] Refine F675-167 in existing EN/KO integrated master and living plan; do not create another standalone planning spec.
- [ ] Update P0/P1 development handoff, internal/GitHub update logs and cross-worker dependencies.
- [ ] Recheck main mid-run, validate docs parity and release classification, push Draft PR, final record.

## Source-backed observation
Main's `frontend/src/components/daily-economic-quest-station.tsx` advertises `quest_financial_quiz` as 1,000 WLD and links to `/#financial-quiz`; the searched frontend tree has no matching anchor. `backend/src/engagement/dopamine.repository.ts` maps that quest ID to 1,000 WLD and checks claim history, but the inspected `claimDailyQuest` does not verify a completed quiz attempt. The controller returns a synthetic success response when its repository is absent. Existing issue #1321 already tracks quest settlement/proof risk; do not duplicate or imply an actual Production exploit. F675-167 practice is a separate, zero-WLD educational feature.

## Evidence / constraints
Main 35971c600f25869c96f1c666d4b9f58927202730 at start. QA v1358 FAILED/HOLD; root98%/data99%, 18,000 WLD drift, 239 app writable relations, three PUBLIC bank functions, five migration checksum mismatches/20 unapplied, official Test exact-main and independent restore unverified. External independently approved/deduplicated references newly 0, cumulative UNKNOWN/10,000: BLOCKED / IN PROGRESS. No runtime/DB/WLD/Test/Production changes authorized in planning.

## Midpoint design / 중간 설계
## v2026.10.29.1446 — F675-167 quiz/daily-quest boundary and receipt hardening (FEATURE IMPROVEMENT / DRAFT / RELEASE HOLD)
- Previous Addition v1444 -> Current Improvement v1446 -> Next Addition v1448 (provisional); main `35971c600f25869c96f1c666d4b9f58927202730` unchanged start/mid, QA v1358 FAILED/HOLD. Draft planning stacked on #1790/#1784/#1780; not implemented.
- **Source conflict:** existing daily station advertises `quest_financial_quiz` for 1,000 WLD and `/#financial-quiz` has no target anchor in inspected main. `DopamineRepository.claimDailyQuest` does not check actual quiz completion; controller fallback can fabricate a success response if repository missing. This is a source risk, not proven Production abuse. Existing finance issue [#1321](https://github.com/wtrdd1-hash/Woldeok-Moneyverse-Migration/issues/1321) owns payout remediation.
- F675-167 remains separate non-rewarded `glossary_practice`: no dopamine reward API, quest/all_clear event, WLD or ledger change. Server-only answer key (no low-entropy public answer hashes), immutable bank/deploy SHA, independent editor/reviewer, 5×4 reviewed locale questions, owner-scoped digest-bound receipts, fail-closed 503, 409/410/422/429, 10 starts/24h, 30min expiry, 90-day retention, web/Android/SEO/WCAG/TalkBack and 320px parity. No client-only success or fake score.
- P0/P1: ENV1446-01 FIN1446-02 SEC1446-03 REL1446-04 QUIZ1446-05 QUIZ1446-06 QUIZ1446-07 QUIZ1446-08 QUIZ1446-09 QUIZ1446-10. Real isolated PostgreSQL 10,001 rows, 100 concurrent races, 100 forged requests, no answer oracle, zero practice-caused WLD delta, exact-SHA Test/rollback required. QA v1358 root98%/data99%/tmp97%, 18 accounts +18k WLD, 239 app DML, PUBLIC bank3, 5 checksum/20 unapplied, Test SHA mismatch and no independent restore; RELEASE HOLD.
- External independently approved/deduplicated references new 0, cumulative UNKNOWN/10,000, BLOCKED/IN PROGRESS. Docs only; no runtime/DB/finance/Test/Production modification. Full bilingual specification in integrated planning master; developer handoff [#1789](https://github.com/wtrdd1-hash/Woldeok-Moneyverse-Migration/issues/1789).
