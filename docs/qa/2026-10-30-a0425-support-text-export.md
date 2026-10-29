# QA — Development A owner-private support text export (2026-10-30 04:25 KST)

**Candidate:** `auto/hourly-a-support-text-export-20261030-0425`, based on main `62c6cd038951d65c94b709302bdaec6e75b080b6`. **Disposition: DRAFT / RELEASE HOLD.**

## Verified scope
- New authenticated NestJS `GET /api/v1/support/threads/:id/transcript/text` returns JSON `{threadId,text,truncated}`. `SupportRepository.messages(actor,id,500)` uses the existing owner-filtering PostgreSQL SECURITY DEFINER function; no table grants, SQL migrations, ledger writes or balance changes.
- Same-origin `/support/transcript/:id/text` downloads UTF-8 `text/plain` with `private, no-store`, `noindex`, `nosniff` and safe attachment filename. Support page exposes a keyboard-focusable 44px TXT download link alongside CSV.
- Android app API forces `private, no-store` and `noindex` for the whole support route family even if the upstream response advertises a public cache. Session cookie forwarding is retained. The text formatter strips C0/C1/ANSI and bidirectional override controls and prefixes every message line. 500-message responses display a possible-incompleteness notice.
- TDD RED reproduced missing route/formatter, missing UI link, Android public-cache leak, and U+2028 line-spoofing; subsequent GREEN tests passed.

## Fresh local evidence
| Gate | Result |
| --- | --- |
| Focused backend transcript and guard tests | PASS (10 before final extra assertions; final 6/6 new text tests) |
| Focused frontend/app-api/support tests | PASS (47/47 before final extra assertions; final text route 4/4) |
| SEO/accessibility-related regressions | PASS 15/15 |
| Contract unit tests | PASS 41/41 |
| Database unit tests | PASS 56, SKIP 4 |
| Real isolated PostgreSQL 17.11 | PASS 304/304 migrations; owner read, foreign-owner denial and direct table SELECT denial; transaction ROLLBACK; container removed |
| Full typecheck | PASS |
| Full build | PASS |
| Changed-file ESLint | PASS |
| Security advisory tests | PASS 13/13; production dependency audit: 0 known vulnerabilities |
| Full lint | FAIL 3 existing errors, 1052 warnings |
| Backend full | FAIL 240, PASS 2354, SKIP 493 |
| Frontend full | FAIL 554, PASS 2041 |
| Mobile generated API contract | FAIL (3 generated docs drift; separate QA #1927 covers NPC schema; new endpoint also needs regeneration/reconciliation) |
| Official Test exact SHA, authenticated browser/Android E2E | BLOCKED — candidate not deployed |

**Live read-only check (04:41 KST):** Test and Production backend `/api/version` both `c2129625aa6629c616fb31ce790950618b8d92b2`. Test frontend same SHA, Production frontend `1793277134644` (not an attested SHA). Test Treasury overview HTTP 200 versus Production 503; P0 #1917 remains unresolved. `/health` HTTP 200 on both. These are not candidate-SHA acceptance proofs.

**Release decision:** No main merge, no Test/Production deployment, no DB migration on shared environments, no rollback required. P0 #1891 required-check bypass and #1908 support table ACL drift remain open. No PASS evidence for the full gate; HOLD.

**Evidence directory:** `/srv/moneyverse-data/reports/Moneyverse-A-2026-10-30-0425-support-text/` (individual command logs, isolated PostgreSQL proof and branch/PR audit).
