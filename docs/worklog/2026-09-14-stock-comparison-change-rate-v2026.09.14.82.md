# Hourly integration worklog — v2026.09.14.82

## Selected runtime slice
Extend the current P1 stock-comparison work with an exact day-open percentage-change metric so members can compare differently priced virtual stocks on a common relative basis.

## Baseline / overlap review
- Latest application main before development: `bedf99608f28198ef12f3ec76b29ce6c2ae3eacb`.
- Newest relevant active stock head: PR #286 `be5d196e67f6ad1fe2dc983ef27e0c0173720819`.
- The latest main advance over PR #286's base contained only signup-friction planning/changelog/worklog files, so PR #286 was merged into a fresh integration branch from current main without dropping concurrent work.
- PRs #277/#279/#280 are superseded by the re-homed #286 stock stack and were not modified in place.

## Runtime change
- Added `signedPercentChange` using `BigInt` integer-string arithmetic.
- Added the relative change row to the stock comparison table.
- Added positive/negative/flat, very-large-value, truncation, and zero-open regression tests.
- No backend/API/database contract change.

## Release state
- PR #286 candidate images/CI passed. Its isolated-Test GitOps promotion was generated and validated, but the public Test endpoint was still serving the older `2bb84e2...` SHA at the time this work continued. Production promotion therefore remained fail-closed.
