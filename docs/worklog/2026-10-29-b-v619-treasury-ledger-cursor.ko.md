# 개발 B v619 — 국고 원장 감사 페이지네이션 무결성 (DRAFT / HOLD)

2026-10-29 KST. 시작·중간 main `35971c600f25869c96f1c666d4b9f58927202730`.

## 실제 P1 결함 및 수정

관리자 `GET /api/v1/admin/treasury/transactions`는 `created_at DESC`만으로 정렬하고 `created_at < cursor`로 다음 페이지를 조회했습니다. 동일 시각에 생성된 원장 행은 다음 페이지에서 누락될 수 있고, `Date.toISOString()`은 PostgreSQL 마이크로초를 밀리초로 절삭했습니다. 이는 감사 조회 누락 위험이며 실제 WLD 원장 손실의 증거는 아닙니다.

`tl1.<base64url({at,id})>` 불투명 커서에 PostgreSQL 시각 원문과 UUID를 넣고 `(created_at,id)` 복합 키셋 페이지네이션을 적용했습니다. limit은 기본 30, 1~100 정규 10진수만 허용합니다. 비정상·중복·구형 타임스탬프 커서는 HTTP 400으로 DB 접근 전 거부하고 Repository 직접 호출도 검증합니다. 기존 거래 필드와 WLD 정수 문자열은 유지하며, 기존 구형 커서는 첫 페이지부터 다시 조회해야 합니다. DB 마이그레이션·권한·금융 쓰기·Frontend 변경 없음.

## 테스트 및 보류 사유

- 수정 전 신규 테스트 4건 실패(RED), 수정 후 HTTP·단위 4건 PASS.
- 격리 PostgreSQL 17 합성 스키마 1건 PASS: 같은 마이크로초 행 2건의 누락·중복 방지, 2^53 초과 WLD 문자열 보존. 운영 전체 스키마 검증 아님.
- Backend 1,943 PASS/441 SKIPPED, DB 46 PASS/4 SKIPPED, 보안 정책 23 PASS, API 계약 180개, Lint 오류 0/경고 1,099, Typecheck·Backend Build PASS.
- Frontend 전체 1,429 PASS/402 FAIL, 보안 감사 `qs` Moderate 1건 FAIL. 공유 디스크 97%로 Next.js 전체 Build 미실행. 공식 Test exact-SHA 및 인증 관리자 E2E 미검증.

**Draft/HOLD**: 필수 CI·보안·전체 빌드·실제 스키마·공식 Test·GitOps 통과 전 병합 및 Production 금지. 다른 개발·기획·QA 예약과 브랜치는 변경하지 않았습니다.
