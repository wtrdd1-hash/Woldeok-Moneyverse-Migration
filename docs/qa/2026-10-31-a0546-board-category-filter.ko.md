# A0546 — 공개 게시판 주식 토론 분류 필터 QA (초안 / 배포 보류)

작업 시작·중간 기준 main: `761a55a094fb9dd383d213e817305e68c79fa23c`. 독립 `auto/hourly-a-20261031-0546-board-category-filter` 작업 공간. 영문 정본의 한국어 대응 문서이며 문서 전용 작업이 아닙니다.

- 공개 게시판 API에서 분석·질문·투자 기록·기업·시스템 분류를 필터링합니다. DB의 공개 최근 50건을 먼저 조회하고 그 범위에서만 검색하며, 분류가 없는 게시글은 선택 시 제외합니다. 기존 종목·제목 필터와 조합할 수 있습니다. 중복·잘못된 분류는 HTTP 400으로 거부합니다.
- `/board`에 레이블과 44px 높이를 갖춘 키보드 조작 가능한 선택창을 추가했습니다. 빈 선택은 전체 보기입니다. 조건별 페이지와 Android app-api는 noindex/no-store이며, 위조되거나 조건과 불일치하는 HTTP 200 응답은 503으로 거부합니다.
- TDD 실패 증거를 확보한 뒤 Backend 대상 23 PASS, Frontend 대상 11 PASS, 실제 PostgreSQL 대상 1 PASS를 확인했습니다.
- 격리 PostgreSQL 17.11에서 마이그레이션 311개 적용, 함수 실행 허용·게시글 및 주식 토론 맥락 테이블 직접 조회 거부, 합성 분류/제목/종목/분류 없음 검증을 확인했습니다. ROLLBACK 후 회원·원장 거래 0건입니다. 적용된 마이그레이션은 변경하지 않았습니다.
- 전체 Typecheck·Backend/Frontend Build 통과, 전체 ESLint 오류 0·경고 1,049, Backend 2,786 PASS/502 SKIP, Frontend 2,780 PASS, DB 단위 62 PASS/4 SKIP, 보안 11 PASS, 접근성/SEO 선별 21 PASS, Android API 계약 184개 PASS, 운영 의존성 알려진 취약점 0건입니다.
- 공식 Test의 정확 SHA 인증 E2E, 독립 백업 복원 및 GitOps 승격은 수행하지 않았습니다. 운영 실행 출처 P0 #1984, 개발 DB 광범위 권한 P0 #993은 OPEN입니다. 전체 릴리스 게이트가 입증되기 전 병합·운영 배포 금지입니다.

증거: `/srv/moneyverse-data/reports/Moneyverse-A-2026-10-31-0546-board-category-filter/`.
