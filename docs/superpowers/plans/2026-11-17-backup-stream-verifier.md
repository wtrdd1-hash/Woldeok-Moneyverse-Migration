# Backup streaming verification recovery implementation plan

> For agentic workers: required sub-skill is superpowers:executing-plans or subagent-driven-development.

**Goal:** Recover six-hour encrypted backup verification without exhausting /tmp, retaining independent filesystem and immutable encrypted archive guarantees.
**Architecture:** Replace archive unpack to disk with bounded manifest/digest metadata only; stream each archive member to SHA256, pg_restore -l and zstd -t. Retain outer archive SHA, fixed member allowlist, encrypted key file 0600 and fail-closed integrity. Preserve original host scripts with rollback.
**Tech Stack:** Bash, GNU tar, zstd, openssl, sha256sum, PostgreSQL pg_restore, Docker, Node test.

## Scope and constraints
- Before/mid/end logging, updated main checks, branch/PR, EN canonical KO secondary.
- No plaintext production DB/photo files written to /tmp or persistent disk by verifier.
- No changes to live finance DB or balances. No weakened archive validation; no secret material in GitHub.
- No removal of encrypted archives. Preserve current active backup timer and independently encrypted copies.

### 1. RED and root cause
- [x] Reproduce real unit failure (log), inspect tmpfs and decrypted archive member metadata.
- [x] Create synthetic fixtures including valid and invalid archive; confirm old extractor uses tmp extraction.

### 2. GREEN and verification
- [x] Implement allowlisted streamed verification template. Add regression tests.
- [x] Test synthetic fixtures and existing 06:20 encrypted archive from sealed host path without storing decrypted members.
- [x] Install only verifier with private restricted rollback copy, run independent verify, then trigger backup service safely; verify systemd success, timer, encrypted output, archive checksum.

### 3. Records and handoff
- [x] Record measured evidence, no secrets, EN/KO worklog + internal/GitHub notes, exact SHA, review PR.
- [x] Hold full DR certification until offsite immutable replica and whole-app restore E2E proven.

## Result
Synthetic tests 3/3 PASS, real prior sealed archive verified, host replacement with rollback, 07:19 encrypted scheduled-service manual run SUCCESS. App release/DR certification remains HOLD.
