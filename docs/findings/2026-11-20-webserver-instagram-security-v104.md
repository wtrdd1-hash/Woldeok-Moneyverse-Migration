# Emergency research intake: Apache / NGINX security reel — v2026.11.20.104

**Status:** BLOCKED (remediation not certified) · **Severity:** P0 triage · **Date:** 2026-11-20 KST
**English canonical** | [한국어](2026-11-20-webserver-instagram-security-v104.ko.md)
**Type:** public source review and read-only operational triage, **not a production release or security-patch attestation**.

## 1. Source provenance

- Owner-supplied Instagram reel: https://www.instagram.com/reel/Df7MYiaKeXL/
- Published November 19, 2026. Its publicly exposed **caption**, not the full audiovisual transcript, was retrieved and paraphrased on November 20.
- The caption discusses Apache HTTP Server, NGINX, conditional RCE risk, checking versions, applying security releases and emergency HTTP/2 mitigation.
- It also describes a **separate October 14 NGINX patch cycle** with releases 1.30.6 / 1.31.7. **Do not mistake these older release numbers for the later November 18 NGINX2Root fixes.**

## 2. Verified November 2026 advisories (sources outrank social media)

| Component | Verified issue | Scope/condition | Corrective reference |
|---|---|---|---|
| NGINX Open Source / Plus | CVE-2026-123007, CVE-2026-123634, CVE-2026-123633, CVE-2026-121810, CVE-2026-113425 (memory safety, conditional unauthenticated code execution) | Different preconditions: HTTP/2, HTTP/3/QUIC, configured DNS resolver + mirror, or mail proxy auth, depending on CVE. Not every install meets every precondition. | F5/KISA November 19 notice; Open Source 1.30.7 (stable) or 1.31.9 (mainline) fixes listed issues. For Debian, rely on the **distribution-specific backport advisory**, not the displayed upstream version alone. |
| Apache HTTP Server | CVE-2026-119618, mod_http2 concurrency error / possible RCE | Apache 2.4.55 to before 2.4.71 **with mod_http2 enabled** | Update to Apache 2.4.71 or a vendor-backported fix. Singapore CSA reports active exploitation; verify against local evidence, do not infer host compromise. |

**Primary sources:** [KISA November 19 NGINX bulletin](https://www.krcert.or.kr/kr/bbs/view.do?bbsId=B0000133&menuNo=205020&nttId=72314), [F5 CVE-2026-123007](https://my.f5.com/manage/s/article/K000163926), [CERT-EU November 18 analysis](https://cert.europa.eu/publications/security-advisories/2026-022/), [Debian DSA-6642-1](https://security-tracker.debian.org/tracker/DSA-6642-1), [Singapore CSA Apache alert](https://www.csa.gov.sg/alerts-and-advisories/alerts/al-2026-164/), [Apache upstream advisories](https://httpd.apache.org/security/vulnerabilities_24.html).

## 3. Moneyverse-specific security posture

An **authorized read-only** mini-PC inventory and package-repository comparison were performed. A **patch-remediation gap requiring urgent operator action** was identified; host-specific affected package versions, active listener details, logs, IP addresses, operational credentials, and private proof are **deliberately excluded from this PUBLIC repository**. The full restricted evidence is stored separately on the host with owner-only file permissions.

**Do not equate an affected package with proven exploitability or compromise.** Actual reachable HTTP/2/3, module/config preconditions, edge/TLS termination, process identity and signs of exploitation still require appropriate privileged QA. Equally, no exploit is ruled out by a normal landing-page HTTP 200.

Existing [living project plan](../planning/PROJECT_PLAN.md), [integrated master](../planning/INTEGRATED_PLANNING_MASTER.md), and [documentation policy](../DOCUMENTATION_POLICY.md) remain authoritative; this is evidence input, not an unreviewed product-plan override.

## 4. P0 response procedure (not executed in this documentation change)

1. **Preserve evidence privately:** package identity, running executable, package-origin/backport status, config/module activation and access/error logs. Limit distribution and redact secrets.
2. **Stage the vendor-supported fixed package**, after independent backup and change ownership/coordination with concurrent Gemini work. Do not rely on outdated social-media package numbers; use the running OS security advisory.
3. **Validate in isolated Test:** privileged NGINX syntax/config checks, real network HTTP/2/3 behavior, HTTPS/TLS, Spring reverse proxy, anonymous admin 401/302 boundaries, signed-in member/admin API contracts, five languages, responsive pages and rollback.
4. **Promote only after recorded gates:** exact binary/source/package identity, service switch-over confirmation, health/functional probes, no-downtime or approved maintenance rollback, and post-change evidence. An NGINX config reload alone is **not evidence that the running executable has been replaced**.
5. If immediate patch is impossible, evaluate **targeted HTTP/2 or HTTP/3 disablement** only where applicable with impact review; that does **not** fix unrelated resolver/mail flaws and is not a substitute for patching.
6. Perform post-patch compromise triage and timeline/worker crash log review; involve incident response if abnormal activity is found.

## 5. Acceptance and truthful status

| Gate | Current status |
|---|---|
| Social caption captured and independently verified against official alerts | SOURCE REVIEWED |
| Remote host inventory and private security evidence | READ-ONLY RECORDED |
| Exact installed package corrected and new binary active | NOT PERFORMED |
| Full Test application/API/role/browser/DB regressions | NOT PERFORMED |
| Production deployment, rollback drill and compromise assessment | NOT PERFORMED |

**Release conclusion:** P0 security remediation remains **BLOCKED** pending patch deployment and exact-host verification. No production package, Java code, web UI, finance ledger or DB migration was changed by this documentation task.

**Public disclosure rule:** never copy private host audit output, access tokens, DB credentials, raw NGINX config, internal endpoints or vulnerable-host fingerprints into this repository.

## 6. Document-control record

- Version: `v2026.11.20.104` — documentation-only; no runtime version increment.
- GitHub base `main` at task start: `9635262fb22b07c1dca5dd9ab855371d5635be86`; confirm again before merge.
- History: [EN worklog](../worklog/2026-11-20-webserver-instagram-security-v104.md) / [KO](../worklog/2026-11-20-webserver-instagram-security-v104.ko.md); GitHub and internal updates to follow.
