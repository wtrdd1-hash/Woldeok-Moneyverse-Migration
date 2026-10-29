# B v640 — P0 engagement reward claims fail closed (Draft / release HOLD)

Date: 2026-10-29 KST. Source base `69c486777d023ee45a216528e7a0c8b7dd1d7ea7`.

## Root cause and implementation

A prior integration restored unsafe `DopamineController` handlers despite retained fail-closed tests and repository guards. `POST /engagement/dopamine/daily-quest/claim` returned HTTP 200 and a fabricated 500 WLD transaction when the repository was absent; when present it called a repository that intentionally rejected the uncertified claim, converting that error into HTTP 500. `POST /engagement/dopamine/pet-fortune` returned an invented 100–1,000 WLD award and `/status` advertised fortune claims as available. No live payout is inferred from this source-level finding.

Both claim endpoints now require the existing session/consent/CSRF guards and return non-cacheable HTTP 503 before repository calls. Error codes: `DAILY_QUEST_SETTLEMENT_UNAVAILABLE` and `PET_FORTUNE_SETTLEMENT_UNAVAILABLE`. Daily quest status continues to read existing owner ledger evidence; a missing repository or query failure now returns 503 `DAILY_QUEST_EVIDENCE_UNAVAILABLE` rather than invented empty history or 500. Fortune availability is false. The existing web daily quest and pet screens remain non-paying practice flows. One inherited duplicate exception import in the touched controller was removed.

No schema migration, financial posting, balance update, account privilege change, Test deployment or Production deployment. This is containment, **not** a certified reward settlement feature.

## RED/GREEN and release evidence

- Before: inherited daily-quest tests 3 failed/1 passed; expanded 4 failed/1 passed. Pet/Fortune regression tests separately reproduced 4 failures.
- After: 9/9 daily-quest and pet/fortune boundary tests PASS; 18/18 related Backend PASS; 8/8 targeted Frontend daily/pet practice PASS; contract 41/41 PASS; production dependency audit 0 known vulnerabilities; focused ESLint PASS.
- Full Backend 2,029 PASS / 236 FAIL / 809 SKIP; full Frontend 2,514 PASS / 53 FAIL; full lint 2 errors / 1,046 warnings; Backend typecheck/build blocked by inherited public treasury export and duplicate blog method (Draft #1886); Frontend typecheck/build blocked by existing malformed central-bank panel and other integration errors. These are **failed gates**, not waived checks.
- QA v1372: migration IDs 291–295 duplicate, historical checksum mismatch, 18,000 WLD provenance unverified, insufficient DB app-role privileges, and no official exact-SHA Test/PG/auth/E2E/backup restore/GitOps approval. The current change does not repair those blockers.

## API/DB contract and integration

POST daily-quest/claim and POST pet-fortune: 503, JSON `code`, `Cache-Control` no-store; no `success`, `rewardAmount`, `newBalance` or fabricated transaction ID. GET daily-quest/status: authenticated owner ledger read or 503 if unavailable. GET dopamine/status: `fortuneCookieAvailable=false`. DB: no change. Frontend C/A should retain local-only pet/quest practice and avoid presenting 503 as a successful payout.

**Release decision:** Draft + hold. No merge, no Test promotion, no Production rollout until all required exact-SHA gates PASS.
