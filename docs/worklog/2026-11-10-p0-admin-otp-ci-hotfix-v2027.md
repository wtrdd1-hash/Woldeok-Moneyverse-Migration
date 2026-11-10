# P0 / v2026.11.10.2027 — OTP release classifier emergency worklog

## Preflight — 2026-11-10 13:40 KST

- Owner: GPT via @미니pc홍; isolated branch `fix/p0-otp-ci-pinned-evidence-v2026.11.10.2027` forked from OTP PR #3015 latest `f899c3885c`, no change to Gemini integration worktree.
- Authority: `AGENTS.md`, `docs/planning/INTEGRATED_PLANNING_MASTER.ko.md`, `docs/planning/AUTHENTICATION_SECURITY_PRIORITY_SPEC.ko.md`, `docs/RELEASING.md`, `scripts/release/classify-release.mjs`, `scripts/release/classify-release.test.mjs`.
- Existing CI fail: release input UNKNOWN when compared to remote main `3a7c34507a`. The integrated v2025 archive `docs/worklog/2026-11-10-contained-remote-deletions-v2025.tsv` is machine-readable, intentionally blocked under `docs/`. Its expected literal blob Git SHA1 is `8735e9de503c99fbaff9b7d9c60f59377a6a4cca`, content SHA256 `0bd598120ee16aa07a42c0f66baad895304d3b56b5f914bddda20783fa1951f8`, mode `100644`. This is provenance, not runtime code.
- Security approach: preserve file, add strictly pinned exact-path+blob digest policy exception (not a general `.tsv` allowance); reject changed contents, absent path and executable/symlink; add regression test RED then GREEN; reproduce exact HEAD classification against main. Do not weaken downstream Test/Production release gates.
- Priority: urgent P0. Target #3017, PR #3015, dependent #3016. No production changes or financial data writes until certified.

## Midpoint — TDD 2026-11-10 13:42 KST

- RED: new archived inventory proof test failed correctly: observed UNKNOWN versus expected DOCS_ONLY. Existing tests 24 passed, 1 failed.
- GREEN: anchored exactly one archive path to immutable SHA-256 digest, checked regular non-executable blob mode and required exact contents in HEAD. Other machine-readable docs remain UNKNOWN. 25 classifier tests passed / 0 failed.
- No changes to TSV content, integration branch, production systemd process, Test release, or financial database. Repo-specific source checksum is not a generalized TSV bypass.
