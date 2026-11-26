# Combined integration candidate — v2026.11.26.2310.1
**English canonical** | [한국어](2026-11-26-combined-integration-candidate.ko.md)

Status: CODE_READY + isolated-sandbox verified. **Not for direct merge to main** (main integration needs a separate owner instruction); not on official Test or Production.

- Branch `integration/combined-candidate-20261126`: #3462 (with #3447 and the game-year branch) + #3456 + #3464 merged; one conflict (MemberPhotoController) resolved to the function-based version while keeping #3456's upload error handling; superseded direct-SQL photo tests trimmed; the loopback blog route listed in the write-route ratchet.
- Source SHA `e3c8e611550821a1129be67ee0280b883769b1a6`; artifact (bootJar -PmoneyverseSourceSha) sha256 `24c686caf4d62cf769efd1ae9df0de07cdcfa04de48bcbe27cd1cd6b83d2f10c`; `/api/version` answers 200 with this SHA.
- Tests at this SHA: Spring 917/0/0 (skipped 0); frontend 624 files / 3,248 tests; typecheck clean; migration parity 6/6; pnpm audit --prod: 0 known vulnerabilities.
- Sandbox regression on the exact artifact (synthetic, chain grants): boundary holds for normalised paths (anonymous admin requests 401), restricted account sign-in 401, transfers 5 VUs 402 rps / 50 VUs 362 rps with 0 errors, same-key races (30) one transaction each, sockets exact ticks, ledger invariants 0/0/0 after 278,124 transactions, 0 permission-denied / ERROR / leak lines.
- Independent review (G7): Gemini upstream 503 "high demand" (HOLD); Codex quota until 2026-11-27 13:57 KST (HOLD); supplementary same-family read-only security subagent: APPROVE, four low findings — two fixed in #3456 (path normalisation, admin identity header), two recorded. Official Test publication (G8) HOLD: no designated publisher/common lease.
