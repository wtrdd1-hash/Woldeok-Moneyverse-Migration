# Strict Test Server Governance — v2026.11.23.1

**English canonical** | [한국어](STRICT_TEST_SERVER_GOVERNANCE_v2026.11.23.1.ko.md)

**Authority:** subordinate to the latest [Integrated Planning Master](../planning/INTEGRATED_PLANNING_MASTER.md), [Release Guide](../RELEASING.md), and actual read-only runtime evidence. **Status: normative proposal / documentation only** until reviewed and merged. This does not attest an active service or change firewall, CI or Production.

## 1. Port identity and non-reassignment
A TCP port is an endpoint, not a deployment environment. Historical records associate 4550 with Spring Boot HTTP/API (not an official Test port), 9092 with Netty-SocketIO, 3100/3101 with official isolated Test backend/frontend, and several legacy Production generations with other ports. Historic 4500/4501 and 4164/4165 identifiers must not be mistaken for verified current runtime. All assignments are **subject to live validation**. No agent may relabel, stop, repurpose, expose or route traffic to/from port 4550 until approved read-only mapping of socket listener PID, systemd unit/container, bind address, effective EnvironmentFile, Nginx upstream and exact build/SHA. Unexpected ownership is a STOP condition.

## 2. Mandatory FAIL-CLOSED gates
**T0 Authority and ownership:** read fresh main, integrated master and applicable release/security instructions at START and MID; create an isolated owner-assigned branch/worktree; log scope, exact SHA, responsible agent and file ownership; protect concurrent Gemini work. No direct edits to main/Production.

**T1 Network isolation:** independent Test DNS/origin, Nginx virtual host, backend/frontend service units, credentials, secrets, data stores, cache, Redis, object storage, queues, WebSocket rooms and scheduled jobs. Expose only explicit TLS 443 through authenticated/authorized ingress. Backend binds to loopback/private interfaces; deny direct public ingress to 4550, 3100/3101 and internal service ports. Test access to authorized external testers uses authenticated edge access (MFA where available), not public raw port forwarding. Allowlist admin/test accounts; enforce roles and least privilege; prevent indexing; remove verbose diagnostics, actuator exposure and stack traces. No Production secrets or credentials in Test.

**T2 Data safety:** separate database instance/schema/roles and storage; no Test write or execution privileges on Production ledgers, real member records, session stores, financial jobs, emails, SMS or webhooks. Test data must be synthetic or de-identified under approved procedure. Real Production data restore requires separate privacy approval, redaction, encryption and egress restrictions; never casually clone. Money, stock, banking and settlement jobs disabled until proven sandbox-only. A Test write must never mutate Production.

**T3 Build and CI:** immutable signed/checksummed artifact tied to exact 40-character commit SHA, dependency/SBOM and secret scans, SAST, build/lint/typecheck, unit/integration, contract, migration dry-run, UI visual regression across desktop/mobile and EN/KO/JA/ZH/VI, auth/authorization negative paths, live DB-backed integration, session continuity and concurrency/idempotency tests. No skipped, flaky or mocked-only critical gate may count as PASS.

**T4 Genuine Test acceptance:** check service PID/port/identity, public TLS host, version headers and real backend->DB transaction path, actual API response provenance (no fake fixed success), login including Google/Discord where enabled, admin RBAC, support/chat, banking, transfers/deposits, stock and subscriptions, all 180-design routes and image/favicon availability. Inspect browser console/network, Nginx/upstream/systemd logs; perform resilience/restart tests and basic load/latency test. Keep evidence (redacted screenshots, request IDs, 5xx/403 counters, SHA, timestamp, tester, rollback readiness). Explicitly distinguish implemented, tested, blocked and not tested.

**T5 Promotion authorization:** independent reviewer required; CODEOWNERS + protected main/required checks; no force push, admin bypass, self-approval or automatic Production promotion. Production requires operator authorization, verified backups and restore rehearsal, DB financial reconciliation, exact-SHA Test acceptance, immutable artifact, no-downtime canary/blue-green, health/functional/observability gates and automatic rollback on threshold breach. A green /health alone is insufficient. Re-read current main/master after any merge before approval.

**T6 Stop/rollback:** STOP on Test/Prod cross-access, unexpected public internal port, inconsistent build SHA, unauthorized privileged account, missing UI/API coverage, production DB side effects, broken auth, financial ledger mismatch, secret leakage, failure to restore, missing backup, or uncertain ownership. Preserve evidence and rollback to previously verified immutable generation without overwriting other agents.

## 3. Required port audit (read-only, on authorized host)
```bash
sudo ss -ltnp
sudo systemctl list-units --type=service --state=running
sudo nginx -T 2>&1 | grep -nE '4550|3100|3101|proxy_pass|listen'
sudo systemctl show <verified-unit-name> -p MainPID -p ExecStart -p EnvironmentFiles
```
Treat outputs as sensitive; sanitize hostnames, paths, account names and tokens before publishing. Do not run network reconfiguration before confirming ownership and rollback.

## 4. Acceptance matrix and decision
All T0-T5 require independently captured PASS. Any FAIL/UNKNOWN/BLOCKED means **Production promotion BLOCKED**; documentation changes have no deployment effect. Existing external Test access requirement must be implemented via protected TLS ingress, not unfiltered :4550 exposure. A strict Test server should be independently operable and stoppable without interrupting Production.

## 5. Current evidence and open items (2026-11-23)
Remote mini-PC endpoint was OFFLINE when queried; there is **no** live PID, firewall, Nginx, authenticated QA, deploy or Test/Production PASS attestation. Repo documents disagree across historical generations, so read-only host audit is mandatory. 4550 is historically Spring Boot API service, **not proven Test**. See [Spring architecture](../SPRING_BOOT_SINGLE_RUNTIME_ARCHITECTURE.md), [Release Guide](../RELEASING.md), and [Integrated Master](../planning/INTEGRATED_PLANNING_MASTER.md).
