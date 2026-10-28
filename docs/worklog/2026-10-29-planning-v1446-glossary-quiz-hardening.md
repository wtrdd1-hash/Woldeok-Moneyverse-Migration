# v1446 — Glossary self-check and daily-quest isolation hardening (DRAFT / RELEASE HOLD)

Cycle: Previous Feature Addition v1444 -> Current Feature Improvement v1446 -> Next Feature Addition v1448 (provisional).

## Checklist
- [x] Read installed Superpowers skills and authoritative main AGENTS.md/README/EN plan/KO cross-check.
- [x] Verify QA v1358, actual glossary/engagement backend, frontend, API and existing GitHub issue #1321.
- [ ] Refine F675-167 in existing EN/KO integrated master and living plan; do not create another standalone planning spec.
- [ ] Update P0/P1 development handoff, internal/GitHub update logs and cross-worker dependencies.
- [ ] Recheck main mid-run, validate docs parity and release classification, push Draft PR, final record.

## Source-backed observation
Main's `frontend/src/components/daily-economic-quest-station.tsx` advertises `quest_financial_quiz` as 1,000 WLD and links to `/#financial-quiz`; the searched frontend tree has no matching anchor. `backend/src/engagement/dopamine.repository.ts` maps that quest ID to 1,000 WLD and checks claim history, but the inspected `claimDailyQuest` does not verify a completed quiz attempt. The controller returns a synthetic success response when its repository is absent. Existing issue #1321 already tracks quest settlement/proof risk; do not duplicate or imply an actual Production exploit. F675-167 practice is a separate, zero-WLD educational feature.

## Evidence / constraints
Main 35971c600f25869c96f1c666d4b9f58927202730 at start. QA v1358 FAILED/HOLD; root98%/data99%, 18,000 WLD drift, 239 app writable relations, three PUBLIC bank functions, five migration checksum mismatches/20 unapplied, official Test exact-main and independent restore unverified. External independently approved/deduplicated references newly 0, cumulative UNKNOWN/10,000: BLOCKED / IN PROGRESS. No runtime/DB/WLD/Test/Production changes authorized in planning.
