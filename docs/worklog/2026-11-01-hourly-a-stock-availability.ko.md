# 개발 A — 상점 재고 필터 작업 기록 (2026-11-01 04:25 KST)

[영어 원본](2026-11-01-hourly-a-stock-availability.md)

## 작업 전
- 최신 main `f13bbce273ffc65e8576170992d82ea00c27a1c9`, 독립 `auto/hourly-a-20261101-0425-stock-availability` 브랜치/worktree. 원격 브랜치 32개. 저장소 정책·영문/국문 기획서·QA/PR/CI 확인.
- 웹이 `stock=available`을 전송하지만 Nest가 무시하여 품절 상품이 노출될 수 있는 오류 확인. 기존 PostgreSQL `shop_catalog_list_v2(actor)` 재사용, DB/원장/권한 쓰기 금지.

## 작업 중
- 테스트 먼저 작성: Backend 3개, Frontend 4개, 링크 1개, 웹의 구버전 200 응답 1개 실패(RED) 확인 후 구현(GREEN).
- 회원·공개 API의 재고 파라미터 검증, 웹 체크박스/필터 보존, 웹·Android의 미검증 200 차단, Android 회원 응답 비공개 헤더 구현. 초기 API 계약 산출물 순서 차이를 EN/KO/JSON 재생성으로 정리.
- 시작·중간·최종 main SHA 동일. 변경 파일은 QA 및 릴리스 보고서에 기록.

## 작업 후 — 코드 검증 완료 / 운영 배포 보류
- 전체 테스트 종료코드 0: 계약 41 PASS, DB 62 PASS/4 SKIP, Backend 2,953 PASS/517 SKIP, Frontend 2,908 PASS. 전체 Build/Typecheck/Lint PASS(경고 1,022), 운영 의존성 감사 취약점 0.
- PostgreSQL 17.11 앱 역할로 읽기 전용 146건 확인(무제한 143, 유한 양수 3, 품절 0), 가상 회원 146건. ROLLBACK. 개발 DB 앱 역할의 상품/잔액 직접 UPDATE 권한 P0 차단 유지.
- 마지막 확인 원격 브랜치 35개(비-main 추적 35개 중 미병합 34개, 선조 1개), 열린 PR 32개. 브랜치 삭제·main 병합 0.
- 공식 Test `bc8cd8a6…`, Production Backend `353c6d5d…`, Frontend 시간형 ID `1793450413898`로 후보 SHA 불일치. 공식 Test 인증 E2E·독립 백업 복원·운영 출처 검증 미완료. Test/Production 배포·서비스 재시작·운영 DB 쓰기·롤백 모두 0.
- Draft PR #2254 유지, 정확 최종 SHA CI 확인 전 병합·운영 승격 금지. 상세 QA: `docs/qa/2026-11-01-a0425-shop-stock-availability.ko.md`.
