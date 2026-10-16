# Discord music QA evidence repair — implementation plan

> **For agentic workers:** Use test-driven-development and verification-before-completion; stage work in the isolated v713 branch.

**Goal:** Repair the unusable bot SponsorBlock QA entrypoint and distinguish real checks from false positive advertising claims.

**Architecture:** A standalone Node.js CLI runs read-only diagnostics with bounded network/process operations. Its offline mode explicitly skips runtime checks; no command claims to prove ad removal or bypass merely from YouTube metadata. Unit tests spawn the CLI so failures and exit codes are observable.

**Tech Stack:** Node.js ESM, `node:test`, builtin HTTPS and `child_process`, systemctl.

**Spec:** v711 audit A711-06; canonical master planning safety and release policy.

## Global constraints
- No credential reads, database writes, service mutations, copyrighted media downloads, or advertiser-bypass claims.
- Preserve existing music bot/runtime code; fix the diagnostic tool only.
- Unknown API/daemon/network results must not be classified PASS.
- Cannot certify Production before exact-SHA candidate/Test/CI and release gates.

## Implementation tasks
- [x] RED: add CLI syntax/offline/invalid-input tests in `bot/scripts/qa_ads_sponsorblock_verification.test.mjs`, observe failure on old source.
- [x] GREEN: replace broken QA CLI with valid ESM; validated video ID, bounded HTTPS, explicit SKIP/FAIL/PASS and non-zero failure exit.
- [x] GREEN: add evidence truth assertions (no absolute yt-dlp path, no bogus 100% bypass, no media download).
- [x] Validate syntax/tests, baseline bot tests when dependencies exist, project CI/type/build as practicable.
- [x] Re-fetch main; record midwork checks; document EN/KO release/worklog/internal/GitHub updates and verify PR/CI.
- [ ] Promote only if exact-SHA Debian Test, financial/session integrity and Production security gates are cleared. Not performed: P0 HOLD, current Production v712.

## Execution outcome
- PR #882 merged to main at `899459213aaef61d91f394bbb9a03d760a29ca1d`; GitHub CI and Test Candidate workflows succeeded.
- Bot read-only local QA and full code tests passed, but v714 has NOT been promoted to Debian Test or Production; v711 finance P0 and v530 authenticated QA prevent release certification.
