# 2026-10-25 — Planning v1268 F675-124 Member Board Author Mutes (DRAFT / HOLD)
- Draft PR [#1281](https://github.com/wtrdd1-hash/Woldeok-Moneyverse-Migration/pull/1281) OPEN/HOLD; engineering issue #1280 OPEN; main unmerged, runtime/Test/Production unchanged.

## Scope and cycle
Previous Feature Improvement v1266 → Current Feature Addition v1268 → Next Feature Improvement v1270 (provisional). This is a documentation-only successor to unmerged Draft #1274, on an isolated planning branch. Development issue [#1280](https://github.com/wtrdd1-hash/Woldeok-Moneyverse-Migration/issues/1280). Authoritative main eb27f5590e80bb71462e3888d052106a068e661a rechecked start and midpoint; canonical AGENTS/README/English PROJECT_PLAN/Korean parity inspected.

## Evidence and decision
- Initially considered cosmetic loadouts but rejected duplicate F675-113 (Draft #1144/#1149) and C's equipment receipt work #1176; preserved this correction in internal start log.
- Public /board is indexable, cached 60s, list max 50 without authorUserId; migration259 public detail exposes authorUserId. Public feed post-filtering would be incorrect. No owner author mute implementation was identified in inspected main. Chosen isolated owner-only private feed with DB pre-LIMIT filtering, versioned mute tombstones and HMAC replay receipts.
- Official OWASP API Top 10, W3C WCAG2.2 and PostgreSQL locking docs were reviewed as contextual sources. Newly approved deduplicated independent evidence 0; cumulative approved UNKNOWN/10,000, gate BLOCKED/IN PROGRESS.

## Proposed engineering and acceptance
P0 ENV1268-01 SEC1268-02 REL1268-03 BOARD1268-04; P1 BOARD1268-05 BOARD1268-06 BOARD1268-07 BOARD1268-08 BOARD1268-09 BOARD1268-10. Full screens, CTA/states, APIs, DB constraints/indexes, actor-first transaction, admin/privacy, security, public SEO, Android/a11y, KPIs, concurrency, exact-SHA Test and rollback in existing English/Korean integrated masters. Feature OFF, migration number UNASSIGNED. No runtime implementation, DB, WLD/ledger, Test or Production mutation.

## QA / release HOLD
Latest completed QA v1268 FAILED/HOLD. Root live 89%/11G free at run start (historical QA 100%/177MiB), dev app DML 235/241, three PUBLIC bank functions, migration266 checksum mismatch and migration280 collision, frontend six failures, root audit Critical2/High10, finance integrity issues, no official exact-SHA authenticated Test finance E2E or isolated restore. Production promotion BLOCKED.

## 국문 요약
이전 기능 보완 v1266 → 현재 기능 추가 v1268 → 다음 기능 보완 v1270(잠정). 기존 F675-113 장착 프리셋 중복을 피하고 신규 F675-124 회원별 게시판 작성자 숨김·개인 피드를 기획했다. 공개 게시판·검색 색인·운영 제재·DM·알림·WLD·원장은 변경하지 않는다. 본인 전용 SQL 선필터·서명 커서·묘비/버전·불변 HMAC 영수증·Android·접근성·QA 게이트를 통합 영문/국문 기획서에 명세했다. 개발 이슈 #1280, 운영 보류, 외부 근거 10,000건 게이트 미달성.
