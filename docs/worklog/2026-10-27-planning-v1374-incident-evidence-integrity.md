# Planning v1374 — Incident Evidence Integrity / 장애 근거 무결성

Date: 2026-10-27 KST. Previous: Feature Addition v1372. Current: Feature Improvement v1374. Next: Feature Addition v1376 (provisional).
Repository: wtrdd1-hash/Woldeok-Moneyverse-Migration. Main at start/mid: 59cdc2e02f0e83e5401049309c4cb89ff57c2d4c.
Issue: #1572. Predecessor: unmerged Draft PR #1573. Branch: docs/planning-v1374-incident-evidence-integrity. **DRAFT / RELEASE HOLD**.

## Evidence and decisions
- Local Debian 13.6 miniPC service health: backend/frontend/bot/nginx active; DEV DB connected. Root 42% and data 54% used at start; /srv/moneyverse points to missing prod-v600. This does not establish an active outage.
- GitHub main AGENTS.md, README.md, PROJECT_PLAN.md and PROJECT_PLAN.ko.md were consulted; English canonical and Korean equivalent specifications updated together.
- Source: backend/src/content/status-collector.ts catches probe exception as outage, but a failed probe is not a verified user-impact outage. packages/database/migrations/013-content-and-status.sql has observed_at/received_at and content_public_status masks stale observed_at. Existing /status is 30-second cached current state, not an approved history.
- Design improvement: structured evidence envelope; source-bound immutable snapshot proof; observed vs received vs confirmed vs published chronology; corroboration and independent approval for outage/recovery; fail-closed pending states; generation-bound publication, safe withdrawal 410, dynamic no-store and no 304 for new incident content; signed cursor, operator/approver separation, least privilege and privacy; Android public-only parity, SEO noindex, WCAG 2.2 AA and receipt-based KPIs.
- QA v1323 20:16–20:33 KST: current main root test fails duplicate 280 (DB 19 PASS/1 FAIL/3 SKIP), full audit Critical 2/High 8, bot Critical 1/High 5. Synthetic PR #1564 isolated PG root test green does not prove official exact-SHA Test. Development DB broad DML and checksum mismatch, restore and authenticated route five-pass unverified. Release HOLD.
- External references: RFC 9111 https://www.rfc-editor.org/rfc/rfc9111.html; PostgreSQL https://www.postgresql.org/docs/18/sql-createtable.html; WCAG 2.2 https://www.w3.org/TR/wcag/. Technical standards are NOT counted as independently accepted corpus. Newly accepted 0; cumulative UNKNOWN/10,000; gate BLOCKED / IN PROGRESS.
- Backlog: ENV1374-01 SEC1374-02 REL1374-03 INCIDENT1374-04 INCIDENT1374-05 INCIDENT1374-06 INCIDENT1374-07 INCIDENT1374-08 INCIDENT1374-09 INCIDENT1374-10.
- Acceptance criteria: 10,001 synthetic rows; 100 concurrent approvals/withdrawals/replays; 100 forged identities/sources; source retirement, 60s skew proposal, collector exceptions, missing samples, recovery proof, CDN/304/HEAD, Android/a11y, exact-SHA Test, independent backup restore. **NOT RUN**.
- Scope: documentation-only. No runtime code, DB, WLD, ledger, Test, Production, feature switch or automation mutation.

## 한국어 동등 요약
- 수집기 예외의 outage는 공식 장애 확정이 아니다. 과거 스냅샷의 관측 시각·수신 시각·확인 시각·게시 시각을 구분하고, 출처 소유권·독립 검증·복구 확인을 요구한다.
- 게시·철회는 세대 번호·불변 감사·영수증·캐시 우회로 보호한다. 신규 이력 화면은 no-store이며 기존 /status의 30초 캐시와 별도다.
- QA v1323의 중복 280/보안 감사/DB 권한/정확 SHA Test/독립 복원 문제로 운영 보류. 합성 10,001/동시 100/위조 100 미실행, 외부 승인 0·누적 UNKNOWN/10,000.
- 문서만 변경했으며 다른 예약·운영·금융 데이터를 수정하지 않았다.
