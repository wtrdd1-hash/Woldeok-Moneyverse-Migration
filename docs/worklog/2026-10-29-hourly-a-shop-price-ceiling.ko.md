# 2026-10-29 개발 A0025 — 상점 WLD 가격 상한 검증 필터 (후보 / 운영 보류)

## 작업 범위

- 최신 main `35971c600f25869c96f1c666d4b9f58927202730`에서 독립 `auto/hourly-a-shop-price-ceiling-20261029-0025` worktree 생성. AGENTS, README, 영문 정본·국문 2차 언어 프로젝트/통합기획서, QA 및 전체 PR 확인. 기존 상점 카테고리·재고·가격순 PR은 미병합으로 보존.
- P1: `/shop` 검색에 선택형 **WLD 최대 가격** 추가. 회원·비회원 API와 기존 상점 조회 경로에서 음수·소수·지수·선행 0·반복 쿼리·bigint 범위 초과를 DB 호출 전에 400으로 거부. 기존 PostgreSQL SECURITY DEFINER 조회 결과를 `BigInt`로 비교해 정밀도 보존. 가격은 사용자가 지정한 구매가격이 아니며 구매·원장 기능은 수정하지 않음.
- 검색·가격 필터로 VIP 상품이 가려져도 실제 회원권이 사라지지 않도록 별도의 필터 없는 회원 목록으로 자격 확인. Android app-api에 가격 쿼리를 그대로 전달하고 회원 상점 응답 `private, no-store` 적용. 신규 SQL/마이그레이션/테이블 권한 없음.
- 메모리 8GiB 서버에서 Next 기본 15개 정적 생성 작업자가 SIGABRT로 실패한 뒤 `experimental.cpus=2`로 제한해 609개 경로 빌드 성공.

## 검증 및 안전

- 테스트 선작성 RED 후 GREEN. 집중 Backend 20 PASS, Frontend 35 PASS, 빌드 작업자 1 PASS. 초기 전체 Backend 1,959 PASS / 440 SKIP, Frontend 1,881 PASS, DB 46 PASS / 4 SKIP, Lint 오류 0, Typecheck·Android 계약·Bot·보안 감사 PASS. 최종 SHA 전체 게이트는 별도 기록.
- 독립 PostgreSQL 17.11 합성 DB에서 앱 계정의 직접 테이블 조회 거부, SECURITY DEFINER 조회, 2^53 초과 정수 문자열 및 상한 비교 PASS. 운영 전체 DB ACL·인증 E2E를 대신하지 않음.
- 데이터 디스크 99%(3.3GiB 여유)에서 **본 개발 A의 종료된 작업공간 6개**에 남은 무시된 `.next` 빌드 캐시만 프로세스·Git 추적 여부 확인 후 정리해 여유 약 7.4GiB 확보. 빌드 이후 약 6.1GiB/97%. Git·백업·DB·Docker 볼륨·타 예약 변경사항 삭제 없음.
- QA v1352: 현금/원장 18,000 WLD 불일치, 235개 테이블 앱 UPDATE/DELETE 권한, PUBLIC 은행 함수 3개, 마이그레이션 체크섬 5건·미적용 20건. 공식 Test SHA는 `cfb13272...`, 후보와 다름. Production은 SHA 아닌 숫자 버전. 독립 복원·정확 SHA 인증 E2E·GitOps 게이트 미충족으로 **병합/운영배포 금지**.

## 통합·롤백

Draft PR로만 보존. 최신 main과 기획서 재확인 및 최종 SHA 전체 게이트·실제 Test 인증·재무 검증 후 통합 검토. 현재 main 병합, Test/Production 배포, 금융 변경, 롤백, 브랜치 삭제 모두 0건. 미병합 고유 커밋과 352개 복구 참조 보존.
