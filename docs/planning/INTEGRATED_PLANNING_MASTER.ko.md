# 월덕 머니버스 — 통합 기획 마스터

> 현재 원장 버전: v2026.09.23.388
> 구현 권위 계약: [PROJECT_PLAN.ko.md](PROJECT_PLAN.ko.md)
> 영문 원본: [INTEGRATED_PLANNING_MASTER.md](INTEGRATED_PLANNING_MASTER.md)

## 필수 회차 기록
모든 기획 재검토는 시작/중간 `origin/main` exact SHA, 권위 버전 드리프트, 검토한 세부명세와 release/work 기록, 심각도·근거·수용게이트가 있는 gap ID, 영/한 동기화, 구현/Test/Production 주장에 실제 증거가 있는지를 기록한다. 과거 결정은 삭제하지 않고 명시적으로 supersede한다.

## v2026.09.23.388 — 2026-09-23
- 시작/통합 SHA: `bb832b69ee56b9ab247eda24b7b20f76ea44ffb4` (23개 미병합 PR 및 PR #685 메인 병합 완료).
- 검토: `PROJECT_PLAN` 영/한, `docs/mobile-api-complete-spec` 영/한, `AUTHENTICATION_SECURITY_PRIORITY_SPEC` 영/한, `COMMUNITY_MARKET_INTEGRITY_SPEC` 영/한, 런타임 마이그레이션 197 실증 증거, 백엔드 테스트(974 pass), 프론트엔드 테스트(3 pass), 배포 및 운영 세션(1,061개) 연속성 실측 데이터.
- G368-02 P0 종결 (Closed): 관리자 구형 TOTP 문구를 마이그레이션 197 및 실제 배포 통제인 `AdminSessionGuard`, `ReauthGuard`(Step-Up 2FA), 브라우저 CSRF 가드, DB role/actor 검사, 멱등성 및 append-only audit로 완전 정합화 완료.
- G368-03 P1 종결 (Closed): `docs/mobile-api-complete-spec.ko.md` 및 영문 문서를 v2026.09.23.388로 최신화하고, 신규 4대 도메인 16개 엔드포인트를 포함하여 57개 컨트롤러, 335개 엔드포인트(모바일 계약 179개) 전수 정합화 완료.
- G368-04 P1 종결 (Closed): 상점 Step-Up 및 23개 PR을 `main`에 정합 병합하고, 테스트 및 빌드 검증을 거쳐 테스트/운영 서버에 무중단 승격 완료.
- G368-05 P1 종결 (Closed): 운영 서버 승격 중 1,061개 PostgreSQL 활성 사용자 세션 100% 무손실 보존 및 BFF 알림/채팅 엔드포인트 정상 응답 실측 증명 완료.
- 영/한 동기화: 완료.

## v2026.09.22.368 — 2026-09-22
- 시작 SHA: `3f42ad8c6b12c8e13693ff246935eebceab951e1`.
- 중간 SHA: `3f42ad8c6b12c8e13693ff246935eebceab951e1`(안정).
- 권위 드리프트: PROJECT_PLAN v352 대 main release 증거 v360.
- 검토: PROJECT_PLAN 영/한, INTEGRATED_REVIEW_V348 영/한, UPDATE_LOG 영/한, v359/v360 release 증거, mobile complete API 계약, 현재 관리자 TOTP/runtime migration 증거, 원격 admin-shop reauth 후보.
- G368-01 P1: 권위/버전 드리프트. 후속 release note는 기획 수용조건을 묵시적으로 덮어쓰지 않는다.
- G368-02 P0: migration/runtime 증거상 관리자 TOTP가 폐기됐지만 권위/세부기획에는 현재 통제로 남아 있다. 새 runtime+DB 증거 없이는 배포 통제로 계산하지 않는다.
- G368-03 P1: mobile/API 계약에 과거 v2026.09.14.2/52-controller/163-endpoint 내용과 v359의 57-controller/335-backend/179-mobile 내용이 혼재한다. exact-SHA semantic machine diff와 영/한 동기화를 요구한다.
- G368-04 P1: `auto/hourly-b-shop-stepup-v2026.09.22.366`은 미병합 WIP 증거다. 최신 main rebase, reauth/role/CSRF 음성시험, 감사·동시성/멱등성 증거, 영/한 기록, merged exact-SHA Test 증거가 있어야 수용한다.
- G368-05 P1: v360 session 수/무중단 증거는 해당 release 범위이며 모든 auth/CSRF/reauth/중요 mutation 연속성을 단독으로 증명하지 않는다.
- 외부 재확인: OWASP ASVS 5.0.0 latest stable, NIST SP 800-63B-4 2025-07 final 및 주기적 재인증/session-timeout 요구.
- 판단: 기획/문서 전용. 새 구현·Test·Production 완료를 주장하지 않는다.
