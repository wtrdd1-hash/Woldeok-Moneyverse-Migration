# 개발 A — 공개 게시판 최근 글 제목 검색 (2026-10-30)

상태: **진행 중 / Draft / 운영 배포 보류**. 영문 문서가 원본입니다.

- 기준 main: `9da6545c4ff4809b5bd84ab6a28b9d2f1db74cef`.
- 독립 브랜치: `auto/hourly-a-20261030-1557-board-title-search`.
- 검색 범위는 기존 DB 함수에서 제공하는 **최신 공개 글 50건**으로 제한합니다. 전체 게시판 검색이라고 표시하지 않습니다.
- 기존 PostgreSQL SECURITY DEFINER 함수와 읽기 전용 SQL만 사용합니다. 신규 마이그레이션·금융 원장 변경 없음.
- Backend/Next.js/Android app-api 및 보안·접근성·SEO 회귀테스트 후 검증되지 않은 항목은 BLOCKED로 기록합니다.
- 다른 개발 작업과 미통합 브랜치를 보호하고 모든 필수 게이트가 PASS가 아니면 병합 및 배포하지 않습니다.

## 종료 검증 (16:16 KST)
- 대상 Backend 15 PASS, Frontend·Android 11 PASS. 전체 Backend 2,576 PASS/119 FAIL/495 SKIP, 전체 Frontend 2,616 PASS/53 FAIL, DB 단위 56 PASS/4 SKIP.
- 전체 Lint 오류 0/경고 1,043, Typecheck·Backend/Frontend Build·앱 API 계약(183개) PASS, 알려진 운영 의존성 취약점 0건.
- 격리 PostgreSQL 17 기능 SQL 검증 PASS, 그러나 전체 305 마이그레이션은 테스트 역할 구성상 020에서 BLOCKED. 합성 게시글 52건, 앱 계정의 직접 SELECT 차단, 합성 원장 거래 0건 확인 후 자체 컨테이너 제거.
- 공식 Test 정확 SHA 인증 E2E, 독립 복원 및 GitOps 게이트 미충족으로 **병합·배포 보류**. 다른 개발 브랜치/PR 보존, 운영 DB·Test·Production·롤백 변경 없음.
- 상세 증거: `docs/qa/2026-10-30-a1557-board-title-search.ko.md`, `docs/qa/2026-10-30-a1557-release-hold.ko.md`.
