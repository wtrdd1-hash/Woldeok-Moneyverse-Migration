# Planning v1332 — Member Support History Search / 회원 문의 이력 검색 (2026-10-27)

**Classification:** Architectural planning specification; design is a proposal awaiting engineering approval, not an implementation authorization. **Status:** PARTIAL / DRAFT / RELEASE HOLD.

**Cycle:** Previous Feature Improvement v1330 → Current Feature Addition v1332 → Next Feature Improvement v1334 (provisional). **GitHub engineering issue:** https://github.com/wtrdd1-hash/Woldeok-Moneyverse-Migration/issues/1467. **Predecessor:** v1330 Draft #1461 stacked on #1457. Branch isolated; do not merge directly into main.

## Evidence and nonclaims
- miniPC Debian 13.6; latest main `0fe614b2ca1a7bc0df540514e54db78130479e2a` start/mid; AGENTS/README/English canonical PROJECT_PLAN/Korean parity reviewed.
- Source: member /support UI lacks search/filter/load-more; NestJS SupportController.threads and SupportRepository.myThreads use migration196 support_my_threads default 50/max 100; existing admin status filter preserved. No Production missing-case incident confirmed.
- QA v1302 local evidence: frontend 1,423/1,423 PASS; typecheck/lint/build/API PASS; full audit FAIL 2 Critical/8 High, bot audit FAIL, route-ledger FAIL. Development DB direct app DML 235/241, PUBLIC bank SECURITY DEFINER 3, migration266 mismatch. Production ACL unknown; root 99% ~1.3GiB, data 91% ~18–19GiB. Exact-SHA Test and isolated restore unverified.
- Superpowers: connector skills__list returned no URIs, so skills__read path BLOCKED. miniPC installed using-superpowers, brainstorming, writing-plans, using-git-worktrees and verification-before-completion were read; only docs/spec proposed, no runtime implementation.

## Scope and acceptance
- F675-140 owner-only literal subject search/status/date filters/created-at keyset; session/consent, signed actor+filter+session 15min cursor, SECURITY DEFINER with PUBLIC revoked, no app direct grants, no GET writes, 20/max50 pages, safe 0/error/partial states. Android parity, WCAG 2.2 AA, private SEO noindex/no-store, admin k>=20 aggregates.
- P0: ENV1332-01, SEC1332-02, REL1332-03, SUP1332-04. P1: SUP1332-05, SUP1332-06, SUP1332-07, SUP1332-08, SUP1332-09, SUP1332-10. Real-PG 10,001 synthetic, 100 cross-user, Unicode/LIKE wildcards, 0 GET writes, cursor expiry, status races, restore and rollback before any deployment.
- External 10,000 independent references: newly approved/deduplicated 0; cumulative verified UNKNOWN, **BLOCKED / IN PROGRESS**. OWASP, PostgreSQL and W3C official guidance consulted as non-counted background. No runtime/DB/WLD/ledger/Test/Production changes.

## External design references (not corpus-approved)
- OWASP API1 BOLA: https://api-security.owasp.org/editions/2023/en/0xa1-broken-object-level-authorization/
- PostgreSQL multicolumn indexes: https://www.postgresql.org/docs/current/indexes-multicolumn.html
- W3C WCAG 2.2: https://www.w3.org/TR/wcag/

**한국어 요약:** 회원 문의 제목만 문자 그대로 검색하고 상태/생성일 필터·안전한 키셋 페이지네이션을 추가하도록 설계. 운영 데이터 변경이나 실제 배포 없음. QA/보안/저장 공간·외부 근거 10,000건 게이트 미통과로 RELEASE HOLD.
