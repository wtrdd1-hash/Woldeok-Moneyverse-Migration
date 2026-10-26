# v562 — Blog cron secret-file caller hardening

## Decision
Issue #1137 documents a plaintext credential in the Debian user's scheduled curl argv. Add a separately testable, read-only-on-production runner rather than editing the live cron schedule or rotating credentials without coordinated release. No database or economy mutation.

## Contract
- Runner requires an explicitly configured absolute secret-file path, owned by its effective user, non-symlink, mode 0400/0600 and a bounded URL-safe secret. Never log secret or pass it in command-line arguments or environment variables.
- Invoke curl via `--config -` and a pipe containing only the secret-bearing header; fixed HTTPS blog generation endpoint and POST, bounded timeout, non-verbose failure.
- Fail closed on missing, unreadable, unsafe, or malformed files. No fallback to hardcoded secrets.
- Tests use an isolated fake curl and dummy credentials. The actual Debian crontab, running service and server-side credential are NOT modified in this candidate.

## Implementation sequence
1. Write no-network test proving safe argv and curl stdin, and rejection cases; execute RED.
2. Implement minimum secure shell runner; execute GREEN.
3. Run focused tests, repository security checks, full checks and CI when possible.
4. Review main and both planning documents again, document blockers, open Draft PR, no merge/deploy.

## Rollout prerequisites (not performed)
Coordinate a new random secret with the blog endpoint owner; provision an appropriately protected local secret file and backend secret, update cron to call this runner while preserving the 04:00 local schedule, rotate old secret, verify unauthorized 403 and authorized isolated Test exact-SHA. Never expose old/new values in git, cron, process argv or logs.
