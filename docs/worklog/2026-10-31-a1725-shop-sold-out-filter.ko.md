# 개발 A 17:25 — 상점 품절 상품 검색

## 작업 전
- 최신 main `ed401215a4c47db9bb1ddeb88840ffb703fe4e93` 확인. 영문 통합기획서 원본과 한국어 번역본, AGENTS, 이전 QA, 열린 PR 검토.
- 시작 원격 브랜치 102개, 열린 PR 90개. `auto/hourly-a-20261031-1725-shop-stock-filter` 독립 worktree 사용.
- 기존 PostgreSQL `shop_catalog_list_v2(uuid)` SECURITY DEFINER 조회 함수의 검증된 재고 수량만 사용. 직접 테이블 권한·마이그레이션·원장 변경 없음.

## 작업 중
- TDD RED: Backend 8 실패, Frontend 1 실패, Android 4 실패를 재현. 수정 후 Backend 20, Frontend/카탈로그 38, 서버 렌더링 2, Android 4 통과.
- 전체 Backend 2,793 PASS/501 SKIP, Frontend 2,782 PASS, Typecheck/Build/Lint 통과(경고 1,049개), 보안/릴리스 22 PASS, 운영 의존성 알려진 취약점 0건.
- 격리 PostgreSQL 17.11에서 마이그레이션 312개 적용. app 계정 함수 실행 가능, 카탈로그 직접 SELECT 및 재고 직접 UPDATE 불가. 재고 0/3/NULL 합성 자료로 품절 1건/판매 가능 145건 확인. 원장 거래 0, ROLLBACK 후 원래 상태 복원.
- 모바일 계약 생성기가 기존 주식 `stocks[].id` 필드 순서만 변경하는 안정적인 산출물을 생성해 참조 문서 3개를 동기화함. API 184개 엔드포인트 의미 변화 없음.

## 작업 후
- 코드·테스트 구현. GitHub 최종 SHA CI/후보 이미지/공식 Test 인증 E2E/독립 복원 확인 전에는 병합 및 운영 배포 금지.
- 다른 예약·Gemini 변경 보호, 운영 DB/서비스/기존 브랜치 변경 없음. 세부 최종 SHA·CI는 QA 및 PR 기록 참조.
